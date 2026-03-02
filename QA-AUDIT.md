# VibeLab — Comprehensive Quality Audit

**Author:** Principal Quality Engineer
**Date:** March 2, 2026
**Version:** 1.0
**Product Version:** PRD v2.0

---

## STEP 1: PRD DECOMPOSITION

### 1.1 Functional Requirements

| ID | Requirement | Source | Priority |
|----|-------------|--------|----------|
| FR-001 | Users can sign up via Email/Password with display name, username, invite code | PRD §6.1 | P0 |
| FR-002 | Users can sign up via Google OAuth + complete signup (username + invite) | PRD §6.1 | P0 |
| FR-003 | Invite codes required for signup (format VIBE-XXXX) | PRD §6.2 | P0 |
| FR-004 | Bootstrap mode: first user signs up without invite code and claims superadmin | PRD §6.2 | P0 |
| FR-005 | Users get 3 invite codes by default | PRD §6.2 | P1 |
| FR-006 | Users can generate invite codes from profile | PRD §6.2 | P1 |
| FR-007 | Forgot password flow via email | PRD §6.3 | P1 |
| FR-008 | Username validation: 3-20 chars, a-z0-9_-, starts with letter, no reserved words | PRD §6.3 | P0 |
| FR-009 | Username availability check (real-time) | PRD §6.3 | P1 |
| FR-010 | Homepage displays hero, featured vibes grid with tabs (For You, Following, Fresh, All Time) | PRD §5.1 | P1 |
| FR-011 | Search bar + filter dropdowns (Category, Built With, Status) | PRD §5.1 | P1 |
| FR-012 | Explore page with infinite scroll (12 per page) | PRD §5.2 | P1 |
| FR-013 | Tag follow bar with 13 tags | PRD §5.2 | P2 |
| FR-014 | "Following" tab shows projects from followed creators | PRD §5.2 | P1 |
| FR-015 | Discover Creators section on explore page | PRD §5.2 | P2 |
| FR-016 | Project detail page with full metadata | PRD §5.3 | P0 |
| FR-017 | Vibe (like) toggle on projects | PRD §5.3 | P1 |
| FR-018 | Save to collection system | PRD §5.3 | P2 |
| FR-019 | Threaded comments with emoji reactions | PRD §5.3 | P1 |
| FR-020 | Edit/Delete own projects | PRD §5.3 | P0 |
| FR-021 | Vanity URL profiles (vibelab.in/username) | PRD §5.4 | P1 |
| FR-022 | Public profile viewing without login | PRD §5.4 | P1 |
| FR-023 | Inline profile editing (own profile) | PRD §5.4 | P1 |
| FR-024 | Avatar upload with validation and resize | PRD §5.4 | P1 |
| FR-025 | Password change for email-auth users | PRD §5.4 | P1 |
| FR-026 | Account deletion with data cascade | PRD §5.4 | P0 |
| FR-027 | Invite drawer on own profile | PRD §5.4 | P1 |
| FR-028 | Streak calendar (90-day grid) | PRD §5.4 | P2 |
| FR-029 | Auto-awarded badges (5 types) | PRD §5.4 | P2 |
| FR-030 | My Vibes dashboard with edit/delete controls | PRD §5.5 | P1 |
| FR-031 | Community values page | PRD §5.6 | P2 |
| FR-032 | Admin dashboard with stats overview | PRD §5.7 | P0 |
| FR-033 | Admin user management: search, sort, bulk actions | PRD §5.7 | P0 |
| FR-034 | Admin challenge management: CRUD with types, dates, docs | PRD §5.7 | P1 |
| FR-035 | Users can submit projects with challenge linking | PRD §7.2 | P1 |
| FR-036 | Follow/unfollow users | PRD implied | P1 |
| FR-037 | Follow/unfollow tags | PRD §5.2 | P2 |
| FR-038 | Share project via native share API | PRD §5.3 | P2 |
| FR-039 | External links: Live Demo, GitHub, Figma | PRD §5.3 | P1 |
| FR-040 | Project visibility: public / unlisted | PRD §4.1 | P1 |
| FR-041 | 7 project categories with color coding | PRD §8.1 | P1 |
| FR-042 | 7 "Built With" tool options | PRD §8.2 | P1 |
| FR-043 | Project status: WIP, Experiment, Shipped | PRD §4.1 | P1 |
| FR-044 | Responsive design across 5 breakpoints | PRD §9 | P1 |
| FR-045 | Custom 404 page with vanity URL fallback | PRD §5.8 | P1 |
| FR-046 | Admin profile URL display in overview | Recent PR | P2 |

### 1.2 Non-Functional Requirements

| ID | Requirement | Source |
|----|-------------|--------|
| NFR-001 | XSS prevention via escapeHtml() on all user content | PRD §11.1 |
| NFR-002 | External link validation for http/https protocol | PRD §11.1 |
| NFR-003 | Firestore rules enforce auth for writes | PRD §11.2 |
| NFR-004 | Protected fields (role, invites, status) restricted in rules | PRD §11.2 |
| NFR-005 | Responsive grid: 5→4→3→2→1 columns across breakpoints | PRD §9 |
| NFR-006 | Image validation: type (PNG/JPG/GIF), size limits (6MB avatar, 10MB thumbnail) | Implementation |
| NFR-007 | Client-side image resize before upload | Implementation |
| NFR-008 | Pages load without blocking on auth state | Implementation |
| NFR-009 | Toast notifications auto-dismiss after 4 seconds | COMPONENTS §10 |
| NFR-010 | Username debounced availability check (400ms) | COMPONENTS §5 |

### 1.3 Assumptions

