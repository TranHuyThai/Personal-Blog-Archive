let blogData = [];
let filteredData = [];

// Auto-load blogs on page load
document.addEventListener('DOMContentLoaded', function() {
    loadBlogsFromFolder();
});

document.getElementById('tagFilter').addEventListener('change', applyFilters);
document.getElementById('searchInput').addEventListener('input', applyFilters);

async function loadBlogsFromFolder() {
    // Specify your blog folder and files here
    const blogFolder = 'test-blog'; // Your blog folder path
    const blogPosts = [
        // List all your blog posts manually
        'blog1/index.md',
        'blog2/index.md',
        'blog3/index.md'
        // Add more blog files here...
    ];

    blogData = [];
    
    for (const postFile of blogPosts) {
        try {
            const filePath = `/${blogFolder}/${postFile}`;
            const response = await fetch(filePath);
            
            if (!response.ok) {
                console.warn(`Could not load: ${filePath}`);
                continue;
            }
            
            const content = await response.text();
            const frontmatter = parseFrontmatter(content);
            
            if (frontmatter.title && frontmatter.date) {
                // Extract folder name for path/url
                const folderName = postFile.split('/')[0];
                
                const blogEntry = {
                    title: frontmatter.title,
                    date: frontmatter.date,
                    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : 
                          (frontmatter.tags ? frontmatter.tags.split(',').map(t => t.trim()) : []),
                    path: `${blogFolder}/${folderName}`,
                    url: `/${blogFolder}/${folderName}/`,
                    content: content,
                    fileName: postFile
                };
                
                blogData.push(blogEntry);
            }
        } catch (error) {
            console.error(`Error loading ${postFile}:`, error);
        }
    }

    // Sort by date (newest first)
    blogData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setupFilters();
    filteredData = [...blogData];
    displayList();
    
    // Show controls (remove hidden class)
    document.getElementById('filterControls').classList.remove('hidden');
    
    console.log(`Loaded ${blogData.length} blog posts`);
}

// CHANGED: Complete rewrite of parseFrontmatter function
function parseFrontmatter(content) {
    // First try to parse YAML frontmatter (content between --- delimiters)
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
        const frontmatterText = match[1];
        return parseYamlLike(frontmatterText);
    }
    
    // If no YAML frontmatter found, try to parse the beginning of the content
    // Look for key: value pairs at the start
    const lines = content.split('\n');
    const frontmatter = {};
    let contentStartIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Stop if we hit an empty line or content that doesn't look like metadata
        if (!line || (!line.includes(':') && !line.startsWith('**'))) {
            contentStartIndex = i;
            break;
        }
        
        // Handle markdown bold format: **Key:** Value
        if (line.startsWith('**') && line.includes(':**')) {
            const keyMatch = line.match(/^\*\*(.*?):\*\*(.*)$/);
            if (keyMatch) {
                const key = keyMatch[1].trim().toLowerCase();
                let value = keyMatch[2].trim();
                frontmatter[key] = parseValue(value);
                contentStartIndex = i + 1;
                continue;
            }
        }
        
        // Handle regular format: key: value
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim().toLowerCase();
            let value = line.substring(colonIndex + 1).trim();
            frontmatter[key] = parseValue(value);
            contentStartIndex = i + 1;
        }
    }
    
    return frontmatter;
}

// ADDED: New helper function for YAML-like parsing
function parseYamlLike(frontmatterText) {
    const frontmatter = {};
    const lines = frontmatterText.split('\n');
    
    for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;
        
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        frontmatter[key] = parseValue(value);
    }
    
    return frontmatter;
}

