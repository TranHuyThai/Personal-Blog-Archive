const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');

hamburger.addEventListener('click', function() {
    navbar.classList.toggle('expanded');
    hamburger.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    if (!navbar.contains(event.target)) {
        navbar.classList.remove('expanded');
        hamburger.classList.remove('active');
    }
});

window.addEventListener('message', (event) => {
    if (event.data.type === 'iframe-click') {
        navbar.classList.remove('expanded');
        hamburger.classList.remove('active');
    }
});

// Close menu when clicking on nav links
document.querySelectorAll('.nav-links button').forEach(link => {
    link.addEventListener('click', function() {
        navbar.classList.remove('expanded');
        hamburger.classList.remove('active');
    });
});