// Link Manager Application - Core Functionality

// State management
const state = {
  groups: [],
  tags: [],
  links: [],
  settings: {
    theme: 'light',
    viewMode: 'grid',
    sortBy: 'dateAdded',
    sortDirection: 'desc',
    linkHealthCheckInterval: 604800, // 7 days in seconds
    lastHealthCheck: null,
    lastBackup: null
  },
  selectedGroupId: 'all',
  selectedTagId: null,
  searchQuery: ''
};

// DOM Elements
const elements = {
  app: null,
  addLinkBtn: null,
  addGroupBtn: null,
  toggleViewBtn: null,
  toggleThemeBtn: null,
  searchInput: null,
  groupsList: null,
  tagsList: null,
  linkContainer: null,
  
  // Group modal elements
  addGroupModal: null,
  closeGroupModal: null,
  addGroupForm: null,
  groupName: null,
  groupColor: null,
  colorPreview: null,
  cancelGroupBtn: null,
  
  // Link modal elements
  addLinkModal: null,
  closeLinkModal: null,
  addLinkForm: null,
  linkUrl: null,
  linkTitle: null,
  linkGroup: null,
  linkRemarks: null,
  cancelLinkBtn: null,
  
  // Edit modal elements
  editLinkModal: null,
  closeEditModal: null,
  editLinkForm: null,
  editLinkId: null,
  editLinkUrl: null,
  editLinkTitle: null,
  editLinkGroup: null,
  editLinkRemarks: null,
  cancelEditBtn: null,
  
  // Preview modal elements
  linkPreviewModal: null,
  closePreviewModal: null,
  previewContent: null,
  previewLink: null,
  closePreviewBtn: null,
  
  // Import/Export elements
  exportBtn: null,
  importInput: null
};

// ===== Utility Functions =====

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function saveToStorage() {
  localStorage.setItem('linkManagerData', JSON.stringify(state));
}

function loadFromStorage() {
  const data = localStorage.getItem('linkManagerData');
  if (data) {
    const parsedData = JSON.parse(data);
    
    // Make sure all required properties exist
    if (!parsedData.tags) parsedData.tags = [];
    if (!parsedData.groups) parsedData.groups = [];
    if (!parsedData.links) parsedData.links = [];
    if (!parsedData.settings) parsedData.settings = state.settings;
    if (!parsedData.selectedGroupId) parsedData.selectedGroupId = 'all';
    
    Object.assign(state, parsedData);
    
    if (state.settings.theme === 'dark' && elements.app) {
      elements.app.classList.add('dark');
    }
  }
}

function getGroupName(groupId) {
  const group = state.groups.find(g => g.id === groupId);
  return group ? group.name : 'Uncategorized';
}

