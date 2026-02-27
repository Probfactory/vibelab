# VibeLab - Product Requirements Document (PRD)

**Version:** 1.0
**Last Updated:** February 27, 2026
**Status:** Active Development

---

## 1. Product Overview

**VibeLab** is a creative coding community platform where developers share experimental, vibe-coded projects. It's a showcase and social network for creative developers — think "Dribbble meets Product Hunt for indie devs." The platform encourages building for fun, celebrating each other's work, and sharing the creative process.

**Tagline:** *A Home for Vibe-Coded Experiments*

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript (no framework) |
| Backend/Database | Firebase (Firestore) |
| Authentication | Firebase Auth (Email/Password + Google OAuth) |
| Storage | Firebase Storage (profile photos, project thumbnails) |
| Hosting | Static file serving |
| SDK Version | Firebase SDK v10.12.0 (compat mode) |

---

## 3. Architecture

### 3.1 File Structure

```
/
├── index.html              # Homepage (landing + featured vibes grid)
├── feed.html               # Explore page (full feed, auth-gated)
├── project.html            # Individual project detail page
├── profile.html            # User profile page (auth-gated)
├── my-vibes.html           # User's own projects dashboard
├── community.html          # Community values page
├── css/
│   └── styles.css          # All styles (single stylesheet)
├── js/
│   ├── shared.js           # Nav, footer, modals, CRUD functions, page init
│   ├── firebase-config.js  # Firebase init, global state, utilities, card rendering
│   ├── auth.js             # Authentication logic, toast system, requireAuth
│   └── custom-dropdown.js  # Reusable dropdown component
├── Logo/
│   ├── VL.svg              # Filled logo (used as favicon)
│   └── VL-01.svg           # Line/outline logo (used as vibe icon in cards)
└── PRD.md                  # This document
```

### 3.2 Script Loading Order (all pages)

1. `js/shared.js` — Nav, footer, modals, CRUD functions (no Firebase dependency)
2. `js/custom-dropdown.js` — Custom dropdown component (only on pages with filters)
3. Firebase SDK scripts (app, auth, firestore, storage)
4. `js/firebase-config.js` — Firebase init, global state, tag/color maps, card rendering
5. `js/auth.js` — Auth observer, login/signup, toast system
6. Page-specific inline `<script>` — Page logic, data loading

### 3.3 Page Initialization Pattern

Every page follows the same pattern:
```javascript
initPage('pageName');  // Injects nav, footer, and all modals
```
`initPage()` inserts:
- Navigation bar (with active page highlighting)
- Footer
- Auth modal, profile edit modal, submit project modal, save-to-collection modal

### 3.4 Auth State Pattern

Firebase Auth fires `onAuthStateChanged`, which:
1. Sets `currentUser` and `currentUserProfile` globals
2. Calls `updateNav()` to toggle logged-in/logged-out nav state
3. Dispatches custom `authStateReady` event with `{ user, profile }`
4. Each page listens for `authStateReady` to load page-specific content

---

## 4. Firestore Data Model

### 4.1 Collections

#### `users` (document ID = Firebase Auth UID)
```
{
  displayName: string,
  email: string,
  bio: string,
  company: string,
  skills: string[],
  photoURL: string,
  socials: {
    twitter: string,
    github: string,
    website: string
  },
  createdAt: timestamp
}
```

#### `projects`
```
{
  name: string,
  desc: string,
  category: string (web|mobile|game|tool|image),
  builtWith: string (Claude|Bolt|Cursor|Lovable|Antigravity|v0|Replit),
  tag: string (display label, e.g. "Web", "Gen Art"),
  status: string (WIP|Experiment|Shipped),
  visibility: string (public|unlisted),
  link: string (live demo URL),
  githubUrl: string,
  figmaUrl: string,
  tags: string[] (freeform tags like "three.js", "shader"),
  imageURL: string (thumbnail from Firebase Storage),
  authorUid: string,
  authorName: string,
  authorPhoto: string,
  color: string (hex, derived from category),
  gradient: string (CSS gradient, derived from category),
  vibes: number (like count),
  comments: number (comment count),
  createdAt: timestamp,
  updatedAt: timestamp (on edit)
}
```

