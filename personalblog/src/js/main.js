// main.js - Entry point and coordination
import { loadBlogsFromFolder } from './blog-loader.js';
import { applyFilters } from './filters.js';
import { showContent } from './content-viewer.js';
import { showList, showAbout } from './display.js';


// Global state
export let blogData = [];
export let filteredData = [];
export let currentGlide = null;

// State management functions
export function setBlogData(data) {
    blogData = data;
}

export function setFilteredData(data) {
    filteredData = data;
}

export function setCurrentGlide(glide) {
    currentGlide = glide;
}

export function getBlogData() {
    return blogData;
}

export function getFilteredData() {
    return filteredData;
}

export function getCurrentGlide() {
    return currentGlide;
}

// Make functions globally available for HTML onclick handlers
window.showContent = showContent;
window.showList = showList;

// Set up event listeners
function initEventListeners() {
    // Back/Forward button handling
    window.addEventListener('popstate', (event) => {
        const state = event.state;
        console.log(event.state)
        if (!state || state.view === 'list') {
            showList(false); // false = don't push a new state
        } else if (state.view === 'about') {
            showAbout(false);
        } else if (state.view === 'blog') {
            showContent(state.path, false);
        }
    });

    // Filters & search
    document.getElementById('tagFilter').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', applyFilters);

    // Nav buttons
    document.getElementById("btnAbout").addEventListener("click", () => {
        showAbout(); // automatically pushes state
    });
    document.getElementById("btnBlogs").addEventListener("click", () => {
        showList();
    });
}

// Initialize the application
async function init() {
    try {
        // Load blog posts
        await loadBlogsFromFolder();
        
        console.log(`Loaded ${blogData.length} blog posts`);
    } catch (error) {
        console.error('Error initializing blog system:', error);
    }
}

// Auto-load blogs on page load
document.addEventListener('DOMContentLoaded', function() {
    initEventListeners();

    (async () => {
        await init(); // wait until blogData is loaded
        handleRouting();
    })();
});


function handleRouting() {
    let hash = location.hash.replace('#', '').trim();

    if (hash === '' || hash === '#' || hash.toLowerCase() === 'about') {
        showAbout(false);
        history.replaceState({ view: 'about' }, '', '#about');
    } else if (hash.toLowerCase() === 'list') {
        showList(false);
        history.replaceState({ view: 'list' }, '', '#list');
    } else {
        const blogData = getBlogData();
        const blog = blogData.find(b => b.path === hash || b.path === `blogs/${hash}`);

        if (blog) {
            showContent(blog.path, false);
            history.replaceState({ view: 'blog', path: blog.path }, '', `#${blog.path}`);
        } else {
            // Fallback to About
            showAbout(false);
            history.replaceState({ view: 'about' }, '', '#about');
        }
    }
}



