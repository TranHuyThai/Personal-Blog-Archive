// blog-loader.js - Blog loading and parsing functionality

import { setBlogData, setFilteredData } from './main.js';
import { setupFilters } from './filters.js';
import { displayList } from './display.js';

export async function loadBlogsFromFolder() {
    // Specify your blog folder and files here
    const blogsPath = 'https://storage.googleapis.com/tranpoline-blogs'; // Your blog folder path
    
    // Fetch JSON index of blogs instead of hardcoding
    const response = await fetch(`${blogsPath}/bloglist.json`);
    if (!response.ok) throw new Error('Failed to load blog index JSON');

    const blogPosts = await response.json(); // Array of objects
    
    const blogData = [];
    
    for (const postFile of blogPosts) {
        try {
            const filePath = `${blogsPath}/blogs/${postFile.folder}/${postFile.file}`;
            const response = await fetch(filePath);
            
            if (!response.ok) {
                console.warn(`Could not load: ${filePath}`);
                continue;
            }
            
            const content = await response.text();
            const frontmatter = parseFrontmatter(content);
            
            if (frontmatter.title && frontmatter.date) {
                // Use postFile.folder directly for path/url
                const folderName = postFile.folder; // e.g., "blog1"
                
                const blogEntry = {
                    title: frontmatter.title,
                    date: frontmatter.date,
                    tags: Array.isArray(frontmatter.tags) 
                            ? frontmatter.tags 
                            : (frontmatter.tags 
                                ? frontmatter.tags.split(',').map(t => t.trim()) 
                                : []),
                    path: `${blogsPath}/blogs/${postFile.folder}`,             // path relative to your site
                    url: `blogs/${folderName}/`,             // URL for navigation
                    content: content,                        // raw markdown content
                    fileName: postFile.file                  // usually "index.md"
                };

                blogData.push(blogEntry);
            }
        } catch (error) {
            console.error(`Error loading ${postFile.file}:`, error);
        }
    }

    // Sort by date (newest first)
    blogData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update global state
    setBlogData(blogData);
    setFilteredData([...blogData]);
    
    // Setup UI
    setupFilters();
    displayList();
    
    // Show controls (remove hidden class)
    document.getElementById('filterControls').classList.remove('hidden');
}

// Helper function to check if the blog index exists
export async function checkBlogSetup() {
    const blogFolder = 'public/blogs';
    try {
        const response = await fetch(`/${blogFolder}/bloglist.json`);
        return {
            indexExists: response.ok,
            status: response.status,
            path: `/${blogFolder}/bloglist.json`
        };
    } catch (error) {
        return {
            indexExists: false,
            error: error.message,
            path: `/${blogFolder}/bloglist.json`
        };
    }
}

// CHANGED: Complete rewrite of parseFrontmatter function
export function parseFrontmatter(content) {
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

// ADDED: New helper function to extract content after metadata
export function extractContentAfterMetadata(content) {
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