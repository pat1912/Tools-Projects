// Link Manager Application - Main Integration File

// This file imports and integrates all the modules

// Load order:
// 1. Core functionality
// 2. Event listeners
// 3. Tags management
// 4. Link management 
// 5. Modals
// 6. Health Check & Import/Export

document.addEventListener('DOMContentLoaded', () => {
  console.log('Link Manager application starting...');
  initialize();
});

// Add additional CSS for new features
function addAdditionalStyles() {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = `
    /* Health indicator styles */
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
    
    /* Tag styles */
    .tag-pill {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      background-color: var(--background-secondary);
      color: var(--text-color);
      border-radius: 12px;
      font-size: 0.8rem;
      margin-right: 4px;
      margin-bottom: 4px;
    }
    
    .tag-remove {
      background: none;
      border: none;
      color: var(--text-secondary);
      margin-left: 4px;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
    }
    
    .tag-remove:hover {
      color: var(--danger-color);
    }
    
    .tag-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
      flex-shrink: 0;
    }
  `;
  
  document.head.appendChild(styleElement);
}

// Call this when the application initializes
// It's already called in the initialize function from core.js
function setupApplication() {
  addAdditionalStyles();
  
  // Show welcome message for first-time users
  if (state.links.length === 0 && state.groups.length === 0) {
    showWelcomeMessage();
  }
}

// Welcome message for first-time users
function showWelcomeMessage() {
  const linkContainer = document.getElementById('linkContainer');
  if (!linkContainer) return;
  
  linkContainer.innerHTML = `
    <div class="welcome-message">
      <h2>Welcome to Link Manager!</h2>
      <p>Get started by adding your first link or creating a group.</p>
      <div class="welcome-actions">
        <button class="button primary" id="welcomeAddLinkBtn">
          <i class="fa fa-plus"></i> Add Your First Link
        </button>
        <button class="button secondary" id="welcomeAddGroupBtn">
          <i class="fa fa-folder-plus"></i> Create a Group
        </button>
      </div>
      <div class="welcome-tip">
        <i class="fa fa-lightbulb"></i>
        <p>Tip: You can import your existing bookmarks from browsers by clicking on the settings icon and selecting "Import Bookmarks".</p>
      </div>
    </div>
  `;
  
  // Add event listeners
  const welcomeAddLinkBtn = document.getElementById('welcomeAddLinkBtn');
  if (welcomeAddLinkBtn) {
    welcomeAddLinkBtn.addEventListener('click', () => {
      const addLinkBtn = document.getElementById('addLinkBtn');
      if (addLinkBtn) addLinkBtn.click();
    });
  }
  
  const welcomeAddGroupBtn = document.getElementById('welcomeAddGroupBtn');
  if (welcomeAddGroupBtn) {
    welcomeAddGroupBtn.addEventListener('click', () => {
      const addGroupBtn = document.getElementById('addGroupBtn');
      if (addGroupBtn) addGroupBtn.click();
    });
  }
  
  // Add welcome styles if not present
  if (!document.getElementById('welcome-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'welcome-styles';
    styleElement.innerHTML = `
      .welcome-message {
        text-align: center;
        max-width: 600px;
        margin: 100px auto;
        padding: 30px;
        background-color: var(--background-secondary);
        border-radius: var(--card-border-radius);
        box-shadow: 0 4px 12px var(--shadow-color);
      }
      
      .welcome-message h2 {
        margin-bottom: 16px;
        color: var(--primary-color);
      }
      
      .welcome-message p {
        margin-bottom: 24px;
        font-size: 1.1rem;
      }
      
      .welcome-actions {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-bottom: 30px;
      }
      
      .welcome-tip {
        display: flex;
        align-items: flex-start;
        background-color: rgba(66, 133, 244, 0.1);
        padding: 16px;
        border-radius: 8px;
        border-left: 4px solid var(--primary-color);
        text-align: left;
      }
      
      .welcome-tip i {
        color: var(--primary-color);
        margin-right: 10px;
        font-size: 20px;
      }
      
      .welcome-tip p {
        margin: 0;
        font-size: 0.9rem;
      }
      
      @media (max-width: 768px) {
        .welcome-actions {
          flex-direction: column;
        }
        
        .welcome-message {
          margin: 40px 20px;
        }
      }
    `;
    
    document.head.appendChild(styleElement);
  }
}
