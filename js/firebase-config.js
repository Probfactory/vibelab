// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBbXFVJwM5TXGX-dyfd_qbyvlsbOYiKCI",
  authDomain: "vibelab-6bff0.firebaseapp.com",
  projectId: "vibelab-6bff0",
  storageBucket: "vibelab-6bff0.firebasestorage.app",
  messagingSenderId: "201935640419",
  appId: "1:201935640419:web:1adf8a30a694b1ce612556",
  measurementId: "G-YT38T5VD65"
};

// Guard: only init if Firebase SDK loaded successfully
let auth, db, storage;
let firebaseReady = false;
if (typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    firebaseReady = true;
  } catch (e) {
    console.warn('Firebase init failed:', e.message);
  }
} else {
  console.warn('Firebase SDK not loaded — running in offline/preview mode');
}

// Global state
let currentUser = null;
let currentUserProfile = null;

// Tag/category maps
const tagClasses = { web: 'tag-web', art: 'tag-art', game: 'tag-game', tool: 'tag-tool', ai: 'tag-ai', mobile: 'tag-mobile', image: 'tag-image' };
const tagMap = { web: 'Web', art: 'Gen Art', game: 'Game', tool: 'Tool', ai: 'AI', mobile: 'Mobile', image: 'Image' };
const colorMap = { web: '#3b82f6', art: '#ec4899', game: '#10b981', tool: '#f59e0b', ai: '#7c3aed', mobile: '#4f46e5', image: '#db2777' };
const gradMap = {
  web: 'linear-gradient(135deg, #dbeafe, #bfdbfe, #93c5fd)',
  art: 'linear-gradient(135deg, #fce7f3, #fbcfe8, #f9a8d4)',
  game: 'linear-gradient(135deg, #d1fae5, #a7f3d0, #6ee7b7)',
  tool: 'linear-gradient(135deg, #fef3c7, #fde68a, #fcd34d)',
  ai: 'linear-gradient(135deg, #ede9fe, #ddd6fe, #c4b5fd)',
  mobile: 'linear-gradient(135deg, #e0e7ff, #c7d2fe, #a5b4fc)',
  image: 'linear-gradient(135deg, #fce7f3, #fbcfe8, #f9a8d4)'
};

