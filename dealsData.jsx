// ============================================================
// Jungle Summer — Deals: mock discount/promo data + helpers
// A "deal" is a discount or promo for a kids' experience.
// Merchants, parents and the Jungle team can submit them.
// People rate each deal good/bad (thumbs up/down -> net score).
// All content mocked. Dates anchored to "today" = 6 Jun 2026.
// ============================================================

// "today" for the prototype, so "ending soon" math is stable.
const TODAY = new Date('2026-06-06T00:00:00+08:00');

const DEAL_CATEGORIES = [
  { k: 'Classes', label: 'Classes' },
  { k: 'Camps', label: 'Camps' },
  { k: 'Attractions', label: 'Attractions' },
  { k: 'Shows', label: 'Shows' },
  { k: 'Dining', label: 'Dining' },
  { k: 'Retail', label: 'Retail' },
];

// submitter types -> trust signal
const SUBMITTER = {
  merchant: { label: 'Verified merchant', tone: 'green' },
  jungle:   { label: 'Jungle team', tone: 'dark' },
  parent:   { label: 'Submitted by parent', tone: 'neutral' },
};

// Each deal maps to a future `deals` table row.
const DEALS = [
  {
    id:'kidstop-summer20', merchant:'KidSTOP Science Centre', category:'Attractions',
    headline:'20% off admission for kids under 8', discountLabel:'20% off',
    detail:'Flash your code at the KidSTOP counter for 20% off a child ticket. Valid weekdays only, one child per code.',
    promo:'SUMMER20', expiry:'2026-06-09', area:'West', location:'15 Science Centre Road',
    submittedByType:'merchant', submittedBy:'KidSTOP', submittedAt:'2026-05-28',
    up:142, down:9,
  },
  {
    id:'pororo-weekday', merchant:'Pororo Park Singapore', category:'Attractions',
    headline:'Weekday family bundle: 2 kids + 2 adults for S$78', discountLabel:'Save S$26',
    detail:'Bundle covers two children and two accompanying adults on any weekday. Show the code at Marina Square entrance.',
    promo:'POROFAM', expiry:'2026-06-12', area:'Central', location:'6 Raffles Boulevard, Marina Square',
    submittedByType:'merchant', submittedBy:'Pororo Park', submittedAt:'2026-05-30',
    up:88, down:14,
  },
  {
    id:'amazonia-1for1', merchant:'Amazonia Playground', category:'Attractions',
    headline:'1-for-1 weekday play pass', discountLabel:'1-for-1',
    detail:'Buy one child play pass, get one free, Monday to Thursday. Great for siblings or a playdate. Socks required.',
    promo:'PLAY1FOR1', expiry:'2026-06-15', area:'Central', location:'Great World, 1 Kim Seng Promenade',
    submittedByType:'parent', submittedBy:'Mum of two', submittedAt:'2026-06-01',
    up:64, down:7,
  },
  {
    id:'artscience-family', merchant:'ArtScience Museum', category:'Attractions',
    headline:'Family of 4 ticket at 15% off', discountLabel:'15% off',
    detail:'Discount applies to the Future World family bundle when booked online. Enter the code at checkout.',
    promo:'JBARTSCI', expiry:'2026-06-20', area:'Central', location:'6 Bayfront Avenue',
    submittedByType:'jungle', submittedBy:'Jungle team', submittedAt:'2026-05-25',
    up:103, down:5,
  },
  {
    id:'littlebigclub-trial', merchant:'Little Big Club', category:'Classes',
    headline:'Free trial music & movement class', discountLabel:'Free trial',
    detail:'One free 45-minute trial class for ages 1 to 4. Mention Jungle when you call to book a slot.',
    promo:'JBTRIAL', expiry:'2026-06-22', area:'East', location:'Parkway Parade, 80 Marine Parade Road',
    submittedByType:'merchant', submittedBy:'Little Big Club', submittedAt:'2026-05-20',
    up:51, down:3,
  },
  {
    id:'camp-asia-early', merchant:'Camp Asia', category:'Camps',
    headline:'Early-bird: S$50 off June multi-sport camp', discountLabel:'S$50 off',
    detail:'Save S$50 per child on any full-week June camp when you book before the deadline. Limited spaces.',
    promo:'EARLYJUN', expiry:'2026-06-10', area:'East', location:'UWCSEA East, 1 Tampines Street 73',
    submittedByType:'merchant', submittedBy:'Camp Asia', submittedAt:'2026-05-18',
    up:77, down:21,
  },
  {
    id:'our-tampines-hub', merchant:'Splash-N-Surf', category:'Attractions',
    headline:'Kids swim free with one paying adult', discountLabel:'Kids free',
    detail:'One child enters free with each paying adult at the water playground. Weekdays before 1pm only.',
    promo:'SPLASHFREE', expiry:'2026-06-30', area:'East', location:'Our Tampines Hub, 1 Tampines Walk',
    submittedByType:'parent', submittedBy:'Tampines dad', submittedAt:'2026-06-02',
    up:39, down:18,
  },
  {
    id:'kineticland', merchant:'KineticLand', category:'Shows',
    headline:'25% off school-holiday science show tickets', discountLabel:'25% off',
    detail:'Applies to all June holiday show times. Quote the code when booking by phone or at the door.',
    promo:'KINETIC25', expiry:'2026-06-18', area:'Central', location:'Suntec City, 3 Temasek Boulevard',
    submittedByType:'merchant', submittedBy:'KineticLand', submittedAt:'2026-05-29',
    up:46, down:11,
  },
  {
    id:'plaster-studio', merchant:'The Plaster Studio', category:'Classes',
    headline:'Buy 2 painting kits, get the 3rd free', discountLabel:'3-for-2',
    detail:'Mix and match any plaster painting kits in store. Perfect for a rainy afternoon or a small party.',
    promo:'PLASTER3', expiry:'2026-07-05', area:'North-East', location:'Waterway Point, 83 Punggol Central',
    submittedByType:'parent', submittedBy:'Punggol parent', submittedAt:'2026-06-03',
    up:28, down:4,
  },
  {
    id:'kbox-junior', merchant:'PoloWalk Kids Cafe', category:'Dining',
    headline:'Free kids meal with every adult main', discountLabel:'Free kids meal',
    detail:'One complimentary kids meal per adult main course ordered. Dine-in only, not valid on public holidays.',
    promo:'EATFREE', expiry:'2026-07-12', area:'East', location:'81 Lorong N Telok Kurau',
    submittedByType:'merchant', submittedBy:'PoloWalk Cafe', submittedAt:'2026-05-31',
    up:34, down:6,
  },
  {
    id:'mybookbox', merchant:'My Book Box', category:'Retail',
    headline:'30% off your first kids book subscription', discountLabel:'30% off',
    detail:'New subscribers get 30% off the first curated box of age-matched picture books. Cancel anytime.',
    promo:'READMORE', expiry:'2026-07-20', area:'Online', location:'Islandwide delivery',
    submittedByType:'jungle', submittedBy:'Jungle team', submittedAt:'2026-05-22',
    up:59, down:8,
  },
  {
    id:'climbcentral-family', merchant:'Climb Central', category:'Classes',
    headline:'Family climb pass: 4 entries for the price of 3', discountLabel:'4-for-3',
    detail:'Auto-belay climbing for the whole family. Kids must be 5 and above. Closed-toe shoes required.',
    promo:'CLIMB4', expiry:'2026-08-01', area:'Central', location:'Funan, 107 North Bridge Road',
    submittedByType:'merchant', submittedBy:'Climb Central', submittedAt:'2026-05-27',
    up:42, down:5,
  },
];

