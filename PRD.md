# VibeLab - Product Requirements Document (PRD)

**Version:** 2.0
**Last Updated:** March 1, 2026
**Status:** Active Development

---

## 1. Product Overview

**VibeLab** is a creative coding community platform where developers share experimental, vibe-coded projects. It's a showcase and social network for creative developers — think "Dribbble meets Product Hunt for indie devs." The platform encourages building for fun, celebrating each other's work, and sharing the creative process.

**Tagline:** *A Home for Vibe-Coded Experiments*

**Domain:** vibelab.in

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript (no framework) |
| Backend/Database | Firebase (Firestore) |
| Authentication | Firebase Auth (Email/Password + Google OAuth) |
| Storage | Firebase Storage (profile photos, project thumbnails, challenge docs) |
| Hosting | Cloudflare Pages |
| SDK Version | Firebase SDK v10.12.0 (compat mode) |

---

## 3. Architecture

### 3.1 File Structure

```
/
├── index.html              # Homepage (landing + featured vibes grid)
├── explore.html            # Explore page (full feed with filters)
├── vibe.html               # Individual project detail page
├── profile.html            # User profile page (public viewing)
├── my-vibes.html           # User's own projects dashboard
├── community.html          # Community values page
├── admin.html              # Admin dashboard (superadmin only)
├── 404.html                # Custom 404 error page
├── _redirects              # Cloudflare Pages routing rules
├── serve.json              # Local dev server routing config
├── firebase.json           # Firebase hosting config with rewrites
├── firestore.rules         # Firestore security rules
├── css/
│   └── styles.css          # All styles (single stylesheet)
├── js/
│   ├── shared.js           # Nav, footer, modals, CRUD, forgot password, challenges in submit
│   ├── firebase-config.js  # Firebase init, globals, utilities, invite system, username system
│   ├── auth.js             # Auth logic, invite validation, Google OAuth flow, toast system
│   └── custom-dropdown.js  # Reusable dropdown component
├── Logo/
│   ├── VL.svg              # Filled logo (used as favicon)
│   └── VL-01.svg           # Line/outline logo (used as vibe icon in cards)
├── PRD.md                  # This document
└── COMPONENTS.md           # Reusable component documentation
```

### 3.2 Script Loading Order (all pages)

1. `js/shared.js` — Nav, footer, modals, CRUD functions (no Firebase dependency)
2. `js/custom-dropdown.js` — Custom dropdown component (only on pages with filters)
3. Firebase SDK scripts (app, auth, firestore, storage)
4. `js/firebase-config.js` — Firebase init, global state, invite/username utilities, card rendering
5. `js/auth.js` — Auth observer, login/signup with invite codes, Google OAuth, toast system
6. Page-specific inline `<script>` — Page logic, data loading

### 3.3 Page Initialization Pattern

Every page follows the same pattern:
```javascript
initPage('pageName');  // Injects nav, footer, and all modals
```
`initPage()` inserts:
- Navigation bar (with active page highlighting)
- Footer
- Auth modal (with forgot password + Google complete signup sections)
- Profile edit modal, submit project modal, save-to-collection modal

### 3.4 Auth State Pattern

Firebase Auth fires `onAuthStateChanged`, which:
1. Sets `currentUser` and `currentUserProfile` globals
2. Backfills invite fields for existing users (`invitesRemaining`, `status`, `lastActive`)
3. Handles Google OAuth incomplete signup (user exists in Auth but needs username)
4. Calls `updateNav()` to toggle logged-in/logged-out nav state (including admin link)
5. Dispatches custom `authStateReady` event with `{ user, profile }`
6. Each page listens for `authStateReady` to load page-specific content

### 3.5 URL Routing

**Cloudflare Pages routing** (`_redirects`):
- `/feed` → `/explore.html` (legacy redirect)
- `/project` → `/vibe.html` (legacy redirect)

**Firebase Hosting rewrites** (`firebase.json`):
- Named routes: `/explore`, `/community`, `/profile`, `/vibe`, `/my-vibes`, `/admin`
- Catch-all vanity URLs: `/:username` → `/profile.html`

**Vanity URL resolution** (client-side in `profile.html`):
1. Check `?id=` query param
2. Check URL path for username (e.g., `/probg`)
3. Look up username in Firestore `usernames` collection
4. Fall back to logged-in user's own profile

---

## 4. Firestore Data Model

### 4.1 Collections

#### `users` (document ID = Firebase Auth UID)
```
{
  displayName: string,
  email: string,
  username: string,
  bio: string,
  company: string,
  skills: string[],
  photoURL: string,
  socials: { twitter, github, website },
  role: string (optional, "superadmin"),
  invitesRemaining: number (default 3),
  invitedBy: string|null (UID of inviter),
  inviteCode: string (code used to join),
  status: string ("active"|"suspended"),
  badges: array of { id, name, icon, earnedAt },
  lastActive: timestamp,
  createdAt: timestamp
}
```

