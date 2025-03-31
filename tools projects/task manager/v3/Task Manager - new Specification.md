# Task Manager Technical Specification

## Overview

Task Manager is a client-side web application designed to help users organize tasks with an intuitive interface, offering features like task deferral, notes, categories, and custom styling. The application provides a robust task management solution with no server-side dependencies.

## Architecture

### Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser's localStorage API
- **Dependencies**: None - pure vanilla JavaScript
- **File Structure**: Separate HTML and JavaScript files

### Data Model

#### Task Structure

```javascript
{
  id: String,                   // Timestamp used as unique identifier
  description: String,          // Task description text
  completed: Boolean,           // Whether the task is completed
  dateAdded: Date,              // Creation date
  completedDate: Date|null,     // Completion date (if completed)
  deferUntil: Date|null,        // Due date for deferred tasks
  notes: Array<Note>,           // Array of note objects
  color: String,                // Background color (hex value or empty)
  categoryId: String,           // Reference to category ID
  isHebrew: Boolean             // Flag for text direction
}
```

#### Note Structure

```javascript
{
  id: String,                   // Timestamp used as unique identifier
  text: String,                 // Note content
  date: Date                    // Creation date
}
```

#### Category Structure

```javascript
{
  id: String,                   // Unique identifier
  name: String,                 // Category name 
  color: String,                // Color for category badge (hex)
  isDefault: Boolean            // Whether it's a default category
}
```

### Storage Schema

The application uses localStorage for data persistence with the following keys:
- `advancedTasks`: JSON-stringified array of task objects
- `taskManagerCategories`: JSON-stringified array of category objects

## Core Components

### Class Structure

1. **Task Class**
   - Represents a single task with all properties
   - Handles text direction detection

2. **Note Class**
   - Represents a note attached to a task
   - Handles timestamps

3. **Category Class**
   - Represents a task category
   - Contains styling and identification information

4. **TaskManager Class**
   - Manages task operations (CRUD)
   - Handles filtering (active, deferred, completed, by category)
   - Manages task lifecycle transitions
   - Monitors deferred tasks for auto-return
   - Connects to CategoryManager for category operations

5. **CategoryManager Class**
   - Manages category operations (CRUD)
   - Provides default categories
   - Prevents deletion of default categories
   - Handles category persistence

6. **UI Class**
   - Manages the application interface
   - Handles events and user interactions
   - Renders tasks, notes, and categories
   - Manages modals and dialogs
   - Provides filtering controls
   - Implements keyboard shortcuts

### File Structure

```
/
├── index.html        # Main HTML document with structure and styles
└── script.js         # All JavaScript code in a separate file
```

## Feature Specifications

### Task Management

1. **Create Tasks**
   - Input field for task description
   - Category selection dropdown
   - Automatic language detection for text direction
   - Task ID generation via timestamp
   - Tab organization based on status

2. **Edit Tasks**
   - Modify description
   - Change category
   - Preserves task history and notes
   - Automatic text direction adjustment

3. **Complete/Restore Tasks**
   - Mark tasks as completed (moved to Completed tab)
   - Restore completed tasks to Active tab
   - Record completion date

4. **Delete Tasks**
   - Only available for completed tasks
   - Confirmation dialog
   - Mass deletion option for all completed tasks

5. **Defer Tasks**
   - Set future date for task appearance
   - Quick options (tomorrow, next week)
   - Custom date selection
   - Automatic return when date arrives
   - Manual return option

### Category System

1. **Default Categories**
   - Pre-defined set (Work, Personal, Home, Shopping, Urgent)
   - Color-coded for visual distinction
   - Cannot be deleted (only custom categories can)

2. **Custom Categories**
   - User-defined name
   - User-selected color from palette
   - Edit, delete operations
   - Validation for name uniqueness

3. **Category Display**
   - Color-coded badges on tasks
   - Dropdown selectors for task assignment
   - Filter dropdowns in each tab view
   - Color contrast detection for readable text

4. **Category Management**
   - Modal interface for CRUD operations
   - Color picker for visual customization
   - Warning when deleting categories in use

### Task Notes

1. **Note Creation**
   - Add timestamped notes to any task
   - Multiple notes per task
   - Automatic language direction detection

2. **Note Management**
   - Chronological display (newest first)
   - Individual note deletion
   - Note count displayed on task

