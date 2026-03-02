// Clean Firebase error messages: strip "Firebase: " prefix and "(auth/xxx)." suffix
function cleanErrorMessage(msg) {
  if (!msg) return 'Something went wrong. Please try again.';
  let clean = String(msg);
  clean = clean.replace(/^Firebase:\s*/i, '');
  clean = clean.replace(/\s*\(auth\/[\w-]+\)\.?$/, '');
  clean = clean.replace(/\s*\(storage\/[\w-]+\)\.?$/, '');
  clean = clean.replace(/\s*\(firestore\/[\w-]+\)\.?$/, '');
  return clean;
}

// Generate navigation HTML - call this to insert nav on any page
function getNavHTML(activePage) {
  // activePage can be 'home', 'feed', etc.
  return `
<nav>
  <div class="nav-inner">
    <a href="index.html" class="logo">
      <div class="logo-mark"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M74.96,1.39c-.91-.24-1.85-.37-2.78-.37-4.85,0-9.12,3.27-10.39,7.95l-5.59,20.07-5.36-19.59c-1.28-4.67-5.55-7.93-10.4-7.93-.94,0-1.87.12-2.78.37-2.78.74-5.1,2.53-6.54,5.02-1.44,2.49-1.82,5.39-1.08,8.17l4.41,16.47s-.02,0-.03,0c-3.36.87-6.01,3.3-7.27,6.39-.75.03-1.5.15-2.24.34-2.78.72-5.11,2.48-6.57,4.96-1.46,2.48-1.86,5.37-1.14,8.15l2.09,8.04s0,.03.01.05v8.26c0,17.39,14.15,31.54,31.54,31.54,2.82,0,5.62-.38,8.34-1.12.63-.15,2.54-.67,5.06-1.86.09-.04.18-.08.27-.13l.09-.05h0s0,0,0,0l.04-.02c.05-.03.1-.05.15-.08.82-.41,1.61-.84,2.34-1.28.11-.07.22-.14.32-.21.65-.41,1.29-.83,1.9-1.27,4.23-3.07,7.64-7.19,9.88-11.94.17-.25.31-.51.43-.78,1.8-4.04,2.71-8.35,2.71-12.8v-10.24c0-5.91-2.98-11.31-7.8-14.48l7.96-28.41v-.02s.01-.02.01-.02c1.53-5.73-1.88-11.64-7.61-13.17ZM50.85,92.2c-13.48,0-24.45-10.97-24.45-24.45v-4.61c1.03.54,2.16.81,3.3.81.61,0,1.22-.08,1.83-.23h0c1.87-.48,3.43-1.67,4.41-3.33.09-.15.16-.29.24-.44.14.09.28.19.42.27,1.12.66,2.37,1,3.64,1,.61,0,1.22-.08,1.82-.23,1.6-.41,2.98-1.35,3.95-2.65,1.44.77,3.08,1.21,4.83,1.21h4.56c-3.39,2.82-5.55,7.06-5.55,11.8v1.73c0,.98.79,1.77,1.77,1.77s1.77-.79,1.77-1.77v-1.73c0-6.51,5.29-11.8,11.8-11.8.98,0,1.77-.79,1.77-1.77s-.79-1.77-1.77-1.77h-14.35c-3.69,0-6.69-3-6.69-6.69,0-1.14.93-2.07,2.07-2.07h18.81c5.66,0,10.26,4.6,10.26,10.26v10.24c0,1.03-.06,2.05-.19,3.06-.01.05-.02.1-.03.15-1.14,7.03-4.42,12.57-9.75,16.49-1.51,1.11-2.98,1.92-4.23,2.51-3.2,1.47-6.69,2.25-10.25,2.25ZM26.71,45.14c.31-.08.62-.12.93-.12.65,0,1.28.17,1.86.51.85.5,1.45,1.29,1.69,2.24l2.09,8.04c.25.95.11,1.94-.39,2.78h0c-.5.85-1.29,1.45-2.24,1.69h0c-.95.25-1.94.11-2.78-.39-.85-.5-1.45-1.29-1.69-2.24l-2.09-8.04c-.51-1.96.67-3.97,2.63-4.48ZM44.01,11.32l8.85,32.38h-6.63c-.39,0-.78.04-1.15.12l-8.19-30.57c-.25-.95-.12-1.94.37-2.8.49-.85,1.29-1.46,2.24-1.72,1.95-.52,3.98.64,4.51,2.59ZM43.23,56.14c-.5.69-1.22,1.19-2.06,1.41-.95.25-1.94.11-2.78-.39-.85-.5-1.45-1.29-1.69-2.24l-3.12-12.02c-.51-1.96.67-3.97,2.63-4.48.95-.25,1.94-.11,2.78.39.74.44,1.3,1.1,1.59,1.9l1.33,5.04c-.8.97-1.29,2.22-1.29,3.58,0,2.62.99,5.01,2.62,6.82ZM73.12,8.23c1.96.52,3.12,2.54,2.6,4.5l-8.72,31.11c-.64-.09-1.29-.14-1.96-.14h-5.61l9.19-32.87c.52-1.96,2.54-3.12,4.5-2.6Z"/></svg></div>
      VibeLab
    </a>
    <div class="nav-links">
      <a href="explore.html" class="hide-mobile ${activePage === 'explore' ? 'active' : ''}">Explore</a>
      <a href="community.html" class="hide-mobile ${activePage === 'community' ? 'active' : ''}">Community</a>
      <div class="nav-auth" id="nav-auth">
        <div class="nav-auth-logged-out" id="nav-auth-logged-out">
          <a href="#" class="btn btn-primary btn-sm" onclick="openAuthModal('login'); return false;">Log In</a>
        </div>
        <div class="nav-auth-logged-in" id="nav-auth-logged-in">
          <a href="#" class="btn btn-primary btn-sm" onclick="openSubmitModal(); return false;">+ Share Your Vibe</a>
          <div style="position: relative;">
            <div class="nav-avatar" id="nav-avatar" onclick="toggleDropdown()">
              <span id="avatar-text">V</span>
              <img id="avatar-img" style="display: none;">
            </div>
            <div class="nav-dropdown" id="nav-dropdown">
              <a href="/profile">My Profile</a>
              <a href="my-vibes.html">My Vibes</a>
              <a href="admin.html" id="nav-admin-link" style="display:none;">Admin Dashboard</a>
              <div class="divider"></div>
              <button class="logout-btn" onclick="logOut()">Log Out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</nav>`;
}

