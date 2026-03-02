// Auth state observer (only if Firebase loaded)
if (typeof auth !== 'undefined' && auth) auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  if (user) {
    try {
      const doc = await db.collection('users').doc(user.uid).get();
      if (doc.exists) {
        currentUserProfile = doc.data();

        // Handle Google OAuth incomplete signup (user exists in Auth but needs username)
        if (user.providerData?.some(p => p.providerId === 'google.com') && !currentUserProfile.username) {
          showGoogleCompleteSignup();
        }

        // Update nav and fire event immediately — don't block on background writes
        updateNav();
        window.dispatchEvent(new CustomEvent('authStateReady', { detail: { user, profile: currentUserProfile } }));

        // Fire-and-forget: backfill invite fields or update lastActive
        if (!currentUserProfile.hasOwnProperty('invitesRemaining')) {
          db.collection('users').doc(user.uid).update({
            invitesRemaining: 3,
            status: 'active',
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
          }).then(() => {
            currentUserProfile.invitesRemaining = 3;
            currentUserProfile.status = 'active';
          }).catch(err => console.warn('Could not backfill invite fields:', err));
        } else {
          db.collection('users').doc(user.uid).update({
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
          }).catch(err => console.warn('Could not update lastActive:', err));
        }
        return; // Already dispatched authStateReady above
      } else {
        // New user — check if this is from email signup (has _pendingUsername) or Google OAuth
        if (window._pendingUsername) {
          // Email signup — create user doc
          currentUserProfile = {
            displayName: user.displayName || '',
            email: user.email,
            username: window._pendingUsername,
            bio: '',
            company: '',
            skills: [],
            photoURL: user.photoURL || '',
            socials: { twitter: '', github: '', website: '' },
            invitesRemaining: 3,
            invitedBy: window._pendingInviteCreator || null,
            inviteCode: window._pendingInviteCode || '',
            status: 'active',
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          };
          await db.collection('users').doc(user.uid).set(currentUserProfile);
          window._pendingUsername = null;
          window._pendingInviteCode = null;
          window._pendingInviteCreator = null;
        } else {
          // Only show complete signup for actual Google OAuth users
          const isGoogleUser = user.providerData?.some(p => p.providerId === 'google.com');
          if (isGoogleUser) {
            showGoogleCompleteSignup();
          } else {
            // Email/password user whose doc is still being created (race condition)
            // Wait briefly and retry before giving up
            await new Promise(resolve => setTimeout(resolve, 1500));
            const retryDoc = await db.collection('users').doc(user.uid).get();
            if (retryDoc.exists) {
              currentUserProfile = retryDoc.data();
              updateNav();
              window.dispatchEvent(new CustomEvent('authStateReady', { detail: { user, profile: currentUserProfile } }));
              return;
            }
          }
        }
      }
    } catch (e) {
      console.error('Profile loading error:', e);
    }
  } else {
    currentUserProfile = null;
  }
  // Update nav
  updateNav();
  // Fire custom event for page-specific logic
  window.dispatchEvent(new CustomEvent('authStateReady', { detail: { user, profile: currentUserProfile } }));
});

function updateNav() {
  const loggedOutEl = document.getElementById('nav-auth-logged-out');
  const loggedInEl = document.getElementById('nav-auth-logged-in');
  if (!loggedOutEl || !loggedInEl) return;

  if (currentUser) {
    loggedOutEl.style.display = 'none';
    loggedInEl.style.display = 'flex';

    const avatarText = document.getElementById('avatar-text');
    const avatarImg = document.getElementById('avatar-img');

    if (currentUserProfile && currentUserProfile.photoURL) {
      if (avatarImg) { avatarImg.src = currentUserProfile.photoURL; avatarImg.style.display = 'block'; }
      if (avatarText) avatarText.style.display = 'none';
    } else {
      const initials = (currentUserProfile?.displayName || currentUser.email || 'U')[0].toUpperCase();
      if (avatarText) { avatarText.textContent = initials; avatarText.style.display = 'flex'; }
      if (avatarImg) avatarImg.style.display = 'none';
    }

    // Show admin link if superadmin
    const adminLink = document.getElementById('nav-admin-link');
    if (adminLink) {
      adminLink.style.display = (currentUserProfile?.role === 'superadmin') ? 'block' : 'none';
    }
  } else {
    loggedOutEl.style.display = 'flex';
    loggedInEl.style.display = 'none';
    closeDropdown();
  }
}

