// filters.js - Filtering and search functionality

import { getBlogData, setFilteredData } from './main.js';
import { displayList } from './display.js';

export function setupFilters() {
    const tagFilter = document.getElementById('tagFilter');
    const blogData = getBlogData();
    
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

export function applyFilters() {
    const tagFilter = document.getElementById('tagFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const blogData = getBlogData();
    
    const filteredData = blogData.filter(blog => {
        const matchesTag = !tagFilter || blog.tags.includes(tagFilter);
        const matchesSearch = !searchTerm || blog.title.toLowerCase().includes(searchTerm);
        
        return matchesTag && matchesSearch;
    });
    
    setFilteredData(filteredData);
    displayList();
}