// Generate Auth Modal HTML
function getAuthModalHTML() {
  return `
<div class="modal-overlay" id="auth-modal">
  <div class="modal">
    <button class="modal-close" onclick="closeAuthModal()">&times;</button>
    <div class="auth-tabs">
      <button class="auth-tab active" onclick="switchAuthMode('login')">Log In</button>
      <button class="auth-tab" onclick="switchAuthMode('signup')">Sign Up</button>
    </div>
    <div class="auth-error" id="auth-error"></div>
    <div id="auth-form">
      <!-- Login fields -->
      <div id="login-fields">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="auth-email" placeholder="you@example.com">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="auth-password" placeholder="At least 6 characters">
        </div>
        <div class="forgot-password-link" id="forgot-password-link">
          <a onclick="showForgotPassword()">Forgot password?</a>
        </div>
        <button class="submit-btn" id="auth-submit-btn" onclick="logInWithEmail()">Log In</button>
        <div class="auth-divider">or</div>
        <button class="google-btn" onclick="signInWithGoogle()">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
      </div>

      <!-- Signup Step 1: Invite verification -->
      <div id="signup-invite-step" style="display: none;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 2rem; margin-bottom: 8px;">🎟️</div>
          <h3 style="margin: 0 0 6px; font-size: 1.15rem;">Got an invite?</h3>
          <p class="subtitle" style="margin: 0; font-size: 0.85rem;">Paste your invite code or link to get started</p>
        </div>
        <div class="form-group">
          <label>Invite Code or Link</label>
          <input type="text" id="auth-invite-code" placeholder="VIBE-XXXX or paste invite link" autocomplete="off">
          <div id="invite-verify-status"></div>
        </div>
        <button class="submit-btn" id="invite-verify-btn" onclick="verifyInviteCode()">Verify & Continue</button>
      </div>

      <!-- Signup Step 2: Registration fields (after invite verified) -->
      <div id="signup-fields-step" style="display: none;">
        <div class="invite-verified-banner" id="invite-verified-banner"></div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="signup-email" placeholder="you@example.com">
        </div>
        <div class="form-group">
          <label>Display Name</label>
          <input type="text" id="auth-display-name" placeholder="Your name">
        </div>
        <div class="form-group">
          <label>Username</label>
          <div class="username-input-wrapper">
            <span class="username-prefix">vibelab.in/</span>
            <input type="text" id="auth-username" placeholder="yourname" autocomplete="off">
          </div>
          <div class="username-status" id="username-status"></div>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="signup-password" placeholder="At least 6 characters">
        </div>
        <button class="submit-btn" onclick="signUpWithEmail()">Sign Up</button>
        <div class="auth-divider">or</div>
        <button class="google-btn" onclick="signInWithGoogle()">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
      </div>
    </div>
    <div id="forgot-password-form" style="display: none;">
      <div class="forgot-password-header">
        <button class="forgot-back-btn" onclick="hideForgotPassword()">&larr;</button>
        <h2>Reset Password</h2>
      </div>
      <p class="subtitle" style="margin-bottom: 20px;">Enter your email and we'll send you a link to reset your password.</p>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="forgot-email" placeholder="you@example.com">
      </div>
      <div class="forgot-password-success" id="forgot-success" style="display: none;">
        <span class="forgot-success-icon">&#10003;</span>
        <p>Reset link sent! Check your email inbox.</p>
      </div>
      <div class="forgot-password-error" id="forgot-error" style="display: none;"></div>
      <button class="submit-btn" id="forgot-submit-btn" onclick="sendPasswordReset()">Send Reset Link</button>
    </div>
    <div id="google-complete-section" style="display: none;">
      <h2 style="margin-bottom: 8px;">Complete Your Profile</h2>
      <p class="subtitle" style="margin-bottom: 24px;">Choose a username to finish signing up</p>
      <div class="form-group">
        <label>Username</label>
        <div class="username-input-wrapper">
          <span class="username-prefix">vibelab.in/</span>
          <input type="text" id="google-username" placeholder="yourname" autocomplete="off">
        </div>
        <div class="username-status" id="google-username-status"></div>
      </div>
      <div class="form-group" id="google-invite-group">
        <label>Invite Code</label>
        <input type="text" id="google-invite-code" placeholder="e.g. VIBE-A3X9" autocomplete="off" style="text-transform: uppercase;">
        <div class="username-status" id="google-invite-status"></div>
      </div>
      <button class="submit-btn" onclick="completeGoogleSignup()">Complete Signup</button>
    </div>
    <div class="auth-switch">
      <span id="auth-switch-text">Don't have an account? <a onclick="switchAuthMode('signup')">Sign Up</a></span>
    </div>
  </div>
</div>`;
}

