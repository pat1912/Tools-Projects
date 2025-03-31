// YT Link Manager - Core Implementation with Bilingual Note Support

// Storage Module
const StorageManager = {
  STORAGE_KEY: 'yt_links',

  getLinks() {
    const linksJSON = localStorage.getItem(this.STORAGE_KEY);
    return linksJSON ? JSON.parse(linksJSON) : {};
  },

  saveLinks(links) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(links));
  },

  addLink(videoId, data) {
    const links = this.getLinks();
    links[videoId] = {
      ...data,
      added: new Date().toISOString()
    };
    this.saveLinks(links);
  },

  deleteLink(videoId) {
    const links = this.getLinks();
    if (links[videoId]) {
      delete links[videoId];
      this.saveLinks(links);
    }
  },

  exportToJSON() {
    const links = this.getLinks();
    const dataStr = JSON.stringify(links, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportLink = document.createElement('a');
    exportLink.setAttribute('href', dataUri);
    exportLink.setAttribute('download', `yt_links_${new Date().toISOString().slice(0,10)}.json`);
    exportLink.click();
  },

  importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          this.saveLinks(data);
          resolve(data);
        } catch (e) {
          reject('Invalid JSON file');
        }
      };
      reader.onerror = () => reject('Error reading file');
      reader.readAsText(file);
    });
  }
};

// YouTube API Module
const YouTubeAPI = {
  extractVideoId(url) {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1);
      }
    } catch (e) {
      return null;
    }
    return null;
  },

  isValidYouTubeURL(url) {
    return !!this.extractVideoId(url);
  },

  extractYouTubeURLFromText(text) {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
    const matches = text.match(youtubeRegex);
    return matches ? matches[0] : null;
  },

  async fetchVideoMetadata(url) {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (!response.ok) {
        throw new Error('Failed to fetch video data');
      }
      const data = await response.json();
      const videoId = this.extractVideoId(url);
      return {
        id: videoId,
        title: data.title,
        thumbnail: data.thumbnail_url,
        url: url
      };
    } catch (error) {
      throw new Error('Invalid YouTube link or video not available');
    }
  }
};