| ID | Assumption | Risk if Wrong |
|----|-----------|---------------|
| A-001 | Cloudflare Pages serves 404.html for unknown paths with original URL intact | Vanity URLs break entirely |
| A-002 | Firebase SDK compat mode (v10.12.0) remains stable and supported | Major migration needed |
| A-003 | Users will have modern browsers (ES6+, Canvas API, IntersectionObserver) | Features silently fail |
| A-004 | All users go through invite-gated signup (no direct Firestore access) | Data integrity compromise |
| A-005 | Single-tenant deployment (one Firestore project, one domain) | Multi-tenancy not supported |
| A-006 | Cloudflare handles SSL, DDoS, CDN | Security layer dependency |
| A-007 | Firebase Auth handles session management, token refresh | Custom session logic unneeded |
| A-008 | Users have usernames in their user documents | Vanity URL replaceState fails |
| A-009 | Firestore indexes are pre-created for all needed queries | Queries fail with fallback |

### 1.4 Ambiguous / Underspecified Areas

| ID | Area | Ambiguity | Impact |
|----|------|-----------|--------|
| AMB-001 | Project visibility "unlisted" | No Firestore rule enforcement — only client-side filtering | Unlisted projects readable via direct API calls |
| AMB-002 | Invite code expiry | PRD mentions `expiresAt` field but no UI to set expiry for user-generated codes | Codes never expire by default |
| AMB-003 | Account deletion cascade | PRD says "deletes all user data" but subcollections (vibes, comments, follows) not addressed | Orphaned data persists |
| AMB-004 | Suspended user behavior | Status field exists but no enforcement in Firestore rules for project creation | Suspended users can still create content |
| AMB-005 | "For You" algorithm | Only mentions "boosts projects matching followed tags" — no scoring logic documented | Unpredictable feed ranking |
| AMB-006 | Comment length limits | Not specified anywhere | Potential for abuse (megabyte-sized comments) |
| AMB-007 | Max projects per user | Not specified | No limit on project creation |
| AMB-008 | Max collections per user / projects per collection | Not specified | Potential for excessive data |
| AMB-009 | Google OAuth email domain restrictions | Not specified | Any Google account can sign up |
| AMB-010 | Email verification requirement | Not mentioned in PRD | Accounts created with unverified emails |

### 1.5 Missing Validation Criteria

| Area | What's Missing |
|------|---------------|
| Password policy | No complexity requirements beyond 6-char minimum |
| URL validation | No format validation on project links, GitHub, Figma, social URLs |
| Description length | No maximum character limit on project descriptions |
| Comment length | No maximum character limit on comments |
| Collection name length | No maximum character limit |
| Tag count per project | No maximum number of tags |
| Rate limiting | No throttling on any client-side actions |
| Image magic number verification | Only MIME type checked, not actual file content |
| EXIF data stripping | Location/metadata preserved in uploaded images |

### 1.6 Requirement Traceability Matrix (RTM)

| Requirement | Source | Implementation File(s) | Test Coverage | Status |
|-------------|--------|----------------------|---------------|--------|
| FR-001 Email signup | PRD §6.1 | auth.js:175-240 | None | Untested |
| FR-002 Google OAuth | PRD §6.1 | auth.js:251-369 | None | Untested |
| FR-003 Invite codes | PRD §6.2 | firebase-config.js:203-293 | None | Untested |
| FR-004 Bootstrap admin | PRD §6.2 | admin.html:bootstrap | None | Untested |
| FR-008 Username validation | PRD §6.3 | firebase-config.js:154-162 | None | Untested |
| FR-016 Project detail | PRD §5.3 | vibe.html | None | Untested |
| FR-019 Comments | PRD §5.3 | vibe.html:comments | None | Untested |
| FR-021 Vanity URLs | PRD §5.4 | profile.html, 404.html | None | Untested |
| FR-026 Account deletion | PRD §5.4 | profile.html:deleteAccount | None | Untested |
| FR-032 Admin dashboard | PRD §5.7 | admin.html | None | Untested |
| NFR-001 XSS prevention | PRD §11 | firebase-config.js:escapeHtml | None | Untested |
| NFR-003 Firestore rules | PRD §11.2 | firestore.rules | None | Untested |

**Note:** Zero automated tests exist in the codebase. All testing is manual.

---

## STEP 2: RISK ANALYSIS

### 2.1 Risk Registry

| Risk ID | Component | Description | Severity | Likelihood | Impact | Classification |
|---------|-----------|-------------|----------|-----------|--------|----------------|
| RSK-001 | Firestore Rules | Invite code redemption allows any authenticated user to redeem any active code | Critical | High | Any user can consume codes meant for others | **CRITICAL** |
| RSK-002 | Firestore Rules | Project visibility ("unlisted") not enforced — all projects publicly readable | Critical | Certain | Privacy violation; unlisted projects exposed | **CRITICAL** |
| RSK-003 | Firestore Rules | `noSuperAdminExists()` always returns true — bootstrap guard is a no-op | Critical | High | Race condition in admin claim | **CRITICAL** |
| RSK-004 | Auth | No email verification — accounts created with unverified emails | High | Certain | Impersonation; spam signups with fake emails | **HIGH** |
| RSK-005 | Auth | No rate limiting on signup, login, or password reset | High | High | Brute force attacks; credential stuffing | **HIGH** |
| RSK-006 | Auth | Password policy only enforces ≥6 characters | High | High | Weak passwords easily compromised | **HIGH** |
| RSK-007 | Data Integrity | No atomic transactions for counter operations (vibes, challenge submissions) | High | Medium | Inaccurate counts under concurrent use | **HIGH** |
| RSK-008 | Data Integrity | Account deletion leaves orphaned subcollections (vibes, comments, follows) | High | Certain | Ghost data persists, counts become inaccurate | **HIGH** |
| RSK-009 | Security | No input length limits on descriptions, comments, collection names | High | Medium | Storage abuse; potential DoS via oversized payloads | **HIGH** |
| RSK-010 | Invite System | Invite code space is only 32^4 (~1M combinations) | Medium | Medium | Brute-forceable in hours at scale | **MEDIUM** |
| RSK-011 | Security | Username TOCTOU race condition between availability check and claim | Medium | Low | Duplicate username claims possible | **MEDIUM** |
| RSK-012 | Security | EXIF data not stripped from uploaded images | Medium | Certain | User location/metadata exposure | **MEDIUM** |
| RSK-013 | Security | No magic number verification on file uploads | Medium | Low | MIME type spoofing | **MEDIUM** |
| RSK-014 | UX | Vanity URLs served via 404.html (HTTP 404 status code) | Medium | Certain | SEO impact; crawlers won't index profiles | **MEDIUM** |
| RSK-015 | Performance | Admin loads ALL users on page load (no pagination) | Medium | High | Slow admin panel as user count grows | **MEDIUM** |
| RSK-016 | Security | Inline `onclick` handlers with string interpolation | Medium | Low | XSS if document IDs contain special characters | **MEDIUM** |
| RSK-017 | Data | Self-follow not prevented in Firestore rules | Low | Low | Follow count inflation | **LOW** |
| RSK-018 | Performance | No caching layer for Firestore reads | Low | Medium | Increased Firestore costs and latency | **LOW** |
| RSK-019 | UX | Composite Firestore indexes not pre-created | Low | Certain | Queries fail and fall back to less efficient alternatives | **LOW** |