// Generate Profile Edit Modal HTML
function getProfileModalHTML() {
  return `
<div class="modal-overlay" id="profile-modal">
  <div class="modal">
    <button class="modal-close" onclick="closeProfileModal()">&times;</button>
    <h2>Edit Profile</h2>
    <p class="subtitle">Customize your VibeLab profile</p>
    <div style="text-align: center;">
      <div class="profile-photo-upload" id="profile-photo-upload" onclick="document.getElementById('profile-photo-input').click()">
        <img id="profile-photo-preview" style="display: none;">
        <span class="upload-icon" id="profile-upload-icon">&#128248;</span>
      </div>
      <input type="file" id="profile-photo-input" accept="image/png,image/jpeg,image/gif" style="display:none;">
      <p class="profile-photo-label">Click to upload profile photo</p>
    </div>
    <div class="form-group">
      <label>Username</label>
      <div class="username-input-wrapper">
        <span class="username-prefix">vibelab.in/</span>
        <input type="text" id="profile-username" placeholder="yourname" autocomplete="off">
      </div>
      <div class="username-status" id="profile-username-status"></div>
    </div>
    <div class="form-group">
      <label>Display Name</label>
      <input type="text" id="profile-display-name" placeholder="Your name">
    </div>
    <div class="form-group">
      <label>Bio</label>
      <textarea id="profile-bio" placeholder="Tell us about yourself..."></textarea>
    </div>
    <div class="form-group">
      <label>Company</label>
      <input type="text" id="profile-company" placeholder="Where you work (optional)">
    </div>
    <div class="form-group">
      <label>Skills & Interests</label>
      <input type="text" id="profile-skills" placeholder="e.g. React, Creative Coding, AI, Game Dev (comma separated)">
    </div>
    <div class="form-group">
      <label>Twitter / X Handle</label>
      <input type="text" id="profile-twitter" placeholder="@yourhandle">
    </div>
    <div class="form-group">
      <label>GitHub Username</label>
      <input type="text" id="profile-github" placeholder="yourusername">
    </div>
    <div class="form-group">
      <label>Website URL</label>
      <input type="url" id="profile-website" placeholder="https://yoursite.com">
    </div>
    <button class="submit-btn" onclick="saveProfile()">Save Profile</button>
  </div>
</div>`;
}

// Generate Submit Project Modal HTML
function getSubmitModalHTML() {
  return `
<div class="modal-overlay" id="submit-modal">
  <div class="modal">
    <button class="modal-close" onclick="closeSubmitModal()">&times;</button>
    <div id="submit-form">
      <h2>Share Your Vibe</h2>
      <p class="subtitle">Post your project for the community to see</p>
      <div class="form-group">
        <label>Project Name</label>
        <input type="text" id="proj-name" placeholder="e.g. Neon Waves">
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="proj-cat">
          <option value="web">Web</option>
          <option value="mobile">Mobile</option>
          <option value="game">Game</option>
          <option value="tool">Tool</option>
          <option value="image">Image</option>
        </select>
      </div>
      <div class="form-group">
        <label>Built With</label>
        <select id="proj-built-with">
          <option value="">Select app (optional)</option>
          <option value="Claude">Claude</option>
          <option value="Bolt">Bolt</option>
          <option value="Cursor">Cursor</option>
          <option value="Lovable">Lovable</option>
          <option value="Antigravity">Antigravity</option>
          <option value="v0">v0</option>
          <option value="Replit">Replit</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <div class="status-tags">
          <button class="status-tag active" onclick="selectStatus(this, 'WIP')">WIP</button>
          <button class="status-tag" onclick="selectStatus(this, 'Experiment')">Experiment</button>
          <button class="status-tag" onclick="selectStatus(this, 'Shipped')">Shipped</button>
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="proj-desc" placeholder="Tell us what you built and the vibe behind it..."></textarea>
      </div>
      <div class="form-group">
        <label>Project Thumbnail (optional)</label>
        <input type="file" id="proj-image" accept="image/png,image/jpeg,image/gif">
      </div>
      <div class="form-group">
        <label>Live Demo URL (optional)</label>
        <input type="url" id="proj-link" placeholder="https://your-project.com">
      </div>
      <div class="form-group">
        <label>GitHub URL (optional)</label>
        <input type="url" id="proj-github" placeholder="https://github.com/you/project">
      </div>
      <div class="form-group">
        <label>Figma URL (optional)</label>
        <input type="url" id="proj-figma" placeholder="https://figma.com/file/...">
      </div>
      <div class="form-group">
        <label>Visibility</label>
        <div class="visibility-toggle">
          <button class="visibility-option active" onclick="selectVisibility(this, 'public')">Public</button>
          <button class="visibility-option" onclick="selectVisibility(this, 'unlisted')">Unlisted</button>
        </div>
      </div>
      <div class="form-group">
        <label>Tags (comma separated)</label>
        <input type="text" id="proj-tags" placeholder="e.g. three.js, shader, interactive">
      </div>
      <div class="form-group" id="challenge-link-group" style="border-top: 1px solid var(--border-light); padding-top: 16px; margin-top: 8px;">
        <label>🔥 Link to Challenge <span style="color:var(--text-muted);font-weight:400;">(optional)</span></label>
        <select id="proj-challenge" onchange="onChallengeSelect()">
          <option value="">No challenge</option>
        </select>
        <div id="challenge-day-group" style="display:none;margin-top:10px;">
          <label style="font-size:0.85rem;">Challenge Day</label>
          <input type="number" id="proj-challenge-day" min="1" max="365" value="1" placeholder="Which day?" style="width:100%;padding:10px 14px;background:var(--bg-alt);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:0.9rem;outline:none;">
          <p id="challenge-day-hint" style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;"></p>
        </div>
      </div>
      <button class="submit-btn" onclick="submitProject()">Post to VibeLab</button>
    </div>
    <div class="success-msg" id="success-msg">
      <div class="check">&#10024;</div>
      <h3>Project Posted!</h3>
      <p>Your vibe is now live in the community. Thanks for sharing.</p>
    </div>
  </div>
</div>`;
}

