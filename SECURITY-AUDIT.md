# VibeLab Security Audit Report

**Date:** 2026-03-02
**Auditor:** Claude (Principal Cyber Security Architect + Red Team Lead)
**Scope:** Full-spectrum application security audit
**Target:** vibelab.in (Vanilla JS + Firebase + Cloudflare Pages)

---

## Executive Summary

VibeLab is a client-side-only application backed by Firebase. It has **no server-side code** — all business logic, access control, and data validation live in Firestore Security Rules and client-side JavaScript. This architecture means **every security control is only as strong as Firestore rules**, since all client-side checks can be trivially bypassed by calling the Firebase SDK directly from a browser console or custom script.

**Critical findings: 2** | **High: 6** | **Medium: 5** | **Low: 4**

---

## CRITICAL Severity

### C1: Admin Bootstrap Privilege Escalation

**File:** `firestore.rules:170-173`, `admin.html:302-338`
**CVSS Estimate:** 9.8

The admin bootstrap flow allows **any authenticated user** to become superadmin if the `adminConfig/settings` document is deleted.

**Attack chain:**
1. The `adminConfig` write rule (line 172-173) allows writes when `!exists(/databases/$(database)/documents/adminConfig/settings)`
2. The `claimAdmin()` function (admin.html:310-321) updates the user doc with `role: 'superadmin'` and creates `adminConfig/settings`
3. **However**, the user document update rule (line 53) requires `isSuperAdmin()` to change protected fields like `role` — this means the bootstrap flow as written should actually fail for a new user

**The real vulnerability:** The `noSuperAdminExists()` helper (line 28-32) always returns `true` and is **never used in any rule**. The bootstrap relies on `adminConfig/settings` not existing. If an attacker (or the superadmin themselves) deletes this document, the `adminConfig` write path reopens.

Currently, only superadmin can delete from `adminConfig`, so this requires a compromised superadmin account. But the fact that the entire admin access gate is a single document's existence is a fragile design.

**Actual bootstrap bug:** The `claimAdmin()` function tries to `update()` the user doc with `role: 'superadmin'` (line 310), but the Firestore rules would reject this because `isSuperAdmin()` is false and `notChangingProtectedFields()` is false (changing `role`, `invitesRemaining`, `status`). This means **bootstrap is broken unless the rules were deployed after the initial admin was set up**.

**Remediation:**
- Use Firebase Admin SDK (Cloud Function) for bootstrap, not client-side rules
- Remove the `noSuperAdminExists()` dead code
- Add a Cloud Function to handle admin role assignment securely
- If keeping client-side bootstrap, add a dedicated rule path for first-time setup that checks `!exists(adminConfig/settings)` on the **user update** rule, not just on `adminConfig` writes

---

### C2: Stored XSS via `showToast()` innerHTML

**File:** `js/auth.js:774-777`
**CVSS Estimate:** 8.1

The `showToast()` function uses `innerHTML` to render the message:
```js
toast.innerHTML = `<span>${message}</span>...`;
```

Multiple call sites pass user-controlled or error-derived data into `showToast()`:
- `auth.js:682` — `'Error saving profile: ' + cleanErrorMessage(error.message)`
- `shared.js:711` — `'Error posting project: ' + cleanErrorMessage(error.message)`
- `profile.html:419,457,505` — various error messages
- `admin.html:336` — admin error messages

While `cleanErrorMessage()` strips Firebase prefixes, it does **not** HTML-escape the content. If an attacker can influence error messages (e.g., via crafted Firestore data that triggers specific error text), they can inject HTML/JS.

**More direct vector:** `showToast()` is a global function. Any call with user-controlled input is an XSS vector. For example, if project names or usernames are ever passed through `showToast()`, arbitrary script execution is possible.

**Remediation:**
- Change `showToast()` to use `textContent` instead of `innerHTML` for the message span
- Only use `innerHTML` for the action button structure, keeping message content escaped

---

## HIGH Severity

### H1: Unescaped URLs in HTML Attributes (Stored XSS)

**File:** `js/firebase-config.js:108,112`

`renderProjectCard()` injects `imageURL` and `authorPhoto` directly into HTML without escaping:
```js
style="background: ${p.imageURL ? `url(${p.imageURL}) center/cover` : gradient};"
<img src="${p.authorPhoto}" class="card-creator-pic">
```

An attacker who stores a crafted `imageURL` or `authorPhoto` in their project/profile document could inject arbitrary HTML. Example payload for `imageURL`:
```
); background: red;"><script>alert(1)</script><div style="display:none
```

This would break out of the `style` attribute and inject a script tag.

**Also affected:**
- `vibe.html:277` — `profile.photoURL` injected unescaped into `src`
- `vibe.html:460,478` — `authorPhoto` in comment rendering injected unescaped into `src`
- `vibe.html:624` — `profile.photoURL` in comment avatar injected via `innerHTML`
- `profile.html:213` — `profile.photoURL` in profile header injected unescaped

