// DOM Elements
const elements = {
    // Navigation
    dogNav: document.getElementById('dogNav'),
    duckNav: document.getElementById('duckNav'),
    
    // Sections
    dogSection: document.getElementById('dogSection'),
    duckSection: document.getElementById('duckSection'),
    
    // Buttons
    dogButton: document.getElementById('dogButton'),
    duckButton: document.getElementById('duckButton'),
    
    // Containers
    dogContainer: document.getElementById('dogContainer'),
    duckContainer: document.getElementById('duckContainer'),
    
    // Title
    pageTitle: document.getElementById('pageTitle')
};

// API Endpoints
const API_ENDPOINTS = {
    dog: 'https://dog.ceo/api/breeds/image/random',
    // Use a CORS-friendly proxy for the Duck API
    duck: 'https://random-d.uk/api/random'
};

// Current active section
let currentSection = 'dog';

// Initialize the application
function init() {
    // Set up event listeners
    elements.dogNav.addEventListener('click', () => switchSection('dog'));
    elements.duckNav.addEventListener('click', () => switchSection('duck'));
    elements.dogButton.addEventListener('click', () => fetchAnimal('dog'));
    elements.duckButton.addEventListener('click', () => fetchAnimal('duck'));
    
    // Set initial theme and load content
    document.body.className = 'dog-theme';
    switchSection('dog');
    fetchAnimal('dog');
}

// Switch between dog and duck sections
function switchSection(section) {
    if (section === currentSection) return;
    
    // Update active state
    currentSection = section;
    
    // Update body class for theme
    document.body.className = section + '-theme';
    
    // Update UI
    elements.dogSection.style.display = section === 'dog' ? 'block' : 'none';
    elements.duckSection.style.display = section === 'duck' ? 'block' : 'none';
    
    elements.dogNav.classList.toggle('active', section === 'dog');
    elements.duckNav.classList.toggle('active', section === 'duck');
    
    elements.pageTitle.textContent = section === 'dog' 
        ? '🐶 Random Dog Images' 
        : '🦆 Random Duck Images';
    
    // Fetch content for the new section if container is empty
    const container = section === 'dog' ? elements.dogContainer : elements.duckContainer;
    if (container.innerHTML.trim() === '') {
        fetchAnimal(section);
    }
}

// Fetch animal image from the appropriate API
async function fetchAnimal(type) {
    const container = type === 'dog' ? elements.dogContainer : elements.duckContainer;
    const button = type === 'dog' ? elements.dogButton : elements.duckButton;
    
    try {
        // Show loading state
        button.disabled = true;
        button.textContent = 'Loading...';
        
        // Fetch the image
        let url = API_ENDPOINTS[type];
        if (type === 'duck') {
            const duckApiUrl = `https://random-d.uk/api/random?format=json&t=${Date.now()}`;
            url = `https://api.allorigins.win/raw?url=${encodeURIComponent(duckApiUrl)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${type} image`);
        }
        
        const data = await response.json();
        // Dog API: { message: 'url' }
        // Duck API (via proxy): { url: 'url', message: '...' }
        const imageUrl = type === 'dog' ? data.message : data.url;
        
        // Create image element
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `Random ${type}`;
        img.className = 'animal-image';

        // If a duck image fails to load (e.g., bad URL or unsupported format), try another one
        if (type === 'duck') {
            img.onerror = () => {
                console.error('Duck image failed to load, fetching another one...');
                fetchAnimal('duck');
            };
        }
        
        // Create wrapper and append image
        const wrapper = document.createElement('div');
        wrapper.className = 'image-wrapper';
        wrapper.appendChild(img);
        
        // Clear container and append new content
        container.innerHTML = '';
        container.appendChild(wrapper);
        
        // Reset button state
        button.disabled = false;
        button.textContent = `Get Another ${type === 'dog' ? 'Dog' : 'Duck'}!`;
        
    } catch (error) {
        console.error(`Error fetching ${type} image:`, error);
        container.innerHTML = `
            <div class="error-message">
                <p>Failed to load ${type} image. Please try again.</p>
                <button class="retry-button" onclick="fetchAnimal('${type}')">
                    Retry
                </button>
            </div>
        `;
        button.disabled = false;
        button.textContent = `Get Another ${type === 'dog' ? 'Dog' : 'Duck'}!`;
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// Make the fetchAnimal function available globally for retry buttons
window.fetchAnimal = fetchAnimal;
