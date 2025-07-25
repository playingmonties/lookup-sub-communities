// Supabase configuration
const SUPABASE_URL = 'https://hwfrwtuqpjbkuywgcvwn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3ZnJ3dHVxcGpia3V5d2djdnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTUzMzksImV4cCI6MjA2Nzg5MTMzOX0.NAUC8B3PHZ9aVDNvAkzwU5gcL4zYMZEpqqKvijTpmnY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const resultsList = document.getElementById('resultsList');
const selectedResult = document.getElementById('selectedResult');
const selectedContent = document.getElementById('selectedContent');
const clearSelectionBtn = document.getElementById('clearSelection');

// State
let searchTimeout;
let currentResults = [];
let selectedItem = null;

// Event listeners
searchInput.addEventListener('input', handleSearch);
searchInput.addEventListener('focus', handleFocus);
searchInput.addEventListener('blur', handleBlur);
clearSelectionBtn.addEventListener('click', clearSelection);

// Handle search input
function handleSearch(event) {
    const query = event.target.value.trim();
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Hide results if query is empty
    if (!query) {
        hideResults();
        return;
    }
    
    // Debounce search to avoid too many API calls
    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, 300);
}

// Perform search in Supabase
async function performSearch(query) {
    try {
        showLoading();
        
        // Search for sub communities that match the query
        const { data, error } = await supabase
            .from('sub_communities')
            .select('*')
            .ilike('sub_communities', `%${query}%`)
            .limit(10)
            .order('sub_communities');
        
        if (error) {
            console.error('Search error:', error);
            showError('Error searching sub communities');
            return;
        }
        
        currentResults = data || [];
        displayResults(query);
        
    } catch (error) {
        console.error('Search failed:', error);
        showError('Failed to search sub communities');
    }
}

// Display search results
function displayResults(query) {
    if (currentResults.length === 0) {
        showNoResults();
        return;
    }
    
    resultsList.innerHTML = '';
    
    currentResults.forEach((item, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.dataset.index = index;
        
        // Highlight the matching part of the text
        const highlightedText = highlightMatch(item.sub_communities, query);
        resultItem.innerHTML = highlightedText;
        
        // Add click event
        resultItem.addEventListener('click', () => selectItem(item));
        
        // Add keyboard navigation
        resultItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectItem(item);
            }
        });
        
        resultItem.setAttribute('tabindex', '0');
        resultItem.setAttribute('role', 'option');
        
        resultsList.appendChild(resultItem);
    });
    
    showResults();
}

// Highlight matching text
function highlightMatch(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Select an item
function selectItem(item) {
    selectedItem = item;
    selectedContent.textContent = item.sub_communities;
    
    // Hide search results
    hideResults();
    
    // Clear search input
    searchInput.value = '';
    
    // Show selected result
    selectedResult.classList.remove('hidden');
    
    // Focus on clear button
    clearSelectionBtn.focus();
}

// Clear selection
function clearSelection() {
    selectedItem = null;
    selectedResult.classList.add('hidden');
    selectedContent.textContent = '';
    searchInput.focus();
}

// Show/hide results
function showResults() {
    resultsContainer.classList.remove('hidden');
}

function hideResults() {
    resultsContainer.classList.add('hidden');
}

// Show loading state
function showLoading() {
    resultsList.innerHTML = '<div class="loading">Searching...</div>';
    showResults();
}

// Show no results
function showNoResults() {
    resultsList.innerHTML = '<div class="no-results">No sub communities found</div>';
    showResults();
}

// Show error
function showError(message) {
    resultsList.innerHTML = `<div class="no-results">${message}</div>`;
    showResults();
}

// Handle focus
function handleFocus() {
    if (searchInput.value.trim() && currentResults.length > 0) {
        showResults();
    }
}

// Handle blur
function handleBlur() {
    // Delay hiding results to allow for clicks
    setTimeout(() => {
        hideResults();
    }, 200);
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideResults();
        searchInput.blur();
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Focus on search input
    searchInput.focus();
}); 