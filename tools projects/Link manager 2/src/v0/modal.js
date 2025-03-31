// Link Manager Application - Modals

// ===== Modal Functions =====

function openEditLinkModal(linkId) {
  const link = state.links.find(l => l.id === linkId);
  if (!link || !elements.editLinkModal) return;
  
  // Fill form with link data
  document.getElementById('editLinkId').value = link.id;
  document.getElementById('editLinkUrl').value = link.url;
  document.getElementById('editLinkTitle').value = link.title;
  document.getElementById('editLinkRemarks').value = link.remarks || '';
  
  // Populate group dropdown
  const editLinkGroup = document.getElementById('editLinkGroup');
  editLinkGroup.innerHTML = '<option value="">Select a group</option>';
  state.groups.forEach(g => {
    const option = document.createElement('option');
    option.value = g.id;
    option.textContent = g.name;
    if (g.id === link.groupId) option.selected = true;
    editLinkGroup.appendChild(option);
  });
  
  // Populate tags display
  const editTagsDisplay = document.getElementById('editTagsDisplay');
  editTagsDisplay.innerHTML = '';
  
  // Reset editSelectedTags array and populate it with existing tags
  window.editSelectedTags = [];
  if (link.tags && link.tags.length > 0) {
    link.tags.forEach(tagName => {
      window.editSelectedTags.push(tagName);
      const tagPill = document.createElement('span');
      tagPill.className = 'tag-pill';
      
      const tag = state.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
      const tagColor = tag ? tag.color : '#808080';
      
      tagPill.style.borderLeft = `3px solid ${tagColor}`;
      tagPill.innerHTML = `
        ${tagName}
        <button class="tag-remove" data-tag="${tagName}">×</button>
      `;
      editTagsDisplay.appendChild(tagPill);
    });
    
    // Add event listeners to remove buttons
    editTagsDisplay.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const tagToRemove = btn.dataset.tag;
        const index = window.editSelectedTags.indexOf(tagToRemove);
        if (index !== -1) {
          window.editSelectedTags.splice(index, 1);
          updateEditTagsDisplay();
        }
      });
    });
  }
  
  elements.editLinkModal.style.display = 'flex';
}

// ===== Link Preview Functions =====

function showLinkPreview(linkId) {
  const link = state.links.find(l => l.id === linkId);
  if (!link || !elements.linkPreviewModal || !elements.previewContent || !elements.previewLink) {
    return;
  }
  
  // Set the visit link href
  elements.previewLink.href = link.url;
  
  // Show loading state
  elements.previewContent.innerHTML = `
    <div class="preview-loading">
      <i class="fa fa-spinner spin"></i> Loading preview...
    </div>
  `;
  
  elements.linkPreviewModal.style.display = 'flex';
  
  // Determine if it's a YouTube link
  const isYouTube = link.url.includes('youtube.com') || link.url.includes('youtu.be');
  
  if (isYouTube) {
    // Extract YouTube video ID
    let videoId = '';
    if (link.url.includes('youtube.com/watch')) {
      const url = new URL(link.url);
      videoId = url.searchParams.get('v');
    } else if (link.url.includes('youtu.be/')) {
      videoId = link.url.split('youtu.be/')[1];
      if (videoId.includes('?')) {
        videoId = videoId.split('?')[0];
      }
    }
    
    if (videoId) {
      renderYouTubePreview(link, videoId);
    } else {
      renderGenericPreview(link);
    }
  } else {
    renderGenericPreview(link);
  }
}

