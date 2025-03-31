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
      try {
        const url = new URL(link.url);
        videoId = url.searchParams.get('v');
      } catch (e) {
        console.error('Error parsing YouTube URL:', e);
      }
    } else if (link.url.includes('youtu.be/')) {
      videoId = link.url.split('youtu.be/')[1];
      if (videoId && videoId.includes('?')) {
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