// Sample projects fallback (include all 9 from original)
const sampleProjects = [
  { id: 'sample-1', name: "Drift FM", desc: "A lo-fi radio player that generates ambient soundscapes based on the time of day and weather in your city.", author: "mellow_dev", authorUid: 'sample-user-1', category: "web", tag: "Web", color: "#3b82f6", vibes: 234, comments: 18, gradient: "linear-gradient(135deg, #dbeafe, #bfdbfe, #93c5fd)", status: "Shipped", createdAt: new Date('2026-02-20'), link: "https://example.com", githubUrl: "https://github.com/example/drift-fm", tags: ["React", "Web Audio API", "Weather API"] },
  { id: 'sample-2', name: "Particle Garden", desc: "Interactive generative art where each click plants a seed that grows into a unique particle system. Every garden is different.", author: "pixel_witch", authorUid: 'sample-user-2', category: "art", tag: "Gen Art", color: "#ec4899", vibes: 412, comments: 35, gradient: "linear-gradient(135deg, #fce7f3, #fbcfe8, #f9a8d4)", status: "Experiment", createdAt: new Date('2026-02-18') },
  { id: 'sample-3', name: "Vibe Check", desc: "An AI-powered mood journal that analyzes your entries and creates a visual mood map over time. Built with vibes only.", author: "soft_coder", authorUid: 'sample-user-3', category: "ai", tag: "AI", color: "#7c3aed", vibes: 189, comments: 22, gradient: "linear-gradient(135deg, #ede9fe, #ddd6fe, #c4b5fd)", status: "WIP", createdAt: new Date('2026-02-15') },
  { id: 'sample-4', name: "Tiny Worlds", desc: "A browser game where you build miniature floating islands. No goals, no score — just peaceful creation.", author: "cloud9js", authorUid: 'sample-user-4', category: "game", tag: "Game", color: "#10b981", vibes: 567, comments: 48, gradient: "linear-gradient(135deg, #d1fae5, #a7f3d0, #6ee7b7)", status: "Shipped", createdAt: new Date('2026-02-10') },
  { id: 'sample-5', name: "Color Thief CLI", desc: "A terminal tool that extracts beautiful color palettes from any image. Outputs CSS, Tailwind, and Figma tokens.", author: "term_queen", authorUid: 'sample-user-5', category: "tool", tag: "Tool", color: "#f59e0b", vibes: 321, comments: 27, gradient: "linear-gradient(135deg, #fef3c7, #fde68a, #fcd34d)", status: "Shipped", createdAt: new Date('2026-02-08') },
  { id: 'sample-6', name: "Wave Type", desc: "A typography experiment where letters ripple and flow like water. Type anything and watch it come alive.", author: "font_surfer", authorUid: 'sample-user-6', category: "art", tag: "Gen Art", color: "#ec4899", vibes: 276, comments: 19, gradient: "linear-gradient(135deg, #fce7f3, #f9a8d4, #f472b6)", status: "Experiment", createdAt: new Date('2026-02-05') },
  { id: 'sample-7', name: "Prompt Palette", desc: "An AI prompt builder with a visual interface. Drag and drop prompt components to craft the perfect generation.", author: "synthdev", authorUid: 'sample-user-7', category: "ai", tag: "AI", color: "#7c3aed", vibes: 198, comments: 31, gradient: "linear-gradient(135deg, #ede9fe, #c4b5fd, #a78bfa)", status: "WIP", createdAt: new Date('2026-02-01') },
  { id: 'sample-8', name: "Midnight Radio", desc: "A retro-styled web radio with curated playlists that change based on the phase of the moon. Yes, really.", author: "luna_coder", authorUid: 'sample-user-8', category: "web", tag: "Web", color: "#3b82f6", vibes: 445, comments: 39, gradient: "linear-gradient(135deg, #dbeafe, #93c5fd, #60a5fa)", status: "Shipped", createdAt: new Date('2026-01-25') },
  { id: 'sample-9', name: "Stack Roulette", desc: "Spin the wheel and get a random tech stack challenge. Build something in 48 hours with whatever it lands on.", author: "chaos_eng", authorUid: 'sample-user-9', category: "tool", tag: "Tool", color: "#f59e0b", vibes: 178, comments: 44, gradient: "linear-gradient(135deg, #fef3c7, #fde68a, #fbbf24)", status: "Experiment", createdAt: new Date('2026-01-20') },
  { id: 'sample-10', name: "Neon Grid", desc: "A CSS art generator that creates neon-lit cityscapes from grid patterns. Every refresh is a new skyline.", author: "grid_wizard", authorUid: 'sample-user-10', category: "art", tag: "Gen Art", color: "#ec4899", vibes: 389, comments: 29, gradient: "linear-gradient(135deg, #fdf2f8, #fce7f3, #fbcfe8)", status: "Shipped", createdAt: new Date('2026-01-18') },
  { id: 'sample-11', name: "Focus Flow", desc: "A minimal pomodoro timer with ambient sounds and focus analytics. Track your deep work streaks.", author: "zen_dev", authorUid: 'sample-user-11', category: "web", tag: "Web", color: "#3b82f6", vibes: 256, comments: 21, gradient: "linear-gradient(135deg, #eff6ff, #dbeafe, #bfdbfe)", status: "Shipped", createdAt: new Date('2026-01-15') },
  { id: 'sample-12', name: "Pixel Dungeon", desc: "A roguelike dungeon crawler with procedurally generated pixel art levels. Each run tells a different story.", author: "retro_bits", authorUid: 'sample-user-12', category: "game", tag: "Game", color: "#10b981", vibes: 623, comments: 57, gradient: "linear-gradient(135deg, #ecfdf5, #d1fae5, #a7f3d0)", status: "Shipped", createdAt: new Date('2026-01-12') },
  { id: 'sample-13', name: "Voice Memo AI", desc: "Record voice memos and get AI-generated summaries, action items, and mood analysis. Your thoughts, organized.", author: "audio_lab", authorUid: 'sample-user-13', category: "ai", tag: "AI", color: "#7c3aed", vibes: 345, comments: 38, gradient: "linear-gradient(135deg, #f5f3ff, #ede9fe, #ddd6fe)", status: "Experiment", createdAt: new Date('2026-01-10') },
  { id: 'sample-14', name: "CSS Alchemy", desc: "Turn any design screenshot into pure CSS art. Upload an image and watch it transform into gradients and shapes.", author: "style_smith", authorUid: 'sample-user-14', category: "tool", tag: "Tool", color: "#f59e0b", vibes: 412, comments: 33, gradient: "linear-gradient(135deg, #fffbeb, #fef3c7, #fde68a)", status: "WIP", createdAt: new Date('2026-01-08') },
  { id: 'sample-15', name: "Island Hop", desc: "A cozy mobile game where you sail between hand-drawn islands collecting stories from quirky characters.", author: "isle_dev", authorUid: 'sample-user-15', category: "game", tag: "Game", color: "#10b981", vibes: 498, comments: 42, gradient: "linear-gradient(135deg, #d1fae5, #6ee7b7, #34d399)", status: "Shipped", createdAt: new Date('2026-01-05') },
  { id: 'sample-16', name: "Mood Gradient", desc: "A daily mood tracker that paints your emotional landscape as flowing color gradients. A year of feelings in one canvas.", author: "color_mind", authorUid: 'sample-user-16', category: "web", tag: "Web", color: "#3b82f6", vibes: 287, comments: 24, gradient: "linear-gradient(135deg, #dbeafe, #a5b4fc, #c4b5fd)", status: "Experiment", createdAt: new Date('2026-01-02') },
  { id: 'sample-17', name: "Terminal Tales", desc: "A text adventure engine that runs entirely in the terminal. Write stories with branching paths using simple markdown.", author: "cli_poet", authorUid: 'sample-user-17', category: "tool", tag: "Tool", color: "#f59e0b", vibes: 167, comments: 15, gradient: "linear-gradient(135deg, #fefce8, #fef9c3, #fef08a)", status: "WIP", createdAt: new Date('2025-12-28') },
  { id: 'sample-18', name: "Synth Playground", desc: "A web-based modular synthesizer with drag-and-drop nodes. Create sounds you've never heard before.", author: "wave_maker", authorUid: 'sample-user-18', category: "web", tag: "Web", color: "#3b82f6", vibes: 534, comments: 46, gradient: "linear-gradient(135deg, #eef2ff, #e0e7ff, #c7d2fe)", status: "Shipped", createdAt: new Date('2025-12-25') },
  { id: 'sample-19', name: "Sketch to Code", desc: "Draw a rough UI sketch on your screen and watch AI turn it into clean React components in real time.", author: "draw_dev", authorUid: 'sample-user-19', category: "ai", tag: "AI", color: "#7c3aed", vibes: 678, comments: 63, gradient: "linear-gradient(135deg, #faf5ff, #f3e8ff, #e9d5ff)", status: "Experiment", createdAt: new Date('2025-12-20') },
  { id: 'sample-20', name: "Terrain Gen", desc: "A real-time 3D terrain generator using noise algorithms. Explore infinite procedural landscapes in your browser.", author: "geo_coder", authorUid: 'sample-user-20', category: "art", tag: "Gen Art", color: "#ec4899", vibes: 356, comments: 28, gradient: "linear-gradient(135deg, #fdf4ff, #fae8ff, #f5d0fe)", status: "Shipped", createdAt: new Date('2025-12-15') },
  { id: 'sample-21', name: "Hue Shift", desc: "A live wallpaper engine for the web. Colors shift based on time, music, or your webcam input.", author: "chroma_dev", authorUid: 'sample-user-21', category: "art", tag: "Gen Art", color: "#ec4899", vibes: 291, comments: 17, gradient: "linear-gradient(135deg, #fce7f3, #f9a8d4, #ec4899)", status: "Experiment", createdAt: new Date('2025-12-12') },
  { id: 'sample-22', name: "Deploy Bot", desc: "A friendly CLI assistant that guides you through deploying to any cloud provider. No more config anxiety.", author: "infra_pal", authorUid: 'sample-user-22', category: "tool", tag: "Tool", color: "#f59e0b", vibes: 203, comments: 26, gradient: "linear-gradient(135deg, #fff7ed, #ffedd5, #fed7aa)", status: "WIP", createdAt: new Date('2025-12-08') },
  { id: 'sample-23', name: "Memory Lane", desc: "Upload photos and let AI arrange them into a beautiful animated timeline with auto-generated captions.", author: "snap_ai", authorUid: 'sample-user-23', category: "ai", tag: "AI", color: "#7c3aed", vibes: 445, comments: 41, gradient: "linear-gradient(135deg, #f5f3ff, #ddd6fe, #c4b5fd)", status: "Shipped", createdAt: new Date('2025-12-05') },
  { id: 'sample-24', name: "Beat Garden", desc: "Plant musical seeds and grow a beat. Each plant produces a different sound layer in this interactive music garden.", author: "rhythm_grow", authorUid: 'sample-user-24', category: "game", tag: "Game", color: "#10b981", vibes: 512, comments: 36, gradient: "linear-gradient(135deg, #ecfdf5, #a7f3d0, #6ee7b7)", status: "Shipped", createdAt: new Date('2025-12-01') },
  { id: 'sample-25', name: "Type Racer AI", desc: "Race against an AI that adapts to your typing speed. The better you get, the faster it types back.", author: "key_master", authorUid: 'sample-user-25', category: "web", tag: "Web", color: "#3b82f6", vibes: 378, comments: 52, gradient: "linear-gradient(135deg, #dbeafe, #93c5fd, #3b82f6)", status: "Experiment", createdAt: new Date('2025-11-28') }
];