**Remediation:**
- Run all URLs through `escapeHtml()` before embedding in HTML attributes
- Validate URLs server-side (Firestore rules can validate format with `matches()`)
- Add URL allowlisting (only `https://` and Firebase Storage URLs)

---

### H2: iframe src Injection (Live Demo Modal)

**File:** `vibe.html:641-648`

The `openDemoModal()` function sets `iframe.src` directly from a Firestore document's `link` field:
```js
iframe.src = url;
```

While the rendering code (line 173) checks for `http://` or `https://` prefix, the `openDemoModal()` function itself performs **no validation**. If an attacker directly writes to Firestore (bypassing the UI), they could set a `link` field to:
- `javascript:alert(document.cookie)` — execute arbitrary JS in the parent context
- `data:text/html,<script>...</script>` — load arbitrary HTML

The check at line 173 only controls whether the button is **rendered**, not whether `openDemoModal()` can be called with a malicious URL. An attacker could call `openDemoModal('javascript:...')` from the console, or inject the URL via Firestore.

**Remediation:**
- Add URL validation inside `openDemoModal()` itself — reject non-http(s) URLs
- Add `sandbox` attribute to the demo iframe: `sandbox="allow-scripts allow-same-origin"`
- Validate URLs in Firestore rules using `matches()` for http/https pattern

---

### H3: Invite Code Enumeration and Brute Force

**File:** `firestore.rules:146-148`

The `inviteCodes` collection is **fully readable by anyone** (even unauthenticated):
```
allow read: if true;
```

This means an attacker can:
1. **List all invite codes**: `db.collection('inviteCodes').get()` returns every code with status, creator UID, etc.
2. **Find active codes**: Filter for `status == 'active'` to find unused invite codes
3. **Bypass invite-only system**: Grab any active code and sign up

This completely undermines the invite-only access control.

**Remediation:**
- Change to `allow read: if isSignedIn()` at minimum
- Better: Use `allow get: if true` (single document reads only, no listing) so the invite landing page can validate a specific code, but attackers can't enumerate all codes
- Best: Move invite validation to a Cloud Function

---

### H4: User Data Exposure via Public Profiles

**File:** `firestore.rules:44-45`

The entire `users` collection is publicly readable:
```
allow read: if true;
```

This exposes every user's profile data to unauthenticated scrapers, including:
- Email addresses (stored in user docs)
- Display names, bios, social links
- `invitesRemaining` count
- `role` field (reveals admins)
- `status` field
- `invitedBy` and `inviteCode` (social graph mapping)

An attacker can build a complete user database with:
```js
db.collection('users').get()
```

**Remediation:**
- Change to `allow get: if true` (single doc reads only, no collection listing)
- Or: `allow list: if isSignedIn()` to prevent anonymous scraping
- Separate sensitive fields (email, inviteCode, invitedBy) into a private subcollection only the owner can read

---

### H5: No Firebase Storage Security Rules

**Finding:** No `storage.rules` file exists in the repository.

Firebase Storage defaults to **allowing all authenticated users** to read and write all files. This means:
- Any authenticated user can upload arbitrary files (unlimited size, any type)
- Any authenticated user can overwrite or delete other users' files
- No file type validation, no size limits server-side
- Potential for abuse: hosting malware, illegal content, or exhausting storage quota

**Remediation:**
- Create `storage.rules` with:
  - Path-based access control (users can only write to their own directory)
  - File type restrictions (images only: `contentType.matches('image/.*')`)
  - File size limits (`resource.size < 5 * 1024 * 1024`)
  - Read access scoped appropriately

---

### H6: Username/Invite Code Race Conditions (TOCTOU)

**File:** `js/auth.js` (signup flow), `firestore.rules:71-85`

The username claim process has a Time-of-Check-Time-of-Use window:

1. Client checks if username is available: `db.collection('usernames').doc(username).get()`
2. If available, client creates the username doc: `db.collection('usernames').doc(username).set({uid: user.uid})`

Between steps 1 and 2, another user could attempt the same. Firestore's `create` semantics (line 76) mean only one will succeed — the second write will fail. So **usernames are safe** due to Firestore atomicity on create.

**However**, the invite code redemption flow has a real race:
1. Client validates invite code (reads doc, checks status == 'active')
2. Client caches validated data in `_verifiedInviteCode`
3. Later, client marks code as used during signup

Between steps 1 and 3, another user could use the same code. The Firestore rules (line 158-162) check `resource.data.status == 'active'` atomically, so only one user will succeed. The other gets a confusing error.

**Severity reduced** because Firestore rules provide atomic protection. The UX could be better.

