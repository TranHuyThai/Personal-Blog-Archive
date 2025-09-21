// glide-carousel.js - Image carousel functionality using Glide.js

import { setCurrentGlide, getCurrentGlide } from './main.js';

export function initializeImageCarousel(images, blogPath) {
    const container = document.getElementById('imageCarousel');
    
    if (!images || images.length === 0) {
        container.classList.add('hidden');
        return;
    }

    // Show the carousel container
    container.classList.remove('hidden');

    // Convert image paths to full URLs
    const mediaPaths = images.map(img => `${blogPath}/${img}`);
    
    // Generate slides HTML
    const slidesContainer = document.getElementById('glide-slides');
    const bulletsContainer = document.getElementById('glide-bullets');
    
    // Destroy existing Glide instance if it exists
    const currentGlide = getCurrentGlide();
    if (currentGlide) {
        try {
            currentGlide.destroy();
            setCurrentGlide(null);
        } catch (e) {
            console.log('Previous Glide instance cleanup');
        }
    }
    
    // Clear existing content
    slidesContainer.innerHTML = '';
    bulletsContainer.innerHTML = '';
    
    // Helper function to determine media type
    function getMediaType(filePath) {
        const extension = filePath.split('.').pop().toLowerCase();
        if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) {
            return 'video';
        } else if (['gif', 'jpg', 'jpeg', 'png', 'webp', 'svg'].includes(extension)) {
            return 'image';
        }
        return 'image'; // default fallback
    }
    
    // Helper function to create media element
    function createMediaElement(mediaPath, index) {
        const mediaType = getMediaType(mediaPath);
        
        if (mediaType === 'video') {
            return `
                <video 
                    src="${mediaPath}" 
                    alt="Blog video ${index + 1}"
                    controls
                    muted
                    playsinline
                    preload="metadata"
                    style="width: 100%; height: 100%; object-fit: contain;"
                >
                    Your browser does not support the video tag.
                </video>
            `;
        } else {
            return `
                <img 
                    src="${mediaPath}" 
                    alt="Blog image ${index + 1}" 
                    loading="lazy"
                    style="width: 100%; height: 100%; object-fit: contain;"
                >
            `;
        }
    }
    
    // Create slides
    mediaPaths.forEach((mediaPath, index) => {
        // Create slide
        const slide = document.createElement('li');
        slide.className = 'glide__slide';
        slide.innerHTML = createMediaElement(mediaPath, index);
        slidesContainer.appendChild(slide);
        
        // Create bullet for navigation (only if more than 1 media item)
        if (mediaPaths.length > 1) {
            const bullet = document.createElement('button');
            bullet.className = 'glide__bullet';
            bullet.setAttribute('data-glide-dir', `=${index}`);
            bulletsContainer.appendChild(bullet);
        }
    });
    
    // Hide/show navigation elements based on media count
    const arrows = container.querySelectorAll('.glide__arrow');
    if (mediaPaths.length <= 1) {
        bulletsContainer.style.display = 'none';
        arrows.forEach(arrow => arrow.style.display = 'none');
    } else {
        bulletsContainer.style.display = 'flex';
        arrows.forEach(arrow => arrow.style.display = 'flex');
    }
    
    // Add video event listeners for better UX
    setTimeout(() => {
        const videos = container.querySelectorAll('video');
        videos.forEach(video => {
            // Pause video when slide changes
            video.addEventListener('loadedmetadata', () => {
                // Optional: Set a poster frame from the first frame
                video.currentTime = 0.1;
            });
            
            // Handle video errors gracefully
            video.addEventListener('error', (e) => {
                console.warn('Video loading error:', e);
                // You could replace with a placeholder image here
            });
        });
        
        initializeGlide();
    }, 100);
    
    // Add slide change listener to pause videos when not active
    setTimeout(() => {
        const glide = getCurrentGlide();
        if (glide) {
            glide.on('move', () => {
                // Pause all videos when sliding
                const allVideos = container.querySelectorAll('video');
                allVideos.forEach(video => {
                    video.pause();
                });
            });
        }
    }, 200);
}

function initializeGlide() {
    try {
        const glide = new Glide('#blog-glide', {
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
        
        glide.mount();
        setCurrentGlide(glide);
        
        // Quick update after mounting
        setTimeout(() => {
            const currentGlide = getCurrentGlide();
            if (currentGlide) {
                currentGlide.update();
            }
        }, 50);
        
        console.log(`Glide carousel initialized successfully`);
        
    } catch (error) {
        console.error('Error initializing Glide:', error);
    }
}

// Clean up Glide instance
export function cleanupCarousel() {
    const currentGlide = getCurrentGlide();
    if (currentGlide) {
        try {
            currentGlide.destroy();
            setCurrentGlide(null);
        } catch (e) {
            console.log('Glide instance already destroyed');
        }
    }
}

// Optional: Function to manually refresh the carousel if needed
export function refreshCarousel() {
    const currentGlide = getCurrentGlide();
    if (currentGlide) {
        try {
            currentGlide.update();
            currentGlide.go('=0');
        } catch (e) {
            console.error('Error refreshing carousel:', e);
        }
    }
}