### 2.2 Risk Heat Map

```
              LOW IMPACT    MEDIUM IMPACT    HIGH IMPACT
HIGH LIKELI.    RSK-019      RSK-015         RSK-001, RSK-004
                             RSK-014         RSK-005, RSK-006
                                             RSK-008
MEDIUM          RSK-017      RSK-010         RSK-007, RSK-009
                             RSK-011
                             RSK-012, RSK-013
LOW                          RSK-016         RSK-002, RSK-003
```

---

## STEP 3: FUNCTIONAL TEST DESIGN

### 3.1 Authentication — Email/Password Signup

| TC ID | Title | Priority | Preconditions | Steps | Expected Result | Edge Cases |
|-------|-------|----------|---------------|-------|-----------------|------------|
| AUTH-001 | Successful email signup with valid invite code | P0 | Superadmin exists, valid invite code "VIBE-A1B2" active | 1. Open auth modal in signup mode 2. Enter display name "Test User" 3. Enter username "testuser" 4. Enter invite code "VIBE-A1B2" 5. Enter valid email 6. Enter password ≥6 chars 7. Click Sign Up | Account created; redirected to profile; invite code marked used; user gets 3 invites | Unicode display names; email with +alias; password exactly 6 chars |
| AUTH-002 | Signup with invalid invite code | P0 | Superadmin exists | 1. Fill all fields with valid data 2. Enter code "VIBE-ZZZZ" (nonexistent) 3. Click Sign Up | Error: "Invalid invite code" shown; no account created | Expired code; already-used code; wrong format "ABC-1234" |
| AUTH-003 | Signup with taken username | P0 | Username "probg" exists | 1. Enter username "probg" 2. Wait for availability check | Status shows "taken" in red; signup button disabled or shows error on submit | Case variations: "ProbG", "PROBG" |
| AUTH-004 | Signup with reserved username | P0 | — | 1. Enter username "admin" | Validation error: "This username is not available" | All 45+ reserved words: "feed", "api", "null", "undefined", "404" |
| AUTH-005 | Username boundary validation | P1 | — | 1. Enter username "ab" (too short) 2. Enter username "a" repeated 21 times (too long) 3. Enter "1username" (starts with number) 4. Enter "user name" (space) 5. Enter "user@name" (special char) | Each shows specific validation error | Exactly 3 chars; exactly 20 chars; underscores; hyphens; mixed case |
| AUTH-006 | Bootstrap mode — first user signup without invite | P0 | No superadmin exists; fresh database | 1. Open signup 2. Leave invite code empty 3. Fill other fields 4. Click Sign Up | Account created without invite code requirement | Second user after bootstrap should require invite |
| AUTH-007 | Signup with duplicate email | P0 | Email already registered | 1. Fill all fields 2. Use existing email 3. Click Sign Up | Firebase error: "email already in use" displayed | Same email, different case |
| AUTH-008 | Signup with weak password | P1 | — | 1. Enter password "12345" (5 chars) | Error: "Password must be at least 6 characters" | Empty password; spaces only; 6 chars exactly |

### 3.2 Authentication — Google OAuth

| TC ID | Title | Priority | Preconditions | Steps | Expected Result | Edge Cases |
|-------|-------|----------|---------------|-------|-----------------|------------|
| OAUTH-001 | New Google user — complete signup flow | P0 | Superadmin exists, valid invite code | 1. Click "Sign in with Google" 2. Complete Google popup 3. Enter username in complete signup form 4. Enter invite code 5. Submit | Account created with Google email; username claimed; invite redeemed | Google account with no display name |
| OAUTH-002 | Returning Google user — direct login | P0 | Google user has existing account with username | 1. Click "Sign in with Google" 2. Complete Google popup | Logged in directly; no complete signup shown | User changed Google display name since last login |
| OAUTH-003 | Google user cancels popup | P1 | — | 1. Click "Sign in with Google" 2. Close Google popup | Error handled gracefully; no spinner left spinning | Popup blocked by browser |
| OAUTH-004 | Google user — complete signup with taken username | P0 | Another user has claimed "testuser" | 1. Complete Google OAuth 2. Enter "testuser" in complete signup | Username availability check shows "taken" | — |

### 3.3 Invite Code System