**Remediation:**
- Use Firestore transactions for username claim for defense-in-depth
- Show a clear error if invite code was already used between verification and signup
- Consider re-validating invite code at signup time

---

## MEDIUM Severity

### M1: Error Message Information Disclosure via innerHTML

**File:** `vibe.html:158`, `profile.html:198`, `404.html:203`, `my-vibes.html:159`

Several pages inject `e.message` directly into HTML via `innerHTML`:
```js
innerHTML = '...<p>' + e.message + '</p></div>';
```

This exposes:
- Firestore collection/field names in permission errors
- Network error details with internal URLs
- Stack trace information in some browsers

This is also a reflected XSS vector if error messages can be influenced.

**Remediation:**
- Never display raw error messages to users
- Use `escapeHtml(e.message)` or `cleanErrorMessage()` + `textContent`
- Show generic user-facing messages, log details to console only

---

### M2: No Rate Limiting on Any Operation

**Architecture gap**

VibeLab has zero server-side code (no Cloud Functions). There is **no rate limiting** on:
- Login attempts (credential stuffing)
- Signup attempts (mass account creation)
- Invite code generation
- Project submissions
- Comment posting
- Follow/unfollow spam
- Vibe (like) toggling
- API requests (Firestore reads/writes)

An attacker with a valid account could:
- Post thousands of spam comments
- Create hundreds of projects
- Follow/unfollow rapidly (notification spam)
- Exhaust Firestore read/write quotas (billing attack)

**Remediation:**
- Implement Cloud Functions for write-heavy operations
- Enable Firebase App Check to prevent automated SDK abuse
- Add Firestore rules with timestamp checks (e.g., `request.time > resource.data.lastAction + duration.value(5, 's')`)
- Client-side debouncing (defense-in-depth only)

---

### M3: Project Visibility Not Enforced Server-Side

**File:** `firestore.rules:91`

Projects are publicly readable regardless of status:
```
allow read: if true;
```

If VibeLab ever implements draft/private/unlisted projects, current rules would still expose them to anyone who knows the document ID.

**Remediation:**
- Add status-based read control:
  ```
  allow read: if resource.data.status == 'published'
    || resource.data.authorUid == request.auth.uid
    || isSuperAdmin()
  ```

---

### M4: Unrestricted Firestore Document Fields on Creation

**File:** `firestore.rules:94-95, 48, 115-116`

Creation rules only validate ownership fields, not the full schema:
```
// Projects
allow create: if isSignedIn() && request.resource.data.authorUid == request.auth.uid;

// Users
allow create: if isOwner(userId);

// Comments
allow create: if isSignedIn() && request.resource.data.authorUid == request.auth.uid;
```

An attacker can include **any additional fields**:
- Projects: Set `vibes: 999999`, `comments: 999`, `featured: true`
- Users: Set `role: 'superadmin'` on creation (bypasses the update restriction!)
- Comments: Set `authorName` to impersonate others

**The user creation vector is particularly dangerous** — while `update` protects `role`, the `create` rule does not. A user could delete their account and recreate with `role: 'superadmin'`.

**Remediation:**
- Validate required fields with `hasAll()`
- Restrict allowed fields with `hasOnly()`
- Validate data types (`is string`, `is number`)
- Ensure `role`, `status`, `invitesRemaining` are never set on user creation (or set to fixed defaults)

---

### M5: Comment Author Spoofing

**File:** `firestore.rules:115-116`, `vibe.html:453-489`

Comment creation only validates `authorUid`. The `authorName`, `authorPhoto`, `authorUsername`, and `authorColor` fields are **attacker-controlled**. An attacker can impersonate any user in comments while using their own UID.

The `renderComment()` function (vibe.html:453) renders these fields directly, with `authorPhoto` going into `src` attributes without escaping (also an XSS vector).

**Remediation:**
- Validate author metadata matches actual profile in rules (expensive)
- Or: populate author metadata server-side via Cloud Function trigger
- Or: look up user profiles on render instead of trusting stored metadata

---

## LOW Severity

### L1: Firebase API Key Exposed in Source

**File:** `js/firebase-config.js:4-15`

Firebase config including API key is in client-side source. This is expected for Firebase client SDK and not inherently a vulnerability. However, the key can be used for automated attacks.

**Remediation:**
- Restrict API key in Google Cloud Console (referrer restrictions, API restrictions)
- Enable Firebase App Check

---

### L2: Vibe Count Race Condition

The vibe toggle system may have non-atomic read-modify-write for the project's `vibes` count field. This is a data integrity issue, not a security vulnerability.

**Remediation:**
- Use `firebase.firestore.FieldValue.increment(1)` / `increment(-1)` for atomic updates

---

### L3: Social Links Not Validated

**File:** `profile.html:231-233`

The `website` social link field is used directly as an `href`:
```js
'<a href="' + profile.socials.website + '"'
```

