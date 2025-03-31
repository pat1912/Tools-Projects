// Link Manager Application - Links Management

// ===== Filtering and Sorting Functions =====

function sortLinks(links) {
  return [...links].sort((a, b) => {
    let valueA, valueB;
    
    // Extract values based on sort field
    switch (state.settings.sortBy) {
      case 'title':
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        break;
      case 'dateAdded':
        valueA = new Date(a.dateAdded);
        valueB = new Date(b.dateAdded);
        break;
      case 'lastVisited':
        // Handle null values (never visited)
        valueA = a.lastVisited ? new Date(a.lastVisited) : new Date(0);
        valueB = b.lastVisited ? new Date(b.lastVisited) : new Date(0);
        break;
      case 'visitCount':
        valueA = a.visitCount || 0;
        valueB = b.visitCount || 0;
        break;
      default:
        valueA = new Date(a.dateAdded);
        valueB = new Date(b.dateAdded);
    }
    
    // Sort based on direction
    const direction = state.settings.sortDirection === 'asc' ? 1 : -1;
    
    // Compare values
    if (valueA < valueB) return -1 * direction;
    if (valueA > valueB) return 1 * direction;
    return 0;
  });
}

function filterLinks() {
  // First, filter the links
  const filteredLinks = state.links.filter(link => {
    // Group filtering
    const inGroup = state.selectedGroupId === 'all' || link.groupId === state.selectedGroupId;
    
    // Tag filtering
    const hasTag = !state.selectedTagId || 
      (link.tags && link.tags.some(tagName => {
        const tag = state.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        return tag && tag.id === state.selectedTagId;
      }));
    
    // Search filtering
    const matchesSearch = !state.searchQuery || 
      link.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      (link.remarks && link.remarks.toLowerCase().includes(state.searchQuery.toLowerCase())) ||
      (link.tags && link.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase())));
    
    return inGroup && hasTag && matchesSearch;
  });
  
  // Then, sort the filtered links
  return sortLinks(filteredLinks);
}

// ===== Link Management Functions =====

function visitLink(linkId) {
  const link = state.links.find(l => l.id === linkId);
  if (link) {
    link.visitCount = (link.visitCount || 0) + 1;
    link.lastVisited = new Date().toISOString();
    saveToStorage();
    window.open(link.url, '_blank');
    renderLinks();
  }
}

function deleteLink(linkId) {
  const link = state.links.find(l => l.id === linkId);
  if (!link) return;
  
  // Update tag counts when deleting a link
  if (link.tags) {
    link.tags.forEach(tagName => {
      const tag = state.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
      if (tag) {
        tag.linkCount--;
        if (tag.linkCount <= 0) {
          state.tags = state.tags.filter(t => t.id !== tag.id);
        }
      }
    });
  }
  
  state.links = state.links.filter(l => l.id !== linkId);
  saveToStorage();
  renderGroups();
  renderTags();
  renderLinks();
}

function deleteGroup(groupId) {
  const linkCount = state.links.filter(l => l.groupId === groupId).length;
  if (linkCount > 0) {
    if (!confirm(`This group contains ${linkCount} link(s). Deleting it will move all links to "Uncategorized". Proceed?`)) {
      return;
    }
    // Reassign links to Uncategorized
    state.links = state.links.map(link => 
      link.groupId === groupId ? { ...link, groupId: null } : link
    );
  }
  state.groups = state.groups.filter(g => g.id !== groupId);
  if (state.selectedGroupId === groupId) state.selectedGroupId = 'all';
  saveToStorage();
  renderGroups();
  renderLinks();
}

// ===== UI Rendering Functions =====

function renderGroups() {
  if (!elements.groupsList) {
    console.error('groupsList element not found');
    return;
  }
  
  elements.groupsList.innerHTML = `
    <li class="sidebar-item ${state.selectedGroupId === 'all' ? 'active' : ''}" data-group-id="all">
      <i class="fa fa-folder"></i>
      <span>All Links</span>
      <span class="item-count">${state.links.length}</span>
    </li>
  `;
  
  state.groups.forEach(group => {
    const li = document.createElement('li');
    li.className = `sidebar-item ${state.selectedGroupId === group.id ? 'active' : ''}`;
    li.dataset.groupId = group.id;
    li.innerHTML = `
      <i class="fa fa-folder" style="color: ${group.color}"></i>
      <span>${group.name}</span>
      <span class="item-count">${state.links.filter(l => l.groupId === group.id).length}</span>
      <button class="item-menu-button delete-group-btn" title="Delete Group"><i class="fa fa-trash"></i></button>
    `;
    
    li.querySelector('.delete-group-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteGroup(group.id);
    });
    
    li.addEventListener('click', () => {
      state.selectedGroupId = group.id;
      state.selectedTagId = null; // Reset tag filter when selecting a group
      renderGroups();
      renderTags(); // Update tags to show active state
      renderLinks();
    });
    
    elements.groupsList.appendChild(li);
  });
}