#### `projects/{projectId}/vibes` (subcollection, document ID = user UID)
```
{
  userId: string,
  createdAt: timestamp
}
```

#### `projects/{projectId}/comments` (subcollection)
```
{
  body: string,
  authorUid: string,
  authorName: string,
  authorPhoto: string,
  authorColor: string,
  parentId: string|null (null for top-level, comment ID for replies),
  reactions: { [userId]: reactionName },  // fire|heart|sparkles|rocket
  createdAt: timestamp
}
```

#### `follows` (document ID = `{followerUid}_{followingUid}`)
```
{
  followerId: string,
  followingId: string,
  createdAt: timestamp
}
```

#### `tag_follows` (document ID = `{userId}_{tagId}`)
```
{
  userId: string,
  tag: string,
  createdAt: timestamp
}
```

#### `users/{userId}/collections` (subcollection)
```
{
  name: string,
  projectIds: string[],
  createdAt: timestamp
}
```

---

## 5. Pages & Features

### 5.1 Homepage (`index.html`)

**Access:** Public (no login required)

#### Hero Section
- Headline: "A home for vibe-coded experiments"
- Subtext describing the community
- CTAs: "Explore Vibes" (links to feed) and "Join VibeLab" (opens auth modal, guest-only)
- Animated hero card stack showing sample project cards

#### Trusted By Section
- Social proof bar showing: Vercel, Figma, Supabase, Replit, Linear, Railway

#### Featured Vibes Grid
- Section label: "FEATURED VIBES"
- Section title: "New Vibes from builders"
- **Feed tabs:** For You, Following, Fresh Experiments, Raw Builds
- **Search bar:** Real-time text search filtering by project name, description, author
- **Filter dropdowns:**
  - Category: All Categories, Web, Mobile, Games, Tools, Image
  - Built with: All, Claude, Bolt, Cursor, Lovable, Antigravity, v0, Replit
  - Status: All Status, WIP, Experiment, Shipped (disabled on Raw Builds / Fresh Experiments tabs)
- Displays up to 9 project cards in a responsive grid
- "View All Projects" button (auth-gated — opens login modal if not signed in)
- Loads real projects from Firestore + 9 sample project fallbacks

#### Project Cards (Compact Design)
- Thumbnail image (16:10 aspect ratio) with gradient fallback per category
- Project name (first line)
- Creator avatar (16px round photo or initial) + creator name (second line)
- Vibe count with outline VL logo icon + comment count with outline speech bubble icon
- Cards link to `project.html?id={id}#id={id}` (hash fallback for cached 301 redirects)

#### Responsive Grid Layout
- 5 columns on widescreen (1600px+)
- 4 columns default
- 3 columns on tablet (1100px)
- 2 columns on mobile (800px)
- 1 column on small mobile (500px)

---

### 5.2 Explore Page (`feed.html`)

**Access:** Authenticated only (login gate for guests)

#### Login Gate
- Shows lock icon, "Sign in to explore projects" message, and Log In button for unauthenticated users
- Full feed hidden until login

#### Feed Features
- Same tab system as homepage: For You, Following, Fresh Experiments, Raw Builds
- Same search + filter toolbar (Category, Built with, Status)
- **"Following" tab** requires auth and shows only projects from followed creators
- **"For You" tab** boosts projects matching followed tags to the top
- **"Fresh Experiments" tab** filters to Experiment + WIP status
- **"Raw Builds" tab** filters to WIP status only

#### Tag Following
- Tag follow bar appears for logged-in users
- Available tags: Web, Gen Art, Games, Tools, AI
- Click to follow/unfollow tags (persisted to Firestore `tag_follows`)
- Followed tags influence "For You" feed personalization