| TC ID | Title | Priority | Preconditions | Steps | Expected Result | Edge Cases |
|-------|-------|----------|---------------|-------|-----------------|------------|
| INV-001 | Generate invite code from profile | P1 | Logged in, invitesRemaining > 0 | 1. Open invite drawer 2. Click "Generate Invite Code" | Code generated in VIBE-XXXX format; invitesRemaining decremented; code appears in list | Generate when invitesRemaining = 1 (last code) |
| INV-002 | Generate invite code with 0 remaining | P1 | invitesRemaining = 0 | 1. Open invite drawer 2. Click "Generate" | Error: "No invites remaining"; button disabled | Concurrent clicks while count = 1 |
| INV-003 | Copy invite code | P2 | Code exists in drawer | 1. Click copy button next to code | Code copied to clipboard; toast shown "Copied!" | Clipboard API not available (HTTP, old browser) |
| INV-004 | Admin generates unlimited codes | P0 | Superadmin logged in | 1. Open admin dashboard 2. Grant invites to user 3. Enter count | Codes generated; user's invitesRemaining updated | Grant 0 invites; grant 999 invites |
| INV-005 | Redeem invite code during signup | P0 | Active code exists | 1. Enter code during signup 2. Complete signup | Code status changes to "used"; usedBy set; usedAt set; creator's code tracked | Case-insensitive: "vibe-a1b2" vs "VIBE-A1B2" |
| INV-006 | Redeem expired invite code | P1 | Code with past expiresAt | 1. Enter expired code during signup | Error: "This invite code has expired" | Code expired 1 second ago; code with no expiry |

### 3.4 Project CRUD

| TC ID | Title | Priority | Preconditions | Steps | Expected Result | Edge Cases |
|-------|-------|----------|---------------|-------|-----------------|------------|
| PROJ-001 | Create project with all fields | P0 | Logged in | 1. Open submit modal 2. Fill name, desc, category, built-with, status, visibility, links, tags, thumbnail, challenge 3. Submit | Project created in Firestore; appears in my-vibes; card renders correctly | All 7 categories; all 7 built-with options; all 3 statuses |
| PROJ-002 | Create project with minimum fields | P0 | Logged in | 1. Open submit modal 2. Enter only name and description 3. Submit | Project created with defaults; no image; no links | Single character name; single character description |
| PROJ-003 | Create project with large thumbnail | P1 | Logged in | 1. Select image > 10MB | Error: "File is too large. Maximum size is 10MB." | Exactly 10MB; 10.1MB; 0-byte file |
| PROJ-004 | Create project with invalid image type | P1 | Logged in | 1. Select .webp or .svg file | Error: "Only PNG, JPG, and GIF images are allowed." | .bmp; .tiff; renamed .txt to .jpg |
| PROJ-005 | Edit existing project | P0 | Logged in, owns project | 1. Open edit modal 2. Change title and description 3. Save | Project updated; changes reflected immediately | Change category; remove thumbnail; change visibility |
| PROJ-006 | Delete project with confirmation | P0 | Logged in, owns project | 1. Click delete 2. Confirm in dialog | Project deleted from Firestore; removed from lists | Cancel deletion; double-click delete |
| PROJ-007 | Submit project linked to challenge | P1 | Active challenge exists | 1. Open submit modal 2. Select challenge from dropdown 3. Submit | challengeId, challengeDay, challengeRound set; challenge submissionCount incremented | Evergreen challenge with round calculation |
| PROJ-008 | Create project while suspended | P0 | User status = "suspended" | 1. Attempt to create project | Should be blocked (currently NOT enforced in rules) | **Known gap — should fail but succeeds** |

### 3.5 Profile & Vanity URLs

| TC ID | Title | Priority | Preconditions | Steps | Expected Result | Edge Cases |
|-------|-------|----------|---------------|-------|-----------------|------------|
| PROF-001 | View own profile via /profile | P0 | Logged in | 1. Navigate to /profile | Own profile loads; edit controls shown | — |
| PROF-002 | View other user via vanity URL | P0 | User "ananya_nvn02" exists | 1. Navigate to vibelab.in/ananya_nvn02 | Other user's profile loads; follow button shown; edit controls hidden | Username with hyphens; username with underscores |
| PROF-003 | View other user via ?id=UID | P0 | User exists | 1. Navigate to /profile?id={uid} | Profile loads; URL replaced with /username via replaceState | User without username field in doc |
| PROF-004 | Visit nonexistent username | P1 | Username "zzz_nobody" doesn't exist | 1. Navigate to /zzz_nobody | "Page not found" error shown | Reserved words in URL: /admin, /explore |
| PROF-005 | Inline profile edit | P1 | Logged in, on own profile | 1. Click edit 2. Change display name, bio 3. Save | Profile updated; view mode shows new data | Clear all fields; max length strings |
| PROF-006 | Change username | P1 | Logged in, on own profile | 1. Click edit 2. Change username to available name 3. Save | Old username doc deleted; new one created; profile URL updates | Change to same username; change while another user claims simultaneously |
| PROF-007 | Upload avatar | P1 | Logged in | 1. Click avatar 2. Select valid image 3. Save | Image resized to 400x400; uploaded to Storage; photoURL updated | Portrait image (tall); landscape image (wide); exactly 400x400 |
| PROF-008 | Delete account | P0 | Logged in | 1. Click Delete Account 2. Confirm first dialog 3. Confirm second dialog | User doc deleted; username doc deleted; projects deleted; Firebase Auth account deleted; redirected to home | User with 0 projects; user with 50 projects |
| PROF-009 | Change password (email auth) | P1 | Email-auth user, logged in | 1. Enter current password 2. Enter new password 3. Confirm new password 4. Submit | Password changed; success toast | Wrong current password; mismatched confirmation; weak new password |
| PROF-010 | Password change section for Google user | P1 | Google-auth user | 1. View own profile in edit mode | Shows "Password managed by Google" instead of change form | — |

### 3.6 Comments System

