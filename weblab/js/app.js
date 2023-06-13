// Get the logout link element
const logoutLink = document.querySelector('.logout-link');

// Add a click event listener to the logout link
logoutLink.addEventListener('click', function(event) {
  event.preventDefault(); // Prevent the default behavior of the link

  // Show a confirmation message
  const confirmLogout = confirm('Are you sure you want to logout?');

  // If the user confirms, redirect to the login page
  if (confirmLogout) {
    window.location.href = 'ui.html';
  }
});