// Generate Save to Collection Modal HTML
function getSaveModalHTML() {
  return `
<div class="modal-overlay" id="save-modal">
  <div class="modal" style="max-width: 420px;">
    <button class="modal-close" onclick="closeSaveModal()">&times;</button>
    <h2>Save to Collection</h2>
    <p class="subtitle">Organize your favorite vibes</p>
    <div class="save-modal-list" id="save-modal-list">
      <div class="loading-spinner"><div class="spinner"></div></div>
    </div>
    <div class="new-collection-input">
      <input type="text" id="new-collection-name" placeholder="New collection name...">
      <button onclick="createCollection()">Create</button>
    </div>
  </div>
</div>`;
}

// Generate Footer HTML
function getFooterHTML() {
  return `
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="index.html" class="logo">
          <div class="logo-mark"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M74.96,1.39c-.91-.24-1.85-.37-2.78-.37-4.85,0-9.12,3.27-10.39,7.95l-5.59,20.07-5.36-19.59c-1.28-4.67-5.55-7.93-10.4-7.93-.94,0-1.87.12-2.78.37-2.78.74-5.1,2.53-6.54,5.02-1.44,2.49-1.82,5.39-1.08,8.17l4.41,16.47s-.02,0-.03,0c-3.36.87-6.01,3.3-7.27,6.39-.75.03-1.5.15-2.24.34-2.78.72-5.11,2.48-6.57,4.96-1.46,2.48-1.86,5.37-1.14,8.15l2.09,8.04s0,.03.01.05v8.26c0,17.39,14.15,31.54,31.54,31.54,2.82,0,5.62-.38,8.34-1.12.63-.15,2.54-.67,5.06-1.86.09-.04.18-.08.27-.13l.09-.05h0s0,0,0,0l.04-.02c.05-.03.1-.05.15-.08.82-.41,1.61-.84,2.34-1.28.11-.07.22-.14.32-.21.65-.41,1.29-.83,1.9-1.27,4.23-3.07,7.64-7.19,9.88-11.94.17-.25.31-.51.43-.78,1.8-4.04,2.71-8.35,2.71-12.8v-10.24c0-5.91-2.98-11.31-7.8-14.48l7.96-28.41v-.02s.01-.02.01-.02c1.53-5.73-1.88-11.64-7.61-13.17ZM50.85,92.2c-13.48,0-24.45-10.97-24.45-24.45v-4.61c1.03.54,2.16.81,3.3.81.61,0,1.22-.08,1.83-.23h0c1.87-.48,3.43-1.67,4.41-3.33.09-.15.16-.29.24-.44.14.09.28.19.42.27,1.12.66,2.37,1,3.64,1,.61,0,1.22-.08,1.82-.23,1.6-.41,2.98-1.35,3.95-2.65,1.44.77,3.08,1.21,4.83,1.21h4.56c-3.39,2.82-5.55,7.06-5.55,11.8v1.73c0,.98.79,1.77,1.77,1.77s1.77-.79,1.77-1.77v-1.73c0-6.51,5.29-11.8,11.8-11.8.98,0,1.77-.79,1.77-1.77s-.79-1.77-1.77-1.77h-14.35c-3.69,0-6.69-3-6.69-6.69,0-1.14.93-2.07,2.07-2.07h18.81c5.66,0,10.26,4.6,10.26,10.26v10.24c0,1.03-.06,2.05-.19,3.06-.01.05-.02.1-.03.15-1.14,7.03-4.42,12.57-9.75,16.49-1.51,1.11-2.98,1.92-4.23,2.51-3.2,1.47-6.69,2.25-10.25,2.25ZM26.71,45.14c.31-.08.62-.12.93-.12.65,0,1.28.17,1.86.51.85.5,1.45,1.29,1.69,2.24l2.09,8.04c.25.95.11,1.94-.39,2.78h0c-.5.85-1.29,1.45-2.24,1.69h0c-.95.25-1.94.11-2.78-.39-.85-.5-1.45-1.29-1.69-2.24l-2.09-8.04c-.51-1.96.67-3.97,2.63-4.48ZM44.01,11.32l8.85,32.38h-6.63c-.39,0-.78.04-1.15.12l-8.19-30.57c-.25-.95-.12-1.94.37-2.8.49-.85,1.29-1.46,2.24-1.72,1.95-.52,3.98.64,4.51,2.59ZM43.23,56.14c-.5.69-1.22,1.19-2.06,1.41-.95.25-1.94.11-2.78-.39-.85-.5-1.45-1.29-1.69-2.24l-3.12-12.02c-.51-1.96.67-3.97,2.63-4.48.95-.25,1.94-.11,2.78.39.74.44,1.3,1.1,1.59,1.9l1.33,5.04c-.8.97-1.29,2.22-1.29,3.58,0,2.62.99,5.01,2.62,6.82ZM73.12,8.23c1.96.52,3.12,2.54,2.6,4.5l-8.72,31.11c-.64-.09-1.29-.14-1.96-.14h-5.61l9.19-32.87c.52-1.96,2.54-3.12,4.5-2.6Z"/></svg></div>
          VibeLab
        </a>
        <p>The community where creative developers share what they build. Code with feeling.</p>
      </div>
      <div class="footer-col">
        <h4>Community</h4>
        <a href="explore.html">Explore</a>
        <a href="community.html">About</a>
        <span>Discord</span>
        <span>Twitter / X</span>
      </div>
      <div class="footer-col">
        <h4>Resources</h4>
        <span>Getting Started</span>
        <span>Guidelines</span>
        <span>Blog</span>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <span>Privacy</span>
        <span>Terms</span>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 VibeLab. Made with good vibes.</span>
      <div class="footer-social">
        <span>Twitter</span>
        <span>GitHub</span>
        <span>Discord</span>
      </div>
    </div>
  </div>
</footer>`;
}

