'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [excelData, setExcelData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const ADMIN_PASSWORD = 'Devs@2026';
  const SESSION_KEY = 'admin_authenticated';

  useEffect(() => {
    // Check if already authenticated in session
    const authenticated = sessionStorage.getItem(SESSION_KEY);
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(SESSION_KEY, 'true');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(SESSION_KEY);
    setPassword('');
    setExcelData(null);
    setFileName('');
  };

  // Helper function to generate slug from text
  const generateSlug = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Use sheet_to_json with raw values and dates as strings
        const data = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          raw: false, // Get formatted strings instead of raw values
          dateNF: 'dd/mm/yyyy' // Format dates as strings
        });
        
        // Find the index of title column in the header row
        const headers = data[0] || [];
        const titleIndex = headers.findIndex(h => 
          h && (h.toLowerCase().includes('title') || h.toLowerCase().includes('name'))
        );
        
        // Add show/hide toggle and slug columns for each row
        const processedData = data.map((row, index) => {
          if (index === 0) {
            // Header row - add 'Show/Hide' and 'Slug' as first columns
            return ['Show/Hide', 'Slug', ...row];
          } else {
            // Data rows - add toggle state and generate slug
            const titleValue = titleIndex >= 0 ? row[titleIndex] : '';
            const slug = generateSlug(titleValue || `item-${index}`);
            return [true, slug, ...row];
          }
        });
        
        setExcelData(processedData);
        setFileName(file.name);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert('Error reading Excel file. Please ensure it\'s a valid Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleRemoveFile = () => {
    setExcelData(null);
    setFileName('');
    // Reset file input
    const fileInput = document.getElementById('excel-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleToggleRow = (rowIndex) => {
    const newData = [...excelData];
    newData[rowIndex + 1][0] = !newData[rowIndex + 1][0];
    setExcelData(newData);
  };

  const handleCellEdit = (rowIndex, cellIndex, value) => {
    const newData = [...excelData];
    // +2 to account for toggle and slug columns
    const actualCellIndex = cellIndex + 2;
    newData[rowIndex + 1][actualCellIndex] = value;
    
    // If editing the title column, also update the slug
    const headers = excelData[0] || [];
    const titleColumnName = headers[actualCellIndex];
    if (titleColumnName && (titleColumnName.toLowerCase().includes('title') || titleColumnName.toLowerCase().includes('name'))) {
      // Update the slug (column index 1)
      newData[rowIndex + 1][1] = generateSlug(value || `item-${rowIndex + 1}`);
    }
    
    setExcelData(newData);
  };
  
  const handleSlugEdit = (rowIndex, value) => {
    const newData = [...excelData];
    newData[rowIndex + 1][1] = value; // Slug is at index 1
    setExcelData(newData);
  };

  const handleSubmitToSupabase = async () => {
    if (!excelData || excelData.length <= 1) {
      alert('No data to submit');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get headers (excluding the Show/Hide and Slug columns)
      const headers = excelData[0].slice(2);
      
      // Check if slug column exists
      const hasSlugColumn = excelData[0][1] === 'Slug';
      
      // Filter and prepare data for visible rows only
      const visibleRows = excelData.slice(1)
        .filter(row => row[0] === true) // Only include rows where Show/Hide is true
        .map(row => {
          const dataRow = {};
          
          // Add slug if it exists
          if (hasSlugColumn && row[1]) {
            dataRow.slug = row[1];
          }
          
          headers.forEach((header, index) => {
            // Map Excel headers to database fields
            const value = row[index + 2]; // +2 to skip the Show/Hide and Slug columns
            if (header && value !== undefined && value !== null && value !== '') {
              // Clean up header names to match database field names
              const fieldName = header.toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, ''); // Remove special characters
              
              // Skip first_seen field (not in database)
              if (fieldName !== 'first_seen') {
                // Handle array fields for database
                if (fieldName === 'age_band' || fieldName === 'categories') {
                  // Convert string to array format
                  // Handle different formats: "4-6; 7-12" or "4-6, 7-12" or already ["4-6", "7-12"]
                  if (typeof value === 'string') {
                    // Check if it's already a JSON string array
                    if (value.startsWith('[') && value.endsWith(']')) {
                      try {
                        dataRow[fieldName] = JSON.parse(value);
                      } catch {
                        // If parsing fails, split by common delimiters
                        const items = value.split(/[;,]/).map(item => item.trim()).filter(item => item);
                        dataRow[fieldName] = items.length > 0 ? items : [value.trim()];
                      }
                    } else {
                      // Split by semicolon or comma
                      const items = value.split(/[;,]/).map(item => item.trim()).filter(item => item);
                      dataRow[fieldName] = items.length > 0 ? items : [value.trim()];
                    }
                  } else if (Array.isArray(value)) {
                    dataRow[fieldName] = value;
                  } else {
                    dataRow[fieldName] = [String(value)];
                  }
                } else {
                  // Keep other values as-is without conversion
                  dataRow[fieldName] = value;
                }
              }
            }
          });
          return dataRow;
        })
        .filter(row => Object.keys(row).length > 0); // Remove empty rows

      if (visibleRows.length === 0) {
        alert('No valid rows to submit');
        setIsSubmitting(false);
        return;
      }

      console.log('Submitting data to Supabase:');
      console.log('Number of rows:', visibleRows.length);
      console.log('Sample row:', visibleRows[0]);
      console.log('All rows:', JSON.stringify(visibleRows, null, 2));

      // Submit to Supabase
      const { data, error } = await supabase
        .from('things_to_do')
        .insert(visibleRows)
        .select(); // Return inserted data for verification

      if (error) {
        console.error('Supabase error details:', error);
        console.error('Error code:', error.code);
        console.error('Error hint:', error.hint);
        console.error('Error details:', error.details);
        
        // Provide more specific error messages
        if (error.message.includes('JSON')) {
          alert(`Data format error: Please ensure Supabase URL and API key are correctly configured in environment variables.`);
        } else if (error.code === '23505') {
          alert('Duplicate entry error: Some rows may already exist in the database.');
        } else if (error.code === '42703' || error.message.includes('column')) {
          alert(`Column mismatch: Excel column names may not match database fields. Error: ${error.message}`);
        } else {
          alert(`Error submitting data: ${error.message}`);
        }
      } else {
        console.log('Successfully inserted data:', data);
        alert(`Successfully submitted ${visibleRows.length} rows to database`);
        
        // Show which rows were submitted in console
        const submittedInfo = visibleRows.map(row => 
          row.title || row.provider_name || row.venue_name || 'Row'
        ).slice(0, 5);
        console.log('Submitted items:', submittedInfo);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit data. Please check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Manrope, sans-serif',
        background: '#F5F5F0'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Manrope, sans-serif',
        background: '#F5F5F0'
      }}>
        <div style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
          margin: '20px'
        }}>
          <h1 style={{
            fontFamily: '"Feather Bold", serif',
            fontSize: '28px',
            color: '#0C3C26',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            Admin Access
          </h1>
          <p style={{
            color: '#666',
            fontSize: '14px',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            Please enter the admin password to continue
          </p>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #DDD',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#009B4D'}
                onBlur={(e) => e.target.style.borderColor = '#DDD'}
              />
            </div>
            
            {error && (
              <div style={{
                padding: '12px',
                background: '#FEE',
                border: '1px solid #FCC',
                borderRadius: '8px',
                color: '#C00',
                fontSize: '14px',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 24px',
                background: '#009B4D',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#008542'}
              onMouseLeave={(e) => e.target.style.background = '#009B4D'}
            >
              Access Admin Panel
            </button>
          </form>
          
          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #EEE',
            textAlign: 'center'
          }}>
            <button
              onClick={() => router.push('/')}
              style={{
                color: '#009B4D',
                background: 'none',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontFamily: 'inherit'
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin panel content
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F0',
      fontFamily: 'Manrope, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #EEE',
        padding: '20px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h1 style={{
              fontFamily: '"Feather Bold", serif',
              fontSize: '24px',
              color: '#0C3C26',
              margin: 0
            }}>
              Admin Dashboard
            </h1>
            <span style={{
              background: '#E5F5ED',
              color: '#0C3C26',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Protected
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 20px',
              background: '#fff',
              color: '#666',
              border: '1px solid #DDD',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#C00';
              e.target.style.color = '#C00';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#DDD';
              e.target.style.color = '#666';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* File Upload Section */}
        <div style={{
          background: '#fff',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontFamily: '"Feather Bold", serif',
            fontSize: '20px',
            color: '#0C3C26',
            marginBottom: '24px'
          }}>
            Excel File Upload
          </h2>
          
          <div style={{
            border: '2px dashed #D0D5DD',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            background: 'linear-gradient(to bottom, #FAFAFA, #F8F8F8)',
            position: 'relative',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#009B4D';
            e.currentTarget.style.background = 'linear-gradient(to bottom, #F5FFF9, #F0F8F4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#D0D5DD';
            e.currentTarget.style.background = 'linear-gradient(to bottom, #FAFAFA, #F8F8F8)';
          }}>
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            
            <div style={{ pointerEvents: 'none' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 20px',
                background: 'linear-gradient(135deg, #009B4D, #00C853)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 155, 77, 0.15)'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 13H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 17H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0C3C26',
                marginBottom: '8px'
              }}>
                {fileName ? fileName : 'Click to upload Excel file'}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#667085',
                marginBottom: '20px'
              }}>
                or drag and drop your .xlsx, .xls, or .csv file here
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#6B7280'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Supports XLSX, XLS, CSV formats
              </div>
            </div>
          </div>

          {fileName && (
            <div style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#E5F5ED',
              borderRadius: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#0C3C26',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                ✅ {fileName} uploaded successfully
              </div>
              <button
                onClick={handleRemoveFile}
                style={{
                  padding: '6px 12px',
                  background: '#fff',
                  border: '1px solid #DDD',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: '#666'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#C00';
                  e.target.style.color = '#C00';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#DDD';
                  e.target.style.color = '#666';
                }}
              >
                Remove File
              </button>
            </div>
          )}
        </div>

        {/* Table Display Section */}
        {excelData && excelData.length > 0 && (
          <div style={{
            background: '#fff',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflowX: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{
                  fontFamily: '"Feather Bold", serif',
                  fontSize: '20px',
                  color: '#0C3C26',
                  margin: 0
                }}>
                  Excel Data ({excelData.length - 1} rows)
                </h2>
                <div style={{
                  fontSize: '13px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  {excelData.slice(1).filter(row => row[0] === true).length} rows selected for submission
                </div>
              </div>
              <button
                onClick={handleSubmitToSupabase}
                disabled={isSubmitting}
                style={{
                  padding: '10px 24px',
                  background: isSubmitting ? '#CCC' : '#009B4D',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.background = '#008542';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.background = '#009B4D';
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <span style={{
                      display: 'inline-block',
                      width: '14px',
                      height: '14px',
                      border: '2px solid #fff',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }}/>
                    Submitting...
                  </>
                ) : (
                  <>
                    ✓ Submit to Database
                  </>
                )}
              </button>
            </div>
            
            <style jsx>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
                border: '1px solid #DDD'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #DDD' }}>
                    {excelData[0] && (() => {
                      // Ensure header has same number of columns as the max in data
                      const maxColumns = Math.max(...excelData.map(r => r.length));
                      const paddedHeaders = [...excelData[0]];
                      while (paddedHeaders.length < maxColumns) {
                        paddedHeaders.push('');
                      }
                      
                      return paddedHeaders.map((header, index) => (
                        <th key={index} style={{
                          padding: '12px',
                          background: index === 1 ? '#E5F5ED' : '#F5F5F0',
                          borderRight: '1px solid #DDD',
                          borderLeft: index === 0 ? '1px solid #DDD' : 'none',
                          borderBottom: '2px solid #DDD',
                          textAlign: index === 0 ? 'center' : 'left',
                          fontWeight: '700',
                          color: index === 1 ? '#0C3C26' : '#333',
                          whiteSpace: 'nowrap',
                          minWidth: index === 0 ? '120px' : index === 1 ? '180px' : '150px',
                          fontFamily: index === 1 ? 'monospace' : 'inherit'
                        }}>
                          {header || `Column ${index}`}
                        </th>
                      ));
                    })()}
                  </tr>
                </thead>
                <tbody>
                  {excelData.slice(1).map((row, rowIndex) => {
                    // Ensure we have cells for all columns
                    const maxColumns = Math.max(...excelData.map(r => r.length));
                    const paddedRow = [...row];
                    while (paddedRow.length < maxColumns) {
                      paddedRow.push('');
                    }
                    
                    return (
                      <tr key={rowIndex} style={{
                        opacity: row[0] ? 1 : 0.5,
                        background: row[0] ? 'transparent' : '#F8F8F8',
                        borderBottom: '1px solid #DDD'
                      }}>
                        {paddedRow.map((cell, cellIndex) => (
                          <td key={cellIndex} style={{
                            padding: cellIndex === 0 ? '8px' : '12px',
                            borderRight: '1px solid #E5E5E5',
                            borderLeft: cellIndex === 0 ? '1px solid #E5E5E5' : 'none',
                            color: cellIndex === 0 ? '#333' : '#666',
                            textAlign: cellIndex === 0 ? 'center' : 'left',
                            minWidth: cellIndex === 0 ? '120px' : '150px',
                            verticalAlign: 'middle',
                            height: '48px'
                          }}>
                          {cellIndex === 0 ? (
                            // Toggle switch for first column (Show/Hide)
                            <label style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              cursor: 'pointer'
                            }}>
                              <input
                                type="checkbox"
                                checked={cell}
                                onChange={() => handleToggleRow(rowIndex)}
                                style={{
                                  position: 'absolute',
                                  opacity: 0,
                                  width: 0,
                                  height: 0
                                }}
                              />
                              <span style={{
                                position: 'relative',
                                display: 'inline-block',
                                width: '44px',
                                height: '24px',
                                background: cell ? '#009B4D' : '#CCC',
                                borderRadius: '999px',
                                transition: 'background 0.3s'
                              }}>
                                <span style={{
                                  position: 'absolute',
                                  top: '2px',
                                  left: cell ? '22px' : '2px',
                                  width: '20px',
                                  height: '20px',
                                  background: '#fff',
                                  borderRadius: '50%',
                                  transition: 'left 0.3s',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}/>
                              </span>
                              <span style={{
                                marginLeft: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: cell ? '#009B4D' : '#999'
                              }}>
                                {cell ? 'Show' : 'Hide'}
                              </span>
                            </label>
                          ) : cellIndex === 1 ? (
                            // Slug column - editable with special styling
                            <input
                              type="text"
                              value={cell || ''}
                              onChange={(e) => handleSlugEdit(rowIndex, e.target.value)}
                              style={{
                                width: '100%',
                                minWidth: '180px',
                                padding: '6px 8px',
                                border: '1px solid transparent',
                                borderRadius: '4px',
                                background: '#F0F8F4',
                                color: '#0C3C26',
                                fontSize: '13px',
                                fontFamily: 'monospace',
                                transition: 'all 0.2s',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                              onFocus={(e) => {
                                e.target.style.background = '#E5F5ED';
                                e.target.style.border = '1px solid #009B4D';
                              }}
                              onBlur={(e) => {
                                e.target.style.background = '#F0F8F4';
                                e.target.style.border = '1px solid transparent';
                              }}
                            />
                          ) : (
                            // Editable input for other columns
                            <input
                              type="text"
                              value={cell || ''}
                              onChange={(e) => handleCellEdit(rowIndex, cellIndex - 2, e.target.value)}
                              placeholder=" "
                              style={{
                                width: '100%',
                                minWidth: '120px',
                                padding: '6px 8px',
                                border: '1px solid transparent',
                                borderRadius: '4px',
                                background: 'transparent',
                                color: '#666',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                transition: 'all 0.2s',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                              onFocus={(e) => {
                                e.target.style.background = '#FAFAFA';
                                e.target.style.border = '1px solid #009B4D';
                                e.target.style.outline = 'none';
                              }}
                              onBlur={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.border = '1px solid transparent';
                              }}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>

            {excelData.length > 11 && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#F5F5F0',
                borderRadius: '6px',
                textAlign: 'center',
                color: '#666',
                fontSize: '13px'
              }}>
                Showing all {excelData.length - 1} rows
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!excelData && (
          <div style={{
            background: 'linear-gradient(145deg, #FFFFFF, #F9FAFB)',
            padding: '80px 32px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11V17" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 14H15" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                right: '-8px',
                width: '28px',
                height: '28px',
                background: '#FEE2E2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h3 style={{
              fontFamily: '"Feather Bold", serif',
              fontSize: '20px',
              color: '#111827',
              marginBottom: '8px',
              fontWeight: '700'
            }}>
              No Excel file uploaded yet
            </h3>
            <p style={{
              color: '#6B7280',
              fontSize: '14px',
              lineHeight: '1.6',
              maxWidth: '400px',
              margin: '0 auto 24px'
            }}>
              Upload an Excel file above to view its contents in table format. You can then edit, toggle visibility, and submit the data to your database.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#9CA3AF'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Edit cells
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#9CA3AF'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Toggle visibility
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#9CA3AF'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10L12 15L17 10M12 15V3" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Submit to DB
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}