#### `usernames` (document ID = username string)
```
{
  uid: string,
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
  tag: string (display label),
  status: string (WIP|Experiment|Shipped),
  visibility: string (public|unlisted),
  link: string,
  githubUrl: string,
  figmaUrl: string,
  tags: string[],
  imageURL: string,
  authorUid: string,
  authorName: string,
  authorUsername: string,
  authorPhoto: string,
  color: string,
  gradient: string,
  vibes: number,
  comments: number,
  challengeId: string|null,
  challengeDay: number|null,
  challengeRound: number|null,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `projects/{projectId}/vibes` (subcollection)
```
{ userId: string, createdAt: timestamp }
```

#### `projects/{projectId}/comments` (subcollection)
```
{
  body: string,
  authorUid: string,
  authorName: string,
  authorPhoto: string,
  authorColor: string,
  parentId: string|null,
  reactions: { [userId]: reactionName },
  createdAt: timestamp
}
```

#### `follows` (document ID = `{followerUid}_{followingUid}`)
```
{ followerId: string, followingId: string, createdAt: timestamp }
```

#### `tag_follows` (document ID = `{userId}_{tagId}`)
```
{ userId: string, tag: string, createdAt: timestamp }
```

#### `users/{userId}/collections` (subcollection)
```
{ name: string, projectIds: string[], createdAt: timestamp }
```

#### `inviteCodes` (document ID = auto)
```
{
  code: string (e.g., "VIBE-A3X9"),
  createdBy: string (UID),
  createdByName: string,
  type: string ("admin"|"user"),
  status: string ("active"|"used"),
  usedBy: string|null (UID),
  usedByName: string|null,
  usedAt: timestamp|null,
  expiresAt: timestamp|null,
  createdAt: timestamp
}
```

#### `challenges` (document ID = auto)
```
{
  title: string,
  description: string,
  type: string ("evergreen"|"weekly"|"seasonal"|"special"),
  startDate: timestamp,
  endDate: timestamp|null,
  roundDays: number (for evergreen, e.g., 30),
  tags: string[],
  documentURL: string|null,
  documentName: string|null,
  bannerImage: string|null,
  participantCount: number,
  submissionCount: number,
  createdBy: string (UID),
  createdAt: timestamp
}
```

#### `adminConfig` (document ID = "bootstrap")
```
{ setupComplete: boolean, setupBy: string, setupAt: timestamp }
```

---

## 5. Pages & Features

### 5.1 Homepage (`index.html`)

**Access:** Public

- Hero section with "A home for vibe-coded experiments" headline
- CTAs: "Explore Vibes" and "Take up Daily Vibe Challenge"
- Trusted By marquee (Vercel, Figma, Supabase, Replit, Linear, Railway, Lovable, Claude, Stitch)
- Featured Vibes grid with tabs (For You, Following, Fresh Experiments, All Time)
- Search bar + filter dropdowns (Category, Built with, Status)
- Up to 25 project cards in responsive grid

### 5.2 Explore Page (`explore.html`)

**Access:** Login-gated for full feed

- Same tab/filter/search system as homepage
- Tag follow bar (13 tags with colors)
- "Following" tab shows projects from followed creators
- "For You" tab boosts projects matching followed tags
- Infinite scroll pagination (12 per page)
- Discover Creators section at bottom

### 5.3 Vibe Detail Page (`vibe.html`)

**Access:** Public

- Full project view with thumbnail, description, metadata
- Vibe (like), Save, Share action buttons (auth-gated)
- External links: Live Demo, GitHub, Figma
- Threaded comments with emoji reactions
- Creator sidebar with follow button
- Edit/Delete for own projects
- Challenge badge if linked to a challenge

### 5.4 Profile Page (`profile.html`)

**Access:** Public (anyone can view profiles)

- **Vanity URLs:** `vibelab.in/username` resolves to profile
- **Public viewing:** Profiles viewable without login; guest CTA shown for non-logged-in visitors
- **Profile header:** Avatar, name, username, company, bio, stats, skills, social links
- **Edit mode (own profile):** Inline edit for all fields + avatar upload
- **Password change (email users):** Current password → new password flow
- **Google users:** Shows "password managed by Google"
- **Invite drawer:** Slide-in panel showing remaining invites, generate codes, copy codes
- **Badges row:** Auto-awarded based on challenge participation
- **Streak calendar:** 90-day GitHub-style contribution grid for challenge activity
- **Tabs:** Vibes (project grid) and Collections (private saved collections)
- **Account deletion:** Double-confirm, deletes all user data

### 5.5 My Vibes Page (`my-vibes.html`)

**Access:** Authenticated

- User's own projects with edit/delete controls
- "+ Share New Vibe" button
- Status and visibility badges on cards

### 5.6 Community Page (`community.html`)

**Access:** Public

- "The VibeLab Way" value cards
- Community guidelines and values

### 5.7 Admin Dashboard (`admin.html`)

**Access:** Superadmin only

- **Bootstrap setup:** First user claims superadmin role
- **Overview tab:** Stats (users, vibes, signups, active codes), active users list
- **Users tab:** Search, sort, bulk actions (grant invites, activate, suspend)
- **Challenges tab:** Create/edit/delete challenges with types (evergreen, weekly, seasonal, special), date ranges, document/banner uploads, tag assignment

### 5.8 404 Page (`404.html`)

- Custom error page with VibeLab branding and navigation back to explore

---

## 6. Authentication & Authorization

### 6.1 Auth Methods
- **Email/Password:** Sign up with display name, username, invite code, email, password
- **Google OAuth:** Google sign-in → complete signup form for username + invite code

### 6.2 Invite-Only System
- New users must provide a valid invite code to sign up
- Bootstrap mode: If no superadmin exists, invite codes are not required
- Each user gets 3 invites by default
- Users can generate invite codes from their profile
- Admin can generate unlimited codes and grant invites to users
- Codes are format `VIBE-XXXX` (4 random alphanumeric chars)

### 6.3 Auth Modal
- Tabbed interface: Log In / Sign Up
- Login: Email, password, forgot password link
- Signup: Display name, username (with availability check), invite code, email, password
- Google OAuth with complete signup flow for username + invite code
- Forgot Password: Dedicated form with email input, success/error states

### 6.4 Auth Gating Rules

| Action | Unauthenticated Behavior |
|--------|-------------------------|
| View homepage, project detail, profiles, community | Allowed |
| View Explore page | Login gate |
| Vibe/Save/Share/Comment/Follow/Submit | Opens login modal |
| Access admin dashboard | Requires superadmin role |

### 6.5 User Roles
- **Regular user:** Default role, can create projects, follow, comment, manage invites
- **Superadmin:** Full admin dashboard access, user management, challenge management

---

## 7. Challenges System

### 7.1 Challenge Types
- **Evergreen:** Repeating rounds (e.g., 30-day cycles), no end date
- **Weekly:** One-week duration
- **Seasonal:** Custom date range
- **Special:** One-off events

### 7.2 Challenge Features
- Admin creates challenges with title, description, type, dates, tags
- Optional document upload (PDF/image) and banner image
- Users link projects to challenges when submitting vibes
- Auto-suggested challenge day based on start date
- Submission count tracking per challenge
- Round tracking for evergreen challenges

### 7.3 Badges (auto-awarded)
| Badge | Icon | Condition |
|-------|------|-----------|
| First Vibe | 🌱 | 1+ challenge submissions |
| 7 Day Streak | 🔥 | 7+ consecutive challenge days |
| 30 Day Streak | ⚡ | 30+ consecutive challenge days |
| Challenge Champion | 🏆 | 1+ completed challenges |
| Multi-Challenger | 🎯 | 3+ challenges joined |

### 7.4 Streak Calendar
- 90-day GitHub-style grid on profile pages
- Shows challenge submission activity per day
- 4 intensity levels based on daily submission count
- Hover tooltips with date and count

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

### 8.2 "Built With" Options
Claude, Bolt, Cursor, Lovable, Antigravity, v0, Replit

---

## 9. Responsive Design

### 9.1 Breakpoints
| Breakpoint | Grid Columns |
|-----------|-------------|
| 1600px+ | 5 columns |
| Default | 4 columns |
| 1100px | 3 columns |
| 800px | 2 columns |
| 500px | 1 column |

---

## 10. Firebase Storage Structure

```
/profile-photos/{userId}                    — User profile photos
/project-thumbnails/{userId}/{timestamp}    — Project thumbnails
/challenge-docs/{challengeId}/{filename}    — Challenge documents
/challenge-banners/{challengeId}/{filename} — Challenge banners
```

---

## 11. Security

### 11.1 XSS Prevention
- All user content rendered via `escapeHtml()`
- External links validated for http/https protocol

### 11.2 Firestore Rules
- Public read for users, projects, usernames, challenges
- Write operations require authentication
- Protected fields (role, invitesRemaining, status) restricted
- Admin operations require superadmin role
- Invite code redemption validates code status

### 11.3 URL Parameter Handling
- `getUrlParam(name)` checks both `?query` and `#hash` params
- Hash fallback for cached 301 redirects

---

## 12. Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-27 | 1.0 | Initial PRD |
| 2026-03-01 | 2.0 | Added: invite-only system, admin dashboard, challenges, badges, streak calendar, vanity URLs, public profiles, Cloudflare Pages hosting, forgot password, Google OAuth complete signup, password change, 404 page. Renamed: feed.html→explore.html, project.html→vibe.html |

---

*This PRD should be updated whenever major functionality or feature changes are made to VibeLab.*
