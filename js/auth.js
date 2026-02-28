// Auth state observer (only if Firebase loaded)
if (typeof auth !== 'undefined' && auth) auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  if (user) {
    try {
      const doc = await db.collection('users').doc(user.uid).get();
      if (doc.exists) {
        currentUserProfile = doc.data();
      } else {
        currentUserProfile = {
          displayName: user.displayName || '',
          email: user.email,
          username: window._pendingUsername || '',
          bio: '',
          company: '',
          skills: [],
          photoURL: user.photoURL || '',
          socials: { twitter: '', github: '', website: '' },
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('users').doc(user.uid).set(currentUserProfile);
        window._pendingUsername = null;
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
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('open');
  clearAuthError();
}

function switchAuthMode(mode) {
  const isSignup = mode === 'signup';
  document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.auth-tab')[isSignup ? 1 : 0].classList.add('active');
  const nameGroup = document.getElementById('display-name-group');
  if (nameGroup) nameGroup.style.display = isSignup ? 'block' : 'none';
  const usernameGroup = document.getElementById('username-group');
  if (usernameGroup) usernameGroup.style.display = isSignup ? 'block' : 'none';
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

  if (!email || !password || !displayName || !username) { showAuthError('Please fill in all fields'); return; }
  if (password.length < 6) { showAuthError('Password must be at least 6 characters'); return; }

  // Validate username format
  const validation = validateUsername(username);
  if (!validation.valid) { showAuthError(validation.error); return; }

  // Check availability
  try {
    const available = await checkUsernameAvailable(username);
    if (!available) { showAuthError('Username is already taken'); return; }
  } catch (e) {
    showAuthError('Error checking username. Please try again.'); return;
  }

  try {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    await result.user.updateProfile({ displayName });

    // Claim the username in the usernames collection
    await db.collection('usernames').doc(username).set({
      uid: result.user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Store username as pending so onAuthStateChanged picks it up
    window._pendingUsername = username;

    closeAuthModal();
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-display-name').value = '';
    if (document.getElementById('auth-username')) document.getElementById('auth-username').value = '';
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

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then(() => closeAuthModal()).catch(error => showAuthError(error.message));
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
