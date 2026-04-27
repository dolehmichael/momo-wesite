/* ============================================================
   MoMo Vendor Management System - Authentication
   ============================================================ */

// Demo users - Agents from Processed By list
const USERS = {
  manager: { password: 'manager', role: 'manager', agentId: null },
  'Mbah Rufai': { password: 'agent', role: 'agent', agentId: 'AGT001', agentName: 'Mbah Rufai' },
  'Ruth Boateng': { password: 'agent', role: 'agent', agentId: 'AGT002', agentName: 'Ruth Boateng' },
  'Shafi Abdul': { password: 'agent', role: 'agent', agentId: 'AGT003', agentName: 'Shafi Abdul' }
};

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('momo_user') !== null;
}

// Get current user
function getCurrentUser() {
  const userData = localStorage.getItem('momo_user');
  return userData ? JSON.parse(userData) : null;
}

// Login function
function login(username, password) {
  if (USERS[username] && USERS[username].password === password) {
    const user = {
      username: username,
      role: USERS[username].role,
      agentId: USERS[username].agentId,
      agentName: USERS[username].agentName,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('momo_user', JSON.stringify(user));
    return true;
  }
  return false;
}

// Logout function
function logout() {
  localStorage.removeItem('momo_user');
  checkAuth();
}

// Check authentication on page load
function checkAuth() {
  const loginSection = document.getElementById('loginSection');
  const mainContent = document.getElementById('mainContent');
  const navUser = document.getElementById('navUser');
  const userInfo = document.getElementById('userInfo');

  if (isLoggedIn()) {
    if (loginSection) loginSection.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
    if (navUser) navUser.style.display = 'flex';
    const user = getCurrentUser();
    if (userInfo && user) {
      userInfo.textContent = `${user.username} (${user.role})`;
    }
  } else {
    // If on index.html, show login section
    if (loginSection) {
      if (loginSection) loginSection.style.display = 'flex';
      if (mainContent) mainContent.style.display = 'none';
      if (navUser) navUser.style.display = 'none';
    } else {
      // On other pages, redirect to index.html
      window.location.href = 'index.html';
    }
  }
}

// Check if current user is a manager
function isManager() {
  const user = getCurrentUser();
  return user && user.role === 'manager';
}

// Check manager authentication (for reports page)
function checkManagerAuth() {
  if (!isLoggedIn()) {
    // Not logged in, redirect to index.html
    window.location.href = 'index.html';
    return;
  }

  if (!isManager()) {
    // Logged in but not a manager, redirect to index.html with error
    alert('Access denied: Reports are only accessible to managers.');
    window.location.href = 'index.html';
    return;
  }

  // User is logged in as manager, show nav user info
  const navUser = document.getElementById('navUser');
  const userInfo = document.getElementById('userInfo');
  if (navUser) navUser.style.display = 'flex';
  const user = getCurrentUser();
  if (userInfo && user) {
    userInfo.textContent = `${user.username} (${user.role})`;
  }
}

// Initialize login form
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      if (login(username, password)) {
        checkAuth();
      } else {
        const errorMsg = document.getElementById('errorMessage');
        errorMsg.textContent = 'Invalid username or password';
        errorMsg.style.display = 'block';
      }
    });
  }

  // Check auth on other pages
  checkAuth();
});