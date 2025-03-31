// Link Manager Application - Health Check & Import/Export

// ===== Link Health Checking =====

function checkLinksHealth() {
  // Check if enough time has passed since last check
  const now = new Date().getTime();
  const lastCheck = state.settings.lastHealthCheck ? new Date(state.settings.lastHealthCheck).getTime() : 0;
  const interval = state.settings.linkHealthCheckInterval * 1000; // Convert to milliseconds
  
  if (now - lastCheck < interval) {
    console.log('Not time for health check yet');
    return;
  }
  
  console.log('Starting link health check...');
  state.settings.lastHealthCheck = new Date().toISOString();
  saveToStorage();
  
  // For demonstration purposes, we'll use a browser-only approach
  // In a real app, you'd use a server-side solution or browser extension
  async function checkAllLinks() {
    let checkedCount = 0;
    
    for (const link of state.links) {
      // Skip if recently checked (within last day)
      if (link.lastChecked) {
        const lastCheckedTime = new Date(link.lastChecked).getTime();
        if (now - lastCheckedTime < 86400000) { // 24 hours in milliseconds
          continue;
        }
      }
      
      // Simple browser-based check using favicon
      await checkLinkHealthBrowserOnly(link);
      checkedCount++;
      
      // Update UI after each 5 links
      if (checkedCount % 5 === 0) {
        renderLinks();
      }
    }
    
    console.log(`Finished checking ${checkedCount} links`);
    saveToStorage();
    renderLinks();
  }
  
  // Browser-only check without proxy
  function checkLinkHealthBrowserOnly(link) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        link.status = 'ok';
        link.lastChecked = new Date().toISOString();
        resolve(true);
      };
      img.onerror = () => {
        // Error doesn't necessarily mean the link is broken
        link.status = 'unknown';
        link.lastChecked = new Date().toISOString();
        resolve(false);
      };
      
      // Try to load the favicon
      try {
        const domain = new URL(link.url).hostname;
        img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      } catch (e) {
        link.status = 'error';
        link.lastChecked = new Date().toISOString();
        resolve(false);
      }
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (!link.lastChecked || new Date(link.lastChecked).getTime() < now) {
          link.status = 'timeout';
          link.lastChecked = new Date().toISOString();
          resolve(false);
        }
      }, 5000);
    });
  }
  
  // Start checking links in the background
  checkAllLinks();
}

// Initialize health checking
function initializeHealthChecking() {
  // Add health check button to the header actions
  const headerActions = document.querySelector('.header-actions');
  if (!headerActions) return;
  
  if (!document.getElementById('healthCheckBtn')) {
    const healthCheckBtn = document.createElement('button');
    healthCheckBtn.className = 'header-action-button';
    healthCheckBtn.id = 'healthCheckBtn';
    healthCheckBtn.title = 'Check Links';
    healthCheckBtn.innerHTML = `
      <i class="fa fa-heartbeat"></i>
      <span class="button-text">Check Links</span>
    `;
    
    healthCheckBtn.addEventListener('click', () => {
      // Reset last check time to force a new check
      state.settings.lastHealthCheck = null;
      checkLinksHealth();
      alert('Link health check started. This may take some time.');
    });
    
    // Insert before the settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      headerActions.insertBefore(healthCheckBtn, settingsBtn);
    } else {
      headerActions.appendChild(healthCheckBtn);
    }
  }
  
  // Add CSS for health indicators if not already present
  if (!document.getElementById('health-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'health-styles';
    styleElement.innerHTML = `
      .link-health-indicator {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 16px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      
      .status-ok {
        color: var(--secondary-color);
      }
      
      .status-error {
        color: var(--danger-color);
      }
      
      .status-unknown {
        color: var(--text-secondary);
      }
      
      .status-warning {
        color: var(--accent-color);
      }
      
      /* Position indicator in list view */
      .link-list .link-health-indicator {
        position: static;
        margin-left: 8px;
      }
    `;
    
    document.head.appendChild(styleElement);
  }
  
  // Start checking links on app load
  setTimeout(checkLinksHealth, 5000); // Wait 5 seconds after load
}

// ===== Import/Export Functions =====