| TC ID | Title | Priority | Preconditions | Steps | Expected Result | Edge Cases |
|-------|-------|----------|---------------|-------|-----------------|------------|
| CMT-001 | Post a comment | P0 | Logged in, on project page | 1. Type comment 2. Click Post | Comment appears in thread with author info and timestamp | Empty comment; whitespace only; very long comment |
| CMT-002 | Reply to a comment | P1 | Existing comment | 1. Click Reply 2. Type reply 3. Submit | Reply nested under parent comment | Reply to a reply (should be single-level nesting) |
| CMT-003 | Add emoji reaction | P1 | Existing comment | 1. Click reaction emoji (fire/heart/sparkles/rocket) | Reaction count increments; user's reaction highlighted | Toggle same reaction off; switch reactions |
| CMT-004 | Delete own comment | P1 | Own comment exists | 1. Click delete on own comment | Comment removed; count decremented | Delete comment with replies |
| CMT-005 | Post comment when logged out | P1 | Not logged in | 1. Attempt to type/post comment | Login prompt shown instead of comment input | — |

### 3.7 Follow System

| TC ID | Title | Priority | Preconditions | Steps | Expected Result | Edge Cases |
|-------|-------|----------|---------------|-------|-----------------|------------|
| FLW-001 | Follow a user | P1 | Logged in, on other user's profile | 1. Click Follow button | Button changes to "Following"; follow doc created | Already following (toggle) |
| FLW-002 | Unfollow a user | P1 | Following another user | 1. Click Following button | Button changes to "Follow"; follow doc deleted | Rapid toggle follow/unfollow |
| FLW-003 | Self-follow prevention | P0 | Logged in, on own profile | 1. Attempt to follow self | Follow button hidden or no-op with toast | API-level: follow doc with self-reference |
| FLW-004 | Follow a tag | P2 | Logged in, on explore page | 1. Click tag in tag bar | Tag appears as followed chip; "For You" feed updates | Follow all 13 tags; unfollow all tags |

### 3.8 Admin Dashboard

| TC ID | Title | Priority | Preconditions | Steps | Expected Result | Edge Cases |
|-------|-------|----------|---------------|-------|-----------------|------------|
| ADM-001 | Bootstrap — claim admin | P0 | Fresh database, no adminConfig | 1. Navigate to /admin 2. Click "Claim Admin Access" | User gets superadmin role; adminConfig created; dashboard loads | Two users claim simultaneously |
| ADM-002 | Access denied for non-admin | P0 | Regular user logged in | 1. Navigate to /admin | "Access Denied" screen shown | Direct Firestore manipulation attempt |
| ADM-003 | View overview stats | P1 | Superadmin logged in | 1. View Overview tab | Total Users, Total Vibes, Signups This Month, Active Codes displayed | Empty database; 10,000+ users |
| ADM-004 | Search users | P1 | Superadmin, users exist | 1. Type in search box | Users filtered by name/email/username | Search with special chars; empty search; no results |
| ADM-005 | Bulk suspend users | P0 | Superadmin, users selected | 1. Select users 2. Click Suspend | Selected users' status changed to "suspended" | Suspend self (superadmin); suspend already-suspended user |
| ADM-006 | Create challenge | P1 | Superadmin logged in | 1. Click New Challenge 2. Fill form 3. Save | Challenge created; appears in list | All 4 types; missing required fields; past start date |
| ADM-007 | Edit challenge | P1 | Challenge exists | 1. Click edit 2. Modify fields 3. Save | Challenge updated | Change type after submissions exist |
| ADM-008 | Delete challenge | P1 | Challenge exists | 1. Click delete 2. Confirm | Challenge deleted | Delete challenge with submissions linked to it |
| ADM-009 | Profile URLs visible in overview | P2 | Users with usernames | 1. View Overview tab | Each user shows vibelab.in/username as clickable link | Users without usernames show "—" |

### 3.9 Concurrency Test Cases

