// Data storage
let groups = JSON.parse(localStorage.getItem('linkGroups')) || [];
let currentGroupId = null;
let currentPath = []; // Array of group IDs representing the current path in the hierarchy

// User preferences
let favoriteGroups = []; // Array of group IDs marked as favorites
let recentGroups = []; // Array of recently accessed group IDs
const MAX_RECENT = 3; // Maximum number of recent groups to display

// Drag and drop state
let isDraggingLink = false;

// DOM Elements
const groupsContainer = document.getElementById('groups-container');
const linksContainer = document.getElementById('links-container');
const currentGroupNameElement = document.getElementById('current-group-name');
const emptyState = document.getElementById('empty-state');
const linksView = document.getElementById('links-view');
const favoritesContainer = document.getElementById('favorites-container');
const recentContainer = document.getElementById('recent-container');

// Group Modal Elements
const groupModal = document.getElementById('group-modal');
const groupModalTitle = document.getElementById('group-modal-title');
const groupNameInput = document.getElementById('group-name');
const groupParentSelect = document.getElementById('group-parent');
const groupParentContainer = document.getElementById('group-parent-container');
const addGroupButton = document.getElementById('add-group-button');
const addGroupButtonEmpty = document.getElementById('add-group-button-empty');
const closeGroupModal = document.getElementById('close-group-modal');
const cancelGroupModal = document.getElementById('cancel-group-modal');
const saveGroupButton = document.getElementById('save-group');

// Link Modal Elements
const linkModal = document.getElementById('link-modal');
const linkModalTitle = document.getElementById('link-modal-title');
const linkTitleInput = document.getElementById('link-title');
const linkUrlInput = document.getElementById('link-url');
const addLinkButton = document.getElementById('add-link-button');
const closeLinkModal = document.getElementById('close-link-modal');
const cancelLinkModal = document.getElementById('cancel-link-modal');
const saveLinkButton = document.getElementById('save-link');

// Note Modal Elements
const noteModal = document.getElementById('note-modal');
const noteModalTitle = document.getElementById('note-modal-title');
const noteContentInput = document.getElementById('note-content');
const closeNoteModal = document.getElementById('close-note-modal');
const cancelNoteModal = document.getElementById('cancel-note-modal');
const saveNoteButton = document.getElementById('save-note');
const removeNoteButton = document.getElementById('remove-note');
let currentNoteLinkId = null;

// Confirm Delete Modal Elements
const confirmDeleteModal = document.getElementById('confirm-delete-modal');
const confirmDeleteMessage = document.getElementById('confirm-delete-message');
const closeConfirmDeleteModal = document.getElementById('close-confirm-delete-modal');
const cancelConfirmDelete = document.getElementById('cancel-confirm-delete');
const confirmDeleteButton = document.getElementById('confirm-delete');

// Import/Export Modal Elements
const importExportModal = document.getElementById('import-export-modal');
const importExportButton = document.getElementById('import-export-button');
const closeImportExportModal = document.getElementById('close-import-export-modal');
const closeImportExport = document.getElementById('close-import-export');
const exportGroupsBtn = document.getElementById('export-groups-btn');
const importGroupsInput = document.getElementById('import-groups-input');
const importGroupsBtn = document.getElementById('import-groups-btn');

// Bilingual Text Support Module
const BilingualTextSupport = {
    containsHebrew(text) {
        if (!text) return false;
        const hebrewPattern = /[\u0590-\u05FF\uFB1D-\uFB4F]/;
        return hebrewPattern.test(text);
    },

    detectLanguageAndSetDirection(element, text) {
        if (!element || !text) return;
        const firstWords = text.trim().substring(0, Math.min(text.length, 10));
        if (this.containsHebrew(firstWords)) {
            element.dir = 'rtl';
        } else {
            element.dir = 'ltr';
        }
    },

    setupBilingualInput(element) {
        if (!element) return;
        this.detectLanguageAndSetDirection(element, element.value);
        element.addEventListener('input', () => {
            this.detectLanguageAndSetDirection(element, element.value);
        });
        element.addEventListener('paste', () => {
            setTimeout(() => {
                this.detectLanguageAndSetDirection(element, element.value);
            }, 0);
        });
    }
};

// Modal state variables
let editingGroupId = null;
let editingLinkId = null;
let itemToDeleteId = null;
let deleteType = null;

// Recursively find a group by ID in the nested structure
function findGroupById(id, groupsArray = groups) {
    for (let group of groupsArray) {
        if (group.id === id) {
            return group;
        }
        
        if (group.subgroups && group.subgroups.length > 0) {
            const found = findGroupById(id, group.subgroups);
            if (found) return found;
        }
    }
    return null;
}

// Find parent group for a given group ID
function findParentGroup(id, groupsArray = groups, parent = null) {
    for (let group of groupsArray) {
        if (group.id === id) {
            return parent;
        }
        
        if (group.subgroups && group.subgroups.length > 0) {
            const found = findParentGroup(id, group.subgroups, group);
            if (found) return found;
        }
    }
    return null;
}

// Build path array to a group
function buildPathToGroup(id, path = [], groupsArray = groups) {
    for (let group of groupsArray) {
        if (group.id === id) {
            path.push(group.id);
            return true;
        }
        
        if (group.subgroups && group.subgroups.length > 0) {
            path.push(group.id);
            const found = buildPathToGroup(id, path, group.subgroups);
            if (found) return true;
            path.pop(); // Remove if not found in this branch
        }
    }
    return false;
}

// Get full path to a group
function getPathToGroup(id) {
    const path = [];
    buildPathToGroup(id, path);
    return path;
}