3. **Note Interface**
   - Scrollable note area
   - Fixed input section
   - Text direction based on language

### Task Reports

1. **Report Generation**
   - Comprehensive task summary
   - Task details with category information
   - Chronological notes listing
   - Correct text direction

2. **Report Actions**
   - Copy to clipboard functionality
   - Modal display with scrollable content

### Task Styling

1. **Visual Customization**
   - Background color selection
   - Color palette with presets
   - Category color badges
   - Keyboard shortcuts for common colors (Alt+R, Alt+G, Alt+Y)

2. **Multilingual Support**
   - Automatic text direction detection
   - Right-to-left support for Hebrew
   - Direction persistence across application

### Data Management

1. **Persistence**
   - Automatic saving to localStorage
   - Data restoration on page load
   - Date object reconstruction

2. **Import/Export**
   - JSON export with all task and category data
   - Import validation and error handling
   - Legacy format support
   - Confirmation dialogs for data replacement

## Technical Implementation Details

### Task Manager Implementation

1. **Task Creation and Editing**
   ```javascript
   addTask(description, categoryId = "") {
       if (!description) return null;
       const id = Date.now().toString();
       const task = new Task(id, description, false, categoryId);
       this.tasks.push(task);
       this.saveTasks();
       return task;
   }
   
   editTask(id, description, categoryId) {
       const task = this.tasks.find(task => task.id === id);
       if (task) {
           task.description = description;
           task.categoryId = categoryId;
           task.isHebrew = this.containsHebrew(description);
           this.saveTasks();
       }
   }
   ```

2. **Task State Management**
   ```javascript
   completeTask(id) {
       const task = this.tasks.find(task => task.id === id);
       if (task) {
           task.completed = true;
           task.completedDate = new Date();
           this.saveTasks();
       }
   }
   
   restoreTask(id) {
       const task = this.tasks.find(task => task.id === id);
       if (task) {
           task.completed = false;
           task.completedDate = null;
           this.saveTasks();
       }
   }
   
   deferTask(id, date) {
       const task = this.tasks.find(task => task.id === id);
       if (task) {
           task.deferUntil = date;
           this.saveTasks();
       }
   }
   ```

3. **Task Filtering**
   ```javascript
   getActiveTasks(categoryFilter = "") {
       const now = new Date();
       return this.tasks.filter(task => 
           !task.completed && 
           (!task.deferUntil || new Date(task.deferUntil) <= now) &&
           (categoryFilter === "" || task.categoryId === categoryFilter)
       );
   }
   
   getDeferredTasks(categoryFilter = "") {
       const now = new Date();
       return this.tasks.filter(task => 
           !task.completed && 
           task.deferUntil && 
           new Date(task.deferUntil) > now &&
           (categoryFilter === "" || task.categoryId === categoryFilter)
       );
   }
   
   getCompletedTasks(categoryFilter = "") {
       return this.tasks.filter(task => 
           task.completed &&
           (categoryFilter === "" || task.categoryId === categoryFilter)
       );
   }
   ```

4. **Automatic Deferred Task Checking**
   ```javascript
   setupDeferredTasksCheck() {
       const checkInterval = () => {
           if (this.checkDeferredTasks()) {
               document.dispatchEvent(new CustomEvent('tasksUpdated'));
           }
       };
       setInterval(checkInterval, 60000);
   }
   ```

### Category Manager Implementation

1. **Default Categories**
   ```javascript
   addDefaultCategories() {
       const defaultCategories = [
           { name: 'Work', color: '#3F51B5' },
           { name: 'Personal', color: '#E91E63' },
           { name: 'Home', color: '#4CAF50' },
           { name: 'Shopping', color: '#FF9800' },
           { name: 'Urgent', color: '#F44336' }
       ];
       
       defaultCategories.forEach(cat => {
           const id = 'default-' + cat.name.toLowerCase().replace(/\s+/g, '-');
           const category = new Category(id, cat.name, cat.color);
           category.isDefault = true;
           this.categories.push(category);
       });
       
       this.saveCategories();
   }
   ```