// Submit modal functions
let selectedStatus = 'WIP';
let selectedVisibility = 'public';
let editingProjectId = null; // Set when editing an existing project

function openSubmitModal() {
  if (!requireAuth('share your vibe')) return;
  editingProjectId = null; // Reset edit mode
  const modal = document.getElementById('submit-modal');
  if (modal) {
    modal.classList.add('open');
    const form = document.getElementById('submit-form');
    const success = document.getElementById('success-msg');
    if (form) form.style.display = 'block';
    if (success) success.classList.remove('show');
    // Reset title
    const heading = form?.querySelector('h2');
    if (heading) heading.textContent = 'Share Your Vibe';
    const subtitle = form?.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = 'Post your project for the community to see';
    const submitBtn = form?.querySelector('.submit-btn');
    if (submitBtn) submitBtn.textContent = 'Post to VibeLab';
    // Reset challenge fields
    const challengeSelect = document.getElementById('proj-challenge');
    if (challengeSelect) challengeSelect.value = '';
    const dayGroup = document.getElementById('challenge-day-group');
    if (dayGroup) dayGroup.style.display = 'none';
    // Load active challenges for dropdown
    loadActiveChallengesForSubmit();
  }
}

async function openEditProjectModal(projectId) {
  if (!requireAuth('edit projects')) return;
  editingProjectId = projectId;

  try {
    const doc = await db.collection('projects').doc(projectId).get();
    if (!doc.exists) { showToast('Project not found'); return; }
    const p = doc.data();

    const modal = document.getElementById('submit-modal');
    if (!modal) return;
    modal.classList.add('open');
    const form = document.getElementById('submit-form');
    const success = document.getElementById('success-msg');
    if (form) form.style.display = 'block';
    if (success) success.classList.remove('show');

    // Update heading
    const heading = form?.querySelector('h2');
    if (heading) heading.textContent = 'Edit Your Vibe';
    const subtitle = form?.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = 'Update your project details';
    const submitBtn = form?.querySelector('.submit-btn');
    if (submitBtn) submitBtn.textContent = 'Save Changes';

    // Populate fields
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('proj-name', p.name);
    setVal('proj-cat', p.category);
    setVal('proj-built-with', p.builtWith);
    setVal('proj-desc', p.desc);
    setVal('proj-link', p.link);
    setVal('proj-github', p.githubUrl);
    setVal('proj-figma', p.figmaUrl);
    setVal('proj-tags', (p.tags || []).join(', '));

    // Set status
    selectedStatus = p.status || 'WIP';
    document.querySelectorAll('.status-tag').forEach(b => {
      b.classList.toggle('active', b.textContent.trim() === selectedStatus);
    });

    // Set visibility
    selectedVisibility = p.visibility || 'public';
    document.querySelectorAll('.visibility-option').forEach(b => {
      b.classList.toggle('active', b.textContent.trim().toLowerCase() === selectedVisibility);
    });

    // Load challenges and set challenge fields
    await loadActiveChallengesForSubmit();
    if (p.challengeId) {
      setVal('proj-challenge', p.challengeId);
      onChallengeSelect();
      if (p.challengeDay) setVal('proj-challenge-day', p.challengeDay);
    }

  } catch (e) {
    console.error('Error loading project for edit:', e);
    showToast('Error loading project');
  }
}

function closeSubmitModal() {
  const modal = document.getElementById('submit-modal');
  if (modal) modal.classList.remove('open');
}

function selectStatus(btn, status) {
  document.querySelectorAll('.status-tag').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedStatus = status;
}

function selectVisibility(btn, vis) {
  document.querySelectorAll('.visibility-option').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedVisibility = vis;
}

// ── Challenge link in Submit Modal ──
let submitChallengesCache = [];

async function loadActiveChallengesForSubmit() {
  const select = document.getElementById('proj-challenge');
  if (!select || !db) return;

  try {
    const snap = await db.collection('challenges').orderBy('createdAt', 'desc').get();
    submitChallengesCache = [];
    const now = new Date();

    snap.docs.forEach(d => {
      const c = { id: d.id, ...d.data() };
      const start = c.startDate ? (c.startDate.toDate ? c.startDate.toDate() : new Date(c.startDate)) : null;
      const end = c.endDate ? (c.endDate.toDate ? c.endDate.toDate() : new Date(c.endDate)) : null;
      // Include active challenges only
      if (!start || start > now) return;
      if (c.type !== 'evergreen' && end && end < now) return;
      submitChallengesCache.push(c);
    });

    // Rebuild options
    select.innerHTML = '<option value="">No challenge</option>';
    submitChallengesCache.forEach(c => {
      const typeLabel = c.type.charAt(0).toUpperCase() + c.type.slice(1);
      select.innerHTML += `<option value="${c.id}">${escapeHtml(c.title)} (${typeLabel})</option>`;
    });
  } catch (e) {
    console.error('Error loading challenges for submit:', e);
  }
}