// Load user preferences from localStorage
function loadUserPreferences() {
    try {
        const savedFavorites = localStorage.getItem('favoriteGroups');
        if (savedFavorites) {
            favoriteGroups = JSON.parse(savedFavorites);
        }
        
        const savedRecent = localStorage.getItem('recentGroups');
        if (savedRecent) {
            recentGroups = JSON.parse(savedRecent);
        }
    } catch (e) {
        console.error('Error loading preferences:', e);
        // Reset if there's an error
        favoriteGroups = [];
        recentGroups = [];
    }
}

// Save user preferences to localStorage
function saveUserPreferences() {
    try {
        localStorage.setItem('favoriteGroups', JSON.stringify(favoriteGroups));
        localStorage.setItem('recentGroups', JSON.stringify(recentGroups));
    } catch (e) {
        console.error('Error saving preferences:', e);
    }
}

// Toggle a group as favorite
function toggleFavorite(groupId) {
    const index = favoriteGroups.indexOf(groupId);
    const group = findGroupById(groupId);
    
    if (!group) return;
    
    if (index === -1) {
        // Add to favorites
        favoriteGroups.push(groupId);
        showNotification(`Added "${group.name}" to favorites`);
    } else {
        // Remove from favorites
        favoriteGroups.splice(index, 1);
        showNotification(`Removed "${group.name}" from favorites`);
    }
    
    // Update UI
    updateFavoriteButtons();
    renderFavorites();
    
    // Save preferences
    saveUserPreferences();
}

// Update favorite buttons to reflect current state
function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-button').forEach(button => {
        const groupId = button.dataset.id;
        
        if (favoriteGroups.includes(groupId)) {
            button.innerHTML = '<i class="fas fa-star"></i>';
            button.classList.add('active');
            button.title = 'Remove from favorites';
        } else {
            button.innerHTML = '<i class="far fa-star"></i>';
            button.classList.remove('active');
            button.title = 'Add to favorites';
        }
    });
}

// Add group to recent groups
function addToRecentGroups(groupId) {
    // Don't add if it's already the most recent
    if (recentGroups[0] === groupId) return;
    
    // Remove if it exists elsewhere in the list
    const index = recentGroups.indexOf(groupId);
    if (index !== -1) {
        recentGroups.splice(index, 1);
    }
    
    // Add to the beginning
    recentGroups.unshift(groupId);
    
    // Limit the number of recent groups
    if (recentGroups.length > MAX_RECENT) {
        recentGroups = recentGroups.slice(0, MAX_RECENT);
    }
    
    // Render and save
    renderRecentGroups();
    saveUserPreferences();
}

// Render favorite groups in quick access section
function renderFavorites() {
    // Clear current favorites
    favoritesContainer.innerHTML = '';
    
    // Check if there are any favorites
    if (favoriteGroups.length === 0) {
        favoritesContainer.innerHTML = '<div class="empty-state">No favorites yet</div>';
        return;
    }
    
    // Add each favorite
    favoriteGroups.forEach(groupId => {
        const group = findGroupById(groupId);
        if (!group) return;
        
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'quick-access-item';
        favoriteItem.dataset.id = groupId;
        favoriteItem.innerHTML = `
            <div class="group-icon"><i class="fas fa-folder"></i></div>
            <div class="group-name">${group.name}</div>
        `;
        
        // Add click event
        favoriteItem.addEventListener('click', () => {
            selectGroup(groupId);
        });
        
        // Add drag events for drop targets
        favoriteItem.addEventListener('dragover', handleItemDragOver);
        favoriteItem.addEventListener('dragleave', handleItemDragLeave);
        favoriteItem.addEventListener('drop', handleItemDrop);
        
        favoritesContainer.appendChild(favoriteItem);
    });
}

// Render recent groups in quick access section
function renderRecentGroups() {
    // Clear current recent groups
    recentContainer.innerHTML = '';
    
    // Check if there are any recent groups
    if (recentGroups.length === 0) {
        recentContainer.innerHTML = '<div class="empty-state">No recent groups</div>';
        return;
    }
    
    // Add each recent group
    recentGroups.forEach(groupId => {
        const group = findGroupById(groupId);
        if (!group) return;
        
        const recentItem = document.createElement('div');
        recentItem.className = 'quick-access-item';
        recentItem.dataset.id = groupId;
        recentItem.innerHTML = `
            <div class="group-icon"><i class="fas fa-folder"></i></div>
            <div class="group-name">${group.name}</div>
        `;
        
        // Add click event
        recentItem.addEventListener('click', () => {
            selectGroup(groupId);
        });
        
        // Add drag events
        recentItem.addEventListener('dragover', handleItemDragOver);
        recentItem.addEventListener('dragleave', handleItemDragLeave);
        recentItem.addEventListener('drop', handleItemDrop);
        
        recentContainer.appendChild(recentItem);
    });
}

// Setup drag and drop events
function setupDragEvents() {
    // Document level drag events
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);
}

// Document-level drag handlers
function handleDragOver(e) {
    e.preventDefault(); // Allow drop
}

function handleDragEnter(e) {
    e.preventDefault();
    
    // Check if we're dragging a link
    if (e.dataTransfer && e.dataTransfer.types && 
        (e.dataTransfer.types.includes('text/uri-list') || 
         e.dataTransfer.types.includes('text/plain'))) {
        // Enable drag highlight mode
        if (!isDraggingLink) {
            isDraggingLink = true;
            highlightAllGroups(true);
        }
    }
}