#### Infinite Scroll
- IntersectionObserver-based lazy loading
- Loads 12 projects per page
- Firestore cursor-based pagination with `startAfter`

#### Discover Creators Section
- Horizontal scroll of creator cards at the bottom
- Shows recent users from Firestore (or sample creators as fallback)
- Each card: avatar, name, bio, Follow button
- Links to creator profiles

---

### 5.3 Project Detail Page (`project.html`)

**Access:** Public (anyone can view a project)

#### Project Content
- Full-width project thumbnail/preview image
- Category tag + status badge + time ago
- Project title and description
- **Action buttons:**
  - Vibe (like) — toggles, shows count, auth-gated
  - Save — opens save-to-collection modal, auth-gated
  - Share — copies URL to clipboard, auth-gated
- **External links:** Live Demo, GitHub, Figma (only shown if URLs provided, validated for http/https)
- **Tools & Stack:** Freeform tags displayed as chips
- **Guest CTA:** "Sign up to vibe with this creator" box for logged-out users

#### Comments System
- Comment input with auto-resizing textarea
- User avatar shown next to input (updates on auth)
- **Threaded replies:** Each comment can have nested replies
- **Emoji reactions:** Fire, Heart, Sparkles, Rocket per comment
  - Toggle reactions on/off (one reaction per user per comment)
  - Shows reaction counts
- Comment author links to their profile
- All comment actions (post, reply, react) are auth-gated
- Sample comments shown for sample projects

#### Creator Sidebar
- Creator avatar, name, company
- Bio text
- Follower/following counts
- Follow/unfollow button (not shown on own profile)
- Links to creator's full profile page

#### URL Parameter Handling
- Primary: `?id={projectId}`
- Hash fallback: `#id={projectId}` (survives cached 301 redirects that strip query params)
- `getUrlParam('id')` utility checks both

---

### 5.4 Profile Page (`profile.html`)

**Access:** Authenticated only (login prompt for guests)

#### Login Gate
- Lock icon + "Sign in to view profiles" + Log In button for unauthenticated users

#### Profile Header (View Mode)
- Large avatar (photo or initial)
- Display name
- Company (if set)
- Bio text
- Stats: project count, followers, following
- Skills & interests tags
- Social links: Twitter/X, GitHub, Website
- **Own profile:** "Edit Profile" button
- **Other profiles:** Follow/Unfollow button

#### Profile Header (Edit Mode)
- Inline edit (no modal — toggles between view/edit in-place)
- Clickable avatar to upload new profile photo
- Editable fields: Display Name, Bio, Company, Skills, Twitter, GitHub, Website
- Save Changes / Cancel buttons
- **Danger zone:** "Delete Account" button with double confirmation

#### Profile Tabs
- **Vibes tab:** Grid of user's published projects (using compact card design)
- **Collections tab:** Grid of saved collections
  - Each collection shows preview grid, name, count
  - "New Collection" card (dashed border)
  - Click collection to view its projects
  - Collections are private (only visible to owner)

#### Account Deletion
- Double confirmation (confirm + second confirm)
- Deletes all user's projects (batch)
- Deletes user profile document
- Deletes Firebase Auth account
- Redirects to homepage after deletion
- Handles `auth/requires-recent-login` error

---

### 5.5 My Vibes Page (`my-vibes.html`)

**Access:** Authenticated only

#### Features
- Page title: "My Vibes" with subtitle showing project count
- "+ Share New Vibe" button to open submit modal
- Grid of user's own projects with enhanced cards showing:
  - Standard card preview with tag and "Built with" badge
  - Project name and description
  - Status badge (WIP/Experiment/Shipped) and visibility badge (if unlisted)
  - Vibe and comment counts
  - **Edit button** — opens submit modal pre-populated with project data
  - **Delete button** — deletes project with confirmation dialog
- Empty state with CTA to share first vibe

---

### 5.6 Community Page (`community.html`)

