// content-viewer.js - Content display and navigation functionality

import { getBlogData } from './main.js';
import { parseFrontmatter, extractContentAfterMetadata } from './blog-loader.js';
import { initializeImageCarousel, cleanupCarousel } from './glide-carousel.js';

export function showContent(path, addToHistory=true) {
    const blogData = getBlogData();
    const blog = blogData.find(b => b.path === path);

    if (addToHistory){
        // Push a new state so the browser back button can be intercepted
        history.pushState({ view: 'blog', path: path }, '', `#${path}`);
    }
    
    if (blog && blog.content) {
        // Parse frontmatter from the content to get metadata
        const frontmatter = parseFrontmatter(blog.content);
        
        // Use frontmatter data if available, otherwise fall back to blog object properties
        const title = frontmatter.title || blog.title || 'Untitled';
        const date = frontmatter.date || blog.date;
        const tags = frontmatter.tags || blog.tags || [];
        
        // FIXED: Check for 'img' (singular) as well as 'imgs' and 'images'
        const images = frontmatter.img || frontmatter.imgs || frontmatter.images || [];
        
        // Handle image carousel with Glide.js
        const carouselContainer = document.getElementById('imageCarousel');
        if (Array.isArray(images) && images.length > 0) {
            // Show carousel and initialize it with Glide.js
            carouselContainer.classList.remove('hidden');
            initializeImageCarousel(images, path);
        } else {
            // Hide carousel if no images
            carouselContainer.classList.add('hidden');
        }
        
        // Extract content after frontmatter/metadata
        let actualContent = extractContentAfterMetadata(blog.content);
        
        let renderedMarkdown;
        if (typeof marked !== 'undefined') {
            try {
                renderedMarkdown = typeof marked.parse === 'function' 
                    ? marked.parse(actualContent) 
                    : marked(actualContent);
            } catch (error) {
                console.error('Markdown parsing error:', error);
                renderedMarkdown = `<pre>${actualContent}</pre>`;
            }
        } else {
            console.warn('Marked library not loaded, showing raw content');
            renderedMarkdown = `<pre>${actualContent}</pre>`;
        }
        
        document.getElementById('blog-title').innerHTML = `
            <h1>${title}</h1>
            <p><strong>Date:</strong> ${date ? new Date(date).toLocaleDateString() : 'No date'}</p>
            ${Array.isArray(tags) && tags.length > 0 ? `<p><strong>Tags:</strong> ${tags.join(', ')}</p>` : ''}
            <hr>
        `;

        document.getElementById('markdownContent').innerHTML = `
            ${renderedMarkdown}
        `;
        
        document.getElementById('content-wrapper').classList.remove('hidden');
        document.getElementById('listView').classList.add('hidden');
        document.getElementById('filterControls').classList.add('hidden');
        document.getElementById('contentView').classList.remove('hidden');
        document.getElementById('aboutView').classList.add('hidden');

    }
}
