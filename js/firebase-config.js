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
  { id: 'sample-1', name: "Drift FM", desc: "A lo-fi radio player that generates ambient soundscapes based on the time of day and weather in your city.", author: "mellow_dev", authorUid: 'sample-user-1', category: "web", tag: "Web", color: "#3b82f6", vibes: 234, comments: 18, gradient: "linear-gradient(135deg, #dbeafe, #bfdbfe, #93c5fd)", status: "Shipped", createdAt: new Date('2026-02-20') },
  { id: 'sample-2', name: "Particle Garden", desc: "Interactive generative art where each click plants a seed that grows into a unique particle system. Every garden is different.", author: "pixel_witch", authorUid: 'sample-user-2', category: "art", tag: "Gen Art", color: "#ec4899", vibes: 412, comments: 35, gradient: "linear-gradient(135deg, #fce7f3, #fbcfe8, #f9a8d4)", status: "Experiment", createdAt: new Date('2026-02-18') },
  { id: 'sample-3', name: "Vibe Check", desc: "An AI-powered mood journal that analyzes your entries and creates a visual mood map over time. Built with vibes only.", author: "soft_coder", authorUid: 'sample-user-3', category: "ai", tag: "AI", color: "#7c3aed", vibes: 189, comments: 22, gradient: "linear-gradient(135deg, #ede9fe, #ddd6fe, #c4b5fd)", status: "WIP", createdAt: new Date('2026-02-15') },
  { id: 'sample-4', name: "Tiny Worlds", desc: "A browser game where you build miniature floating islands. No goals, no score — just peaceful creation.", author: "cloud9js", authorUid: 'sample-user-4', category: "game", tag: "Game", color: "#10b981", vibes: 567, comments: 48, gradient: "linear-gradient(135deg, #d1fae5, #a7f3d0, #6ee7b7)", status: "Shipped", createdAt: new Date('2026-02-10') },
  { id: 'sample-5', name: "Color Thief CLI", desc: "A terminal tool that extracts beautiful color palettes from any image. Outputs CSS, Tailwind, and Figma tokens.", author: "term_queen", authorUid: 'sample-user-5', category: "tool", tag: "Tool", color: "#f59e0b", vibes: 321, comments: 27, gradient: "linear-gradient(135deg, #fef3c7, #fde68a, #fcd34d)", status: "Shipped", createdAt: new Date('2026-02-08') },
  { id: 'sample-6', name: "Wave Type", desc: "A typography experiment where letters ripple and flow like water. Type anything and watch it come alive.", author: "font_surfer", authorUid: 'sample-user-6', category: "art", tag: "Gen Art", color: "#ec4899", vibes: 276, comments: 19, gradient: "linear-gradient(135deg, #fce7f3, #f9a8d4, #f472b6)", status: "Experiment", createdAt: new Date('2026-02-05') },
  { id: 'sample-7', name: "Prompt Palette", desc: "An AI prompt builder with a visual interface. Drag and drop prompt components to craft the perfect generation.", author: "synthdev", authorUid: 'sample-user-7', category: "ai", tag: "AI", color: "#7c3aed", vibes: 198, comments: 31, gradient: "linear-gradient(135deg, #ede9fe, #c4b5fd, #a78bfa)", status: "WIP", createdAt: new Date('2026-02-01') },
  { id: 'sample-8', name: "Midnight Radio", desc: "A retro-styled web radio with curated playlists that change based on the phase of the moon. Yes, really.", author: "luna_coder", authorUid: 'sample-user-8', category: "web", tag: "Web", color: "#3b82f6", vibes: 445, comments: 39, gradient: "linear-gradient(135deg, #dbeafe, #93c5fd, #60a5fa)", status: "Shipped", createdAt: new Date('2026-01-25') },
  { id: 'sample-9', name: "Stack Roulette", desc: "Spin the wheel and get a random tech stack challenge. Build something in 48 hours with whatever it lands on.", author: "chaos_eng", authorUid: 'sample-user-9', category: "tool", tag: "Tool", color: "#f59e0b", vibes: 178, comments: 44, gradient: "linear-gradient(135deg, #fef3c7, #fde68a, #fbbf24)", status: "Experiment", createdAt: new Date('2026-01-20') }
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

// Utility: render a project card HTML
function renderProjectCard(p) {
  const authorName = p.authorName || p.author || 'Anonymous';
  const authorInitial = authorName[0] ? authorName[0].toUpperCase() : 'A';
  const cat = p.category || 'web';
  const tagLabel = p.tag || tagMap[cat] || 'Web';
  const gradient = p.gradient || gradMap[cat] || 'linear-gradient(135deg, #dbeafe, #bfdbfe, #93c5fd)';
  const cardColor = p.color || colorMap[cat] || '#3b82f6';
  return `
    <a href="project.html?id=${p.id}#id=${p.id}" class="project-card" data-category="${cat}">
      <div class="card-preview" style="background: ${p.imageURL ? `url(${p.imageURL}) center/cover` : gradient};">
        <div class="card-gradient"></div>
        <span class="card-tag ${tagClasses[cat] || 'tag-web'}">${tagLabel}</span>
        ${p.builtWith ? `<span class="card-built-with">${escapeHtml(p.builtWith)}</span>` : ''}
      </div>
      <div class="card-body">
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.desc)}</p>
      </div>
      <div class="card-footer">
        <div class="card-author">
          ${p.authorPhoto ? `<img src="${p.authorPhoto}" class="avatar" style="width:26px;height:26px;border-radius:50%;object-fit:cover;">` : `<div class="avatar" style="background: ${cardColor};">${authorInitial}</div>`}
          <span>${escapeHtml(authorName)}</span>
        </div>
        <div class="card-stats">
          <span>&#10024; ${p.vibes || 0}</span>
          <span>&#128172; ${p.comments || 0}</span>
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
