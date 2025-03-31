# YT Link Manager Specification

This document outlines the full specification for the YT Link Manager application, including the new bilingual text support for notes and planned browser extension integration.

## Core Application

YT Link Manager is a lightweight web application for saving, organizing, and managing YouTube video links. It allows users to save links with additional notes and provides a visual interface for browsing saved videos.

### Key Features

- **Link Management**: Add, edit, and delete YouTube video links
- **Metadata Display**: Show video thumbnails and titles automatically
- **Notes System**: Add personal notes to each saved video with bilingual support (Hebrew/English)
- **Drag & Drop Support**: Easily add videos by dragging links
- **Export/Import**: Backup and restore your collection
- **Visual Interface**: Thumbnail-based grid layout for easy browsing

### Technical Stack

- **Frontend Only**: Pure JavaScript, HTML, and CSS
- **No Dependencies**: No external libraries or frameworks
- **Local Storage**: Data is stored in the browser's localStorage
- **Responsive Design**: Adapts to different screen sizes

## Bilingual Text Support for Notes

The application includes a sophisticated bilingual text support system for notes, enabling automatic detection and handling of Hebrew and English text.

### Bilingual Features

- **Automatic Language Detection**: Identifies Hebrew or English text as the user types
- **Dynamic Text Direction**: Switches between RTL (right-to-left) for Hebrew and LTR (left-to-right) for English text
- **Real-time Adjustment**: Changes text direction as you type, with no manual toggling required
- **Paste Support**: Correctly handles pasted text with proper language detection

### Implementation Details

#### BilingualTextSupport Module

```javascript
const BilingualTextSupport = {
  // Function to detect if text contains Hebrew characters
  containsHebrew(text) {
    const hebrewPattern = /[\u0590-\u05FF\uFB1D-\uFB4F]/;
    return hebrewPattern.test(text);
  },
  
  // Function to detect language and set direction
  detectLanguageAndSetDirection(element, text) {
    if (!text) {
      element.className = element.className.replace(/\b(rtl|ltr)\b/g, '').trim();
      return;
    }
    
    // Check first few characters to determine direction
    const firstWords = text.trim().substring(0, Math.min(text.length, 10));
    
    if (this.containsHebrew(firstWords)) {
      element.classList.remove('ltr');
      element.classList.add('rtl');
    } else {
      element.classList.remove('rtl');
      element.classList.add('ltr');
    }
  },
  
  // Set up bilingual support for an input element
  setupBilingualInput(element) {
    // Initial direction setting
    this.detectLanguageAndSetDirection(element, element.value);
    
    // Update direction on input
    element.addEventListener('input', () => {
      this.detectLanguageAndSetDirection(element, element.value);
    });
    
    // Ensure correct handling of paste events
    element.addEventListener('paste', () => {
      setTimeout(() => {
        this.detectLanguageAndSetDirection(element, element.value);
      }, 0);
    });
  }
};
```

#### CSS Classes for Text Direction

```css
.rtl {
  direction: rtl;
  text-align: right;
}

.ltr {
  direction: ltr;
  text-align: left;
}
```

#### Technical Considerations

- **Detection Algorithm**: Uses Unicode character ranges (Standard Hebrew: `\u0590-\u05FF`, Hebrew presentation forms: `\uFB1D-\uFB4F`)
- **Performance**: Lightweight detection that runs only on active input fields
- **Browser Compatibility**: Works with all modern browsers (Chrome 49+, Firefox 44+, Safari 9+, Edge 12+)

## Storage Module

The Storage Module handles all data persistence operations using the browser's localStorage.

```javascript
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
```

## YouTube API Module

The YouTube API Module handles all YouTube-specific operations like extracting video IDs and fetching metadata.

```javascript
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
```

## UI Module

The UI Module handles all user interface operations, including rendering videos, displaying modals, and setting up event listeners.

Key UI Components:
- Video grid layout
- Add/edit link modal
- Note editing interface with bilingual support
- Export/import controls
- Message notifications
- Drag and drop interface

## Planned Browser Extension Integration