// Function to render YouTube preview
function renderYouTubePreview(link, videoId) {
  elements.previewContent.innerHTML = `
    <div class="preview-image-container">
      <iframe
        width="100%"
        height="315"
        src="https://www.youtube.com/embed/${videoId}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
    
    <div class="preview-details">
      <h2 class="preview-title">
        <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.title}</a>
      </h2>
      <div class="preview-url">${link.url}</div>
      
      ${link.remarks ? `
        <div class="preview-remarks">
          <h4>Your Notes</h4>
          <p>${link.remarks}</p>
        </div>
      ` : ''}
      
      <div class="preview-meta">
        <div class="preview-meta-item">
          <i class="fa fa-folder"></i>
          ${getGroupName(link.groupId)}
        </div>
        
        <div class="preview-meta-item">
          <i class="fa fa-clock"></i>
          Added: ${new Date(link.dateAdded).toLocaleDateString()}
        </div>
        
        <div class="preview-meta-item">
          <i class="fa fa-eye"></i>
          Visits: ${link.visitCount || 0}
        </div>
      </div>
      
      ${link.tags && link.tags.length > 0 ? `
        <div class="link-tags">
          ${link.tags.map(tagName => {
            const tag = state.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
            const tagColor = tag ? tag.color : '#808080';
            return `
              <span class="link-tag" style="border-left: 3px solid ${tagColor}">
                <i class="fa fa-tag" style="color: ${tagColor}"></i>
                ${tagName}
              </span>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// Function to render generic preview when metadata fetching fails
function renderGenericPreview(link) {
  // Extract domain for favicon
  let domain = '';
  try {
    domain = new URL(link.url).hostname;
  } catch (e) {
    domain = link.url.split('/')[2] || '';
  }
  
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  
  elements.previewContent.innerHTML = `
    <div class="preview-image-container">
      <div class="preview-image-placeholder">
        <img src="${faviconUrl}" alt="Favicon" style="width: 64px; height: 64px;">
      </div>
    </div>
    
    <div class="preview-details">
      <h2 class="preview-title">
        <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.title}</a>
      </h2>
      <div class="preview-url">${link.url}</div>
      
      ${link.remarks ? `
        <div class="preview-remarks">
          <h4>Your Notes</h4>
          <p>${link.remarks}</p>
        </div>
      ` : ''}
      
      <div class="preview-meta">
        <div class="preview-meta-item">
          <i class="fa fa-folder"></i>
          ${getGroupName(link.groupId)}
        </div>
        
        <div class="preview-meta-item">
          <i class="fa fa-clock"></i>
          Added: ${new Date(link.dateAdded).toLocaleDateString()}
        </div>
        
        <div class="preview-meta-item">
          <i class="fa fa-eye"></i>
          Visits: ${link.visitCount || 0}
        </div>
      </div>
      
      ${link.tags && link.tags.length > 0 ? `
        <div class="link-tags">
          ${link.tags.map(tagName => {
            const tag = state.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
            const tagColor = tag ? tag.color : '#808080';
            return `
              <span class="link-tag" style="border-left: 3px solid ${tagColor}">
                <i class="fa fa-tag" style="color: ${tagColor}"></i>
                ${tagName}
              </span>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// Initialize link preview
function initializeLinkPreview() {
  elements.linkPreviewModal = document.getElementById('linkPreviewModal');
  elements.closePreviewModal = document.getElementById('closePreviewModal');
  elements.previewContent = document.getElementById('previewContent');
  elements.previewLink = document.getElementById('previewLink');
  elements.closePreviewBtn = document.getElementById('closePreviewBtn');
  
  if (elements.closePreviewModal) {
    elements.closePreviewModal.addEventListener('click', () => {
      elements.linkPreviewModal.style.display = 'none';
    });
  }
  
  if (elements.closePreviewBtn) {
    elements.closePreviewBtn.addEventListener('click', () => {
      elements.linkPreviewModal.style.display = 'none';
    });
  }
}

// Add metadata fetch capability to the "Add Link" form
function enhanceAddLinkForm() {
  const fetchMetadataBtn = document.getElementById('fetchMetadataBtn');
  if (fetchMetadataBtn) {
    fetchMetadataBtn.addEventListener('click', () => {
      const urlInput = document.getElementById('linkUrl');
      if (!urlInput || !urlInput.value) return;
      
      const url = urlInput.value;
      
      // Show loading state
      fetchMetadataBtn.innerHTML = '<i class="fa fa-spinner spin"></i>';
      fetchMetadataBtn.disabled = true;
      
      // Check if it's a YouTube link for special handling
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      
      if (isYouTube) {
        // Extract title from YouTube
        // In a real implementation, you'd use the YouTube API
        // For this demo, we'll simulate a delay and set a generic title
        setTimeout(() => {
          document.getElementById('linkTitle').value = 'YouTube Video';
          document.getElementById('linkType').value = 'youtube';
          
          // Extract video ID
          let videoId = '';
          if (url.includes('youtube.com/watch')) {
            try {
              const urlObj = new URL(url);
              videoId = urlObj.searchParams.get('v');
            } catch(e) {
              // Handle URL parsing error
            }
          } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1];
            if (videoId.includes('?')) {
              videoId = videoId.split('?')[0];
            }
          }
          
          if (videoId) {
            // Set thumbnail URL
            document.getElementById('linkThumbnail').value = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          }
          
          fetchMetadataBtn.innerHTML = 'Fetch';
          fetchMetadataBtn.disabled = false;
        }, 1000);
      } else {
        // For normal websites, we'd use a metadata service
        // Since we can't due to CORS, we'll simulate it
        setTimeout(() => {
          // Extract domain for a simple title
          let domain = '';
          try {
            domain = new URL(url).hostname;
            document.getElementById('linkTitle').value = domain.replace('www.', '');
          } catch (e) {
            document.getElementById('linkTitle').value = url;
          }
          
          document.getElementById('linkType').value = 'website';
          
          fetchMetadataBtn.innerHTML = 'Fetch';
          fetchMetadataBtn.disabled = false;
        }, 1000);
      }
    });
  }
  
  // Add type field to the form if not present
  const addLinkForm = document.getElementById('addLinkForm');
  if (addLinkForm && !document.getElementById('linkType')) {
    const typeInput = document.createElement('input');
    typeInput.type = 'hidden';
    typeInput.id = 'linkType';
    typeInput.value = 'website';
    addLinkForm.appendChild(typeInput);
    
    const thumbnailInput = document.createElement('input');
    thumbnailInput.type = 'hidden';
    thumbnailInput.id = 'linkThumbnail';
    thumbnailInput.value = '';
    addLinkForm.appendChild(thumbnailInput);
  }
}
