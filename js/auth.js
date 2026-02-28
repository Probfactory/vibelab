// Auth state observer (only if Firebase loaded)
if (typeof auth !== 'undefined' && auth) auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  if (user) {
    try {
      const doc = await db.collection('users').doc(user.uid).get();
      if (doc.exists) {
        currentUserProfile = doc.data();

        // Grandfather existing users: backfill new invite fields if missing
        if (!currentUserProfile.hasOwnProperty('invitesRemaining')) {
          try {
            await db.collection('users').doc(user.uid).update({
              invitesRemaining: 3,
              status: 'active',
              lastActive: firebase.firestore.FieldValue.serverTimestamp()
            });
            currentUserProfile.invitesRemaining = 3;
            currentUserProfile.status = 'active';
          } catch (backfillErr) {
            console.warn('Could not backfill invite fields:', backfillErr);
          }
        } else {
          // Update lastActive for existing users
          try {
            await db.collection('users').doc(user.uid).update({
              lastActive: firebase.firestore.FieldValue.serverTimestamp()
            });
          } catch (laErr) {
            console.warn('Could not update lastActive:', laErr);
          }
        }

        // Handle Google OAuth incomplete signup (user exists in Auth but needs username)
        if (user.providerData?.some(p => p.providerId === 'google.com') && !currentUserProfile.username) {
          showGoogleCompleteSignup();
        }
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
          // Google OAuth — no user doc yet, show complete signup modal
          showGoogleCompleteSignup();
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
  switchAuthMode(mode || 'login');
  document.getElementById('auth-modal').classList.add('open');
  clearAuthError();
  // Hide Google complete section
  const googleSection = document.getElementById('google-complete-section');
  if (googleSection) googleSection.style.display = 'none';
  const authForm = document.getElementById('auth-form');
  if (authForm) authForm.style.display = 'block';
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('open');
  clearAuthError();
  // If Google user has no profile, sign them out on modal close
  if (currentUser && !currentUserProfile?.username) {
    const isGoogleUser = currentUser.providerData?.some(p => p.providerId === 'google.com');
    if (isGoogleUser) {
      auth.signOut().catch(e => console.error('Signout error:', e));
    }
  }
}

function switchAuthMode(mode) {
  const isSignup = mode === 'signup';
  document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.auth-tab')[isSignup ? 1 : 0].classList.add('active');
  const nameGroup = document.getElementById('display-name-group');
  if (nameGroup) nameGroup.style.display = isSignup ? 'block' : 'none';
  const usernameGroup = document.getElementById('username-group');
  if (usernameGroup) usernameGroup.style.display = isSignup ? 'block' : 'none';
  const inviteGroup = document.getElementById('invite-code-group');
  if (inviteGroup) inviteGroup.style.display = isSignup ? 'block' : 'none';
  const submitBtn = document.getElementById('auth-submit-btn');
  if (submitBtn) {
    submitBtn.textContent = isSignup ? 'Sign Up' : 'Log In';
    submitBtn.onclick = isSignup ? signUpWithEmail : logInWithEmail;
  }
  const switchText = document.getElementById('auth-switch-text');
  if (switchText) {
    switchText.innerHTML = isSignup
      ? 'Already have an account? <a onclick="switchAuthMode(\'login\')">Log In</a>'
      : 'Don\'t have an account? <a onclick="switchAuthMode(\'signup\')">Sign Up</a>';
  }
}

function clearAuthError() {
  const el = document.getElementById('auth-error');
  if (el) { el.classList.remove('show'); el.textContent = ''; }
}

function showAuthError(message) {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = message; el.classList.add('show'); }
}

async function signUpWithEmail() {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const displayName = document.getElementById('auth-display-name').value.trim();
  const usernameRaw = document.getElementById('auth-username')?.value.trim() || '';
  const username = usernameRaw.toLowerCase();
  const inviteCodeInput = document.getElementById('auth-invite-code')?.value.trim().toUpperCase() || '';

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

  // Validate invite code (skip if no superadmin exists — bootstrap mode)
  let inviteResult = null;
  try {
    const adminExists = await checkSuperAdminExists();
    if (adminExists) {
      if (!inviteCodeInput) { showAuthError('Invite code is required'); return; }
      inviteResult = await validateInviteCode(inviteCodeInput);
      if (!inviteResult.valid) { showAuthError(inviteResult.error); return; }
    }
  } catch (e) {
    showAuthError('Error validating invite code. Please try again.'); return;
  }

  try {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    await result.user.updateProfile({ displayName });

    // Claim the username in the usernames collection
    await db.collection('usernames').doc(username).set({
      uid: result.user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Redeem invite code if one was used
    if (inviteResult && inviteResult.valid) {
      await redeemInviteCode(inviteCodeInput, result.user.uid, displayName);
      window._pendingInviteCode = inviteCodeInput;
      window._pendingInviteCreator = inviteResult.codeData?.createdBy || null;
    }

    // Store username as pending so onAuthStateChanged picks it up
    window._pendingUsername = username;

    closeAuthModal();
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-display-name').value = '';
    if (document.getElementById('auth-username')) document.getElementById('auth-username').value = '';
    if (document.getElementById('auth-invite-code')) document.getElementById('auth-invite-code').value = '';
  } catch (error) {
    showAuthError(error.message);
  }
}

function logInWithEmail() {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  if (!email || !password) { showAuthError('Please fill in all fields'); return; }
  auth.signInWithEmailAndPassword(email, password)
    .then(() => { closeAuthModal(); document.getElementById('auth-email').value = ''; document.getElementById('auth-password').value = ''; })
    .catch(error => showAuthError(error.message));
}

async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
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

  clearAuthError();
}

// Complete Google OAuth signup with username + invite code
async function completeGoogleSignup() {
  if (!currentUser) { showAuthError('Not signed in'); return; }

  const usernameRaw = document.getElementById('google-username')?.value.trim() || '';
  const username = usernameRaw.toLowerCase();
  const inviteCodeInput = document.getElementById('google-invite-code')?.value.trim().toUpperCase() || '';

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

  // Validate invite code (skip if no superadmin — bootstrap mode)
  let inviteResult = null;
  try {
    const adminExists = await checkSuperAdminExists();
    if (adminExists) {
      if (!inviteCodeInput) { showAuthError('Invite code is required'); return; }
      inviteResult = await validateInviteCode(inviteCodeInput);
      if (!inviteResult.valid) { showAuthError(inviteResult.error); return; }
    }
  } catch (e) {
    showAuthError('Error validating invite code. Please try again.'); return;
  }

  try {
    // Claim username
    await db.collection('usernames').doc(username).set({
      uid: currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Redeem invite code
    if (inviteResult && inviteResult.valid) {
      await redeemInviteCode(inviteCodeInput, currentUser.uid, currentUser.displayName || '');
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
      invitedBy: inviteResult?.codeData?.createdBy || null,
      inviteCode: inviteCodeInput || '',
      status: 'active',
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('users').doc(currentUser.uid).set(currentUserProfile);

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
  document.getElementById('nav-dropdown').classList.toggle('open');
}

function closeDropdown() {
  const dd = document.getElementById('nav-dropdown');
  if (dd) dd.classList.remove('open');
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
  document.getElementById('profile-modal').classList.add('open');
}

function closeProfileModal() {
  document.getElementById('profile-modal').classList.remove('open');
}

function handleProfilePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file || !currentUser) return;
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
      const storageRef = storage.ref(`profile-photos/${currentUser.uid}`);
      await storageRef.put(file);
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
    showToast('Error saving profile: ' + error.message);
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
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span>${message}</span>
    ${actionText ? `<a class="toast-action" href="#">${actionText}</a>` : ''}
  `;

  if (actionText && actionCallback) {
    toast.querySelector('.toast-action').addEventListener('click', (e) => {
      e.preventDefault();
      actionCallback();
    });
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
