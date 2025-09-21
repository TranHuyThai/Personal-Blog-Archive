// display.js - List display functionality

import { getFilteredData } from './main.js';
import { cleanupCarousel } from './glide-carousel.js';

export function displayList() {
    const blogList = document.getElementById('blogList');
    const stats = document.getElementById('stats');
    const filteredData = getFilteredData();
    
    stats.innerHTML = `<p>Total: ${filteredData.length} posts</p>`;
    
    if (filteredData.length === 0) {
        blogList.innerHTML = '<li>No blog posts found.</li>';
        return;
    }

    blogList.innerHTML = filteredData.map((blog) => `
        <li class="blog-item" onclick="showContent('${blog.path}')">
            <div class="blog-title">${blog.title}</div>
            <div class="blog-meta">
                ${new Date(blog.date).toLocaleDateString()} 
                ${blog.tags.length > 0 ? `• Tags: ${blog.tags.join(', ')}` : ''}
            </div>
        </li>
    `).join('');
}

// UPDATED: showList function with Glide cleanup
export function showList(addToHistory=true) {

    if (addToHistory){
        history.pushState({view: 'list'}, '', '#list');
    }

    document.getElementById('content-wrapper').classList.remove('hidden');
    document.getElementById('listView').classList.remove('hidden');
    document.getElementById('filterControls').classList.remove('hidden');
    document.getElementById('contentView').classList.add('hidden');
    document.getElementById('aboutView').classList.add('hidden');
    
    // Hide carousel when going back to list
    document.getElementById('imageCarousel').classList.add('hidden');
    
    // Clean up Glide instance to prevent memory leaks
    cleanupCarousel();
}

export function showAbout(addToHistory=true){

    if (addToHistory){
        history.pushState({view: 'about'}, '', '#about');
    }
    document.getElementById('content-wrapper').classList.add('hidden');
    document.getElementById('listView').classList.add('hidden');
    document.getElementById('filterControls').classList.add('hidden');
    document.getElementById('contentView').classList.add('hidden');
    document.getElementById('aboutView').classList.remove('hidden');

}