// ADDED: New helper function for parsing values
function parseValue(value) {
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
    }
    
    // Handle arrays
    if (value.startsWith('[') && value.endsWith(']')) {
        const arrayContent = value.slice(1, -1);
        if (arrayContent.trim() === '') return [];
        return arrayContent.split(',').map(item => item.trim().replace(/['"]/g, ''));
    }
    
    return value;
}

function setupFilters() {
    const tagFilter = document.getElementById('tagFilter');
    
    tagFilter.innerHTML = '<option value="">All Tags</option>';
    
    const allTags = [...new Set(blogData.flatMap(blog => blog.tags))].sort();
    
    allTags.forEach(tag => {
        if (tag) {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        }
    });
}

function applyFilters() {
    const tagFilter = document.getElementById('tagFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredData = blogData.filter(blog => {
        const matchesTag = !tagFilter || blog.tags.includes(tagFilter);
        const matchesSearch = !searchTerm || blog.title.toLowerCase().includes(searchTerm);
        
        return matchesTag && matchesSearch;
    });
    
    displayList();
}

function displayList() {
    const blogList = document.getElementById('blogList');
    const stats = document.getElementById('stats');
    
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


// ADDED: New helper function to extract content after metadata
function extractContentAfterMetadata(content) {
    // If it has YAML frontmatter, remove it
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\n?/;
    const yamlMatch = content.match(frontmatterRegex);
    if (yamlMatch) {
        return content.replace(frontmatterRegex, '').trim();
    }
    
    // Otherwise, find where metadata ends and content begins
    const lines = content.split('\n');
    let contentStart = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip metadata lines (key: value or **key:** value)
        if (line && (line.includes(':') || line.startsWith('**'))) {
            // Check if this looks like metadata
            if (line.startsWith('**') && line.includes(':**')) {
                contentStart = i + 1;
                continue;
            }
            if (line.match(/^(title|date|tags):/i)) {
                contentStart = i + 1;
                continue;
            }
        }
        
        // Found content or empty line, stop here
        if (line && !line.includes(':') && !line.startsWith('**')) {
            contentStart = i;
            break;
        }
        
        if (!line) {
            contentStart = i + 1;
            continue;
        }
    }
    
    return lines.slice(contentStart).join('\n').trim();
}

// Global variable to store the current Glide instance
let currentGlide = null;

// Function to initialize Glide.js carousel with blog images
function initializeImageCarousel(images, blogPath) {
    const container = document.getElementById('imageCarousel');
    
    if (!images || images.length === 0) {
        container.classList.add('hidden');
        return;
    }

    // Show the carousel container
    container.classList.remove('hidden');

    // Convert image paths to full URLs
    const imagePaths = images.map(img => `/${blogPath}/${img}`);
    
    // Generate slides HTML
    const slidesContainer = document.getElementById('glide-slides');
    const bulletsContainer = document.getElementById('glide-bullets');
    
    // Destroy existing Glide instance if it exists
    if (currentGlide) {
        try {
            currentGlide.destroy();
            currentGlide = null;
        } catch (e) {
            console.log('Previous Glide instance cleanup');
        }
    }
    
    // Clear existing content
    slidesContainer.innerHTML = '';
    bulletsContainer.innerHTML = '';
    
    // Create slides
    imagePaths.forEach((imgPath, index) => {
        // Create slide
        const slide = document.createElement('li');
        slide.className = 'glide__slide';
        slide.innerHTML = `<img src="${imgPath}" alt="Blog image ${index + 1}" loading="lazy">`;
        slidesContainer.appendChild(slide);
        
        // Create bullet for navigation (only if more than 1 image)
        if (imagePaths.length > 1) {
            const bullet = document.createElement('button');
            bullet.className = 'glide__bullet';
            bullet.setAttribute('data-glide-dir', `=${index}`);
            bulletsContainer.appendChild(bullet);
        }
    });
    
    // Hide/show navigation elements based on image count
    const arrows = container.querySelectorAll('.glide__arrow');
    if (imagePaths.length <= 1) {
        bulletsContainer.style.display = 'none';
        arrows.forEach(arrow => arrow.style.display = 'none');
    } else {
        bulletsContainer.style.display = 'flex';
        arrows.forEach(arrow => arrow.style.display = 'flex');
    }
    
    // Simple timeout to initialize Glide after DOM is ready
    setTimeout(() => {
        initializeGlide();
    }, 100);
}

function initializeGlide() {
    try {
        currentGlide = new Glide('#blog-glide', {
            type: 'carousel',
            startAt: 0,
            perView: 1,
            focusAt: 'center',
            gap: 0,
            autoplay: false,
            hoverpause: true,
            keyboard: true,
            animationDuration: 300,
            animationTimingFunc: 'ease-in-out',
            dragThreshold: 120,
            swipeThreshold: 80,
            peek: 0,
            rewind: true,
            breakpoints: {
                768: {
                    dragThreshold: 60,
                    swipeThreshold: 40
                }
            }
        });
        
        currentGlide.mount();
        
        // Quick update after mounting
        setTimeout(() => {
            if (currentGlide) {
                currentGlide.update();
            }
        }, 50);
        
        console.log(`Glide carousel initialized successfully`);
        
    } catch (error) {
        console.error('Error initializing Glide:', error);
    }
}

// // Optional: Function to manually refresh the carousel if needed
// function refreshCarousel() {
//     if (currentGlide) {
//         try {
//             currentGlide.update();
//             currentGlide.go('=0');
//         } catch (e) {
//             console.error('Error refreshing carousel:', e);
//         }
//     }
// }

// // Optional: Clean up function for when leaving the page/view
// function cleanupCarousel() {
//     if (currentGlide) {
//         try {
//             currentGlide.destroy();
//             currentGlide = null;
//         } catch (e) {
//             console.error('Error cleaning up carousel:', e);
//         }
//     }
// }

// UPDATED: showContent function (keeping your existing logic)
function showContent(path) {
    const blog = blogData.find(b => b.path === path);
    
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
        
        document.getElementById('markdownContent').innerHTML = `
            <h1>${title}</h1>
            <p><strong>Date:</strong> ${date ? new Date(date).toLocaleDateString() : 'No date'}</p>
            ${Array.isArray(tags) && tags.length > 0 ? `<p><strong>Tags:</strong> ${tags.join(', ')}</p>` : ''}
            <hr>
            ${renderedMarkdown}
        `;
        
        document.getElementById('listView').classList.add('hidden');
        document.getElementById('contentView').classList.remove('hidden');
    }
}

// UPDATED: showList function with Glide cleanup
function showList() {
    document.getElementById('contentView').classList.add('hidden');
    document.getElementById('listView').classList.remove('hidden');
    
    // Hide carousel when going back to list
    document.getElementById('imageCarousel').classList.add('hidden');
    
    // Clean up Glide instance to prevent memory leaks
    if (currentGlide) {
        try {
            currentGlide.destroy();
            currentGlide = null;
        } catch (e) {
            console.log('Glide instance already destroyed');
        }
    }
}