2. **Category CRUD Operations**
   ```javascript
   addCategory(name, color) {
       const id = Date.now().toString();
       const category = new Category(id, name, color);
       this.categories.push(category);
       this.saveCategories();
       return category;
   }
   
   updateCategory(id, name, color) {
       const category = this.categories.find(cat => cat.id === id);
       if (category) {
           category.name = name;
           category.color = color;
           this.saveCategories();
           return true;
       }
       return false;
   }
   
   deleteCategory(id) {
       const category = this.categories.find(cat => cat.id === id);
       if (category && category.isDefault) {
           return false;
       }
       
       this.categories = this.categories.filter(cat => cat.id !== id);
       this.saveCategories();
       return true;
   }
   ```

### UI Implementation

1. **Task Rendering**
   ```javascript
   renderTasks() {
       const activeFilter = this.activeFilterCategory.value;
       const deferredFilter = this.deferredFilterCategory.value;
       const completedFilter = this.completedFilterCategory.value;
       
       const activeTasks = this.taskManager.getActiveTasks(activeFilter);
       const deferredTasks = this.taskManager.getDeferredTasks(deferredFilter);
       const completedTasks = this.taskManager.getCompletedTasks(completedFilter);
       
       // Update badge counters
       this.updateBadges(activeTasks.length, deferredTasks.length, completedTasks.length);
       
       // Render each tab's content
       this.renderActiveTasksList(activeTasks);
       this.renderDeferredTasksList(deferredTasks);
       this.renderCompletedTasksList(completedTasks);
   }
   ```

2. **Category Badge Creation**
   ```javascript
   createCategoryBadge(task) {
       if (!task.categoryId) return '';
       
       const category = this.categoryManager.getCategoryById(task.categoryId);
       if (!category) return '';
       
       return `<span class="category-badge" style="background-color: ${category.color}; color: ${this.getContrastColor(category.color)};">${category.name}</span>`;
   }
   
   getContrastColor(hexColor) {
       if (!hexColor) return '#000000';
       
       const r = parseInt(hexColor.slice(1, 3), 16);
       const g = parseInt(hexColor.slice(3, 5), 16);
       const b = parseInt(hexColor.slice(5, 7), 16);
       
       const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
       return luminance > 0.5 ? '#000000' : '#ffffff';
   }
   ```

3. **Event Handling**
   ```javascript
   setupEventListeners() {
       // Button clicks
       this.addTaskButton.addEventListener('click', () => this.handleAddTask());
       this.taskInput.addEventListener('keypress', (e) => {
           if (e.key === 'Enter') this.handleAddTask();
       });
       
       // Category filters
       this.activeFilterCategory.addEventListener('change', () => this.renderTasks());
       this.deferredFilterCategory.addEventListener('change', () => this.renderTasks());
       this.completedFilterCategory.addEventListener('change', () => this.renderTasks());
       
       // Tab switching
       this.tabs.forEach(tab => {
           tab.addEventListener('click', () => {
               const tabName = tab.dataset.tab;
               this.switchTab(tabName);
           });
       });
       
       // ...additional event listeners
   }
   ```

4. **Modal Management**
   ```javascript
   openModal(modal) {
       modal.style.display = 'flex';
   }
   
   closeModal(modal) {
       modal.style.display = 'none';
       
       if (modal === this.notesModal) {
           this.renderTasks();
       }
   }
   ```

5. **Category Management UI**
   ```javascript
   renderCategories() {
       this.categoriesList.innerHTML = '';
       
       this.categoryManager.categories.forEach(category => {
           const categoryItem = document.createElement('div');
           categoryItem.className = 'category-item';
           
           // Create category UI elements
           const colorSwatch = document.createElement('span');
           colorSwatch.className = 'category-color';
           colorSwatch.style.backgroundColor = category.color;
           
           const categoryName = document.createElement('span');
           categoryName.className = 'category-name';
           categoryName.textContent = category.name;
           
           const actionsDiv = document.createElement('div');
           actionsDiv.className = 'category-actions';
           
           // Differentiate between default and custom categories
           if (!category.isDefault) {
               const editButton = document.createElement('button');
               editButton.className = 'btn';
               editButton.style.backgroundColor = '#FFC107';
               editButton.textContent = 'Edit';
               editButton.addEventListener('click', () => this.handleEditCategory(category.id));
               
               // Add other action buttons...
               
               actionsDiv.appendChild(editButton);
               // Append other buttons...
           } else {
               const defaultLabel = document.createElement('span');
               defaultLabel.style.color = '#888';
               defaultLabel.style.fontStyle = 'italic';
               defaultLabel.textContent = 'Default';
               actionsDiv.appendChild(defaultLabel);
           }
           
           // Assemble the category item
           categoryItem.appendChild(colorSwatch);
           categoryItem.appendChild(categoryName);
           categoryItem.appendChild(actionsDiv);
           
           this.categoriesList.appendChild(categoryItem);
       });
   }
   ```