function handleDragLeave(e) {
    // Check if we're leaving the document
    if (e.clientX <= 0 || e.clientY <= 0 || 
        e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        // Disable drag highlight mode
        isDraggingLink = false;
        highlightAllGroups(false);
    }
}

function handleDrop(e) {
    e.preventDefault();
    // Disable drag highlight mode
    isDraggingLink = false;
    highlightAllGroups(false);
}

// Item-specific drag handlers
function handleItemDragOver(e) {
    e.preventDefault();
    if (isDraggingLink) {
        this.classList.add('drag-highlight');
    }
}

function handleItemDragLeave(e) {
    this.classList.remove('drag-highlight');
}

function handleItemDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the group ID
    const groupId = this.dataset.id;
    
    // Extract URL and title from drag data
    const linkData = extractLinkFromDragEvent(e);
    
    // Add the link if we have a URL
    if (linkData.url) {
        addLinkToGroup(groupId, linkData);
        
        // Select the group where we dropped
        selectGroup(groupId);
        
        // Show notification
        const group = findGroupById(groupId);
        if (group) {
            showNotification(`Added link to "${group.name}"`);
        }
    }
    
    // Remove highlights
    this.classList.remove('drag-highlight');
    isDraggingLink = false;
    highlightAllGroups(false);
}

function extractLinkFromDragEvent(e) {
    let url = null;
    let title = null;
    
    // Extract URL
    if (e.dataTransfer.types.includes('text/uri-list')) {
        url = e.dataTransfer.getData('text/uri-list');
    } else if (e.dataTransfer.types.includes('text/plain')) {
        const text = e.dataTransfer.getData('text/plain');
        // Check if it's a URL
        if (text.match(/^https?:\/\//)) {
            url = text;
        }
    }
    
    // Try to get title from HTML
    if (e.dataTransfer.types.includes('text/html')) {
        const html = e.dataTransfer.getData('text/html');
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const titleElement = doc.querySelector('title');
        if (titleElement) {
            title = titleElement.textContent;
        } else {
            // Try to extract from anchor text
            const anchor = doc.querySelector('a');
            if (anchor) {
                title = anchor.textContent;
            }
        }
    }
    
    // If we still don't have a title, use the URL hostname
    if (!title && url) {
        try {
            const urlObj = new URL(url);
            title = urlObj.hostname;
        } catch (e) {
            title = 'New Link';
        }
    }
    
    return {
        title: title || 'New Link',
        url: url
    };
}

function addLinkToGroup(groupId, linkData) {
    const group = findGroupById(groupId);
    if (!group) return;
    
    // Create a new link object
    const newLink = {
        id: Date.now().toString(),
        title: linkData.title,
        url: linkData.url
    };
    
    // Make sure the group has a links array
    if (!group.links) {
        group.links = [];
    }
    
    // Add the link
    group.links.push(newLink);
    
    // Save the data
    saveData();
    
    // If this is the current group, refresh the view
    if (currentGroupId === groupId) {
        renderLinks();
    }
}

function highlightAllGroups(highlight) {
    // Highlight regular group items
    document.querySelectorAll('.group-item').forEach(item => {
        if (highlight) {
            item.classList.add('drag-highlight');
        } else {
            item.classList.remove('drag-highlight');
        }
    });
    
    // Also highlight quick access items
    document.querySelectorAll('.quick-access-item').forEach(item => {
        if (highlight) {
            item.classList.add('drag-highlight');
        } else {
            item.classList.remove('drag-highlight');
        }
    });
}

function showNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function addFavoriteButtonListeners() {
    document.querySelectorAll('.favorite-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent group selection
            const groupId = button.dataset.id;
            toggleFavorite(groupId);
        });
    });
}

// Initialize the app
function init() {
    console.log("Script loaded successfully");
    
    // Initialize existing structure for backward compatibility
    groups.forEach(group => {
        if (!group.subgroups) group.subgroups = [];
    });

    // Load user preferences
    loadUserPreferences();
    
    renderGroups();
    updateMainContentView();
    
    // Render quick access sections
    renderFavorites();
    renderRecentGroups();
    
    // Add breadcrumb container to content header
    const contentHeader = document.querySelector('.content-header');
    if (!document.querySelector('.breadcrumb-container')) {
        const breadcrumbContainer = document.createElement('div');
        breadcrumbContainer.className = 'breadcrumb-container';
        contentHeader.insertBefore(breadcrumbContainer, contentHeader.firstChild);
    }
    
    // Setup drag and drop events
    setupDragEvents();
    
    // Setup bilingual support for note input if it exists
    if (noteContentInput) {
        BilingualTextSupport.setupBilingualInput(noteContentInput);
    }
    
    // Attach event listeners
    addGroupButton.addEventListener('click', () => openAddGroupModal(null));
    addGroupButtonEmpty.addEventListener('click', () => openAddGroupModal(null));
    closeGroupModal.addEventListener('click', closeModal);
    cancelGroupModal.addEventListener('click', closeModal);
    saveGroupButton.addEventListener('click', saveGroup);
    
    addLinkButton.addEventListener('click', openAddLinkModal);
    closeLinkModal.addEventListener('click', closeModal);
    cancelLinkModal.addEventListener('click', closeModal);
    saveLinkButton.addEventListener('click', saveLink);
    
    // Note modal event listeners
    if (noteContentInput) {
        closeNoteModal.addEventListener('click', closeModal);
        cancelNoteModal.addEventListener('click', closeModal);
        saveNoteButton.addEventListener('click', saveNote);
        removeNoteButton.addEventListener('click', removeNote);
    }
    
    closeConfirmDeleteModal.addEventListener('click', closeModal);
    cancelConfirmDelete.addEventListener('click', closeModal);
    confirmDeleteButton.addEventListener('click', confirmDelete);
    
    // Import/Export event listeners
    if (importExportModal) {
        importExportButton.addEventListener('click', () => openModal(importExportModal));
        closeImportExportModal.addEventListener('click', closeModal);
        closeImportExport.addEventListener('click', closeModal);
        exportGroupsBtn.addEventListener('click', handleExportGroups);
        importGroupsBtn.addEventListener('click', handleImportGroups);
    }
}