A companion browser extension is planned to enhance the YT Link Manager by enabling deeper integration with YouTube and providing more convenient ways to save videos.

### Extension Architecture
- **Components**:
  - Background script (service worker)
  - Content script for YouTube pages
  - Popup interface for quick actions
  - Options page for configuration
- **Permissions Required**:
  - `tabs`: To access current tab information
  - `storage`: To store settings
  - `activeTab`: To access the current page
  - Host permissions for youtube.com

### Integration Methods
1. **Direct API Communication**
   - Extension communicates with web app via a defined API interface
   - Options:
     - **LocalStorage**: Extension writes directly to the same localStorage used by the web app
     - **Custom Events**: Extension dispatches events that web app listens for
     - **Background Synchronization**: Extension stores pending additions that sync when web app opens

2. **Context Menu Integration**
   - Adds "Add to YT Link Manager" to browser's right-click menu
   - Available on YouTube video pages and links
   - Configuration to control when it appears:
     - On all pages
     - Only on YouTube
     - Only on links that point to YouTube

3. **YouTube Page Integration**
   - Injects a custom button under YouTube videos
   - Appears next to native YouTube buttons (like, share, etc.)
   - One-click saving to the collection
   - Optional feedback when a video is already in collection

### Extension Features
- **One-Click Saving**:
  - Add current YouTube video with a single click
  - Badge or indication when current video is already saved
  - Option to add with note in a popup

- **Batch Operations**:
  - Save all videos from a playlist
  - Select multiple videos from search results
  - Import from YouTube bookmarks or liked videos

- **Notifications**:
  - Success/error feedback when adding videos
  - Counter showing total videos in collection
  - Optional notifications for new uploads from saved channels

- **Search & Navigation**:
  - Search your saved videos directly from extension
  - Jump to the web app with deep links to specific videos
  - Category/tag management (future enhancement)

### Technical Challenges
- **Cross-Origin Restrictions**:
  - Browser security prevents direct communication between extension and web app across domains
  - Solution: Use shared storage (localStorage) or message passing protocols

- **Authentication & Security**:
  - Ensuring only the legitimate extension can add to the user's collection
  - Optional: Add basic authentication between extension and web app

- **Versioning & Compatibility**:
  - Maintaining compatibility between extension and web app versions
  - Graceful degradation when features don't align

### Implementation Steps
1. **Initial Development**:
   - Create basic extension with icon and popup
   - Implement core functionality to save current video
   - Test communication with web app

2. **YouTube Integration**:
   - Develop content script to inject UI elements
   - Add listeners for YouTube page events
   - Implement visual feedback on YouTube pages

3. **Advanced Features**:
   - Add context menu functionality
   - Implement batch operations
   - Create options page for customization

4. **Distribution**:
   - Package extension for Chrome Web Store
   - Create Firefox add-on version
   - Implement auto-update mechanism

### Benefits of Browser Extension
- **Seamless Experience**: Eliminates need to manually copy/paste URLs
- **Direct Integration**: Works where users actually discover videos
- **Time Saving**: Reduces steps needed to save videos
- **Enhanced Functionality**: Enables features not possible in a standard web app
- **Cross-Browser Support**: Can be adapted for Chrome, Firefox, and other major browsers

## Future Enhancements

Potential improvements for future versions:

### Bilingual Support Enhancements
- Support for additional RTL languages (Arabic, Persian, etc.)
- Improved mixed language handling
- Paragraph-level direction detection for mixed content

### Core Application Enhancements
- **Categorization**: Folder or tagging system for organizing videos
- **Search Function**: Full-text search for video titles and notes
- **Sort Options**: Sort by date added, title, etc.
- **Multiple Collections**: Support for multiple separate collections
- **Theme Support**: Light/dark mode and customizable themes
- **Sync Support**: Optional cloud sync between devices

## Technical Requirements

- **Browser Support**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Performance**: Fast loading and smooth animations, even with hundreds of saved links
- **Accessibility**: Support for keyboard navigation and screen readers
- **Offline Support**: Full functionality without internet connection (except for fetching new metadata)
- **Data Integrity**: Prevent data loss with careful storage management