| TC ID | Title | Priority | Preconditions | Steps | Expected Result |
|-------|-------|----------|---------------|-------|-----------------|
| CONC-001 | Two users claim same username simultaneously | P0 | Username "newuser" available | Both submit signup with username "newuser" at same time | Only one succeeds; other gets error or stale availability result |
| CONC-002 | Two users vibe same project simultaneously | P1 | Project exists | Both click Vibe at same time | Both vibes registered; count = original + 2 (not +1) |
| CONC-003 | User edits profile while another views it | P2 | User A edits, User B viewing | A saves changes while B is reading | B sees either old or new data; no crash or corruption |
| CONC-004 | Two users redeem same invite code | P0 | One active invite code | Both submit signup with same code simultaneously | Only one succeeds; other gets "Code already used" |
| CONC-005 | Admin suspends user while user is posting | P1 | User actively creating project | Admin changes status to suspended | Project creation may succeed (Firestore rules don't check active status on project create) |

### 3.10 Failure Recovery Test Cases

| TC ID | Title | Priority | Steps | Expected Result |
|-------|-------|----------|-------|-----------------|
| FAIL-001 | Network loss during project submit | P1 | 1. Start project creation 2. Kill network 3. Click submit | Error toast shown; no partial data written; user can retry |
| FAIL-002 | Network loss during image upload | P1 | 1. Select image 2. Kill network during upload 3. Wait | Upload fails; error shown; no orphaned Storage blob |
| FAIL-003 | Firebase SDK fails to load | P0 | Block Firebase CDN | Page renders static content; features requiring Firebase show graceful errors |
| FAIL-004 | Firestore index not created | P1 | Query requiring composite index | Fallback query runs without index; data still loads |
| FAIL-005 | Auth token expires mid-session | P1 | Let session sit for hours | Firebase auto-refreshes token; if failed, next action prompts re-login |

---

## STEP 4: NON-FUNCTIONAL TESTING

### 4.1 Performance Tests

| Test ID | Area | Test | Acceptance Criteria |
|---------|------|------|---------------------|
| PERF-001 | Page load | Homepage first contentful paint | < 2 seconds on 4G |
| PERF-002 | Page load | Explore page with 12 projects loaded | < 3 seconds on 4G |
| PERF-003 | Infinite scroll | Next 12 projects load time | < 1.5 seconds |
| PERF-004 | Image resize | Client-side avatar resize (6MB → 400x400) | < 2 seconds |
| PERF-005 | Image resize | Client-side thumbnail resize (10MB → 2800x2100) | < 3 seconds |
| PERF-006 | Admin | Load admin overview with 1000 users | < 5 seconds |
| PERF-007 | Admin | Load admin overview with 10,000 users | < 15 seconds (or paginate) |
| PERF-008 | Profile | Streak calendar render (90 days) | < 500ms |
| PERF-009 | Search | Explore page search debounce + filter | < 300ms perceived latency |
| PERF-010 | Comments | Load 100 threaded comments | < 2 seconds |

### 4.2 Security Tests

| Test ID | Area | Test | Expected Behavior |
|---------|------|------|-------------------|
| SEC-001 | XSS | Inject `<script>alert(1)</script>` in project name | Rendered as escaped text, no execution |
| SEC-002 | XSS | Inject `<img onerror=alert(1) src=x>` in bio | Rendered as escaped text |
| SEC-003 | XSS | Inject JS in comment body | Escaped on render |
| SEC-004 | XSS | Inject via `onclick` in Firestore document ID | No execution (IDs are sanitized by Firestore) |
| SEC-005 | Auth bypass | Call Firestore API directly without auth token | Write rejected by Firestore rules |
| SEC-006 | Auth bypass | Modify `currentUser` global in browser console | Firestore rules use server-side auth token, not client global |
| SEC-007 | Privilege escalation | Regular user writes `role: "superadmin"` to own profile | Blocked by `notChangingProtectedFields()` rule |
| SEC-008 | Privilege escalation | Regular user writes to another user's profile | Blocked by `isOwner(userId)` rule |
| SEC-009 | Invite abuse | Redeem another user's admin-generated invite code | **CURRENTLY SUCCEEDS** — Rule allows any auth user to redeem any active code |
| SEC-010 | Invite abuse | Brute-force invite codes (VIBE-0000 through VIBE-ZZZZ) | No rate limiting; ~1M combinations brute-forceable |
| SEC-011 | Data leak | Read unlisted project via direct Firestore query | **CURRENTLY SUCCEEDS** — No visibility enforcement in rules |
| SEC-012 | Data leak | Read another user's collections via Firestore API | Blocked by `isOwner(userId)` on collections subcollection |
| SEC-013 | EXIF leak | Upload photo with GPS EXIF data; download from Storage | EXIF data preserved — **location exposed** |
| SEC-014 | Enumeration | Enumerate valid usernames via /username paths | Possible; response differs for valid vs invalid usernames |
| SEC-015 | Email enumeration | Try password reset for existing vs non-existing email | Different error messages reveal account existence |

### 4.3 Access Control Tests

| Test ID | Role | Action | Expected |
|---------|------|--------|----------|
| AC-001 | Anonymous | Read public project | Allowed |
| AC-002 | Anonymous | Read user profile | Allowed |
| AC-003 | Anonymous | Create project | Blocked (Firestore rules) |
| AC-004 | Anonymous | View explore page | Login gate shown |
| AC-005 | Regular user | Create own project | Allowed |
| AC-006 | Regular user | Edit another's project | Blocked |
| AC-007 | Regular user | Delete another's project | Blocked |
| AC-008 | Regular user | Access admin dashboard | "Access Denied" shown |
| AC-009 | Regular user | Write to adminConfig | Blocked (if admin exists) |
| AC-010 | Regular user | Change own role to superadmin | Blocked by protected fields rule |
| AC-011 | Superadmin | Edit any project | Allowed |
| AC-012 | Superadmin | Delete any project | Allowed |
| AC-013 | Superadmin | Suspend user | Allowed |
| AC-014 | Superadmin | Create admin invite codes | Allowed |
| AC-015 | Suspended user | Create project | **Currently allowed** (rules don't check status) |
| AC-016 | Suspended user | Login | Allowed (no enforcement) |

### 4.4 Data Consistency Tests

| Test ID | Test | Expected | Risk |
|---------|------|----------|------|
| DC-001 | Vibe count matches vibes subcollection size | Count on project doc = number of vibe docs | HIGH — no atomic transaction |
| DC-002 | Comment count matches comments subcollection size | Count on project doc = number of comment docs | HIGH |
| DC-003 | Follow count matches follows collection queries | Follower/following counts correct | MEDIUM |
| DC-004 | Challenge submissionCount matches linked projects | Count on challenge = projects with that challengeId | HIGH |
| DC-005 | Invite code usedBy matches signup user | Code's usedBy UID = the user who signed up with it | MEDIUM |
| DC-006 | Username in users doc matches usernames collection | users/{uid}.username == usernames/{name}.uid | HIGH |
| DC-007 | Deleted user has no orphaned data | No projects, follows, vibes, comments left behind | HIGH |

### 4.5 Error Handling Tests

| Test ID | Scenario | Expected Behavior |
|---------|----------|-------------------|
| ERR-001 | Firestore query fails (network error) | Toast or inline error; no blank screen |
| ERR-002 | Firebase Storage upload fails | Error toast; no partial upload; user can retry |
| ERR-003 | Auth modal submit with server error | Error message shown in modal; form remains filled |
| ERR-004 | Image resize fails (corrupt file) | Error caught; toast shown; upload blocked |
| ERR-005 | Profile load for deleted user | "Profile not found" screen; not a JavaScript crash |
| ERR-006 | Navigate to /vibe?id=nonexistent | "Project not found" screen |
| ERR-007 | Firestore rules deny write | Error caught; toast shown; UI not stuck in loading |

### 4.6 Accessibility Tests

| Test ID | Area | Test | WCAG Level |
|---------|------|------|------------|
| A11Y-001 | Navigation | Keyboard navigation through all nav links | AA |
| A11Y-002 | Modals | Focus trap in auth modal; Escape key closes | AA |
| A11Y-003 | Color contrast | Accent (#c8ff00) on white background | AA — **likely fails** (neon yellow on white) |
| A11Y-004 | Form labels | All form inputs have associated labels | AA |
| A11Y-005 | Alt text | All images have alt attributes | A |
| A11Y-006 | Screen reader | Project cards announce title, author, stats | AA |
| A11Y-007 | Focus indicators | Visible focus ring on interactive elements | AA |
| A11Y-008 | ARIA | Modals have role="dialog" and aria-label | AA |
| A11Y-009 | Toast | Toasts announced to screen readers (aria-live) | AA |
| A11Y-010 | Streak calendar | Tooltips accessible via keyboard | AA |

---

## STEP 5: UX QUALITY REVIEW

### 5.1 State Transition Issues

| Issue | Current Behavior | Expected Behavior |
|-------|-----------------|-------------------|
| Auth modal → Google complete signup | Tabs hide; section slides in | Needs clearer visual transition; user may not understand what changed |
| Follow → Unfollow hover state | Button text changes on hover | May cause accidental unfollows on mobile (no hover) |
| Edit mode toggle on profile | Full page re-render | Should be smoother inline toggle; fields should preserve scroll position |
| Invite drawer open/close | Slide animation | No keyboard dismissal (Escape); no focus trap |
| Project submit → loading → success | No loading indicator on submit button | Button should show spinner/disabled state during submission |

### 5.2 Empty States

| Context | Current Empty State | Assessment |
|---------|-------------------|------------|
| No projects on explore | Emoji + "No vibes yet" message | Good — but no CTA to create first project |
| No projects on profile | "No vibes yet" | Missing CTA for own profile; fine for other profiles |
| No collections | Not shown | Collections tab should indicate "No collections yet" |
| No followers/following | Count shows "0" | Fine — but "0 followers" on new profiles feels cold |
| Empty search results | Generic empty state | Should suggest broadening search or show popular alternatives |
| No comments on project | Empty section | Should show "Be the first to comment" prompt |
| Admin — no users | "No users yet" | Fine for bootstrap phase |
| Admin — no challenges | Empty list | Should show "Create your first challenge" CTA |

### 5.3 Error Messaging Clarity

| Context | Current Message | Improvement Needed |
|---------|----------------|-------------------|
| Invalid invite code | "Invalid invite code" | Distinguish: "Code not found" vs "Code expired" vs "Code already used" |
| Username taken | Shows "taken" status | Good — real-time feedback |
| Network error on project submit | Generic "Please try again" | Should indicate network issue specifically |
| Password change — wrong current password | Firebase error code | Should be "Current password is incorrect" (human-readable) |
| Account deletion error | Generic error | Should explain what happened and suggest retry |
| Image too large | "File is too large. Maximum size is 10MB." | Good — specific and actionable |

### 5.4 Microcopy Consistency

| Issue | Location | Details |
|-------|----------|---------|
| "Vibes" vs "Projects" vs "Vibe" | Throughout | PRD uses "vibes" but code uses "projects" in collection names; confusing terminology |
| "Share Your Vibe" vs "Submit Project" | Submit modal title vs button text | Should be consistent |
| "Following" button states | Profile vs explore | Different styling for same action |
| Time format | "5m ago" vs "just now" vs "3d ago" | Consistent — good |

### 5.5 Interaction Dead-Ends

| Dead-End | Description | Fix |
|----------|-------------|-----|
| Logged-out user clicks Vibe button | Auth modal opens — after login, vibe action not retried | Should remember pending action and execute after auth |
| Logged-out user clicks Follow | Same issue — follow not retried after login | Queue action for post-login execution |
| Copy invite code fails (HTTP) | Clipboard API requires HTTPS | Show manual copy fallback with selectable text |
| Share button on unsupported browser | Native Share API not available | Should fall back to copy-URL-to-clipboard |
| Cancel project edit | No explicit cancel — must close modal | Add Cancel button |

### 5.6 Role-Based UI Inconsistencies

| Issue | Details |
|-------|---------|
| Admin link visibility | Admin link in nav dropdown only visible to superadmin — good |
| Suspended user UI | No visual indication to suspended user that they're suspended; features may silently fail |
| Google user password section | Shows "managed by Google" — good distinction |
| Guest CTA box | Shown on profile/vibe/explore — consistent |
| Edit controls on other's profile | Hidden — correct |
| Delete project on other's vibe page | Hidden unless superadmin — check needed |

---

## STEP 6: AUTOMATION STRATEGY

### 6.1 Test Automation Priority

| Layer | Framework | Test Count | Priority |
|-------|-----------|-----------|----------|
| **Unit Tests** | Vitest or Jest | ~40 tests | P0 |
| **Integration Tests** | Firestore Emulator + Jest | ~30 tests | P0 |
| **E2E Tests** | Playwright | ~25 tests | P1 |
| **Visual Regression** | Playwright screenshots | ~10 snapshots | P2 |

### 6.2 Unit Test Candidates (Vitest/Jest)

| Module | Functions to Test | Count |
|--------|------------------|-------|
| firebase-config.js | `escapeHtml`, `timeAgo`, `getUrlParam`, `validateUsername`, `getUsernameFromPath`, `getProfileUrl`, `generateInviteCode` | 7 |
| image-utils.js | `validateImage`, `resizeImage`, `resizeAvatar`, `IMAGE_RULES` | 4 |
| shared.js | `getNavHTML`, `getFooterHTML` (snapshot tests) | 2 |
| auth.js | Password validation logic, auth error message mapping | 2 |

**Priority functions for unit testing:**
- `validateUsername()` — 15+ test cases for all validation rules
- `escapeHtml()` — XSS prevention is critical
- `validateImage()` — File type/size boundary testing
- `timeAgo()` — Date edge cases
- `getProfileUrl()` — URL generation correctness

### 6.3 Integration Test Candidates (Firestore Emulator)

| Test Suite | Tests | Priority |
|------------|-------|----------|
| Firestore Rules — users | Create, update, delete, protected fields | P0 |
| Firestore Rules — projects | CRUD, author enforcement, visibility | P0 |
| Firestore Rules — inviteCodes | Create, redeem, read access | P0 |
| Firestore Rules — follows | Create/delete ownership | P1 |
| Firestore Rules — adminConfig | Bootstrap, admin-only write | P0 |
| Firestore Rules — comments | Create/delete, author enforcement | P1 |
| Invite code lifecycle | Generate → validate → redeem → verify used | P0 |
| Username lifecycle | Claim → lookup → rename → delete | P1 |

### 6.4 E2E Test Candidates (Playwright)

| Test Suite | Scenarios | Priority |
|------------|----------|----------|
| Auth flow | Email signup, Google OAuth, login, logout | P0 |
| Project lifecycle | Create, edit, delete project | P0 |
| Profile | View own, view other, edit, vanity URL | P1 |
| Admin | Bootstrap, user management, challenge CRUD | P1 |
| Explore | Search, filter, infinite scroll, tag follow | P1 |
| Comments | Post, reply, react, delete | P2 |
| Responsive | Breakpoint testing (1600, 1100, 800, 500px) | P2 |

### 6.5 Regression Strategy

**Smoke Suite (pre-deploy, ~5 min):**
1. Homepage loads with project cards
2. Auth modal opens and login works
3. Project creation succeeds
4. Profile page loads
5. Admin dashboard accessible to superadmin

**Core Regression (nightly, ~30 min):**
- All Firestore rules pass
- Full auth flow (email + Google)
- Project CRUD lifecycle
- Profile editing
- Comment system
- Follow/unfollow

**Full Regression (weekly, ~2 hours):**
- All test suites
- Visual regression screenshots
- Performance benchmarks
- Accessibility audit (axe-core)

### 6.6 Release Gating Criteria

| Gate | Criteria | Blocking? |
|------|----------|-----------|
| Unit tests | 100% pass | Yes |
| Firestore rules tests | 100% pass | Yes |
| E2E smoke | 100% pass | Yes |
| E2E core | ≥95% pass | Yes |
| Performance | LCP < 3s, FCP < 2s | Yes |
| Security | No critical/high Firestore rule violations | Yes |
| Accessibility | No WCAG AA violations (axe-core) | No (warning) |
| Visual regression | No unexpected diffs | No (manual review) |

---

## STEP 7: TEST COVERAGE GAP REPORT

### 7.1 Currently Uncovered Areas (Zero Test Coverage)

| Area | Risk | Priority to Cover |
|------|------|-------------------|
| **Firestore security rules** | CRITICAL — rules have known flaws (invite redemption, visibility) | P0 — Immediate |
| **Authentication flows** | HIGH — signup, login, OAuth untested | P0 — Immediate |
| **Project CRUD operations** | HIGH — core business logic untested | P0 — Immediate |
| **Input validation** | HIGH — XSS, username, image validation untested | P0 — Immediate |
| **Account deletion cascade** | HIGH — data integrity risk | P0 — Immediate |
| **Invite code lifecycle** | HIGH — security-sensitive feature | P0 — Immediate |
| **Admin bootstrap** | MEDIUM — one-time but security-critical | P1 — Soon |
| **Comment/reaction system** | MEDIUM — user-facing feature | P1 — Soon |
| **Follow system** | MEDIUM — social feature | P1 — Soon |
| **Streak calendar / badges** | LOW — display-only features | P2 — Later |
| **Responsive breakpoints** | LOW — visual quality | P2 — Later |

### 7.2 Redundant Areas

| Area | Details | Recommendation |
|------|---------|----------------|
| `profile.html` and `404.html` | Nearly identical 800+ line files | Extract shared profile logic into `js/profile.js` to reduce duplication and testing surface |
| `my-vibes.html` and profile Vibes tab | Both load and render user's own projects | Share rendering logic; test once |
| Sample projects in `firebase-config.js` | 25 hardcoded sample objects in production bundle | Move to separate file or Firestore seed; reduces bundle size and confusion |

### 7.3 Architecture Improvements for Testability

| Improvement | Impact | Effort |
|-------------|--------|--------|
| **Extract validation into pure functions module** | Unit-testable without DOM or Firebase | Low |
| **Add Firestore emulator test suite** | Catch rule bugs before deploy | Medium |
| **Extract `profile.html`/`404.html` shared code** | Test once, use twice; reduce 1600 lines of duplication | Medium |
| **Add error boundary / global error handler** | Catch and log all unhandled errors | Low |
| **Add structured logging** | Audit trail for admin actions and auth events | Medium |
| **Add Firestore field validation in rules** | Enforce data types, lengths, and formats server-side | Medium |
| **Move counter updates to Cloud Functions** | Atomic, reliable, testable counter management | High |
| **Add server-side image processing** | Strip EXIF, verify magic numbers, virus scan | High |
| **Implement proper visibility enforcement in rules** | Prevent unlisted project data leaks | Low |
| **Add `isActiveUser()` check to project create rule** | Block suspended users from posting | Low — single rule change |

### 7.4 Immediate Action Items (Priority Order)

1. **FIX** Firestore rule for invite code redemption — any user can consume any code (RSK-001)
2. **FIX** Add visibility enforcement to project read rule (RSK-002)
3. **FIX** Add `isActiveUser()` to project create rule (RSK-008 mitigation)
4. **ADD** Firestore emulator tests for all security rules
5. **ADD** Unit tests for `validateUsername()`, `escapeHtml()`, `validateImage()`
6. **ADD** Input length limits (description: 5000 chars, comment: 2000 chars, name: 200 chars)
7. **ADD** URL validation for project links and social URLs
8. **ADD** Atomic transactions for counter operations (Cloud Functions)
9. **FIX** Account deletion to cascade-delete all subcollections
10. **ADD** E2E smoke tests for auth and project creation

---

*This audit represents a point-in-time assessment. It should be revisited after each major feature release or security incident.*