// Render groups in the sidebar with subgroups
function renderGroups(groupsArray = groups, level = 0, parentElement = groupsContainer) {
    if (level === 0) {
        parentElement.innerHTML = '';
    }
    
    groupsArray.forEach(group => {
        const groupItem = document.createElement('div');
        groupItem.className = `group-item ${currentPath.includes(group.id) ? 'active' : ''}`;
        groupItem.dataset.id = group.id; // Add data-id attribute for drag and drop
        groupItem.style.paddingLeft = `${15 + (level * 15)}px`; // Indentation based on level
        
        const hasSubgroups = group.subgroups && group.subgroups.length > 0;
        const isExpanded = currentPath.includes(group.id);
        
        let expandIcon = '';
        if (hasSubgroups) {
            expandIcon = `<span class="expand-icon ${isExpanded ? 'expanded' : ''}">${isExpanded ? '▼' : '▶'}</span>`;
        }
        
        // Add favorite button
        const isFavorite = favoriteGroups.includes(group.id);
        const favoriteButtonHTML = `
            <button class="favorite-button ${isFavorite ? 'active' : ''}" data-id="${group.id}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                <i class="${isFavorite ? 'fas' : 'far'} fa-star"></i>
            </button>
        `;
        
        groupItem.innerHTML = `
            ${expandIcon}
            <span class="group-name">${group.name}</span>
            <div class="group-actions">
                ${favoriteButtonHTML}
                <button class="menu-toggle" data-id="${group.id}">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
            <div class="dropdown-menu" id="dropdown-${group.id}">
                <a class="dropdown-item add-subgroup" data-id="${group.id}">
                    <i class="fas fa-folder-plus"></i> Add Subgroup
                </a>
                <a class="dropdown-item edit-group" data-id="${group.id}">
                    <i class="fas fa-edit"></i> Edit
                </a>
                <a class="dropdown-item delete-group" data-id="${group.id}">
                    <i class="fas fa-trash"></i> Delete
                </a>
            </div>
        `;
        
        groupItem.addEventListener('click', (e) => {
            // Only select the group if we didn't click the menu, its children, expand icon, or favorite button
            if (!e.target.closest('.menu-toggle') && 
                !e.target.closest('.dropdown-menu') &&
                !e.target.closest('.expand-icon') &&
                !e.target.closest('.favorite-button')) {
                selectGroup(group.id);
            }
            
            // Handle expand/collapse icon click
            if (e.target.closest('.expand-icon')) {
                e.stopPropagation();
                toggleSubgroupExpansion(group.id);
            }
        });
        
        // Add drag and drop event listeners
        groupItem.addEventListener('dragover', handleItemDragOver);
        groupItem.addEventListener('dragleave', handleItemDragLeave);
        groupItem.addEventListener('drop', handleItemDrop);
        
        parentElement.appendChild(groupItem);
        
        // Recursively render subgroups if expanded
        if (hasSubgroups && isExpanded) {
            // Create a container for subgroups
            const subgroupContainer = document.createElement('div');
            subgroupContainer.className = 'subgroup-container';
            subgroupContainer.id = `subgroup-container-${group.id}`;
            parentElement.appendChild(subgroupContainer);
            
            renderGroups(group.subgroups, level + 1, subgroupContainer);
        }
    });
    
    // Add event listeners for menu toggles and actions
    if (level === 0) {
        addEventListenersToGroupItems();
    }
}

// Add event listeners to group items after rendering
function addEventListenersToGroupItems() {
    // Menu toggle event listeners
    document.querySelectorAll('.menu-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const groupId = button.dataset.id;
            const dropdown = document.getElementById(`dropdown-${groupId}`);
            
            // Close all other dropdowns first
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                if (menu !== dropdown) {
                    menu.classList.remove('show');
                }
            });
            
            // Toggle this dropdown
            dropdown.classList.toggle('show');
        });
    });
    
    // Favorite button event listeners
    addFavoriteButtonListeners();
    
    // Add subgroup event listeners
    document.querySelectorAll('.add-subgroup').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            openAddGroupModal(item.dataset.id); // Pass parent ID
            // Hide dropdown after action
            document.getElementById(`dropdown-${item.dataset.id}`).classList.remove('show');
        });
    });
    
    // Edit group event listeners
    document.querySelectorAll('.edit-group').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditGroupModal(item.dataset.id);
            // Hide dropdown after action
            document.getElementById(`dropdown-${item.dataset.id}`).classList.remove('show');
        });
    });
    
    // Delete group event listeners
    document.querySelectorAll('.delete-group').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            openDeleteGroupConfirmation(item.dataset.id);
            // Hide dropdown after action
            document.getElementById(`dropdown-${item.dataset.id}`).classList.remove('show');
        });
    });
    
    // Close dropdown menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-menu') && !e.target.closest('.menu-toggle')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
}

// Toggle expansion state of a group with subgroups
function toggleSubgroupExpansion(groupId) {
    const index = currentPath.indexOf(groupId);
    if (index !== -1) {
        // If already in path, remove it and all children to collapse
        currentPath.splice(index + 1);
    } else {
        // If not in path, add it to expand
        currentPath.push(groupId);
    }
    
    renderGroups();
}

