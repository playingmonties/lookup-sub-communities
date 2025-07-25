// Supabase configuration
const SUPABASE_URL = 'https://hwfrwtuqpjbkuywgcvwn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3ZnJ3dHVxcGpia3V5d2djdnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTUzMzksImV4cCI6MjA2Nzg5MTMzOX0.NAUC8B3PHZ9aVDNvAkzwU5gcL4zYMZEpqqKvijTpmnY';

// Webhook configuration
const WEBHOOK_URL = 'https://thomasmccone.app.n8n.cloud/webhook/89da7908-14a3-4d70-a7a2-35754bf745f8';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const resultsList = document.getElementById('resultsList');
const selectedResult = document.getElementById('selectedResult');
const selectedContent = document.getElementById('selectedContent');
const clearSelectionBtn = document.getElementById('clearSelection');
const submitSelectionBtn = document.getElementById('submitSelection');
const userEmailInput = document.getElementById('userEmail');

// State
let searchTimeout;
let currentResults = [];
let selectedItem = null;

// Event listeners
searchInput.addEventListener('input', handleSearch);
searchInput.addEventListener('focus', handleFocus);
searchInput.addEventListener('blur', handleBlur);
clearSelectionBtn.addEventListener('click', clearSelection);
submitSelectionBtn.addEventListener('click', submitSelection);

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
        
        console.log('Searching for:', query);
        
        // Search for sub communities that match the query
        const { data, error } = await supabase
            .from('sub_communities')
            .select('*')
            .ilike('sub_community', `%${query}%`)
            .limit(10)
            .order('sub_community');
        
        console.log('Supabase response:', { data, error });
        
        if (error) {
            console.error('Search error:', error);
            showError(`Error: ${error.message}`);
            return;
        }
        
        currentResults = data || [];
        console.log('Current results:', currentResults);
        displayResults(query);
        
    } catch (error) {
        console.error('Search failed:', error);
        showError(`Failed to search: ${error.message}`);
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
        const highlightedText = highlightMatch(item.sub_community, query);
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
    selectedContent.textContent = item.sub_community;
    
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
    userEmailInput.value = '';
    searchInput.focus();
}

// Submit selection to webhook
async function submitSelection() {
    if (!selectedItem) {
        alert('Please select a sub community first');
        return;
    }
    
    // Validate email
    const email = userEmailInput.value.trim();
    if (!email) {
        alert('Please enter your email address');
        userEmailInput.focus();
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        userEmailInput.focus();
        return;
    }
    
    if (WEBHOOK_URL === 'YOUR_N8N_WEBHOOK_URL') {
        alert('Please configure your n8n webhook URL in script.js');
        return;
    }
    
    try {
        // Disable submit button and show loading state
        submitSelectionBtn.disabled = true;
        submitSelectionBtn.textContent = 'Submitting...';
        
        // Prepare the data to send
        const payload = {
            sub_community: selectedItem.sub_community,
            user_email: email,
            selected_at: new Date().toISOString(),
            user_agent: navigator.userAgent,
            timestamp: Date.now(),
            // Include all data from the selected item
            full_data: selectedItem
        };
        
        console.log('Sending payload to webhook:', payload);
        
        // Send to n8n webhook
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log('Successfully sent to webhook');
            alert('Selection submitted successfully!');
            
            // Clear the selection after successful submission
            clearSelection();
            userEmailInput.value = '';
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Error submitting to webhook:', error);
        alert(`Error submitting selection: ${error.message}`);
    } finally {
        // Re-enable submit button
        submitSelectionBtn.disabled = false;
        submitSelectionBtn.textContent = 'Submit Selection';
    }
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

// Test Supabase connection
async function testConnection() {
    try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase
            .from('sub_communities')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('Connection test failed:', error);
            return false;
        }
        
        console.log('Connection test successful');
        return true;
    } catch (error) {
        console.error('Connection test error:', error);
        return false;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
        console.error('Failed to connect to Supabase');
    }
    
    // Focus on search input
    searchInput.focus();
}); 