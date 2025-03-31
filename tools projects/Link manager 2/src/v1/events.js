// Link Manager Application - Event Listeners

// Initialize all event listeners
function initializeEventListeners() {
  console.log('Initializing event listeners');
  
  // Group management event listeners
  initializeGroupEvents();
  
  // Link management event listeners
  initializeLinkEvents();
  
  // Theme toggle
  initializeThemeToggle();
}

// Initialize group-related events
function initializeGroupEvents() {
  // Add Group button
  const addGroupBtn = document.getElementById('addGroupBtn');
  if (addGroupBtn) {
    addGroupBtn.addEventListener('click', () => {
      const addGroupModal = document.getElementById('addGroupModal');
      if (addGroupModal) addGroupModal.style.display = 'flex';
    });
  }

  // Add Group form
  const addGroupForm = document.getElementById('addGroupForm');
  if (addGroupForm) {
    addGroupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const groupName = document.getElementById('groupName').value.trim();
      const groupColor = document.getElementById('groupColor').value;
      
      // Validate
      if (!groupName) {
        alert('Group name is required');
        return;
      }
      
      // Check for duplicate
      if (state.groups.some(g => g.name.toLowerCase() === groupName.toLowerCase())) {
        alert('A group with this name already exists. Please choose a different name.');
        return;
      }
      
      // Create group
      const group = {
        id: generateId(),
        name: groupName,
        color: groupColor,
        dateCreated: new Date().toISOString()
      };
      
      state.groups.push(group);
      saveToStorage();
      renderGroups();
      
      // Reset and close
      addGroupForm.reset();
      document.getElementById('colorPreview').style.backgroundColor = '#4285F4';
      document.getElementById('addGroupModal').style.display = 'none';
    });
  }

  // Group color picker
  const groupColor = document.getElementById('groupColor');
  const colorPreview = document.getElementById('colorPreview');
  if (groupColor && colorPreview) {
    groupColor.addEventListener('input', (e) => {
      colorPreview.style.backgroundColor = e.target.value;
    });
  }

  // Group modal close
  const closeGroupModal = document.getElementById('closeGroupModal');
  if (closeGroupModal) {
    closeGroupModal.addEventListener('click', () => {
      document.getElementById('addGroupModal').style.display = 'none';
    });
  }

  // Cancel Group button
  const cancelGroupBtn = document.getElementById('cancelGroupBtn');
  if (cancelGroupBtn) {
    cancelGroupBtn.addEventListener('click', () => {
      document.getElementById('addGroupModal').style.display = 'none';
    });
  }

  // Group sidebar toggle
  const toggleGroupsHeader = document.getElementById('toggleGroupsHeader');
  if (toggleGroupsHeader) {
    toggleGroupsHeader.addEventListener('click', () => {
      const groupsList = document.getElementById('groupsList');
      if (groupsList) {
        groupsList.style.display = groupsList.style.display === 'none' ? 'block' : 'none';
        const icon = toggleGroupsHeader.querySelector('i:first-child');
        if (icon) {
          icon.className = groupsList.style.display === 'none' ? 'fa fa-chevron-right' : 'fa fa-chevron-down';
        }
      }
    });
  }

  // Tag sidebar toggle
  const toggleTagsHeader = document.getElementById('toggleTagsHeader');
  if (toggleTagsHeader) {
    toggleTagsHeader.addEventListener('click', () => {
      const tagsList = document.getElementById('tagsList');
      if (tagsList) {
        tagsList.style.display = tagsList.style.display === 'none' ? 'block' : 'none';
        const icon = toggleTagsHeader.querySelector('i:first-child');
        if (icon) {
          icon.className = tagsList.style.display === 'none' ? 'fa fa-chevron-right' : 'fa fa-chevron-down';
        }
      }
    });
  }
}

// Initialize link-related events
function initializeLinkEvents() {
  // Add Link button
  const addLinkBtn = document.getElementById('addLinkBtn');
  if (addLinkBtn) {
    addLinkBtn.addEventListener('click', () => {
      const addLinkModal = document.getElementById('addLinkModal');
      if (addLinkModal) {
        // Populate group dropdown
        const linkGroup = document.getElementById('linkGroup');
        if (linkGroup) {
          linkGroup.innerHTML = '<option value="">Select a group</option>';
          state.groups.forEach(g => {
            const option = document.createElement('option');
            option.value = g.id;
            option.textContent = g.name;
            linkGroup.appendChild(option);
          });
        }
        
        // Reset the form
        const addLinkForm = document.getElementById('addLinkForm');
        if (addLinkForm) {
          addLinkForm.reset();
        }
        
        // Clear the tags display
        const tagsDisplay = document.getElementById('tagsDisplay');
        if (tagsDisplay) {
          tagsDisplay.innerHTML = '';
        }
        
        // Reset selected tags
        window.selectedTags = [];
        
        addLinkModal.style.display = 'flex';
      }
    });
  }

  // Close Link modal
  const closeLinkModal = document.getElementById('closeLinkModal');
  if (closeLinkModal) {
    closeLinkModal.addEventListener('click', () => {
      document.getElementById('addLinkModal').style.display = 'none';
    });
  }

  // Cancel Link button
  const cancelLinkBtn = document.getElementById('cancelLinkBtn');
  if (cancelLinkBtn) {
    cancelLinkBtn.addEventListener('click', () => {
      document.getElementById('addLinkModal').style.display = 'none';
    });
  }

  // Close Edit modal
  const closeEditModal = document.getElementById('closeEditModal');
  if (closeEditModal) {
    closeEditModal.addEventListener('click', () => {
      document.getElementById('editLinkModal').style.display = 'none';
    });
  }

  // Cancel Edit button
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      document.getElementById('editLinkModal').style.display = 'none';
    });
  }
}

// Initialize theme toggle
function initializeThemeToggle() {
  const toggleThemeBtn = document.getElementById('toggleThemeBtn');
  if (toggleThemeBtn) {
    // Update icon
    const updateThemeIcon = () => {
      toggleThemeBtn.innerHTML = `<i class="fa ${state.settings.theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>`;
      toggleThemeBtn.title = `Switch to ${state.settings.theme === 'dark' ? 'Light' : 'Dark'} Theme`;
    };
    
    updateThemeIcon();
    
    toggleThemeBtn.addEventListener('click', () => {
      state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light';
      document.getElementById('app').classList.toggle('dark');
      updateThemeIcon();
      saveToStorage();
    });
  }
}