// Initialize all DOM elements
function initializeElements() {
  elements.app = document.getElementById('app');
  elements.addLinkBtn = document.getElementById('addLinkBtn');
  elements.addGroupBtn = document.getElementById('addGroupBtn');
  elements.toggleViewBtn = document.getElementById('toggleViewBtn');
  elements.toggleThemeBtn = document.getElementById('toggleThemeBtn');
  elements.searchInput = document.getElementById('searchInput');
  elements.groupsList = document.getElementById('groupsList');
  elements.tagsList = document.getElementById('tagsList');
  elements.linkContainer = document.getElementById('linkContainer');
  
  // Group modal elements
  elements.addGroupModal = document.getElementById('addGroupModal');
  elements.closeGroupModal = document.getElementById('closeGroupModal');
  elements.addGroupForm = document.getElementById('addGroupForm');
  elements.groupName = document.getElementById('groupName');
  elements.groupColor = document.getElementById('groupColor');
  elements.colorPreview = document.getElementById('colorPreview');
  elements.cancelGroupBtn = document.getElementById('cancelGroupBtn');
  
  // Link modal elements
  elements.addLinkModal = document.getElementById('addLinkModal');
  elements.closeLinkModal = document.getElementById('closeLinkModal');
  elements.addLinkForm = document.getElementById('addLinkForm');
  elements.linkUrl = document.getElementById('linkUrl');
  elements.linkTitle = document.getElementById('linkTitle');
  elements.linkGroup = document.getElementById('linkGroup');
  elements.linkRemarks = document.getElementById('linkRemarks');
  elements.cancelLinkBtn = document.getElementById('cancelLinkBtn');
  
  // Edit modal elements
  elements.editLinkModal = document.getElementById('editLinkModal');
  elements.closeEditModal = document.getElementById('closeEditModal');
  elements.editLinkForm = document.getElementById('editLinkForm');
  elements.editLinkId = document.getElementById('editLinkId');
  elements.editLinkUrl = document.getElementById('editLinkUrl');
  elements.editLinkTitle = document.getElementById('editLinkTitle');
  elements.editLinkGroup = document.getElementById('editLinkGroup');
  elements.editLinkRemarks = document.getElementById('editLinkRemarks');
  elements.cancelEditBtn = document.getElementById('cancelEditBtn');
  
  // Preview modal elements
  elements.linkPreviewModal = document.getElementById('linkPreviewModal');
  elements.closePreviewModal = document.getElementById('closePreviewModal');
  elements.previewContent = document.getElementById('previewContent');
  elements.previewLink = document.getElementById('previewLink');
  elements.closePreviewBtn = document.getElementById('closePreviewBtn');
  
  // Import/Export elements
  elements.exportBtn = document.getElementById('exportBtn');
  elements.importInput = document.getElementById('importInput');
  
  // Add a log for any missing elements
  Object.keys(elements).forEach(key => {
    if (!elements[key] && key !== 'selectedTagId') {
      console.warn(`Element not found: ${key}`);
    }
  });
  
  // Add shorthand for document.querySelector
  window.$ = document.querySelector.bind(document);
  window.$$ = document.querySelectorAll.bind(document);
}

// Main initialization function
function initialize() {
  console.log('Initializing Link Manager application');
  
  // Get all DOM elements
  initializeElements();
  
  // Load data from storage
  loadFromStorage();
  
  // Initialize core functionality
  initializeEventListeners();
  
  // Initialize enhanced features
  initializeTagInputs();
  initializeSearchFiltering();
  initializeViewToggle();
  initializeImportExport();
  initializeHealthChecking();
  initializeLinkPreview();
  enhanceAddLinkForm();
  
  // Render UI
  renderGroups();
  renderTags();
  renderLinks();
  
  console.log('Initialization complete');
}

// Initialize search and filtering
function initializeSearchFiltering() {
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      renderLinks();
    });
    
    elements.searchInput.addEventListener('focus', () => {
      const searchContainer = document.getElementById('searchContainer');
      if (searchContainer) {
        searchContainer.classList.add('focused');
      }
    });
    
    elements.searchInput.addEventListener('blur', () => {
      const searchContainer = document.getElementById('searchContainer');
      if (searchContainer) {
        searchContainer.classList.remove('focused');
      }
    });
  }
}

// Initialize view toggle (grid/list)
function initializeViewToggle() {
  if (elements.toggleViewBtn) {
    // Update the icon based on current view mode
    const updateViewIcon = () => {
      elements.toggleViewBtn.innerHTML = `<i class="fa ${state.settings.viewMode === 'grid' ? 'fa-list' : 'fa-th-large'}"></i>`;
      elements.toggleViewBtn.title = `Switch to ${state.settings.viewMode === 'grid' ? 'List' : 'Grid'} View`;
    };
    
    updateViewIcon();
    
    elements.toggleViewBtn.addEventListener('click', () => {
      state.settings.viewMode = state.settings.viewMode === 'grid' ? 'list' : 'grid';
      updateViewIcon();
      saveToStorage();
      renderLinks();
    });
  }
}

// Main document ready function
// This is already in main.js