An attacker could set `javascript:alert(1)` as their website, which would execute when another user clicks the link.

**Remediation:**
- Validate the `website` field starts with `http://` or `https://`
- Use `escapeHtml()` on URL values in `href` attributes

---

### L4: Remaining `alert()` Call

**File:** `js/shared.js:591`

One `alert()` call remains:
```js
if (!name || !desc) { alert('Please fill in project name and description'); return; }
```

Not a security vulnerability, but inconsistent with `showToast()` usage elsewhere.

**Remediation:** Replace with `showToast()`.

---

## Attack Scenario Matrix

| Attacker Type | Attack Vector | Severity | Finding |
|---|---|---|---|
| **Anonymous scraper** | Enumerate all invite codes via public read | HIGH | H3 |
| **Anonymous scraper** | Dump all user data via public collection listing | HIGH | H4 |
| **Authenticated user** | Inject XSS via `showToast()` innerHTML | CRITICAL | C2 |
| **Authenticated user** | Inject XSS via crafted `imageURL` or `photoURL` | HIGH | H1 |
| **Authenticated user** | iframe `javascript:` URL injection | HIGH | H2 |
| **Authenticated user** | Set `role: 'superadmin'` on user doc creation | MEDIUM | M4 |
| **Authenticated user** | Fake project stats on creation | MEDIUM | M4 |
| **Authenticated user** | Impersonate users in comments | MEDIUM | M5 |
| **Authenticated user** | Spam comments/projects without rate limit | MEDIUM | M2 |
| **Authenticated user** | Upload arbitrary files to Storage | HIGH | H5 |
| **Botnet operator** | Credential stuffing without rate limit | MEDIUM | M2 |
| **Compromised admin** | Delete `adminConfig/settings` to re-bootstrap | CRITICAL | C1 |

---

## Priority Remediation Roadmap

### Immediate (Before Launch / This Week)
1. **Fix `showToast()` XSS** — use `textContent` for message span (C2)
2. **Escape all URLs** in `renderProjectCard()`, `vibe.html`, `profile.html` (H1)
3. **Validate iframe URLs** — reject non-http(s) in `openDemoModal()` (H2)
4. **Create `storage.rules`** — restrict uploads by path, type, and size (H5)
5. **Fix invite code enumeration** — change `allow read` to `allow get` (H3)
6. **Add field validation on user creation** — block `role` field on create (M4)

### Short Term (This Sprint)
7. **Restrict user collection reads** — `allow get: if true` only (H4)
8. **Add field validation** to project and comment creation rules (M4, M5)
9. **Validate social link URLs** — ensure `website` is http/https (L3)
10. **Enable Firebase App Check** — prevent automated SDK abuse (M2)
11. **Fix raw `e.message` in innerHTML** across all pages (M1)

### Medium Term (Next Sprint)
12. **Implement Cloud Functions** for write-heavy operations with rate limiting (M2)
13. **Move admin bootstrap to Cloud Function** (C1)
14. **Server-side author metadata** for comments (M5)
15. **Separate sensitive user fields** into private subcollections (H4)

---

## Summary Table

| # | Severity | Finding | File(s) |
|---|---|---|---|
| C1 | CRITICAL | Admin bootstrap privilege escalation | `firestore.rules`, `admin.html` |
| C2 | CRITICAL | Stored XSS via `showToast()` innerHTML | `js/auth.js:774` |
| H1 | HIGH | Unescaped URLs in HTML attributes (XSS) | `js/firebase-config.js:108,112` |
| H2 | HIGH | iframe src injection in Live Demo modal | `vibe.html:646` |
| H3 | HIGH | Invite code enumeration (public read) | `firestore.rules:148` |
| H4 | HIGH | User data exposure (public collection listing) | `firestore.rules:45` |
| H5 | HIGH | No Firebase Storage security rules | Missing `storage.rules` |
| H6 | HIGH | Username/invite race conditions (mitigated) | `js/auth.js`, `firestore.rules` |
| M1 | MEDIUM | Error messages leak details via innerHTML | `vibe.html`, `profile.html`, `404.html` |
| M2 | MEDIUM | No rate limiting on any operation | Architecture gap |
| M3 | MEDIUM | Project visibility not enforced server-side | `firestore.rules:91` |
| M4 | MEDIUM | Unrestricted fields on document creation | `firestore.rules:94,48,115` |
| M5 | MEDIUM | Comment author spoofing | `firestore.rules:115`, `vibe.html` |
| L1 | LOW | Firebase API key exposed (expected) | `js/firebase-config.js` |
| L2 | LOW | Vibe count race condition | `js/shared.js` |
| L3 | LOW | Social links not URL-validated | `profile.html:231` |
| L4 | LOW | Remaining `alert()` call | `js/shared.js:591` |

---

*End of security audit report.*