function onChallengeSelect() {
  const select = document.getElementById('proj-challenge');
  const dayGroup = document.getElementById('challenge-day-group');
  const dayInput = document.getElementById('proj-challenge-day');
  const hint = document.getElementById('challenge-day-hint');

  if (!select || !dayGroup) return;

  const challengeId = select.value;
  if (!challengeId) {
    dayGroup.style.display = 'none';
    return;
  }

  dayGroup.style.display = 'block';

  // Auto-suggest current day
  const challenge = submitChallengesCache.find(c => c.id === challengeId);
  if (challenge) {
    const start = challenge.startDate ? (challenge.startDate.toDate ? challenge.startDate.toDate() : new Date(challenge.startDate)) : null;
    if (start) {
      const now = new Date();
      let currentDay;
      if (challenge.type === 'evergreen') {
        const roundDays = challenge.roundDays || 30;
        const elapsed = now - start;
        const roundMs = roundDays * 86400000;
        const intoRound = elapsed % roundMs;
        currentDay = Math.floor(intoRound / 86400000) + 1;
        const round = Math.floor(elapsed / roundMs) + 1;
        hint.textContent = `Round ${round} · Auto-suggested: Day ${currentDay} of ${roundDays}`;
        dayInput.max = roundDays;
      } else {
        const elapsed = now - start;
        currentDay = Math.floor(elapsed / 86400000) + 1;
        const end = challenge.endDate ? (challenge.endDate.toDate ? challenge.endDate.toDate() : new Date(challenge.endDate)) : null;
        const totalDays = end ? Math.ceil((end - start) / 86400000) : currentDay;
        hint.textContent = `Auto-suggested: Day ${currentDay} of ${totalDays}`;
        dayInput.max = totalDays;
      }
      dayInput.value = currentDay;
    }
  }
}