function openAuthModal(mode) {
  _modalTrigger = document.activeElement;
  switchAuthMode(mode || 'login');
  const modal = document.getElementById('auth-modal');
  modal.classList.add('open');
  clearAuthError();
  setTimeout(() => trapFocusInModal(modal.querySelector('[role="dialog"]') || modal), 50);
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  releaseFocusTrap(modal.querySelector('[role="dialog"]') || modal);
  modal.classList.remove('open');
  clearAuthError();
  // Reset invite verification state
  _verifiedInviteCode = null;
  _verifiedInviteData = null;
  // Reset invite step UI
  const verifyBtn = document.getElementById('invite-verify-btn');
  if (verifyBtn) { verifyBtn.disabled = false; verifyBtn.textContent = 'Verify & Continue'; }
  const inviteStatus = document.getElementById('invite-verify-status');
  if (inviteStatus) { inviteStatus.innerHTML = ''; inviteStatus.className = ''; }
  const inviteInput = document.getElementById('auth-invite-code');
  if (inviteInput) { inviteInput.value = ''; }
  // Reset Google invite field
  const googleInviteInput = document.getElementById('google-invite-code');
  if (googleInviteInput) { googleInviteInput.readOnly = false; googleInviteInput.style.opacity = ''; googleInviteInput.style.cursor = ''; googleInviteInput.value = ''; }
  const googleInviteGroup = document.getElementById('google-invite-group');
  if (googleInviteGroup) googleInviteGroup.style.display = '';
  // If Google user has no profile, sign them out on modal close
  if (currentUser && !currentUserProfile?.username) {
    const isGoogleUser = currentUser.providerData?.some(p => p.providerId === 'google.com');
    if (isGoogleUser) {
      auth.signOut().catch(e => console.error('Signout error:', e));
    }
  }
}

// Invite verification state
let _verifiedInviteCode = null;
let _verifiedInviteData = null;

function switchAuthMode(mode) {
  const isSignup = mode === 'signup';
  document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.auth-tab')[isSignup ? 1 : 0].classList.add('active');

  // Hide forgot password form if visible
  const forgotForm = document.getElementById('forgot-password-form');
  if (forgotForm) forgotForm.style.display = 'none';
  const authForm = document.getElementById('auth-form');
  if (authForm) authForm.style.display = 'block';
  const authTabs = document.querySelector('.auth-tabs');
  if (authTabs) authTabs.style.display = '';
  // Hide Google complete section
  const googleSection = document.getElementById('google-complete-section');
  if (googleSection) googleSection.style.display = 'none';

  // Get the three sections
  const loginFields = document.getElementById('login-fields');
  const inviteStep = document.getElementById('signup-invite-step');
  const signupFields = document.getElementById('signup-fields-step');

  // Hide all sections first
  if (loginFields) loginFields.style.display = 'none';
  if (inviteStep) inviteStep.style.display = 'none';
  if (signupFields) signupFields.style.display = 'none';

  if (isSignup) {
    // Check if arriving from invite link (auto-verify)
    if (window._inviteLinkCode && !_verifiedInviteCode) {
      const inviteInput = document.getElementById('auth-invite-code');
      if (inviteInput) inviteInput.value = window._inviteLinkCode;
      if (inviteStep) inviteStep.style.display = 'block';
      // Auto-verify the invite code
      verifyInviteCode();
    } else if (_verifiedInviteCode) {
      // Already verified — show signup fields directly
      if (signupFields) signupFields.style.display = 'block';
    } else {
      // Show invite step
      if (inviteStep) inviteStep.style.display = 'block';
    }
  } else {
    // Login mode
    if (loginFields) loginFields.style.display = 'block';
  }

  const switchText = document.getElementById('auth-switch-text');
  if (switchText) {
    switchText.innerHTML = isSignup
      ? 'Already have an account? <a onclick="switchAuthMode(\'login\')">Log In</a>'
      : 'Don\'t have an account? <a onclick="switchAuthMode(\'signup\')">Sign Up</a>';
  }

  clearAuthError();
}