### Data Persistence

1. **Saving and Loading**
   ```javascript
   saveTasks() {
       localStorage.setItem('advancedTasks', JSON.stringify(this.tasks));
   }
   
   loadTasks() {
       const savedTasks = localStorage.getItem('advancedTasks');
       if (savedTasks) {
           this.tasks = JSON.parse(savedTasks);
           
           // Restore date objects
           this.tasks.forEach(task => {
               task.dateAdded = new Date(task.dateAdded);
               
               if (task.completedDate) {
                   task.completedDate = new Date(task.completedDate);
               }
               
               if (task.deferUntil) {
                   task.deferUntil = new Date(task.deferUntil);
               }
               
               task.notes.forEach(note => {
                   note.date = new Date(note.date);
               });
               
               // Ensure all tasks have categoryId property
               if (task.categoryId === undefined) {
                   task.categoryId = "";
               }
           });
       }
   }
   ```

2. **Import/Export**
   ```javascript
   handleExportTasks() {
       // Create a bundle with both tasks and categories
       const exportData = {
           tasks: this.taskManager.tasks,
           categories: this.categoryManager.categories
       };
       
       const data = JSON.stringify(exportData);
       const blob = new Blob([data], { type: 'application/json' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `task-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
   }
   ```

## Performance Considerations

1. **Efficient DOM Updates**
   - Only render tabs that are currently visible
   - Use document fragments for batch DOM operations
   - Prioritize changes to visible elements

2. **Memory Management**
   - Proper event listener cleanup
   - Avoid closures that capture large objects
   - Manual garbage collection hints where appropriate

3. **Storage Efficiency**
   - Monitor localStorage size limitations (~5MB)
   - Implement cleanup for very old completed tasks
   - Consider data compression for large task sets

4. **Render Optimization**
   - Batch UI updates
   - Use CSS transitions for smoother interactions
   - Debounce frequent events

## User Experience Principles

1. **Interface Clarity**
   - Consistent button placement and coloring
   - Clear visual indicators of task state
   - Intuitive layout with minimal cognitive load

2. **Error Prevention**
   - Confirmation dialogs for destructive actions
   - Clear error messages
   - Forgiving input handling

3. **Accessibility**
   - Color contrast compliance
   - Keyboard navigation support
   - Screen reader compatible

4. **Responsiveness**
   - Mobile-friendly design
   - Flexible layout adapts to screen size
   - Touch-friendly tap targets

## Browser Compatibility

The application is designed to work on modern browsers:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 80+

Required browser features:
- localStorage API
- ES6+ JavaScript
- CSS Grid and Flexbox

## Extensions and Future Enhancements

1. **Priority System**
   - Task importance levels
   - Visual indicators
   - Priority-based sorting

2. **Search Functionality**
   - Real-time filtering across all tasks
   - Advanced search options

3. **Recurring Tasks**
   - Scheduled repetition patterns
   - Intelligent scheduling

4. **Subtasks/Checklists**
   - Hierarchical task structure
   - Progress tracking

5. **Time Estimates**
   - Duration planning
   - Time-based filtering

6. **Dark Mode**
   - Light/dark theme toggle
   - System preference detection

7. **Statistics and Reporting**
   - Productivity metrics
   - Completion patterns

8. **Notifications**
   - Due date reminders
   - Browser notifications

## Known Limitations

1. **Storage Constraints**
   - Limited by browser localStorage (~5MB)
   - No built-in data compression

2. **Single Device Usage**
   - No native synchronization between devices
   - Manual export/import required for transfer

3. **Offline Only**
   - No cloud backup
   - No multi-device synchronization

4. **Performance with Large Datasets**
   - Rendering may slow with hundreds of tasks
   - Search performance degrades with scale

---

This technical specification provides a comprehensive overview of the Task Manager application, detailing its architecture, features, implementation, and design principles. The modular structure with separate HTML and JavaScript files enhances maintainability, while the category system adds powerful organizational capabilities.