function renderLinks() {
  if (!elements.linkContainer) {
    console.error('linkContainer element not found');
    return;
  }
  
  const links = filterLinks();
  elements.linkContainer.innerHTML = links.length === 0 ? 
    '<div class="no-links"><p>No links found</p></div>' : '';
  elements.linkContainer.className = state.settings.viewMode === 'grid' ? 'link-grid' : 'link-list';
  
  if (links.length === 0) return;
  
  if (state.settings.viewMode === 'grid') {
    renderLinkGrid(links);
  } else {
    renderLinkList(links);
  }
}

function renderLinkGrid(links) {
  links.forEach(link => {
    const card = document.createElement('div');
    card.className = 'link-card';
    card.dataset.linkId = link.id;
    
    // Determine if it's a YouTube link for special layout
    const isYouTube = link.type === 'youtube';
    
    // Determine icon or image
    let imageContent = '';
    let cardHeaderClass = isYouTube ? 'link-card-header youtube-header' : 'link-card-header';
    
    if (isYouTube && link.thumbnail) {
      // For YouTube, make thumbnail fill the whole header
      imageContent = `<img src="${link.thumbnail}" class="link-thumbnail" alt="YouTube Thumbnail">`;
      cardHeaderClass += ' youtube-thumbnail-header';
    } else if (link.favicon) {
      imageContent = `<div class="link-image"><img src="${link.favicon}" class="link-favicon" alt="Favicon"></div>`;
    } else {
      imageContent = `<div class="link-image"><i class="fa ${isYouTube ? 'fa-youtube youtube' : 'fa-globe'} link-icon"></i></div>`;
    }
    
    // Create tags HTML if the link has tags
    let tagsHtml = '';
    if (link.tags && link.tags.length > 0) {
      tagsHtml = '<div class="link-tags">';
      link.tags.forEach(tagName => {
        const tag = state.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        const tagColor = tag ? tag.color : '#808080';
        tagsHtml += `
          <span class="link-tag" style="border-left: 3px solid ${tagColor}">
            <i class="fa fa-tag" style="color: ${tagColor}"></i>
            ${tagName}
          </span>
        `;
      });
      tagsHtml += '</div>';
    }
    
    // Add health status indicator if available
    let healthIndicator = '';
    if (link.status) {
      const statusClasses = {
        'ok': 'status-ok',
        'error': 'status-error',
        'unknown': 'status-unknown',
        'timeout': 'status-warning'
      };
      
      const statusIconClasses = {
        'ok': 'fa-check-circle',
        'error': 'fa-times-circle',
        'unknown': 'fa-question-circle',
        'timeout': 'fa-exclamation-circle'
      };
      
      const statusClass = statusClasses[link.status] || 'status-unknown';
      const iconClass = statusIconClasses[link.status] || 'fa-question-circle';
      
      let statusTitle = 'Status: ' + link.status;
      if (link.lastChecked) {
        statusTitle += `\nLast checked: ${new Date(link.lastChecked).toLocaleString()}`;
      }
      
      healthIndicator = `
        <div class="link-health-indicator ${statusClass}" title="${statusTitle}">
          <i class="fa ${iconClass}"></i>
        </div>
      `;
    }
    
    // Different layout for YouTube vs regular links
    if (isYouTube && link.thumbnail) {
      card.innerHTML = `
        <div class="${cardHeaderClass}">
          ${imageContent}
          <div class="link-youtube-overlay">
            <i class="fa fa-youtube youtube-play-icon"></i>
          </div>
          <div class="link-actions">
            <button class="link-action-button preview-button" title="Preview"><i class="fa fa-eye"></i></button>
            <button class="link-action-button edit-button" title="Edit"><i class="fa fa-edit"></i></button>
            <button class="link-action-button delete-button" title="Delete"><i class="fa fa-trash"></i></button>
          </div>
          ${healthIndicator}
        </div>
        <div class="link-card-content">
          <h3 class="link-title">${link.title}</h3>
          <div class="link-group">
            <i class="fa fa-folder"></i>
            ${getGroupName(link.groupId)}
          </div>
          ${link.remarks ? `<p class="link-remarks">${link.remarks}</p>` : ''}
          <div class="link-meta">
            <div>Visits: ${link.visitCount || 0}</div>
            <div>Last visited: ${link.lastVisited ? new Date(link.lastVisited).toLocaleDateString() : 'Never'}</div>
          </div>
          ${tagsHtml}
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="${cardHeaderClass}">
          ${imageContent}
          <div class="link-actions">
            <button class="link-action-button preview-button" title="Preview"><i class="fa fa-eye"></i></button>
            <button class="link-action-button edit-button" title="Edit"><i class="fa fa-edit"></i></button>
            <button class="link-action-button delete-button" title="Delete"><i class="fa fa-trash"></i></button>
          </div>
          ${healthIndicator}
        </div>
        <div class="link-card-content">
          <h3 class="link-title">${link.title}</h3>
          <div class="link-group">
            <i class="fa fa-folder"></i>
            ${getGroupName(link.groupId)}
          </div>
          ${link.remarks ? `<p class="link-remarks">${link.remarks}</p>` : ''}
          <div class="link-meta">
            <div>Visits: ${link.visitCount || 0}</div>
            <div>Last visited: ${link.lastVisited ? new Date(link.lastVisited).toLocaleDateString() : 'Never'}</div>
          </div>
          ${tagsHtml}
        </div>
      `;
    }
    
    // Add event listeners
    const previewButton = card.querySelector('.preview-button');
    previewButton.addEventListener('click', (e) => {
      e.stopPropagation();
      showLinkPreview(link.id);
    });
    
    const editButton = card.querySelector('.edit-button');
    editButton.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditLinkModal(link.id);
    });
    
    const deleteButton = card.querySelector('.delete-button');
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to delete the link "${link.title}"?`)) {
        deleteLink(link.id);
      }
    });

    card.addEventListener('click', () => {
      visitLink(link.id);
    });

    elements.linkContainer.appendChild(card);
  });
}

function renderLinkList(links) {
  const table = document.createElement('table');
  table.className = 'links-table';
  
  // Table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th style="width: 40px"></th>
      <th>Title</th>
      <th>Group</th>
      <th>Tags</th>
      <th>Last Visited</th>
      <th>Visits</th>
      <th style="width: 120px">Actions</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Table body
  const tbody = document.createElement('tbody');
  
  links.forEach(link => {
    const tr = document.createElement('tr');
    tr.className = 'link-row';
    tr.dataset.linkId = link.id;
    
    // Determine icon or image for the icon cell
    let iconContent = '';
    if (link.type === 'youtube') {
      iconContent = `<i class="fa fa-youtube youtube link-icon"></i>`;
    } else if (link.favicon) {
      iconContent = `<img src="${link.favicon}" class="link-favicon" alt="Favicon">`;
    } else {
      iconContent = `<i class="fa fa-globe link-icon"></i>`;
    }
    
    // Create tags HTML if the link has tags
    let tagsHtml = '';
    if (link.tags && link.tags.length > 0) {
      tagsHtml = '<div class="link-tags">';
      link.tags.forEach(tagName => {
        const tag = state.tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        const tagColor = tag ? tag.color : '#808080';
        tagsHtml += `
          <span class="link-tag" style="border-left: 3px solid ${tagColor}">
            ${tagName}
          </span>
        `;
      });
      tagsHtml += '</div>';
    } else {
      tagsHtml = '<span class="no-tags">No tags</span>';
    }
    
    // Add health status indicator if available
    let healthIndicator = '';
    if (link.status) {
      const statusClasses = {
        'ok': 'status-ok',
        'error': 'status-error',
        'unknown': 'status-unknown',
        'timeout': 'status-warning'
      };
      
      const statusIconClasses = {
        'ok': 'fa-check-circle',
        'error': 'fa-times-circle',
        'unknown': 'fa-question-circle',
        'timeout': 'fa-exclamation-circle'
      };
      
      const statusClass = statusClasses[link.status] || 'status-unknown';
      const iconClass = statusIconClasses[link.status] || 'fa-question-circle';
      
      let statusTitle = 'Status: ' + link.status;
      if (link.lastChecked) {
        statusTitle += `\nLast checked: ${new Date(link.lastChecked).toLocaleString()}`;
      }
      
      healthIndicator = `
        <i class="fa ${iconClass} ${statusClass}" title="${statusTitle}"></i>
      `;
    }
    
    tr.innerHTML = `
      <td class="link-icon-cell">${iconContent}</td>
      <td class="link-title-cell">
        <div class="link-title">${link.title}</div>
        ${link.remarks ? `<div class="link-remarks">${link.remarks}</div>` : ''}
      </td>
      <td class="link-group-cell">${getGroupName(link.groupId)}</td>
      <td class="link-tags-cell">${tagsHtml}</td>
      <td class="link-visited-cell">${link.lastVisited ? new Date(link.lastVisited).toLocaleDateString() : 'Never'}</td>
      <td class="link-visits-cell">${link.visitCount || 0}</td>
      <td class="link-actions-cell">
        <div class="link-actions">
          <button class="link-action-button preview-button" title="Preview"><i class="fa fa-eye"></i></button>
          <button class="link-action-button edit-button" title="Edit"><i class="fa fa-edit"></i></button>
          <button class="link-action-button delete-button" title="Delete"><i class="fa fa-trash"></i></button>
          ${healthIndicator}
        </div>
      </td>
    `;
    
    // Add event listeners
    const previewButton = tr.querySelector('.preview-button');
    previewButton.addEventListener('click', (e) => {
      e.stopPropagation();
      showLinkPreview(link.id);
    });
    
    const editButton = tr.querySelector('.edit-button');
    editButton.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditLinkModal(link.id);
    });
    
    const deleteButton = tr.querySelector('.delete-button');
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to delete the link "${link.title}"?`)) {
        deleteLink(link.id);
      }
    });

    tr.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON' && 
          e.target.tagName !== 'I' && 
          !e.target.closest('button')) {
        visitLink(link.id);
      }
    });

    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  elements.linkContainer.appendChild(table);
}