// Extract invite code from raw code or full URL
function extractInviteCode(input) {
  const trimmed = input.trim();

  // Direct code: VIBE-XXXX or VIBE-XXXXXXXX (4-8 chars, case insensitive)
  if (/^VIBE-[A-Za-z0-9]{4,8}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // URL: https://vibelab.in/invite/VIBE-XXXX or vibelab.in/invite/VIBE-XXXX
  const urlMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?vibelab\.in\/invite\/([A-Za-z0-9-]+)/i);
  if (urlMatch) {
    return urlMatch[1].toUpperCase();
  }

  // Try as-is if it looks like a code (uppercase it)
  const upper = trimmed.toUpperCase();
  if (/^[A-Z0-9]+-[A-Z0-9]+$/.test(upper)) {
    return upper;
  }

  return null;
}

// Verify the invite code and transition to signup fields
async function verifyInviteCode() {
  const input = document.getElementById('auth-invite-code');
  const rawValue = (input?.value || '').trim();
  const statusEl = document.getElementById('invite-verify-status');
  const verifyBtn = document.getElementById('invite-verify-btn');

  if (!rawValue) {
    if (statusEl) { statusEl.textContent = 'Please enter an invite code or link'; statusEl.className = 'invite-verify-error'; }
    return;
  }

  const code = extractInviteCode(rawValue);
  if (!code) {
    if (statusEl) { statusEl.textContent = 'Invalid invite code format'; statusEl.className = 'invite-verify-error'; }
    return;
  }

  // Show loading
  if (verifyBtn) { verifyBtn.disabled = true; verifyBtn.textContent = 'Verifying...'; }
  if (statusEl) { statusEl.innerHTML = ''; statusEl.className = ''; }

  try {
    // Check bootstrap mode (no superadmin = skip validation)
    const adminExists = await checkSuperAdminExists();
    if (!adminExists) {
      _verifiedInviteCode = code;
      _verifiedInviteData = null;
      showSignupFields(null);
      return;
    }

    const result = await validateInviteCode(code);
    if (!result.valid) {
      if (statusEl) { statusEl.textContent = result.error; statusEl.className = 'invite-verify-error'; }
      if (verifyBtn) { verifyBtn.disabled = false; verifyBtn.textContent = 'Verify & Continue'; }
      return;
    }

    // Success — store validated data
    _verifiedInviteCode = code;
    _verifiedInviteData = result.codeData;

    // Fetch inviter display name
    let inviterName = null;
    if (result.codeData?.createdBy) {
      try {
        const inviterDoc = await db.collection('users').doc(result.codeData.createdBy).get();
        if (inviterDoc.exists) {
          inviterName = inviterDoc.data().displayName;
        }
      } catch (e) { /* silent */ }
    }

    showSignupFields(inviterName);
  } catch (e) {
    if (statusEl) { statusEl.textContent = 'Error verifying invite. Please try again.'; statusEl.className = 'invite-verify-error'; }
    if (verifyBtn) { verifyBtn.disabled = false; verifyBtn.textContent = 'Verify & Continue'; }
  }
}

// Transition from invite step to registration fields
function showSignupFields(inviterName) {
  const inviteStep = document.getElementById('signup-invite-step');
  if (inviteStep) inviteStep.style.display = 'none';

  const banner = document.getElementById('invite-verified-banner');
  if (banner) {
    const nameText = inviterName ? 'Invited by ' + escapeHtml(inviterName) : 'Invite verified';
    banner.innerHTML = '<span class="invite-verified-check">&#10003;</span> ' + nameText;
    banner.style.display = 'flex';
  }

  const signupFields = document.getElementById('signup-fields-step');
  if (signupFields) signupFields.style.display = 'block';
}

function clearAuthError() {
  const el = document.getElementById('auth-error');
  if (el) { el.classList.remove('show'); el.textContent = ''; }
}

function showAuthError(message) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = cleanErrorMessage(message);
  el.classList.add('show');
}