// ---- helpers ----
function daysLeft(expiryStr) {
  const exp = new Date(expiryStr + 'T23:59:59+08:00');
  return Math.ceil((exp - TODAY) / 86400000);
}
function expiryText(expiryStr) {
  const d = new Date(expiryStr + 'T00:00:00+08:00');
  const day = d.getDate();
  const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
  return `${day} ${mon}`;
}
function urgencyTone(n) {
  if (n <= 3) return { label: n <= 0 ? 'Expired' : (n === 1 ? 'Ends today' : `${n} days left`), bg:'#FDECEA', fg:'#C5372F', dot:'#F63F3C' };
  if (n <= 7) return { label: `${n} days left`, bg:'#FCF3DF', fg:'#8A6A12', dot:'#EEC71B' };
  return { label: `${n} days left`, bg:'#E5F5ED', fg:'#0C3C26', dot:'#009B4D' };
}
function netScore(d) { return (d.up || 0) - (d.down || 0); }
function submittedAgo(str) {
  const d = new Date(str + 'T00:00:00+08:00');
  const days = Math.round((TODAY - d) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  const wk = Math.round(days / 7);
  return wk === 1 ? 'a week ago' : `${wk} weeks ago`;
}

Object.assign(window, { DEALS, DEAL_CATEGORIES, SUBMITTER, TODAY, daysLeft, expiryText, urgencyTone, netScore, submittedAgo });
