// Link Manager Application - Tags Management

// ===== Tag Management Functions =====

function createOrGetTag(tagName) {
  tagName = tagName.trim().toLowerCase();
  if (!tagName) return null;
  
  // Check if tag already exists
  let tag = state.tags.find(t => t.name.toLowerCase() === tagName);
  
  // If not, create a new tag
  if (!tag) {
    // Generate a random color for the tag
    const colors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', 
                   '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
                   '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', 
                   '#FF5722', '#795548', '#607D8B'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    tag = {
      id: generateId(),
      name: tagName,
      color: randomColor,
      linkCount: 0
    };
    
    state.tags.push(tag);
  }
  
  return tag;
}

function addTagToLink(linkId, tagName) {
  const link = state.links.find(l => l.id === linkId);
  if (!link) return false;
  
  if (!link.tags) link.tags = [];
  
  // Check if tag is already on the link
  if (link.tags.some(t => t.toLowerCase() === tagName.toLowerCase())) {
    return false;
  }
  
  const tag = createOrGetTag(tagName);
  if (tag) {
    link.tags.push(tag.name);
    tag.linkCount++;
    saveToStorage();
    return true;
  }
  
  return false;
}

function removeTagFromLink(linkId, tagName) {
  const link = state.links.find(l => l.id === linkId);
  if (!link || !link.tags) return false;
  
  const tagIndex = link.tags.findIndex(t => t.toLowerCase() === tagName.toLowerCase());
  if (tagIndex === -1) return false;
  
  link.tags.splice(tagIndex, 1);
  
  // Update tag count
  const tag = state.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
  if (tag) {
    tag.linkCount--;
    // Remove tag if not used anymore
    if (tag.linkCount <= 0) {
      state.tags = state.tags.filter(t => t.id !== tag.id);
    }
  }
  
  saveToStorage();
  return true;
}

function renderTags() {
  if (!elements.tagsList) {
    console.error('tagsList element not found');
    return;
  }
  
  elements.tagsList.innerHTML = '';
  
  // Sort tags by link count (descending)
  const sortedTags = [...state.tags].sort((a, b) => b.linkCount - a.linkCount);
  
  sortedTags.forEach(tag => {
    const li = document.createElement('li');
    li.className = `sidebar-item ${state.selectedTagId === tag.id ? 'active' : ''}`;
    li.dataset.tagId = tag.id;
    li.innerHTML = `
      <div class="tag-color" style="background-color: ${tag.color}"></div>
      <span>${tag.name}</span>
      <span class="item-count">${tag.linkCount}</span>
    `;
    
    li.addEventListener('click', () => {
      // Toggle tag selection
      state.selectedTagId = state.selectedTagId === tag.id ? null : tag.id;
      renderTags();
      renderLinks();
    });
    
    elements.tagsList.appendChild(li);
  });
}

// ===== Tag Input Initialization =====

// Initialize tag inputs for add and edit forms
function initializeTagInputs() {
  // For adding new link
  const tagInput = document.getElementById('linkTags');
  const tagsDisplay = document.getElementById('tagsDisplay');
  
  if (tagInput && tagsDisplay) {
    // Initialize selected tags array for add form
    window.selectedTags = [];
    
    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const tagName = tagInput.value.trim();
        if (tagName && !window.selectedTags.includes(tagName)) {
          window.selectedTags.push(tagName);
          updateTagsDisplay();
        }
        tagInput.value = '';
      }
    });

    // Update the add form tags display
    function updateTagsDisplay() {
      tagsDisplay.innerHTML = '';
      window.selectedTags.forEach(tagName => {
        const tagPill = document.createElement('span');
        tagPill.className = 'tag-pill';
        
        const tag = state.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        const tagColor = tag ? tag.color : '#808080';
        
        tagPill.style.borderLeft = `3px solid ${tagColor}`;
        tagPill.innerHTML = `
          ${tagName}
          <button class="tag-remove" data-tag="${tagName}">×</button>
        `;
        tagsDisplay.appendChild(tagPill);
      });

      // Add event listeners to remove buttons
      tagsDisplay.querySelectorAll('.tag-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const tagToRemove = btn.dataset.tag;
          const index = window.selectedTags.indexOf(tagToRemove);
          if (index !== -1) {
            window.selectedTags.splice(index, 1);
            updateTagsDisplay();
          }
        });
      });
    }

    // Modify add form submission to include tags
    const addLinkForm = document.getElementById('addLinkForm');
    if (addLinkForm) {
      addLinkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const url = document.getElementById('linkUrl').value;
        const title = document.getElementById('linkTitle').value;
        const groupId = document.getElementById('linkGroup').value;
        const remarks = document.getElementById('linkRemarks').value;
        
        // Create link object
        const link = {
          id: generateId(),
          url: url,
          title: title,
          groupId: groupId || null,
          remarks: remarks,
          dateAdded: new Date().toISOString(),
          visitCount: 0,
          tags: [...window.selectedTags]
        };
        
        // Add type and thumbnail if available
        const linkType = document.getElementById('linkType');
        if (linkType) link.type = linkType.value;
        
        const linkThumbnail = document.getElementById('linkThumbnail');
        if (linkThumbnail && linkThumbnail.value) {
          if (link.type === 'youtube') {
            link.thumbnail = linkThumbnail.value;
          } else {
            link.favicon = linkThumbnail.value;
          }
        }
        
        // Validate
        if (!url || !title) {
          alert('URL and title are required');
          return;
        }
        
        // Save the link
        state.links.push(link);
        
        // Update tag counts
        link.tags.forEach(tagName => {
          createOrGetTag(tagName);
        });
        
        // Save and refresh UI
        saveToStorage();
        renderLinks();
        renderGroups();
        renderTags();
        
        // Reset form
        addLinkForm.reset();
        window.selectedTags = [];
        updateTagsDisplay();
        
        // Close modal
        elements.addLinkModal.style.display = 'none';