**Access:** Public

#### The VibeLab Way
Three value cards:
1. **Build What Feels Right** (art emoji) — "No sprints, no specs. Code because you're inspired."
2. **Celebrate, Don't Compete** (handshake emoji) — "We hype each other up. Every project gets love."
3. **Share the Process** (seedling emoji) — "The messy drafts, the 'aha' moments, the weird tangents."

Uses existing `.values-grid` / `.value-card` CSS classes.

---

## 6. Authentication & Authorization

### 6.1 Auth Methods
- **Email/Password:** Sign up with display name, email, password (min 6 chars)
- **Google OAuth:** One-click Google sign-in via popup

### 6.2 Auth Modal
- Tabbed interface: Log In / Sign Up
- Email input, password input, display name (signup only)
- "Continue with Google" button
- Error display with clear messaging
- Switch between login/signup with link text

### 6.3 Auth Gating Rules

| Action | Unauthenticated Behavior |
|--------|-------------------------|
| View homepage + project grid | Allowed |
| View individual project | Allowed |
| View community page | Allowed |
| View Explore/Feed page | Login gate (lock icon + login button) |
| View profiles | Login gate (lock icon + login button) |
| Click "View All Projects" on homepage | Opens login modal |
| Click "Explore" nav link | Opens login modal |
| Vibe (like) a project | Opens login modal |
| Save a project | Opens login modal |
| Share a project | Opens login modal |
| Comment on a project | Opens login modal |
| Reply to a comment | Opens login modal |
| React to a comment | Opens login modal |
| Follow a creator | Opens login modal |
| Follow a tag | Opens login modal |
| Submit a project | Opens login modal |
| Access "Following" tab | Opens login modal |

### 6.4 User Profile Auto-Creation
On first sign-in, if no user document exists in Firestore, one is automatically created with:
- Display name from auth provider
- Email
- Empty bio, company, skills
- Photo URL from auth provider (Google)
- Empty social links

---

## 7. Shared Components

### 7.1 Navigation Bar
- Logo (VibeLab with SVG icon) linking to homepage
- Links: Explore (auth-gated), Community, Events (placeholder)
- **Logged out:** "Log In" button
- **Logged in:** "+ Share Your Vibe" button, user avatar dropdown
- Avatar dropdown: My Profile, My Vibes, divider, Log Out
- Dropdown closes on outside click

### 7.2 Footer
- Brand section with logo and description
- Community links: Explore, About, Discord, Twitter/X
- Resources: Getting Started, Guidelines, Blog
- Legal: Privacy, Terms
- Copyright: "2026 VibeLab. Made with good vibes."
- Social links: Twitter, GitHub, Discord

### 7.3 Custom Dropdown Component (`custom-dropdown.js`)
- Reusable pill-shaped dropdown replacing native `<select>`
- Features: open/close toggle, option selection with highlighting, onChange callbacks
- Programmatic API: `toggleCustomDropdown()`, `selectDropdownOption()`, `getDropdownValue()`, `setDropdownValue()`, `onDropdownChange()`
- Helper: `createCustomDropdown(config)` generates HTML from config object
- Auto-closes on outside click
- Supports disabled state (via `.disabled` class)

### 7.4 Toast Notification System
- Bottom-right positioned toast container
- Auto-dismiss after 4 seconds with fade-out animation
- Optional action button with callback
- Used for: profile updates, project submissions, errors, clipboard copies

### 7.5 Modals
All modals use `.modal-overlay` + `.modal` pattern:
- Close on backdrop click
- Close on X button
- `.open` class to show

#### Auth Modal
- Login/Signup tabbed interface
- Email + Google auth options

#### Submit/Edit Project Modal
- Dual-purpose: creates new or edits existing project
- Form fields: name, category (select), built with (select), status (toggle buttons), description (textarea), thumbnail (file upload), live demo URL, GitHub URL, Figma URL, visibility (public/unlisted toggle), tags (comma-separated)
- Success state with animation after submission

