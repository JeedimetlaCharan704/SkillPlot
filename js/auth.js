/**
 * Authentication and Route Guarding Logic
 * Simulates a frontend-only authentication system using localStorage.
 */

const AUTH_KEY = 'currentUserRole';

// Simple Auth Guard - Runs immediately on page load
function authGuard() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const currentUserRole = localStorage.getItem(AUTH_KEY);

    // If on login page, redirect if already logged in
    if (currentPath === 'login.html') {
        if (currentUserRole === 'student') {
            window.location.href = 'index.html';
        } else if (currentUserRole === 'admin') {
            window.location.href = 'admin.html';
        }
        return; // Stop further checks on login page
    }

    // If not logged in and trying to access a protected page
    if (!currentUserRole) {
        window.location.href = 'login.html';
        return;
    }

    // Role-based route guarding
    const isAdminPage = currentPath.startsWith('admin');
    
    if (isAdminPage && currentUserRole !== 'admin') {
        alert('Access Denied: You need Administrator privileges to view this page.');
        window.location.href = 'index.html';
    } else if (!isAdminPage && currentUserRole === 'admin') {
        // Optional: prevent admin from viewing student pages directly, or just warn
        // We'll allow it but you could force redirect back to admin.html
    }
}

// Run the auth guard immediately
authGuard();

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtns = document.querySelectorAll('.logout-btn, #logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem(AUTH_KEY);
            window.location.href = 'login.html';
        });
    });
});