function exportData() {
  const dataToExport = JSON.stringify(state, null, 2);
  const blob = new Blob([dataToExport], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create a download link and trigger it
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `link-manager-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  // Update last backup timestamp
  state.settings.lastBackup = new Date().toISOString();
  saveToStorage();
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function importData(jsonData) {
  try {
    const importedData = JSON.parse(jsonData);
    
    // Validate imported data
    if (!importedData.links || !Array.isArray(importedData.links)) {
      throw new Error('Invalid data format: links array missing');
    }
    
    // Confirm with user
    const linkCount = importedData.links.length;
    const groupCount = importedData.groups ? importedData.groups.length : 0;
    const tagCount = importedData.tags ? importedData.tags.length : 0;
    
    const confirmMessage = `
      This will import:
      - ${linkCount} links
      - ${groupCount} groups
      - ${tagCount} tags
      
      Do you want to:
      1. Replace all existing data
      2. Merge with existing data
      3. Cancel
    `;
    
    const userChoice = prompt(confirmMessage, "2");
    
    if (!userChoice || userChoice === "3") {
      return false;
    }
    
    if (userChoice === "1") {
      // Replace all data
      Object.assign(state, importedData);
    } else if (userChoice === "2") {
      // Merge data
      mergeImportedData(importedData);
    } else {
      alert("Invalid choice. Import canceled.");
      return false;
    }
    
    saveToStorage();
    renderGroups();
    renderTags();
    renderLinks();
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    alert(`Error importing data: ${error.message}`);
    return false;
// Function to import browser bookmarks
function importBrowserBookmarks(bookmarkData) {
  try {
    // Parse the HTML content (most browsers export bookmarks as HTML)
    const parser = new DOMParser();
    const bookmarkDoc = parser.parseFromString(bookmarkData, 'text/html');
    
    // Find all bookmark links
    const bookmarkLinks = bookmarkDoc.querySelectorAll('a');
    
    if (bookmarkLinks.length === 0) {
      throw new Error('No bookmarks found in the imported file');
    }
    
    // Confirm with user
    const confirmImport = confirm(`Found ${bookmarkLinks.length} bookmarks. Do you want to import them?`);
    if (!confirmImport) return false;
    
    // Create a "Imported Bookmarks" group if it doesn't exist
    let importGroup = state.groups.find(g => g.name === 'Imported Bookmarks');
    if (!importGroup) {
      importGroup = {
        id: generateId(),
        name: 'Imported Bookmarks',
        color: '#4285F4',
        dateCreated: new Date().toISOString()
      };
      state.groups.push(importGroup);
    }
    
    // Process each bookmark link
    const importedLinks = [];
    bookmarkLinks.forEach(link => {
      const url = link.href;
      const title = link.textContent.trim();
      
      // Skip if URL is invalid or if it's already in the collection
      if (!url || !title || url.startsWith('javascript:') || state.links.some(l => l.url === url)) {
        return;
      }
      
      // Extract parent folder as a potential tag
      let tag = null;
      let parentNode = link.parentNode;
      while (parentNode && !tag) {
        if (parentNode.tagName === 'H3') {
          tag = parentNode.textContent.trim();
          break;
        }
        parentNode = parentNode.parentNode;
      }
      
      // Create new link object
      const newLink = {
        id: generateId(),
        url: url,
        title: title,
        groupId: importGroup.id,
        remarks: `Imported bookmark from "${tag || 'Unknown folder'}"`,
        dateAdded: new Date().toISOString(),
        visitCount: 0,
        tags: tag ? [tag] : []
      };
      
      importedLinks.push(newLink);
      
      // Create tag if it doesn't exist
      if (tag) {
        createOrGetTag(tag);
      }
    });
    
    // Add links to state
    state.links = [...state.links, ...importedLinks];
    saveToStorage();
    renderGroups();
    renderTags();
    renderLinks();
    
    alert(`Successfully imported ${importedLinks.length} bookmarks.`);
    return true;
  } catch (error) {
    console.error('Error importing bookmarks:', error);
    alert(`Error importing bookmarks: ${error.message}`);
    return false;
  }
}

// Initialize import/export functionality
function initializeImportExport() {
  // Add event listeners for import/export buttons
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }
  
  const importInput = document.getElementById('importInput');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target.result;
        
        // Check file type and process accordingly
        if (file.name.endsWith('.json')) {
          importData(fileContent);
        } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
          importBrowserBookmarks(fileContent);
        } else {
          alert('Unsupported file format. Please upload a .json or .html file.');
        }
        
        // Reset the input so the same file can be selected again
        importInput.value = '';
      };
      
      if (file.name.endsWith('.json')) {
        reader.readAsText(file);
      } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        reader.readAsText(file);
      } else {
        alert('Unsupported file format. Please upload a .json or .html file.');
        importInput.value = '';
      }
    });
  }
  
  // Add import bookmarks option to dropdown
  const dropdownContent = document.querySelector('.dropdown-content');
  if (dropdownContent) {
    // Check if it already exists
    if (!document.getElementById('importBookmarksBtn')) {
      const importBookmarksLabel = document.createElement('label');
      importBookmarksLabel.className = 'dropdown-item';
      importBookmarksLabel.id = 'importBookmarksBtn';
      importBookmarksLabel.innerHTML = `
        <i class="fa fa-bookmark"></i>
        <span>Import Bookmarks</span>
        <input type="file" id="importBookmarksInput" accept=".html, .htm" style="display: none;">
      `;
      dropdownContent.appendChild(importBookmarksLabel);
      
      const importBookmarksInput = document.getElementById('importBookmarksInput');
      if (importBookmarksInput) {
        importBookmarksInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          
          const reader = new FileReader();
          reader.onload = (event) => {
            importBrowserBookmarks(event.target.result);
            importBookmarksInput.value = '';
          };
          reader.readAsText(file);
        });
      }
    }
  }
}

// Function to merge imported data with existing data
function mergeImportedData(importedData) {
  // Merge groups
  if (importedData.groups && Array.isArray(importedData.groups)) {
    importedData.groups.forEach(importedGroup => {
      // Check if group already exists
      const existingGroup = state.groups.find(g => 
        g.name.toLowerCase() === importedGroup.name.toLowerCase()
      );
      
      if (!existingGroup) {
        // Generate new ID to avoid conflicts
        importedGroup.id = generateId();
        state.groups.push(importedGroup);
      }
    });
  }
  
  // Merge tags
  if (importedData.tags && Array.isArray(importedData.tags)) {
    importedData.tags.forEach(importedTag => {
      // Check if tag already exists
      const existingTag = state.tags.find(t => 
        t.name.toLowerCase() === importedTag.name.toLowerCase()
      );
      
      if (!existingTag) {
        // Generate new ID to avoid conflicts
        importedTag.id = generateId();
        state.tags.push(importedTag);
      } else {
        // Update linkCount
        existingTag.linkCount += importedTag.linkCount;
      }
    });
  }
  
  // Merge links
  if (importedData.links && Array.isArray(importedData.links)) {
    importedData.links.forEach(importedLink => {
      // Check if link already exists
      const existingLink = state.links.find(l => 
        l.url === importedLink.url
      );
      
      if (!existingLink) {
        // Generate new ID to avoid conflicts
        importedLink.id = generateId();
        
        // Update group references
        if (importedLink.groupId) {
          const importedGroup = importedData.groups.find(g => g.id === importedLink.groupId);
          if (importedGroup) {
            const matchingGroup = state.groups.find(g => 
              g.name.toLowerCase() === importedGroup.name.toLowerCase()
            );
            if (matchingGroup) {
              importedLink.groupId = matchingGroup.id;
            } else {
              importedLink.groupId = null;
            }
          }
        }
        
        state.links.push(importedLink);
      }
    });
  }
  
  // Merge settings
  if (importedData.settings) {
    // Preserve user theme preference
    const currentTheme = state.settings.theme;
    
    // Preserve view mode
    const currentViewMode = state.settings.viewMode;
    
    // Merge settings but keep current theme and view mode
    state.settings = {
      ...importedData.settings,
      theme: currentTheme,
      viewMode: currentViewMode
    };
  }
}