// Utility: time ago
function timeAgo(date) {
  if (!date) return '';
  const now = new Date();
  const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
  const seconds = Math.floor((now - d) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 30) return days + 'd ago';
  const months = Math.floor(days / 30);
  return months + 'mo ago';
}

// SVG icons for cards
const vibeIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="14" height="14" fill="currentColor"><path fill-rule="evenodd" d="M74.96,1.39c-.91-.24-1.85-.37-2.78-.37-4.85,0-9.12,3.27-10.39,7.95l-5.59,20.07-5.36-19.59c-1.28-4.67-5.55-7.93-10.4-7.93-.94,0-1.87.12-2.78.37-2.78.74-5.1,2.53-6.54,5.02-1.44,2.49-1.82,5.39-1.08,8.17l4.41,16.47s-.02,0-.03,0c-3.36.87-6.01,3.3-7.27,6.39-.75.03-1.5.15-2.24.34-2.78.72-5.11,2.48-6.57,4.96-1.46,2.48-1.86,5.37-1.14,8.15l2.09,8.04s0,.03.01.05v8.26c0,17.39,14.15,31.54,31.54,31.54,2.82,0,5.62-.38,8.34-1.12.63-.15,2.54-.67,5.06-1.86.09-.04.18-.08.27-.13l.09-.05h0s0,0,0,0l.04-.02c.05-.03.1-.05.15-.08.82-.41,1.61-.84,2.34-1.28.11-.07.22-.14.32-.21.65-.41,1.29-.83,1.9-1.27,4.23-3.07,7.64-7.19,9.88-11.94.17-.25.31-.51.43-.78,1.8-4.04,2.71-8.35,2.71-12.8v-10.24c0-5.91-2.98-11.31-7.8-14.48l7.96-28.41v-.02s.01-.02.01-.02c1.53-5.73-1.88-11.64-7.61-13.17ZM50.85,92.2c-13.48,0-24.45-10.97-24.45-24.45v-4.61c1.03.54,2.16.81,3.3.81.61,0,1.22-.08,1.83-.23h0c1.87-.48,3.43-1.67,4.41-3.33.09-.15.16-.29.24-.44.14.09.28.19.42.27,1.12.66,2.37,1,3.64,1,.61,0,1.22-.08,1.82-.23,1.6-.41,2.98-1.35,3.95-2.65,1.44.77,3.08,1.21,4.83,1.21h4.56c-3.39,2.82-5.55,7.06-5.55,11.8v1.73c0,.98.79,1.77,1.77,1.77s1.77-.79,1.77-1.77v-1.73c0-6.51,5.29-11.8,11.8-11.8.98,0,1.77-.79,1.77-1.77s-.79-1.77-1.77-1.77h-14.35c-3.69,0-6.69-3-6.69-6.69,0-1.14.93-2.07,2.07-2.07h18.81c5.66,0,10.26,4.6,10.26,10.26v10.24c0,1.03-.06,2.05-.19,3.06-.01.05-.02.1-.03.15-1.14,7.03-4.42,12.57-9.75,16.49-1.51,1.11-2.98,1.92-4.23,2.51-3.2,1.47-6.69,2.25-10.25,2.25ZM26.71,45.14c.31-.08.62-.12.93-.12.65,0,1.28.17,1.86.51.85.5,1.45,1.29,1.69,2.24l2.09,8.04c.25.95.11,1.94-.39,2.78h0c-.5.85-1.29,1.45-2.24,1.69h0c-.95.25-1.94.11-2.78-.39-.85-.5-1.45-1.29-1.69-2.24l-2.09-8.04c-.51-1.96.67-3.97,2.63-4.48ZM44.01,11.32l8.85,32.38h-6.63c-.39,0-.78.04-1.15.12l-8.19-30.57c-.25-.95-.12-1.94.37-2.8.49-.85,1.29-1.46,2.24-1.72,1.95-.52,3.98.64,4.51,2.59ZM43.23,56.14c-.5.69-1.22,1.19-2.06,1.41-.95.25-1.94.11-2.78-.39-.85-.5-1.45-1.29-1.69-2.24l-3.12-12.02c-.51-1.96.67-3.97,2.63-4.48.95-.25,1.94-.11,2.78.39.74.44,1.3,1.1,1.59,1.9l1.33,5.04c-.8.97-1.29,2.22-1.29,3.58,0,2.62.99,5.01,2.62,6.82ZM73.12,8.23c1.96.52,3.12,2.54,2.6,4.5l-8.72,31.11c-.64-.09-1.29-.14-1.96-.14h-5.61l9.19-32.87c.52-1.96,2.54-3.12,4.5-2.6Z"/></svg>`;
const commentIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const copyIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

// Utility: render a project card HTML
function renderProjectCard(p) {
  const authorName = p.authorName || p.author || 'Anonymous';
  const authorInitial = authorName[0] ? authorName[0].toUpperCase() : 'A';
  const cat = p.category || 'web';
  const tagLabel = p.tag || tagMap[cat] || 'Web';
  const gradient = p.gradient || gradMap[cat] || 'linear-gradient(135deg, #dbeafe, #bfdbfe, #93c5fd)';
  const cardColor = p.color || colorMap[cat] || '#3b82f6';
  return `
    <a href="vibe.html?id=${p.id}" class="project-card" data-category="${cat}">
      <div class="card-thumb" style="background: ${p.imageURL ? `url(${escapeHtml(p.imageURL)}) center/cover` : gradient};"></div>
      <div class="card-info">
        <div class="card-info-text">
          <h3>${escapeHtml(p.name)}</h3>
          <span class="card-creator">${p.authorPhoto ? `<img src="${escapeHtml(p.authorPhoto)}" class="card-creator-pic">` : `<span class="card-creator-initial" style="background:${cardColor};">${authorInitial}</span>`} ${escapeHtml(authorName)}</span>
        </div>
        <div class="card-stats">
          <span class="card-stat">${vibeIconSVG} ${p.vibes || 0}</span>
          <span class="card-stat">${commentIconSVG} ${p.comments || 0}</span>
        </div>
      </div>
    </a>
  `;
}

// Utility: escape HTML (including single quotes for use in inline handlers)
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML.replace(/'/g, '&#39;');
}

// Utility: get URL parameter (with hash fallback for cached 301 redirects)
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  let value = params.get(name);
  if (!value && window.location.hash) {
    // Fallback: parse hash as query params (survives 301 redirects that strip query params)
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    value = hashParams.get(name);
  }
  return value;
}

// --- Username / Vanity URL utilities ---

const RESERVED_USERNAMES = new Set([
  'feed', 'community', 'profile', 'project', 'my-vibes', 'index',
  'css', 'js', 'images', 'assets', 'api', 'admin', 'settings',
  'login', 'signup', 'about', 'help', 'support', 'blog',
  'terms', 'privacy', 'null', 'undefined', 'explore', 'search',
  'new', 'edit', 'delete', 'auth', 'callback', 'error', '404',
  'vibe', 'invite', 'invites', 'reset-password'
]);

// Validate a username: returns { valid: boolean, error: string }
function validateUsername(username) {
  if (!username) return { valid: false, error: 'Username is required' };
  const u = username.toLowerCase().trim();
  if (u.length < 3) return { valid: false, error: 'Must be at least 3 characters' };
  if (u.length > 20) return { valid: false, error: 'Must be 20 characters or less' };
  if (!/^[a-z][a-z0-9_-]*$/.test(u)) return { valid: false, error: 'Start with a letter, use only letters, numbers, _ or -' };
  if (RESERVED_USERNAMES.has(u)) return { valid: false, error: 'This username is not available' };
  return { valid: true, error: '' };
}

// Check if a username is available in Firestore
async function checkUsernameAvailable(username) {
  if (!db) return false;
  const doc = await db.collection('usernames').doc(username.toLowerCase().trim()).get();
  return !doc.exists;
}

// Build a profile URL: prefers vanity /{username}, falls back to /profile?id={uid}
function getProfileUrl(username, uid) {
  if (username) return '/' + encodeURIComponent(username);
  if (uid) return '/profile?id=' + encodeURIComponent(uid);
  return '/profile';
}

// Extract username from current URL path (for vanity URL routing)
function getUsernameFromPath() {
  const path = window.location.pathname;
  // Remove leading slash and .html extension
  const segment = path.replace(/^\//, '').replace(/\.html$/, '');
  // If it's a known page or empty, return null
  if (!segment || segment === 'index' || RESERVED_USERNAMES.has(segment)) return null;
  // If it looks like a file path (has dots or slashes), skip
  if (segment.includes('/') || segment.includes('.')) return null;
  return segment;
}

// --- Invite Code utilities ---

// Generate a random invite code like "VIBE-A3X9K7PB"
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/0/1 to avoid confusion
  let code = 'VIBE-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Validate an invite code against Firestore
async function validateInviteCode(code) {
  if (!db || !code) return { valid: false, error: 'Invite code is required' };
  const upperCode = code.toUpperCase().trim();
  try {
    const snapshot = await db.collection('inviteCodes')
      .where('code', '==', upperCode)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return { valid: false, error: 'Invalid or expired invite code' };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Check expiry
    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
      return { valid: false, error: 'This invite code has expired' };
    }

    return { valid: true, error: '', codeDocId: doc.id, codeData: data };
  } catch (e) {
    console.error('Invite code validation error:', e);
    return { valid: false, error: 'Error validating invite code. Please try again.' };
  }
}

// Create a new invite code in Firestore
async function createInviteCode(createdByUid, createdByName, type, expiresAt) {
  if (!db) return null;
  const code = generateInviteCode();
  const docData = {
    code: code,
    createdBy: createdByUid,
    createdByName: createdByName || '',
    usedBy: null,
    usedByName: null,
    usedAt: null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    expiresAt: expiresAt || null,
    status: 'active',
    type: type || 'user'
  };

  try {
    await db.collection('inviteCodes').add(docData);

    // Decrement inviter's remaining invites at generation time (not redemption)
    if (type === 'user' && createdByUid) {
      await db.collection('users').doc(createdByUid).update({
        invitesRemaining: firebase.firestore.FieldValue.increment(-1)
      });
    }

    return code;
  } catch (e) {
    console.error('Error creating invite code:', e);
    return null;
  }
}

// Redeem an invite code (mark as used)
async function redeemInviteCode(code, usedByUid, usedByName, usedByEmail) {
  if (!db || !code) return false;
  const upperCode = code.toUpperCase().trim();
  try {
    const snapshot = await db.collection('inviteCodes')
      .where('code', '==', upperCode)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) return false;

    const doc = snapshot.docs[0];

    await doc.ref.update({
      usedBy: usedByUid,
      usedByName: usedByName || '',
      usedByEmail: usedByEmail || '',
      usedAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'used'
    });

    // Note: invitesRemaining is now decremented at code GENERATION time
    // (in createInviteCode), not at redemption time

    return true;
  } catch (e) {
    console.error('Error redeeming invite code:', e);
    return false;
  }
}

// Check if a superadmin exists in the system
async function checkSuperAdminExists() {
  if (!db) return false;
  try {
    const snapshot = await db.collection('users')
      .where('role', '==', 'superadmin')
      .limit(1)
      .get();
    return !snapshot.empty;
  } catch (e) {
    console.error('Error checking superadmin:', e);
    return false;
  }
}