// Select a group and set the current path
function selectGroup(groupId) {
    currentGroupId = groupId;
    currentPath = getPathToGroup(groupId);
    
    // Add to recent groups
    addToRecentGroups(groupId);
    
    renderGroups();
    updateMainContentView();
    updateBreadcrumbs();
}

// Update breadcrumb navigation
function updateBreadcrumbs() {
    const breadcrumbContainer = document.querySelector('.breadcrumb-container');
    if (!breadcrumbContainer) return;
    
    breadcrumbContainer.innerHTML = '';
    
    // Create breadcrumb elements for each level in the path
    for (let i = 0; i < currentPath.length; i++) {
        const groupId = currentPath[i];
        const group = findGroupById(groupId);
        if (!group) continue;
        
        // Create breadcrumb item
        const breadcrumb = document.createElement('span');
        breadcrumb.className = 'breadcrumb-item';
        
        // Last item in path is current group
        if (i === currentPath.length - 1) {
            breadcrumb.classList.add('active');
            breadcrumb.textContent = group.name;
        } else {
            breadcrumb.innerHTML = `<a href="#" data-id="${groupId}">${group.name}</a> <span class="separator">›</span>`;
            
            // Add click event to navigate to this level
            const link = breadcrumb.querySelector('a');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                selectGroup(groupId);
            });
        }
        
        breadcrumbContainer.appendChild(breadcrumb);
    }
}

// Render links for the current group with shortcut-style cards
function renderLinks() {
    if (!currentGroupId) return;
    
    linksContainer.innerHTML = '';
    
    const currentGroup = findGroupById(currentGroupId);
    if (!currentGroup) return;
    
    currentGroupNameElement.textContent = currentGroup.name;
    
    if (!currentGroup.links || currentGroup.links.length === 0) {
        linksContainer.innerHTML = `
            <div class="empty-state">
                <p>No links in this group yet.</p>
                <p>Click the "Add Link" button to add your first link.</p>
            </div>
        `;
        return;
    }
    
    currentGroup.links.forEach(link => {
        // Get domain for favicon
        let faviconUrl;
        try {
            const url = new URL(link.url);
            faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
        } catch (e) {
            faviconUrl = '';
        }
        
        // Create shortcut-style card
        const linkCard = document.createElement('div');
        linkCard.className = 'link-card';
        linkCard.dataset.url = link.url;
        linkCard.dataset.id = link.id;
        
		
		// Create icon element
        const iconElement = document.createElement('div');
        iconElement.className = 'link-icon';
        iconElement.innerHTML = faviconUrl ? 
            `<img src="${faviconUrl}" alt="Site icon" onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
            <i class="fas fa-globe link-icon-fallback" style="display:none;"></i>` 
            : 
            `<i class="fas fa-globe link-icon-fallback"></i>`;
        
        // Create title element
        const titleElement = document.createElement('div');
        titleElement.className = 'link-title';
        titleElement.textContent = link.title;
        
        // Create menu button
        const menuButton = document.createElement('button');
        menuButton.className = 'link-menu-toggle';
        menuButton.dataset.id = link.id;
        menuButton.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
        
        // Create dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'link-dropdown-menu dropdown-menu';
        dropdown.id = `link-dropdown-${link.id}`;
        
        dropdown.innerHTML = `
            <a class="dropdown-item edit-link" data-id="${link.id}">
                <i class="fas fa-edit"></i> Edit
            </a>
            <a class="dropdown-item edit-note" data-id="${link.id}">
                <i class="fas fa-sticky-note"></i> ${link.note ? 'Edit Note' : 'Add Note'}
            </a>
            <a class="dropdown-item delete-link" data-id="${link.id}">
                <i class="fas fa-trash"></i> Delete
            </a>
        `;
        
        // Assemble the card
        linkCard.appendChild(iconElement);
        linkCard.appendChild(titleElement);
        linkCard.appendChild(menuButton);
        linkCard.appendChild(dropdown);
        
        // Add note indicator and content if note exists
        if (link.note && link.note.trim()) {
            // Create note indicator
            const noteIndicator = document.createElement('div');
            noteIndicator.className = 'note-indicator';
            noteIndicator.dataset.id = link.id;
            noteIndicator.innerHTML = '<i class="fas fa-sticky-note"></i> View note';
            
            // Create note content
            const noteContent = document.createElement('div');
            noteContent.className = 'note-content';
            noteContent.id = `note-${link.id}`;
            
            // Set RTL/LTR based on language
            if (BilingualTextSupport.containsHebrew(link.note)) {
                noteContent.classList.add('rtl');
            } else {
                noteContent.classList.add('ltr');
            }
            
            noteContent.textContent = link.note;
            
            linkCard.appendChild(noteIndicator);
            linkCard.appendChild(noteContent);
        }
        
        linksContainer.appendChild(linkCard);
    });
    
    // Add event listeners for card interactions
    setupCardEventListeners();
}