async function submitProject() {
  if (!currentUser) { openAuthModal('login'); return; }

  const name = document.getElementById('proj-name').value.trim();
  const cat = document.getElementById('proj-cat').value;
  const builtWith = document.getElementById('proj-built-with')?.value || '';
  const desc = document.getElementById('proj-desc').value.trim();
  const link = document.getElementById('proj-link')?.value.trim() || '';
  const githubUrl = document.getElementById('proj-github')?.value.trim() || '';
  const figmaUrl = document.getElementById('proj-figma')?.value.trim() || '';
  const tagsInput = document.getElementById('proj-tags')?.value.trim() || '';
  const imageFile = document.getElementById('proj-image')?.files[0];

  if (!name || !desc) { alert('Please fill in project name and description'); return; }

  // Validate thumbnail if provided
  if (imageFile) {
    const check = validateImage(imageFile, { maxSizeMB: IMAGE_RULES.thumbnail.maxSizeMB });
    if (!check.valid) { showToast(check.error); return; }
  }

  try {
    let imageURL = '';
    if (imageFile) {
      const resized = await resizeImage(imageFile, { maxWidth: IMAGE_RULES.thumbnail.maxWidth, maxHeight: IMAGE_RULES.thumbnail.maxHeight, quality: IMAGE_RULES.thumbnail.quality });
      const storageRef = storage.ref(`project-thumbnails/${currentUser.uid}/${Date.now()}`);
      await storageRef.put(resized);
      imageURL = await storageRef.getDownloadURL();
    }

    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];

    // Challenge linking
    const challengeId = document.getElementById('proj-challenge')?.value || '';
    const challengeDay = challengeId ? (parseInt(document.getElementById('proj-challenge-day')?.value) || 1) : null;
    let challengeRound = null;
    if (challengeId) {
      const linkedChallenge = submitChallengesCache.find(c => c.id === challengeId);
      if (linkedChallenge && linkedChallenge.type === 'evergreen' && linkedChallenge.startDate) {
        const start = linkedChallenge.startDate.toDate ? linkedChallenge.startDate.toDate() : new Date(linkedChallenge.startDate);
        const roundDays = linkedChallenge.roundDays || 30;
        challengeRound = Math.floor((new Date() - start) / (roundDays * 86400000)) + 1;
      }
    }

    if (editingProjectId) {
      // UPDATE existing project
      const updateData = {
        name, desc,
        category: cat,
        builtWith: builtWith,
        tag: tagMap[cat],
        status: selectedStatus,
        visibility: selectedVisibility,
        link, githubUrl, figmaUrl,
        tags,
        color: colorMap[cat],
        gradient: gradMap[cat],
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      if (imageURL) updateData.imageURL = imageURL;
      if (challengeId) {
        updateData.challengeId = challengeId;
        updateData.challengeDay = challengeDay;
        updateData.challengeRound = challengeRound;
      }

      await db.collection('projects').doc(editingProjectId).update(updateData);
      editingProjectId = null;
      showToast('Project updated successfully!');
    } else {
      // CREATE new project
      const project = {
        name, desc,
        category: cat,
        builtWith: builtWith,
        tag: tagMap[cat],
        status: selectedStatus,
        visibility: selectedVisibility,
        link, githubUrl, figmaUrl,
        tags,
        imageURL,
        authorUid: currentUser.uid,
        authorName: currentUserProfile?.displayName || currentUser.displayName || currentUser.email,
        authorUsername: currentUserProfile?.username || '',
        authorPhoto: currentUserProfile?.photoURL || '',
        color: colorMap[cat],
        gradient: gradMap[cat],
        vibes: 0,
        comments: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      if (challengeId) {
        project.challengeId = challengeId;
        project.challengeDay = challengeDay;
        project.challengeRound = challengeRound;
      }
      await db.collection('projects').add(project);

      // Increment challenge submission count
      if (challengeId) {
        try {
          await db.collection('challenges').doc(challengeId).update({
            submissionCount: firebase.firestore.FieldValue.increment(1)
          });
        } catch (e) {
          console.warn('Could not increment challenge submission count:', e);
        }
      }
    }

    // Clear form
    ['proj-name', 'proj-desc', 'proj-link', 'proj-github', 'proj-figma', 'proj-tags', 'proj-built-with', 'proj-challenge'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const imageInput = document.getElementById('proj-image');
    if (imageInput) imageInput.value = '';
    const dayGroup = document.getElementById('challenge-day-group');
    if (dayGroup) dayGroup.style.display = 'none';

    const form = document.getElementById('submit-form');
    const success = document.getElementById('success-msg');
    if (form) form.style.display = 'none';
    if (success) success.classList.add('show');
    setTimeout(closeSubmitModal, 2000);

    // Reload projects if on a page that shows them
    if (typeof loadFeedProjects === 'function') loadFeedProjects();
    if (typeof loadProjects === 'function') loadProjects();
    if (typeof loadMyVibes === 'function') loadMyVibes();
  } catch (error) {
    console.error('Project submission error:', error);
    showToast('Error posting project: ' + cleanErrorMessage(error.message));
  }
}

// Delete a project with confirmation
async function deleteProject(projectId, projectName) {
  if (!currentUser) return;

  const confirmed = confirm(`Are you sure you want to delete "${projectName || 'this project'}"? This action cannot be undone.`);
  if (!confirmed) return;

  try {
    // Delete project document
    await db.collection('projects').doc(projectId).delete();

    showToast('Project deleted successfully');

    // Reload projects on current page
    if (typeof loadMyVibes === 'function') loadMyVibes();
    if (typeof loadFeedProjects === 'function') loadFeedProjects();
    if (typeof loadProfileProjects === 'function') loadProfileProjects();
    if (typeof loadProjects === 'function') loadProjects();
  } catch (e) {
    console.error('Delete project error:', e);
    showToast('Error deleting project: ' + e.message);
  }
}

// Save modal functions
function openSaveModal(projectId) {
  if (!requireAuth('save projects')) return;
  const modal = document.getElementById('save-modal');
  if (modal) {
    modal.classList.add('open');
    modal.dataset.projectId = projectId;
    loadCollections(projectId);
  }
}

function closeSaveModal() {
  const modal = document.getElementById('save-modal');
  if (modal) modal.classList.remove('open');
}

async function loadCollections(projectId) {
  const list = document.getElementById('save-modal-list');
  if (!list || !currentUser) return;

  try {
    const snapshot = await db.collection('users').doc(currentUser.uid).collection('collections').get();
    if (snapshot.empty) {
      list.innerHTML = '<div class="empty-state" style="padding:20px;"><p>No collections yet. Create one below!</p></div>';
    } else {
      let html = '';
      for (const doc of snapshot.docs) {
        const col = doc.data();
        const hasProject = col.projectIds && col.projectIds.includes(projectId);
        html += `
          <label class="save-modal-item">
            <input type="checkbox" ${hasProject ? 'checked' : ''} onchange="toggleProjectInCollection('${doc.id}', '${projectId}', this.checked)">
            <span class="collection-name">${escapeHtml(col.name)}</span>
            <span class="collection-count">${(col.projectIds || []).length} vibes</span>
          </label>`;
      }
      list.innerHTML = html;
    }
  } catch (e) {
    console.error('Load collections error:', e);
    list.innerHTML = '<div class="empty-state" style="padding:20px;"><p>Error loading collections</p></div>';
  }
}

async function createCollection() {
  if (!currentUser) return;
  const input = document.getElementById('new-collection-name');
  const name = input?.value.trim();
  if (!name) return;

  try {
    await db.collection('users').doc(currentUser.uid).collection('collections').add({
      name,
      projectIds: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    input.value = '';
    const modal = document.getElementById('save-modal');
    if (modal?.dataset.projectId) loadCollections(modal.dataset.projectId);
    showToast('Collection created!');
  } catch (e) {
    console.error('Create collection error:', e);
  }
}

async function toggleProjectInCollection(collectionId, projectId, add) {
  if (!currentUser) return;
  try {
    const ref = db.collection('users').doc(currentUser.uid).collection('collections').doc(collectionId);
    if (add) {
      await ref.update({ projectIds: firebase.firestore.FieldValue.arrayUnion(projectId) });
    } else {
      await ref.update({ projectIds: firebase.firestore.FieldValue.arrayRemove(projectId) });
    }
  } catch (e) {
    console.error('Toggle collection error:', e);
  }
}

// Initialize page common elements
function initPage(activePage) {
  // Insert nav
  const navContainer = document.getElementById('nav-container');
  if (navContainer) navContainer.innerHTML = getNavHTML(activePage);

  // Insert footer
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) footerContainer.innerHTML = getFooterHTML();

  // Insert modals
  const modalsContainer = document.getElementById('modals-container');
  if (modalsContainer) {
    modalsContainer.innerHTML = getAuthModalHTML() + getProfileModalHTML() + getSubmitModalHTML() + getSaveModalHTML();
  }

  // Setup modal close on backdrop click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) this.classList.remove('open');
    });
  });
}