#### Save to Collection Modal
- Lists existing collections with checkboxes
- Shows which collections already contain the project
- "New collection" input at bottom

#### Profile Edit Modal
- Photo upload with preview
- Fields: display name, bio, company, skills, social links
- Note: Profile page also has inline edit mode (separate from this modal)

---

## 8. Project Categories & Design Tokens

### 8.1 Categories
| Category | Tag Label | Color | Gradient |
|----------|-----------|-------|----------|
| web | Web | #3b82f6 | Blue gradient |
| art | Gen Art | #ec4899 | Pink gradient |
| game | Game | #10b981 | Green gradient |
| tool | Tool | #f59e0b | Amber gradient |
| ai | AI | #7c3aed | Purple gradient |
| mobile | Mobile | #4f46e5 | Indigo gradient |
| image | Image | #db2777 | Pink gradient |

### 8.2 Project Status
- **WIP** — Work in progress
- **Experiment** — Experimental/exploratory
- **Shipped** — Complete and launched

### 8.3 "Built With" Options
Claude, Bolt, Cursor, Lovable, Antigravity, v0, Replit

---

## 9. Sample Data

9 hardcoded sample projects serve as fallback when Firestore is empty or unavailable:
1. Drift FM (Web) — Lo-fi radio player
2. Particle Garden (Gen Art) — Interactive generative art
3. Vibe Check (AI) — Mood journal with visual mood map
4. Tiny Worlds (Game) — Browser game for building islands
5. Color Thief CLI (Tool) — Terminal color palette extractor
6. Wave Type (Gen Art) — Typography water ripple experiment
7. Prompt Palette (AI) — Visual AI prompt builder
8. Midnight Radio (Web) — Moon-phase-based web radio
9. Stack Roulette (Tool) — Random tech stack challenge generator

Sample projects use IDs prefixed with `sample-` and are excluded from write operations (vibe, edit, delete).

---

## 10. Responsive Design

### 10.1 Container
- Max-width: 1600px
- Padding: 0 16px (minimal for full-screen feel)

### 10.2 Breakpoints
| Breakpoint | Grid Columns | Notes |
|-----------|-------------|-------|
| 1600px+ | 5 columns | Widescreen |
| Default | 4 columns | Standard desktop |
| 1100px | 3 columns | Small desktop/tablet |
| 800px | 2 columns | Tablet/large phone |
| 500px | 1 column | Mobile |

### 10.3 Mobile Adaptations
- Nav links hidden on mobile (`.hide-mobile`)
- Feed toolbar wraps on small screens
- Cards stack vertically on narrow screens

---

## 11. Firebase Storage Structure

```
/profile-photos/{userId}         — User profile photo
/project-thumbnails/{userId}/{timestamp}  — Project thumbnail images
```

---

## 12. Security & Edge Cases

### 12.1 XSS Prevention
- All user-generated content rendered via `escapeHtml()` function
- External links validated for `http://` or `https://` protocol before rendering
- DOM element creation used for link rendering instead of innerHTML where possible

### 12.2 URL Parameter Resilience
- `getUrlParam(name)` checks both `?query` params and `#hash` params
- Hash fallback exists because cached 301 redirects can strip query parameters
- Project and profile links include both: `?id=xxx#id=xxx`

### 12.3 Firestore Query Fallbacks
- Queries with `visibility == 'public'` filter try first, then fallback without filter (for backward compatibility)
- Queries with composite index requirements (`where` + `orderBy`) fallback to simpler queries with client-side sorting

### 12.4 Offline/Preview Mode
- If Firebase SDK fails to load, the app runs in offline mode with sample data
- `firebaseReady` flag guards Firebase operations
- Console warnings for Firebase init failures

---

## 13. Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-27 | 1.0 | Initial PRD documenting all existing features |

---

*This PRD should be updated whenever major functionality or feature changes are made to VibeLab.*