// Setup event listeners for shortcut-style cards
function setupCardEventListeners() {
    // Card click to open link
    document.querySelectorAll('.link-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Only open if not clicking menu, dropdown, or note elements
            if (!e.target.closest('.link-menu-toggle') && 
                !e.target.closest('.dropdown-menu') &&
                !e.target.closest('.note-indicator') &&
                !e.target.closest('.note-content')) {
                
                const url = card.dataset.url;
                if (url) {
                    window.open(url, '_blank');
                }
            }
        });
    });
    
    // Menu toggle buttons
    document.querySelectorAll('.link-menu-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const linkId = button.dataset.id;
            const dropdown = document.getElementById(`link-dropdown-${linkId}`);
            
            // Close all other dropdowns first
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                if (menu !== dropdown) {
                    menu.classList.remove('show');
                }
            });
            
            // Toggle this dropdown
            dropdown.classList.toggle('show');
        });
    });
    
    // Edit link option
    document.querySelectorAll('.edit-link').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditLinkModal(item.dataset.id);
            // Hide dropdown after action
            document.getElementById(`link-dropdown-${item.dataset.id}`).classList.remove('show');
        });
    });
    
    // Edit note option
    document.querySelectorAll('.edit-note').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            openNoteModal(item.dataset.id);
            // Hide dropdown after action
            document.getElementById(`link-dropdown-${item.dataset.id}`).classList.remove('show');
        });
    });
    
    // Delete link option
    document.querySelectorAll('.delete-link').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            openDeleteLinkConfirmation(item.dataset.id);
            // Hide dropdown after action
            document.getElementById(`link-dropdown-${item.dataset.id}`).classList.remove('show');
        });
    });
    
    // Note indicators
    document.querySelectorAll('.note-indicator').forEach(indicator => {
        indicator.addEventListener('click', (e) => {
            e.stopPropagation();
            const linkId = indicator.dataset.id;
            const noteContent = document.getElementById(`note-${linkId}`);
            
            // Toggle expanded state
            if (noteContent.classList.contains('expanded')) {
                noteContent.classList.remove('expanded');
                indicator.innerHTML = '<i class="fas fa-sticky-note"></i> View note';
            } else {
                noteContent.classList.add('expanded');
                indicator.innerHTML = '<i class="fas fa-sticky-note"></i> Hide note';
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-menu') && !e.target.closest('.link-menu-toggle')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
}

// Update main content view based on current state
function updateMainContentView() {
    if (groups.length === 0 || !currentGroupId) {
        emptyState.style.display = 'block';
        linksView.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        linksView.style.display = 'block';
        renderLinks();
    }
}

// Open modal
function openModal(modal) {
    modal.style.display = 'flex';
}

// Close all modals
function closeModal() {
    groupModal.style.display = 'none';
    linkModal.style.display = 'none';
    confirmDeleteModal.style.display = 'none';
    if (noteModal) noteModal.style.display = 'none';
    if (importExportModal) importExportModal.style.display = 'none';
}

// Open add group modal with optional parent group
function openAddGroupModal(parentId) {
    groupModalTitle.textContent = parentId ? 'Add Subgroup' : 'Add Group';
    groupNameInput.value = '';
    editingGroupId = null;
    
    // Store parent ID in a data attribute
    groupModal.dataset.parentId = parentId || '';
    
    // Handle parent group dropdown
    if (parentId) {
        groupParentContainer.style.display = 'none';
    } else {
        groupParentContainer.style.display = 'block';
        populateParentDropdown(groupParentSelect);
    }
    
    openModal(groupModal);
}

// Open edit group modal
function openEditGroupModal(groupId) {
    const group = findGroupById(groupId);
    if (!group) return;
    
    groupModalTitle.textContent = 'Edit Group';
    groupNameInput.value = group.name;
    editingGroupId = groupId;
    
    // Find parent ID for possible reassignment
    const parentGroup = findParentGroup(groupId);
    groupModal.dataset.parentId = parentGroup ? parentGroup.id : '';
    
    // Show parent group dropdown for moving between hierarchies
    groupParentContainer.style.display = 'block';
    
    // Populate the parent dropdown, excluding the current group and its descendants
    populateParentDropdown(groupParentSelect, groupId);
    
    openModal(groupModal);
}

// Populate the parent group dropdown, excluding the current group and its descendants
function populateParentDropdown(selectElement, excludeGroupId = null) {
    selectElement.innerHTML = '<option value="">Top Level (No Parent)</option>';
    
    function addGroupOptions(groupsArray, level = 0) {
        groupsArray.forEach(group => {
            // Skip the current group and its descendants to prevent circular references
            if (group.id === excludeGroupId) return;
            
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = '─'.repeat(level) + ' ' + group.name;
            option.selected = group.id === groupModal.dataset.parentId;
            selectElement.appendChild(option);
            
            // Recursively add subgroups
            if (group.subgroups && group.subgroups.length > 0) {
                addGroupOptions(group.subgroups, level + 1);
            }
        });
    }
    
    addGroupOptions(groups);
}

// Open add link modal
function openAddLinkModal() {
    linkModalTitle.textContent = 'Add Link';
    linkTitleInput.value = '';
    linkUrlInput.value = '';
    editingLinkId = null;
    openModal(linkModal);
}

// Open edit link modal
function openEditLinkModal(linkId) {
    const currentGroup = findGroupById(currentGroupId);
    if (!currentGroup) return;
    
    const link = currentGroup.links.find(link => link.id === linkId);
    if (!link) return;
    
    linkModalTitle.textContent = 'Edit Link';
    linkTitleInput.value = link.title;
    linkUrlInput.value = link.url;
    editingLinkId = linkId;
    openModal(linkModal);
}

// Open note modal for adding or editing a note
function openNoteModal(linkId) {
    const currentGroup = findGroupById(currentGroupId);
    if (!currentGroup) return;
    
    const link = currentGroup.links.find(link => link.id === linkId);
    if (!link) return;
    
    noteModalTitle.textContent = link.note ? 'Edit Note' : 'Add Note';
    noteContentInput.value = link.note || '';
    currentNoteLinkId = linkId;
    
    // Show/hide remove button based on whether there's an existing note
    if (link.note) {
        removeNoteButton.style.display = 'block';
    } else {
        removeNoteButton.style.display = 'none';
    }
    
    // Reset text direction
    BilingualTextSupport.detectLanguageAndSetDirection(noteContentInput, noteContentInput.value);
    
    openModal(noteModal);
}

// Open delete link confirmation
function openDeleteLinkConfirmation(linkId) {
    const currentGroup = findGroupById(currentGroupId);
    if (!currentGroup) return;
    
    const link = currentGroup.links.find(link => link.id === linkId);
    if (!link) return;
    
    confirmDeleteMessage.textContent = `Are you sure you want to delete "${link.title}"?`;
    itemToDeleteId = linkId;
    deleteType = 'link';
    openModal(confirmDeleteModal);
}

// Open delete group confirmation
function openDeleteGroupConfirmation(groupId) {
    const group = findGroupById(groupId);
    if (!group) return;
    
    let subgroupCount = 0;
    let linkCount = group.links ? group.links.length : 0;
    
    // Count all subgroups and their links recursively
    function countItems(subgroups) {
        subgroupCount += subgroups.length;
        subgroups.forEach(subgroup => {
            linkCount += subgroup.links ? subgroup.links.length : 0;
            if (subgroup.subgroups && subgroup.subgroups.length > 0) {
                countItems(subgroup.subgroups);
            }
        });
    }
    
    if (group.subgroups && group.subgroups.length > 0) {
        countItems(group.subgroups);
    }
    
    let message = `Are you sure you want to delete "${group.name}"`;
    if (subgroupCount > 0 || linkCount > 0) {
        message += ` and all its contents (${subgroupCount} subgroup${subgroupCount !== 1 ? 's' : ''}, ${linkCount} link${linkCount !== 1 ? 's' : ''})?`;
    } else {
        message += '?';
    }
    
    confirmDeleteMessage.textContent = message;
    itemToDeleteId = groupId;
    deleteType = 'group';
    openModal(confirmDeleteModal);
}

// Save group
function saveGroup() {
    const groupName = groupNameInput.value.trim();
    if (!groupName) {
        alert('Please enter a group name');
        return;
    }
    
    // Get parent ID from the form
    let parentId = groupModal.dataset.parentId || '';
    if (groupParentContainer.style.display !== 'none') {
        parentId = groupParentSelect.value;
    }
    
    if (editingGroupId) {
        // Edit existing group
        const currentGroup = findGroupById(editingGroupId);
        const currentParent = findParentGroup(editingGroupId);
        
        if (currentGroup) {
            // Update the name
            currentGroup.name = groupName;
            
            // Handle possible parent change
            if ((currentParent?.id || '') !== parentId) {
                // Remove from current parent
                if (currentParent) {
                    const index = currentParent.subgroups.findIndex(g => g.id === editingGroupId);
                    if (index !== -1) {
                        const removedGroup = currentParent.subgroups.splice(index, 1)[0];
                        
                        // Add to new parent
                        if (parentId) {
                            const newParent = findGroupById(parentId);
                            if (newParent) {
                                if (!newParent.subgroups) newParent.subgroups = [];
                                newParent.subgroups.push(removedGroup);
                            }
                        } else {
                            // Move to top level
                            groups.push(removedGroup);
                        }
                    }
                } else {
                    // Currently at top level, move to a parent
                    if (parentId) {
                        const index = groups.findIndex(g => g.id === editingGroupId);
                        if (index !== -1) {
                            const removedGroup = groups.splice(index, 1)[0];
                            const newParent = findGroupById(parentId);
                            if (newParent) {
                                if (!newParent.subgroups) newParent.subgroups = [];
                                newParent.subgroups.push(removedGroup);
                            }
                        }
                    }
                }
            }
        }
    } else {
        // Add new group/subgroup
        const newGroup = {
            id: Date.now().toString(),
            name: groupName,
            links: [],
            subgroups: []
        };
        
        if (parentId) {
            // Add as subgroup
            const parentGroup = findGroupById(parentId);
            if (parentGroup) {
                if (!parentGroup.subgroups) parentGroup.subgroups = [];
                parentGroup.subgroups.push(newGroup);
                
                // Select the new subgroup
                currentGroupId = newGroup.id;
                currentPath = getPathToGroup(newGroup.id);
            }
        } else {
            // Add as top-level group
            groups.push(newGroup);
            
            // Select the new group if no group is currently selected
            if (!currentGroupId) {
                currentGroupId = newGroup.id;
                currentPath = [newGroup.id];
            }
        }
    }
    
    // Save to localStorage and update UI
    saveData();
    renderGroups();
    updateMainContentView();
    updateBreadcrumbs();
    closeModal();
}

// Save link
function saveLink() {
    const linkTitle = linkTitleInput.value.trim();
    let linkUrl = linkUrlInput.value.trim();
    
    if (!linkTitle || !linkUrl) {
        alert('Please enter both title and URL');
        return;
    }
    
    // Add https:// if not present
    if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
        linkUrl = 'https://' + linkUrl;
    }
    
    const currentGroup = findGroupById(currentGroupId);
    if (!currentGroup) return;
    
    // Initialize links array if it doesn't exist
    if (!currentGroup.links) {
        currentGroup.links = [];
    }
    
    if (editingLinkId) {
        // Edit existing link
        const linkIndex = currentGroup.links.findIndex(link => link.id === editingLinkId);
        if (linkIndex !== -1) {
            // Preserve the note if it exists
            const existingNote = currentGroup.links[linkIndex].note;
            
            currentGroup.links[linkIndex].title = linkTitle;
            currentGroup.links[linkIndex].url = linkUrl;
            
            // Keep the note if it exists
            if (existingNote) {
                currentGroup.links[linkIndex].note = existingNote;
            }
        }
    } else {
        // Add new link
        const newLink = {
            id: Date.now().toString(),
            title: linkTitle,
            url: linkUrl
        };
        currentGroup.links.push(newLink);
    }
    
    // Save to localStorage and update UI
    saveData();
    renderLinks();
    closeModal();
}

// Save note
function saveNote() {
    if (!currentNoteLinkId) return;
    
    const currentGroup = findGroupById(currentGroupId);
    if (!currentGroup) return;
    
    const noteText = noteContentInput.value.trim();
    const index = currentGroup.links.findIndex(link => link.id === currentNoteLinkId);
    
    if (index !== -1) {
        currentGroup.links[index].note = noteText;
        saveData();
        renderLinks();
        closeModal();
    }
}

// Remove note
function removeNote() {
    if (!currentNoteLinkId) return;
    
    const currentGroup = findGroupById(currentGroupId);
    if (!currentGroup) return;
    
    const index = currentGroup.links.findIndex(link => link.id === currentNoteLinkId);
    
    if (index !== -1) {
        delete currentGroup.links[index].note;
        saveData();
        renderLinks();
        closeModal();
    }
}

// Confirm delete
function confirmDelete() {
    if (deleteType === 'group') {
        deleteGroup(itemToDeleteId);
    } else if (deleteType === 'link') {
        deleteLink(itemToDeleteId);
    }
    closeModal();
}

// Delete group (and all subgroups)
function deleteGroup(groupId) {
    const parentGroup = findParentGroup(groupId);
    
    if (parentGroup) {
        // Remove from parent's subgroups
        const index = parentGroup.subgroups.findIndex(g => g.id === groupId);
        if (index !== -1) {
            parentGroup.subgroups.splice(index, 1);
        }
    } else {
        // Remove from top level
        const index = groups.findIndex(g => g.id === groupId);
        if (index !== -1) {
            groups.splice(index, 1);
        }
    }
    
    // If the deleted group was the current group, select parent or another group
    if (currentGroupId === groupId) {
        if (parentGroup) {
            currentGroupId = parentGroup.id;
            currentPath = getPathToGroup(parentGroup.id);
        } else {
            currentGroupId = groups.length > 0 ? groups[0].id : null;
            currentPath = currentGroupId ? [currentGroupId] : [];
        }
    }
    
    saveData();
    renderGroups();
    updateMainContentView();
    updateBreadcrumbs();
}

// Delete link
function deleteLink(linkId) {
    const currentGroup = findGroupById(currentGroupId);
    if (!currentGroup || !currentGroup.links) return;
    
    const linkIndex = currentGroup.links.findIndex(link => link.id === linkId);
    if (linkIndex === -1) return;
    
    currentGroup.links.splice(linkIndex, 1);
    
    saveData();
    renderLinks();
}

// Handle export groups function
function handleExportGroups() {
    try {
        // Prepare data to export (groups and user preferences)
        const exportData = {
            groups: groups,
            favorites: favoriteGroups,
            recent: recentGroups
        };
        
        // Convert to JSON string
        const jsonData = JSON.stringify(exportData, null, 2);
        
        // Create a Blob with the JSON data
        const blob = new Blob([jsonData], { type: 'application/json' });
        
        // Create a download URL
        const url = URL.createObjectURL(blob);
        
        // Create a temporary anchor element to trigger download
        const a = document.createElement('a');
        a.href = url;
        
        // Set filename with current date
        const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        a.download = `link-manager-backup-${date}.json`;
        
        // Append to body, click to download, then remove
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Revoke the URL to free up memory
        URL.revokeObjectURL(url);
        
        // Show success notification
        showNotification('Export completed successfully');
    } catch (error) {
        console.error('Export error:', error);
        alert('There was an error exporting your data. Please try again.');
    }
}

// Handle import groups function
function handleImportGroups() {
    const fileInput = importGroupsInput;
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a file to import');
        return;
    }
    
    const file = fileInput.files[0];
    if (file.type !== 'application/json') {
        alert('Please select a valid JSON file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate the imported data structure
            if (!importedData.groups || !Array.isArray(importedData.groups)) {
                throw new Error('Invalid data format: Missing or invalid groups array');
            }
            
            // Confirm with the user before replacing existing data
            if (confirm(`Import ${importedData.groups.length} groups? This will replace your current groups and settings.`)) {
                // Replace current data with imported data
                groups = importedData.groups;
                
                // Also import user preferences if available
                if (importedData.favorites && Array.isArray(importedData.favorites)) {
                    favoriteGroups = importedData.favorites;
                }
                
                if (importedData.recent && Array.isArray(importedData.recent)) {
                    recentGroups = importedData.recent;
                }
                
                // Reset current selection
                currentGroupId = null;
                currentPath = [];
                
                // Save all data
                saveData();
                
                // Re-render the UI
                renderGroups();
                renderFavorites();
                renderRecentGroups();
                updateMainContentView();
                
                // Close modal and show success message
                closeModal();
                showNotification('Import completed successfully');
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing data. Please check that the file is a valid Link Manager backup.');
        }
    };
    
    reader.readAsText(file);
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('linkGroups', JSON.stringify(groups));
    
    // Also save user preferences
    saveUserPreferences();
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', init);		