// Bilingual Text Support Module
const BilingualTextSupport = {
  containsHebrew(text) {
    const hebrewPattern = /[\u0590-\u05FF\uFB1D-\uFB4F]/;
    return hebrewPattern.test(text);
  },

  detectLanguageAndSetDirection(element, text) {
    if (!text) {
      element.className = element.className.replace(/\b(rtl|ltr)\b/g, '').trim();
      return;
    }
    const firstWords = text.trim().substring(0, Math.min(text.length, 10));
    if (this.containsHebrew(firstWords)) {
      element.classList.remove('ltr');
      element.classList.add('rtl');
    } else {
      element.classList.remove('rtl');
      element.classList.add('ltr');
    }
  },

  setupBilingualInput(element) {
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

// UI Module
const UI = {
  elements: {
    container: null,
    addButton: null,
    exportButton: null,
    importButton: null,
    modal: null,
    linksGrid: null,
    importInput: null
  },

  dragCounter: 0,

  init() {
    this.createElements();
    this.setupEventListeners();
    this.renderLinks();
    this.setupDragAndDrop();
  },

  createElements() {
    this.elements.container = document.createElement('div');
    this.elements.container.className = 'yt-manager';
    document.body.appendChild(this.elements.container);

    const header = document.createElement('header');
    header.className = 'yt-manager-header';
    this.elements.container.appendChild(header);

    const title = document.createElement('h1');
    title.textContent = 'YT Link Manager';
    header.appendChild(title);

    const controls = document.createElement('div');
    controls.className = 'yt-manager-controls';
    header.appendChild(controls);

    const addContainer = document.createElement('div');
    addContainer.className = 'yt-manager-add-container';
    controls.appendChild(addContainer);

    this.elements.addButton = document.createElement('button');
    this.elements.addButton.className = 'yt-manager-button primary';
    this.elements.addButton.innerHTML = '<span>+</span> Add Link';
    addContainer.appendChild(this.elements.addButton);

    this.elements.exportButton = document.createElement('button');
    this.elements.exportButton.className = 'yt-manager-button';
    this.elements.exportButton.innerHTML = 'Export';
    controls.appendChild(this.elements.exportButton);

    this.elements.importButton = document.createElement('button');
    this.elements.importButton.className = 'yt-manager-button';
    this.elements.importButton.innerHTML = 'Import';
    controls.appendChild(this.elements.importButton);

    this.elements.importInput = document.createElement('input');
    this.elements.importInput.type = 'file';
    this.elements.importInput.accept = '.json';
    this.elements.importInput.style.display = 'none';
    controls.appendChild(this.elements.importInput);

    this.elements.linksGrid = document.createElement('div');
    this.elements.linksGrid.className = 'yt-manager-grid';
    this.elements.container.appendChild(this.elements.linksGrid);

    this.elements.modal = document.createElement('div');
    this.elements.modal.className = 'yt-manager-modal hidden';
    this.elements.container.appendChild(this.elements.modal);

    this.addStyles();
  },

  addStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .yt-manager {
        font-family: Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        height: 100%;
        overflow-y: auto;
        position: relative;
        transition: all 0.3s ease;
      }
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      body {
        overflow-y: auto;
      }
      .yt-manager-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
      }
      .yt-manager-header h1 {
        margin: 0;
        font-size: 24px;
      }
      .yt-manager-controls {
        display: flex;
        gap: 10px;
      }
      .yt-manager-add-container {
        position: relative;
        display: flex;
        align-items: center;
      }
      .yt-manager.drop-highlight {
        outline: 2px dashed #4caf50;
        background-color: rgba(76, 175, 80, 0.1);
      }
      .yt-manager-button {
        padding: 8px 16px;
        background: #f1f1f1;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 14px;
      }
      .yt-manager-button:hover {
        background: #e1e1e1;
      }
      .yt-manager-button.primary {
        background: #ff0000;
        color: white;
      }
      .yt-manager-button.primary:hover {
        background: #cc0000;
      }
      .yt-manager-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }
      .yt-manager-card {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        position: relative;
      }
      .yt-manager-card-thumbnail {
        position: relative;
        padding-top: 56.25%;
        background: #f1f1f1;
        cursor: pointer;
      }
      .yt-manager-card-thumbnail img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .yt-manager-card-menu {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
      }
      .yt-manager-card-dropdown {
        position: absolute;
        top: 40px;
        right: 8px;
        background: #ffffff;
        border-radius: 4px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
        z-index: 10;
        display: none;
        border: 1px solid #e1e1e1;
        min-width: 100px;
      }
      .yt-manager-card-dropdown.active {
        display: block;
      }
      .yt-manager-card-dropdown-item {
        padding: 10px 16px;
        cursor: pointer;
        white-space: nowrap;
        color: #333333;
        font-weight: 500;
        border-bottom: 1px solid #f1f1f1;
      }
      .yt-manager-card-dropdown-item:last-child {
        border-bottom: none;
      }
      .yt-manager-card-dropdown-item:hover {
        background: #f8f8f8;
        color: #ff0000;
      }
      .yt-manager-card-info {
        padding: 12px;
      }
      .yt-manager-card-title {
        margin: 0;
        font-size: 14px;
        line-height: 1.4;
        font-weight: 500;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .yt-manager-card-note-indicator {
        margin-top: 8px;
        font-size: 12px;
        color: #666;
        display: flex;
        align-items: center;
        cursor: pointer;
      }
      .yt-manager-card-note-indicator svg {
        margin-right: 4px;
      }
      .yt-manager-card-note {
        height: 0;
        padding: 0 10px;
        margin-top: 0;
        background-color: #f8f8f8;
        border-radius: 4px;
        font-size: 13px;
        line-height: 1.5;
        color: #333;
        border-left: 3px solid #ff0000;
        overflow: hidden;
        transition: height 0.3s ease, padding 0.3s ease, margin 0.3s ease;
      }
      .yt-manager-card-note.expanded {
        height: auto;
        padding: 10px;
        margin-top: 8px;
        max-height: 300px;
        overflow-y: auto;
      }
      .yt-manager-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
      }
      .yt-manager-modal.hidden {
        display: none;
      }
      .yt-manager-modal-content {
        background: white;
        padding: 20px;
        border-radius: 8px;
        width: 100%;
        max-width: 500px;
      }
      .yt-manager-modal-title {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 18px;
      }
      .yt-manager-form-group {
        margin-bottom: 15px;
      }
      .yt-manager-form-group label {
        display: block;
        margin-bottom: 5px;
        font-size: 14px;
      }
      .yt-manager-form-group input, .yt-manager-form-group textarea {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      .yt-manager-form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      .yt-manager-message {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        color: white;
        border-radius: 4px;
        z-index: 200;
        opacity: 0;
        transition: opacity 0.3s;
      }
      .yt-manager-message.visible {
        opacity: 1;
      }
      .rtl {
        direction: rtl;
        text-align: right;
      }
      .ltr {
        direction: ltr;
        text-align: left;
      }
      @media (max-width: 768px) {
        .yt-manager-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 15px;
        }
      }
    `;
    document.head.appendChild(styleEl);
  },

  setupEventListeners() {
    this.elements.addButton.addEventListener('click', () => {
      this.showModal('Add YouTube Link', null);
    });

    this.elements.exportButton.addEventListener('click', () => {
      StorageManager.exportToJSON();
      this.showMessage('Links exported successfully');
    });

    this.elements.importButton.addEventListener('click', () => {
      this.elements.importInput.click();
    });

    this.elements.importInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        StorageManager.importFromJSON(e.target.files[0])
          .then(() => {
            this.renderLinks();
            this.showMessage('Links imported successfully');
          })
          .catch(error => {
            this.showMessage(`Import failed: ${error}`, true);
          });
      }
    });

    this.elements.modal.addEventListener('click', (e) => {
      if (e.target === this.elements.modal) {
        this.hideModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.elements.modal.classList.contains('hidden')) {
        this.hideModal();
      }
    });
  },

  setupDragAndDrop() {
    const container = this.elements.container;

    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragEnter = (e) => {
      preventDefaults(e);
      this.dragCounter++;
      if (this.dragCounter === 1) {
        container.classList.add('drop-highlight');
      }
    };

    const handleDragOver = (e) => {
      preventDefaults(e);
    };

    const handleDragLeave = (e) => {
      preventDefaults(e);
      this.dragCounter--;
      if (this.dragCounter === 0) {
        container.classList.remove('drop-highlight');
      }
    };

    const handleDrop = async (e) => {
      preventDefaults(e);
      this.dragCounter = 0;
      container.classList.remove('drop-highlight');

      let youtubeUrl = null;
      let isValid = false;

      if (e.dataTransfer.types.includes('text/uri-list')) {
        youtubeUrl = e.dataTransfer.getData('text/uri-list');
        isValid = YouTubeAPI.isValidYouTubeURL(youtubeUrl);
      }

      if (!isValid && e.dataTransfer.types.includes('text/plain')) {
        const text = e.dataTransfer.getData('text/plain');
        youtubeUrl = YouTubeAPI.extractYouTubeURLFromText(text);
        isValid = youtubeUrl && YouTubeAPI.isValidYouTubeURL(youtubeUrl);
      }

      if (isValid) {
        try {
          const videoId = YouTubeAPI.extractVideoId(youtubeUrl);
          const links = StorageManager.getLinks();
          if (links[videoId]) {
            this.showMessage('Link already exists.', true);
            return;
          }

          const loadingMsg = this.showMessage('Processing YouTube link...', false, true);
          const videoData = await YouTubeAPI.fetchVideoMetadata(youtubeUrl);
          StorageManager.addLink(videoData.id, videoData);
          this.renderLinks();
          loadingMsg.remove();
          this.showMessage('YouTube link added successfully');
        } catch (error) {
          this.showMessage(`Failed to add link: ${error.message}`, true);
        }
      } else {
        this.showMessage('Invalid YouTube link. Please try again.', true);
      }
    };

    container.addEventListener('dragenter', handleDragEnter);
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('drop', handleDrop);
  },

  renderLinks() {
    const links = StorageManager.getLinks();
    this.elements.linksGrid.innerHTML = '';

    if (Object.keys(links).length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'yt-manager-empty';
      emptyMessage.textContent = 'No links yet. Click "Add Link" to get started.';
      emptyMessage.style.gridColumn = '1 / -1';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.padding = '40px';
      emptyMessage.style.color = '#666';
      this.elements.linksGrid.appendChild(emptyMessage);
      return;
    }

    const sortedLinks = Object.entries(links).sort((a, b) => {
      return new Date(b[1].added) - new Date(a[1].added);
    });

    sortedLinks.forEach(([videoId, data]) => {
      this.addCardToUI(videoId, data);
    });
  },

  addCardToUI(videoId, data) {
    const card = document.createElement('div');
    card.className = 'yt-manager-card';
    card.dataset.id = videoId;

    const thumbnail = document.createElement('div');
    thumbnail.className = 'yt-manager-card-thumbnail';
    thumbnail.addEventListener('click', () => {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    });
    card.appendChild(thumbnail);

    const img = document.createElement('img');
    img.src = data.thumbnail;
    img.alt = data.title;
    thumbnail.appendChild(img);

    const menu = document.createElement('div');
    menu.className = 'yt-manager-card-menu';
    menu.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = card.querySelector('.yt-manager-card-dropdown');
      dropdown.classList.toggle('active');
      const closeDropdown = (e) => {
        if (!dropdown.contains(e.target) && e.target !== menu) {
          dropdown.classList.remove('active');
          document.removeEventListener('click', closeDropdown);
        }
      };
      document.addEventListener('click', closeDropdown);
    });
    thumbnail.appendChild(menu);

    const dropdown = document.createElement('div');
    dropdown.className = 'yt-manager-card-dropdown';
    menu.appendChild(dropdown);

    const editOption = document.createElement('div');
    editOption.className = 'yt-manager-card-dropdown-item';
    editOption.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#555" style="margin-right: 8px;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>Edit';
    editOption.addEventListener('click', () => {
      this.showModal('Edit YouTube Link', data);
    });
    dropdown.appendChild(editOption);

    const noteOption = document.createElement('div');
    noteOption.className = 'yt-manager-card-dropdown-item';
    noteOption.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#555" style="margin-right: 8px;"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/></svg>' +
      (data.note && data.note.trim() ? 'Edit Note' : 'Add Note');
    noteOption.addEventListener('click', () => {
      this.showNoteModal(videoId, data);
    });
    dropdown.appendChild(noteOption);

    const deleteOption = document.createElement('div');
    deleteOption.className = 'yt-manager-card-dropdown-item';
    deleteOption.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#d32f2f" style="margin-right: 8px;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>Delete';
    deleteOption.addEventListener('click', () => {
      this.confirmDelete(videoId, data.title);
    });
    dropdown.appendChild(deleteOption);

    const info = document.createElement('div');
    info.className = 'yt-manager-card-info';
    card.appendChild(info);

    const title = document.createElement('h3');
    title.className = 'yt-manager-card-title';
    title.textContent = data.title;
    title.title = data.title;
    info.appendChild(title);

    if (data.note && data.note.trim()) {
      const noteIndicator = document.createElement('div');
      noteIndicator.className = 'yt-manager-card-note-indicator';
      noteIndicator.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#666">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
        </svg>
        <span>View note</span>
      `;

      const noteSection = document.createElement('div');
      noteSection.className = 'yt-manager-card-note';
      if (BilingualTextSupport.containsHebrew(data.note)) {
        noteSection.classList.add('rtl');
      } else {
        noteSection.classList.add('ltr');
      }
      noteSection.textContent = data.note;
      info.appendChild(noteSection);

      let isExpanded = false;
      noteIndicator.addEventListener('click', () => {
        if (isExpanded) {
          noteSection.classList.remove('expanded');
          noteIndicator.querySelector('span').textContent = 'View note';
        } else {
          noteSection.classList.add('expanded');
          noteIndicator.querySelector('span').textContent = 'Hide note';
        }
        isExpanded = !isExpanded;
      });

      info.appendChild(noteIndicator);
    }

    this.elements.linksGrid.appendChild(card);
  },

  showModal(title, existingData) {
    const modalContent = document.createElement('div');
    modalContent.className = 'yt-manager-modal-content';

    const modalTitle = document.createElement('h2');
    modalTitle.className = 'yt-manager-modal-title';
    modalTitle.textContent = title;
    modalContent.appendChild(modalTitle);

    const form = document.createElement('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(form, existingData);
    });

    const formGroup = document.createElement('div');
    formGroup.className = 'yt-manager-form-group';
    formGroup.style.width = '100%';
    form.appendChild(formGroup);

    const label = document.createElement('label');
    label.textContent = 'YouTube URL';
    label.htmlFor = 'yt-url-input';
    formGroup.appendChild(label);

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'yt-url-input';
    input.placeholder = 'https://www.youtube.com/watch?v=...';
    input.required = true;
    input.style.width = '100%';
    input.style.boxSizing = 'border-box';
    if (existingData) {
      input.value = existingData.url || `https://www.youtube.com/watch?v=${existingData.id}`;
    }
    formGroup.appendChild(input);

    const errorMsg = document.createElement('div');
    errorMsg.style.color = 'red';
    errorMsg.style.fontSize = '14px';
    errorMsg.style.marginTop = '5px';
    errorMsg.style.display = 'none';
    formGroup.appendChild(errorMsg);

    const formActions = document.createElement('div');
    formActions.className = 'yt-manager-form-actions';
    form.appendChild(formActions);

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'yt-manager-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
      this.hideModal();
    });
    formActions.appendChild(cancelButton);

    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.className = 'yt-manager-button primary';
    saveButton.textContent = existingData ? 'Update' : 'Save';
    formActions.appendChild(saveButton);

    modalContent.appendChild(form);

    this.elements.modal.innerHTML = '';
    this.elements.modal.appendChild(modalContent);
    this.elements.modal.classList.remove('hidden');

    setTimeout(() => input.focus(), 100);
  },

  showNoteModal(videoId, data) {
    const modalContent = document.createElement('div');
    modalContent.className = 'yt-manager-modal-content';

    const modalTitle = document.createElement('h2');
    modalTitle.className = 'yt-manager-modal-title';
    modalTitle.textContent = data.note && data.note.trim() ? 'Edit Note' : 'Add Note';
    modalContent.appendChild(modalTitle);

    const bilingualInfo = document.createElement('div');
    bilingualInfo.className = 'bilingual-info';
    bilingualInfo.textContent = 'This note field supports both English and Hebrew with automatic text direction.';
    bilingualInfo.style.fontSize = '12px';
    bilingualInfo.style.color = '#666';
    bilingualInfo.style.marginBottom = '10px';
    modalContent.appendChild(bilingualInfo);

    const videoTitle = document.createElement('div');
    videoTitle.style.marginBottom = '15px';
    videoTitle.style.fontWeight = 'bold';
    videoTitle.textContent = data.title;
    modalContent.appendChild(videoTitle);

    const form = document.createElement('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleNoteSubmit(form, videoId);
    });
    modalContent.appendChild(form);

    const formGroup = document.createElement('div');
    formGroup.className = 'yt-manager-form-group';
    formGroup.style.width = '100%';
    form.appendChild(formGroup);

    const label = document.createElement('label');
    label.textContent = 'Your Notes';
    label.htmlFor = 'yt-note-input';
    formGroup.appendChild(label);

    const textarea = document.createElement('textarea');
    textarea.id = 'yt-note-input';
    textarea.placeholder = 'Add your notes about this video...';
    textarea.rows = 5;
    textarea.style.width = '100%';
    textarea.style.padding = '8px 12px';
    textarea.style.border = '1px solid #ddd';
    textarea.style.borderRadius = '4px';
    textarea.style.resize = 'vertical';
    textarea.style.fontFamily = 'inherit';
    textarea.style.fontSize = '14px';
    textarea.style.boxSizing = 'border-box';
    if (data.note) {
      textarea.value = data.note;
    }
    formGroup.appendChild(textarea);

    BilingualTextSupport.setupBilingualInput(textarea);

    const formActions = document.createElement('div');
    formActions.className = 'yt-manager-form-actions';
    form.appendChild(formActions);

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'yt-manager-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
      this.hideModal();
    });
    formActions.appendChild(cancelButton);

    if (data.note && data.note.trim()) {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'yt-manager-button';
      removeButton.style.color = '#d32f2f';
      removeButton.textContent = 'Remove Note';
      removeButton.addEventListener('click', () => {
        this.handleNoteRemove(videoId);
      });
      formActions.appendChild(removeButton);
    }

    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.className = 'yt-manager-button primary';
    saveButton.textContent = 'Save Note';
    formActions.appendChild(saveButton);

    this.elements.modal.innerHTML = '';
    this.elements.modal.appendChild(modalContent);
    this.elements.modal.classList.remove('hidden');

    setTimeout(() => textarea.focus(), 100);
  },

  hideModal() {
    this.elements.modal.classList.add('hidden');
  },

  async handleFormSubmit(form, existingData) {
    const input = form.querySelector('input');
    const url = input.value.trim();
    const errorMsg = form.querySelector('div[style*="color: red"]');

    if (!YouTubeAPI.isValidYouTubeURL(url)) {
      errorMsg.textContent = 'Please enter a valid YouTube URL';
      errorMsg.style.display = 'block';
      return;
    }

    if (existingData && existingData.url === url) {
      this.hideModal();
      return;
    }

    try {
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Loading...';
      submitButton.disabled = true;

      const videoData = await YouTubeAPI.fetchVideoMetadata(url);
      if (existingData && existingData.note) {
        videoData.note = existingData.note;
      }

      if (existingData) {
        StorageManager.deleteLink(existingData.id);
      }

      StorageManager.addLink(videoData.id, videoData);
      this.renderLinks();
      this.hideModal();
      this.showMessage(existingData ? 'Link updated successfully' : 'Link added successfully');
    } catch (error) {
      errorMsg.textContent = error.message;
      errorMsg.style.display = 'block';
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  },

  handleNoteSubmit(form, videoId) {
    const textarea = form.querySelector('textarea');
    const note = textarea.value.trim();
    const links = StorageManager.getLinks();
    const videoData = links[videoId];

    if (videoData) {
      videoData.note = note;
      StorageManager.saveLinks(links);
      this.renderLinks();
      this.hideModal();
      this.showMessage('Note saved successfully');
    } else {
      this.showMessage('Error: Video data not found', true);
    }
  },

  handleNoteRemove(videoId) {
    const links = StorageManager.getLinks();
    const videoData = links[videoId];

    if (videoData) {
      videoData.note = '';
      StorageManager.saveLinks(links);
      this.renderLinks();
      this.hideModal();
      this.showMessage('Note removed successfully');
    } else {
      this.showMessage('Error: Video data not found', true);
    }
  },

  confirmDelete(videoId, title) {
    const confirmed = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (confirmed) {
      StorageManager.deleteLink(videoId);
      this.renderLinks();
      this.showMessage('Link deleted successfully');
    }
  },

  showMessage(message, isError = false, isLoading = false) {
    const existingMessage = document.querySelector('.yt-manager-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = 'yt-manager-message';

    if (isLoading) {
      messageEl.innerHTML = `
        <span style="display: inline-block; width: 12px; height: 12px; border: 2px solid #fff;
               border-radius: 50%; border-top-color: transparent;
               margin-right: 8px; animation: spin 1s linear infinite;"></span>
        ${message}
      `;
      messageEl.style.background = '#333';
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styleEl);
    } else {
      messageEl.textContent = message;
      messageEl.style.background = isError ? '#d32f2f' : '#4caf50';
    }

    document.body.appendChild(messageEl);
    setTimeout(() => messageEl.classList.add('visible'), 10);
    const delay = isLoading ? 10000 : 3000;
    setTimeout(() => {
      messageEl.classList.remove('visible');
      setTimeout(() => messageEl.remove(), 300);
    }, delay);

    return messageEl;
  }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  UI.init();
});