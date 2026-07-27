// Single source of truth for "what month is it" copy across the site
// (hero H1, browse header, family-wizard prompt, etc.) — computed fresh
// from the real date instead of being hardcoded to a specific month.
export function currentMonthLabel() {
  return new Date().toLocaleString('en-GB', { month: 'long' }); // "July"
}