// Toggle vibe (like) on a project
async function toggleVibe(projectId, btn) {
  if (!requireAuth('vibe with this project')) return;

  try {
    const vibeRef = db.collection('projects').doc(projectId).collection('vibes').doc(currentUser.uid);
    const vibeDoc = await vibeRef.get();

    if (vibeDoc.exists) {
      await vibeRef.delete();
      await db.collection('projects').doc(projectId).update({
        vibes: firebase.firestore.FieldValue.increment(-1)
      });
      if (btn) { btn.classList.remove('active'); }
      const countEl = btn?.querySelector('.count');
      if (countEl) countEl.textContent = parseInt(countEl.textContent) - 1;
    } else {
      await vibeRef.set({
        userId: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      await db.collection('projects').doc(projectId).update({
        vibes: firebase.firestore.FieldValue.increment(1)
      });
      if (btn) { btn.classList.add('active'); }
      const countEl = btn?.querySelector('.count');
      if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
    }
  } catch (e) {
    console.error('Toggle vibe error:', e);
  }
}

// Follow/unfollow a creator
async function toggleFollow(targetUid, btn) {
  if (!requireAuth('follow creators')) return;
  if (targetUid === currentUser.uid) return;

  try {
    const followRef = db.collection('follows').doc(`${currentUser.uid}_${targetUid}`);
    const followDoc = await followRef.get();

    if (followDoc.exists) {
      await followRef.delete();
      if (btn) {
        btn.classList.remove('following');
        btn.classList.add('not-following');
        btn.textContent = 'Follow';
      }
    } else {
      await followRef.set({
        followerId: currentUser.uid,
        followingId: targetUid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      if (btn) {
        btn.classList.remove('not-following');
        btn.classList.add('following');
        btn.textContent = 'Following';
      }
    }
  } catch (e) {
    console.error('Toggle follow error:', e);
  }
}

// Check if current user is following target
async function checkIfFollowing(targetUid) {
  if (!currentUser) return false;
  try {
    const doc = await db.collection('follows').doc(`${currentUser.uid}_${targetUid}`).get();
    return doc.exists;
  } catch (e) { return false; }
}

// Check if current user has vibed a project
async function checkIfVibed(projectId) {
  if (!currentUser) return false;
  try {
    const doc = await db.collection('projects').doc(projectId).collection('vibes').doc(currentUser.uid).get();
    return doc.exists;
  } catch (e) { return false; }
}

// Get follower/following counts
async function getFollowCounts(userId) {
  try {
    const [followersSnap, followingSnap] = await Promise.all([
      db.collection('follows').where('followingId', '==', userId).get(),
      db.collection('follows').where('followerId', '==', userId).get()
    ]);
    return { followers: followersSnap.size, following: followingSnap.size };
  } catch (e) { return { followers: 0, following: 0 }; }
}

// ── Forgot Password ──
function showForgotPassword() {
  const authForm = document.getElementById('auth-form');
  const forgotForm = document.getElementById('forgot-password-form');
  const authTabs = document.querySelector('.auth-tabs');
  const authSwitch = document.querySelector('.auth-switch');
  const forgotLink = document.getElementById('forgot-password-link');

  if (authForm) authForm.style.display = 'none';
  if (forgotForm) forgotForm.style.display = 'block';
  if (authTabs) authTabs.style.display = 'none';
  if (authSwitch) authSwitch.style.display = 'none';

  // Pre-fill email from login form
  const loginEmail = document.getElementById('auth-email')?.value?.trim();
  const forgotEmail = document.getElementById('forgot-email');
  if (forgotEmail && loginEmail) forgotEmail.value = loginEmail;

  // Reset state
  const successEl = document.getElementById('forgot-success');
  const errorEl = document.getElementById('forgot-error');
  const submitBtn = document.getElementById('forgot-submit-btn');
  if (successEl) successEl.style.display = 'none';
  if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }
  if (submitBtn) { submitBtn.style.display = 'block'; submitBtn.disabled = false; submitBtn.textContent = 'Send Reset Link'; }

  clearAuthError();
}

function hideForgotPassword() {
  const authForm = document.getElementById('auth-form');
  const forgotForm = document.getElementById('forgot-password-form');
  const authTabs = document.querySelector('.auth-tabs');
  const authSwitch = document.querySelector('.auth-switch');

  if (forgotForm) forgotForm.style.display = 'none';
  if (authForm) authForm.style.display = 'block';
  if (authTabs) authTabs.style.display = '';
  if (authSwitch) authSwitch.style.display = '';
}

async function sendPasswordReset() {
  const email = document.getElementById('forgot-email')?.value?.trim();
  const successEl = document.getElementById('forgot-success');
  const errorEl = document.getElementById('forgot-error');
  const submitBtn = document.getElementById('forgot-submit-btn');

  if (!email) {
    if (errorEl) { errorEl.textContent = 'Please enter your email address.'; errorEl.style.display = 'block'; }
    return;
  }

  if (errorEl) errorEl.style.display = 'none';
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

  try {
    await auth.sendPasswordResetEmail(email);
    if (successEl) successEl.style.display = 'flex';
    if (submitBtn) submitBtn.style.display = 'none';
  } catch (error) {
    let message = 'Something went wrong. Please try again.';
    if (error.code === 'auth/user-not-found') message = 'No account found with this email.';
    else if (error.code === 'auth/invalid-email') message = 'Please enter a valid email address.';
    else if (error.code === 'auth/too-many-requests') message = 'Too many attempts. Please try again later.';
    if (errorEl) { errorEl.textContent = message; errorEl.style.display = 'block'; }
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Reset Link'; }
  }
}