async function signUpWithEmail() {
  const email = document.getElementById('signup-email')?.value.trim() || '';
  const password = document.getElementById('signup-password')?.value || '';
  const displayName = document.getElementById('auth-display-name')?.value.trim() || '';
  const usernameRaw = document.getElementById('auth-username')?.value.trim() || '';
  const username = usernameRaw.toLowerCase();

  if (!email || !password || !displayName || !username) { showAuthError('Please fill in all fields'); return; }
  if (password.length < 6) { showAuthError('Password must be at least 6 characters'); return; }

  // Validate username format
  const validation = validateUsername(username);
  if (!validation.valid) { showAuthError(validation.error); return; }

  // Check username availability
  try {
    const available = await checkUsernameAvailable(username);
    if (!available) { showAuthError('Username is already taken'); return; }
  } catch (e) {
    showAuthError('Error checking username. Please try again.'); return;
  }

  // Use pre-verified invite code (already validated at invite step)
  const inviteCode = _verifiedInviteCode;
  const inviteCreator = _verifiedInviteData?.createdBy || null;

  const btn = document.querySelector('#signup-fields-step .submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Signing up...'; }

  try {
    // Set pending flags BEFORE creating auth user so onAuthStateChanged
    // has them immediately when it fires (prevents race condition)
    window._pendingUsername = username;
    if (inviteCode) {
      window._pendingInviteCode = inviteCode;
      window._pendingInviteCreator = inviteCreator;
    }

    const result = await auth.createUserWithEmailAndPassword(email, password);
    await result.user.updateProfile({ displayName });

    // Claim the username in the usernames collection
    await db.collection('usernames').doc(username).set({
      uid: result.user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Redeem invite code if one was used
    if (inviteCode) {
      await redeemInviteCode(inviteCode, result.user.uid, displayName, email);
    }

    // Reset verified state
    _verifiedInviteCode = null;
    _verifiedInviteData = null;

    closeAuthModal();
    // Clear form fields
    const signupEmail = document.getElementById('signup-email');
    const signupPassword = document.getElementById('signup-password');
    const authDisplayName = document.getElementById('auth-display-name');
    const authUsername = document.getElementById('auth-username');
    if (signupEmail) signupEmail.value = '';
    if (signupPassword) signupPassword.value = '';
    if (authDisplayName) authDisplayName.value = '';
    if (authUsername) authUsername.value = '';
  } catch (error) {
    // Clear pending flags on error so onAuthStateChanged doesn't misuse them
    window._pendingUsername = null;
    window._pendingInviteCode = null;
    window._pendingInviteCreator = null;
    showAuthError(error.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
  }
}

async function logInWithEmail() {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  if (!email || !password) { showAuthError('Please fill in all fields'); return; }
  const btn = document.getElementById('auth-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Logging in...'; }
  try {
    await auth.signInWithEmailAndPassword(email, password);
    closeAuthModal();
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-password').value = '';
  } catch (error) {
    showAuthError(error.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Log In'; }
  }
}

async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const btns = document.querySelectorAll('.google-btn');
  btns.forEach(b => { b.disabled = true; b.textContent = 'Signing in...'; });
  try {
    const result = await auth.signInWithPopup(provider);
    const userDoc = await db.collection('users').doc(result.user.uid).get();

    if (userDoc.exists && userDoc.data().username) {
      // Existing user with complete profile — normal login
      closeAuthModal();
    } else {
      // New Google user or incomplete profile — show complete signup form
      showGoogleCompleteSignup();
    }
  } catch (error) {
    showAuthError(error.message);
  } finally {
    btns.forEach(b => { b.disabled = false; b.textContent = 'Continue with Google'; });
  }
}

// Show the "Complete Signup" section for Google OAuth users who need username + invite code
function showGoogleCompleteSignup() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('open');

  const authForm = document.getElementById('auth-form');
  if (authForm) authForm.style.display = 'none';

  const tabsEl = document.querySelector('.auth-tabs');
  if (tabsEl) tabsEl.style.display = 'none';

  const switchEl = document.querySelector('.auth-switch');
  if (switchEl) switchEl.style.display = 'none';

  const googleSection = document.getElementById('google-complete-section');
  if (googleSection) googleSection.style.display = 'block';

  // If invite is already verified (user clicked Google from signup-fields-step), hide invite field
  if (_verifiedInviteCode) {
    const googleInviteGroup = document.getElementById('google-invite-group');
    if (googleInviteGroup) googleInviteGroup.style.display = 'none';
    const googleInviteInput = document.getElementById('google-invite-code');
    if (googleInviteInput) googleInviteInput.value = _verifiedInviteCode;
  } else if (window._inviteLinkCode) {
    // Pre-fill from invite link
    const googleInviteInput = document.getElementById('google-invite-code');
    if (googleInviteInput) {
      googleInviteInput.value = window._inviteLinkCode;
      googleInviteInput.readOnly = true;
      googleInviteInput.style.opacity = '0.7';
      googleInviteInput.style.cursor = 'not-allowed';
    }
  }

  clearAuthError();
}

// Complete Google OAuth signup with username + invite code
async function completeGoogleSignup() {
  if (!currentUser) { showAuthError('Not signed in'); return; }

  const usernameRaw = document.getElementById('google-username')?.value.trim() || '';
  const username = usernameRaw.toLowerCase();

  if (!username) { showAuthError('Username is required'); return; }

  // Validate username
  const validation = validateUsername(username);
  if (!validation.valid) { showAuthError(validation.error); return; }

  try {
    const available = await checkUsernameAvailable(username);
    if (!available) { showAuthError('Username is already taken'); return; }
  } catch (e) {
    showAuthError('Error checking username. Please try again.'); return;
  }

  // Use pre-verified invite code if available, otherwise read from Google invite field
  let inviteCode = _verifiedInviteCode;
  let inviteCreator = _verifiedInviteData?.createdBy || null;
  let inviteResult = _verifiedInviteData ? { valid: true, codeData: _verifiedInviteData } : null;

  if (!inviteCode) {
    // Fallback: read from Google invite field (for direct Google OAuth without prior invite verification)
    const inviteCodeInput = document.getElementById('google-invite-code')?.value.trim().toUpperCase() || '';
    try {
      const adminExists = await checkSuperAdminExists();
      if (adminExists) {
        if (!inviteCodeInput) { showAuthError('Invite code is required'); return; }
        inviteResult = await validateInviteCode(inviteCodeInput);
        if (!inviteResult.valid) { showAuthError(inviteResult.error); return; }
        inviteCode = inviteCodeInput;
        inviteCreator = inviteResult.codeData?.createdBy || null;
      }
    } catch (e) {
      showAuthError('Error validating invite code. Please try again.'); return;
    }
  }

  try {
    // Claim username
    await db.collection('usernames').doc(username).set({
      uid: currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Redeem invite code
    if (inviteCode && inviteResult?.valid) {
      await redeemInviteCode(inviteCode, currentUser.uid, currentUser.displayName || '', currentUser.email || '');
    }

    // Create user profile
    currentUserProfile = {
      displayName: currentUser.displayName || '',
      email: currentUser.email,
      username: username,
      bio: '',
      company: '',
      skills: [],
      photoURL: currentUser.photoURL || '',
      socials: { twitter: '', github: '', website: '' },
      invitesRemaining: 3,
      invitedBy: inviteCreator,
      inviteCode: inviteCode || '',
      status: 'active',
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('users').doc(currentUser.uid).set(currentUserProfile);

    // Reset verified state
    _verifiedInviteCode = null;
    _verifiedInviteData = null;

    // Restore modal UI
    const tabsEl = document.querySelector('.auth-tabs');
    if (tabsEl) tabsEl.style.display = '';
    const switchEl = document.querySelector('.auth-switch');
    if (switchEl) switchEl.style.display = '';

    updateNav();
    closeAuthModal();
    showToast('Welcome to VibeLab! 🎉');

    // Re-fire auth event so page-specific logic runs
    window.dispatchEvent(new CustomEvent('authStateReady', { detail: { user: currentUser, profile: currentUserProfile } }));
  } catch (error) {
    showAuthError(error.message);
  }
}

function logOut() {
  auth.signOut().catch(error => console.error('Logout error:', error));
  closeDropdown();
}

function toggleDropdown() {
  const dd = document.getElementById('nav-dropdown');
  dd.classList.toggle('open');
  const avatar = document.getElementById('nav-avatar');
  if (avatar) avatar.setAttribute('aria-expanded', dd.classList.contains('open') ? 'true' : 'false');
}

function closeDropdown() {
  const dd = document.getElementById('nav-dropdown');
  if (dd) dd.classList.remove('open');
  const avatar = document.getElementById('nav-avatar');
  if (avatar) avatar.setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('nav-dropdown');
  const avatar = document.getElementById('nav-avatar');
  if (dropdown && avatar && !dropdown.contains(e.target) && !avatar.contains(e.target)) {
    closeDropdown();
  }
});

// Profile modal functions
function openProfileModal() {
  _modalTrigger = document.activeElement;
  if (currentUserProfile) {
    const fields = ['profile-display-name', 'profile-bio', 'profile-company', 'profile-skills'];
    const vals = [currentUserProfile.displayName || '', currentUserProfile.bio || '', currentUserProfile.company || '', (currentUserProfile.skills || []).join(', ')];
    fields.forEach((id, i) => { const el = document.getElementById(id); if (el) el.value = vals[i]; });

    // Populate username
    const usernameEl = document.getElementById('profile-username');
    if (usernameEl) usernameEl.value = currentUserProfile.username || '';
    const usernameStatus = document.getElementById('profile-username-status');
    if (usernameStatus) { usernameStatus.textContent = ''; usernameStatus.className = 'username-status'; }

    ['twitter', 'github', 'website'].forEach(s => {
      const el = document.getElementById('profile-' + s);
      if (el) el.value = currentUserProfile.socials?.[s] || '';
    });

    if (currentUserProfile.photoURL) {
      const preview = document.getElementById('profile-photo-preview');
      const icon = document.getElementById('profile-upload-icon');
      if (preview) { preview.src = currentUserProfile.photoURL; preview.style.display = 'block'; }
      if (icon) icon.style.display = 'none';
    }
  }
  const modal = document.getElementById('profile-modal');
  modal.classList.add('open');
  setTimeout(() => trapFocusInModal(modal.querySelector('[role="dialog"]') || modal), 50);
}

function closeProfileModal() {
  const modal = document.getElementById('profile-modal');
  releaseFocusTrap(modal.querySelector('[role="dialog"]') || modal);
  modal.classList.remove('open');
}

function handleProfilePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file || !currentUser) return;

  // Validate image type and size
  const check = validateImage(file, { maxSizeMB: IMAGE_RULES.avatar.maxSizeMB });
  if (!check.valid) { showToast(check.error); e.target.value = ''; return; }

  const reader = new FileReader();
  reader.onload = function(event) {
    const preview = document.getElementById('profile-photo-preview');
    if (preview) { preview.src = event.target.result; preview.style.display = 'block'; }
    const icon = document.getElementById('profile-upload-icon');
    if (icon) icon.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

async function saveProfile() {
  if (!currentUser) return;
  const file = document.getElementById('profile-photo-input')?.files[0];
  let photoURL = currentUserProfile?.photoURL || '';
  const btn = document.querySelector('#profile-modal .submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
  try {
    // Handle username change
    const newUsername = (document.getElementById('profile-username')?.value || '').trim().toLowerCase();
    const oldUsername = currentUserProfile?.username || '';

    if (newUsername && newUsername !== oldUsername) {
      const validation = validateUsername(newUsername);
      if (!validation.valid) { showToast(validation.error); return; }
      const available = await checkUsernameAvailable(newUsername);
      if (!available) { showToast('Username is already taken'); return; }
      // Delete old username claim
      if (oldUsername) await db.collection('usernames').doc(oldUsername).delete();
      // Claim new username
      await db.collection('usernames').doc(newUsername).set({
        uid: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    if (file) {
      const resized = await resizeAvatar(file, { size: IMAGE_RULES.avatar.maxDim, quality: IMAGE_RULES.avatar.quality });
      const storageRef = storage.ref(`profile-photos/${currentUser.uid}`);
      await storageRef.put(resized);
      photoURL = await storageRef.getDownloadURL();
    }
    const skillsInput = document.getElementById('profile-skills')?.value.trim() || '';
    const skills = skillsInput ? skillsInput.split(',').map(s => s.trim()).filter(Boolean) : [];
    const updatedProfile = {
      displayName: document.getElementById('profile-display-name').value,
      username: newUsername || oldUsername,
      bio: document.getElementById('profile-bio').value,
      company: document.getElementById('profile-company').value,
      skills: skills,
      photoURL: photoURL,
      socials: {
        twitter: document.getElementById('profile-twitter').value,
        github: document.getElementById('profile-github').value,
        website: document.getElementById('profile-website').value
      }
    };
    await db.collection('users').doc(currentUser.uid).update(updatedProfile);
    currentUserProfile = { ...currentUserProfile, ...updatedProfile };
    updateNav();
    closeProfileModal();
    showToast('Profile updated successfully!');
  } catch (error) {
    console.error('Profile save error:', error);
    showToast('Error saving profile: ' + cleanErrorMessage(error.message));
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save Profile'; }
  }
}

// Real-time username availability check (debounced)
let _usernameCheckTimer = null;
function _attachUsernameChecker(inputId, statusId, currentUsername) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('input', function() {
    clearTimeout(_usernameCheckTimer);
    const status = document.getElementById(statusId);
    const raw = this.value.trim().toLowerCase();

    if (!raw) { if (status) { status.textContent = ''; status.className = 'username-status'; } return; }

    // If same as current username, no check needed
    if (currentUsername && raw === currentUsername) {
      if (status) { status.textContent = ''; status.className = 'username-status'; }
      return;
    }

    const validation = validateUsername(raw);
    if (!validation.valid) {
      if (status) { status.textContent = validation.error; status.className = 'username-status error'; }
      return;
    }

    if (status) { status.textContent = 'Checking...'; status.className = 'username-status checking'; }

    _usernameCheckTimer = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailable(raw);
        if (status) {
          if (available) {
            status.textContent = '\u2713 Available';
            status.className = 'username-status available';
          } else {
            status.textContent = '\u2717 Already taken';
            status.className = 'username-status taken';
          }
        }
      } catch (e) {
        if (status) { status.textContent = 'Error checking availability'; status.className = 'username-status error'; }
      }
    }, 400);
  });
}

function initUsernameCheck() {
  // Signup form
  _attachUsernameChecker('auth-username', 'username-status', '');
  // Profile edit modal
  _attachUsernameChecker('profile-username', 'profile-username-status', currentUserProfile?.username || '');
  // Google complete signup
  _attachUsernameChecker('google-username', 'google-username-status', '');
  // Enter key on invite code input triggers verify
  const inviteInput = document.getElementById('auth-invite-code');
  if (inviteInput) {
    inviteInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); verifyInviteCode(); }
    });
  }
}

// Initialize profile photo input listener (retry until element exists after initPage injects modals)
let _profilePhotoRetries = 0;
function initProfilePhotoListener() {
  const photoInput = document.getElementById('profile-photo-input');
  if (photoInput) {
    photoInput.addEventListener('change', handleProfilePhotoUpload);
  } else if (_profilePhotoRetries < 50) {
    _profilePhotoRetries++;
    setTimeout(initProfilePhotoListener, 100);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  initProfilePhotoListener();
  initUsernameCheck();
});

// Toast notification system
function showToast(message, actionText, actionCallback) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');

  const msgSpan = document.createElement('span');
  msgSpan.textContent = message;
  toast.appendChild(msgSpan);

  if (actionText) {
    const actionLink = document.createElement('a');
    actionLink.className = 'toast-action';
    actionLink.href = '#';
    actionLink.textContent = actionText;
    if (actionCallback) {
      actionLink.addEventListener('click', (e) => {
        e.preventDefault();
        actionCallback();
      });
    }
    toast.appendChild(actionLink);
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Guest gate: show login modal if user tries restricted action
function requireAuth(actionName) {
  if (!currentUser) {
    openAuthModal('login');
    return false;
  }
  return true;
}
