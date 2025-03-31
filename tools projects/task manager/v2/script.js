// Helper function to detect text direction and set element direction
function detectTextDirection(element) {
    if (!element) return;
    
    const text = element.value;
    const hebrewPattern = /[\u0590-\u05FF]/;
    
    if (hebrewPattern.test(text)) {
        element.dir = 'rtl';
    } else {
        element.dir = 'ltr';
    }
}

// Category class to represent categories
class Category {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.isDefault = false; // Flag to mark default categories
    }
}

// CategoryManager class to handle category operations
class CategoryManager {
    constructor() {
        this.categories = [];
        this.loadCategories();
        // Add default categories if none exist
        if (this.categories.length === 0) {
            this.addDefaultCategories();
        }
    }
    
    addDefaultCategories() {
        const defaultCategories = [
            { name: 'Work', color: '#3F51B5' },      // Indigo
            { name: 'Personal', color: '#E91E63' },  // Pink
            { name: 'Home', color: '#4CAF50' },      // Green
            { name: 'Shopping', color: '#FF9800' },  // Orange
            { name: 'Urgent', color: '#F44336' }     // Red
        ];
        
        defaultCategories.forEach(cat => {
            const id = 'default-' + cat.name.toLowerCase().replace(/\s+/g, '-');
            const category = new Category(id, cat.name, cat.color);
            category.isDefault = true;
            this.categories.push(category);
        });
        
        this.saveCategories();
    }
    
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
        // Don't allow deletion of default categories
        const category = this.categories.find(cat => cat.id === id);
        if (category && category.isDefault) {
            return false;
        }
        
        this.categories = this.categories.filter(cat => cat.id !== id);
        this.saveCategories();
        return true;
    }
    
    getCategoryById(id) {
        return this.categories.find(cat => cat.id === id);
    }
    
    saveCategories() {
        localStorage.setItem('taskManagerCategories', JSON.stringify(this.categories));
    }
    
    loadCategories() {
        const savedCategories = localStorage.getItem('taskManagerCategories');
        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        }
    }
}

// Task class to represent each task
class Task {
    constructor(id, description, completed = false, categoryId = "") {
        this.id = id;
        this.description = description;
        this.completed = completed;
        this.dateAdded = new Date();
        this.completedDate = null;
        this.deferUntil = null;
        this.notes = [];
        this.color = "";
        this.categoryId = categoryId;
        this.isHebrew = this.containsHebrew(description);
    }
    
    containsHebrew(text) {
        if (!text) return false;
        const hebrewPattern = /[\u0590-\u05FF]/;
        return hebrewPattern.test(text);
    }
}

// Note class for task notes
class Note {
    constructor(text) {
        this.id = Date.now().toString();
        this.text = text;
        this.date = new Date();
    }
}

// TaskManager class to handle task operations
class TaskManager {
    constructor(categoryManager) {
        this.tasks = [];
        this.categoryManager = categoryManager;
        this.loadTasks();
        this.setupDeferredTasksCheck();
        // Perform a check immediately on load
        this.checkDeferredTasks();
    }
    
    addTask(description, categoryId = "") {
        if (!description) return null;
        
        try {
            const id = Date.now().toString();
            const task = new Task(id, description, false, categoryId);
            this.tasks.push(task);
            this.saveTasks();
            return task;
        } catch (error) {
            console.error('Error in addTask:', error);
            throw error;
        }
    }
    
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
    }
    
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
    
    undeferTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.deferUntil = null;
            this.saveTasks();
        }
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
    
    setTaskCategory(id, categoryId) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.categoryId = categoryId;
            this.saveTasks();
        }
    }
    
    // Directly use containsHebrew method
    containsHebrew(text) {
        if (!text) return false;
        const hebrewPattern = /[\u0590-\u05FF]/;
        return hebrewPattern.test(text);
    }
    
    addNote(id, text) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            const note = new Note(text);
            task.notes.push(note);
            this.saveTasks();
            return note;
        }
        return null;
    }
    
    deleteNote(taskId, noteId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.notes = task.notes.filter(note => note.id !== noteId);
            this.saveTasks();
            return true;
        }
        return false;
    }
    
    setTaskColor(id, color) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.color = color;
            this.saveTasks();
        }
    }
    
    saveTasks() {
        localStorage.setItem('advancedTasks', JSON.stringify(this.tasks));
    }
    
    loadTasks() {
        const savedTasks = localStorage.getItem('advancedTasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
            
            // Restore date objects (they're converted to strings in JSON)
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
    
    checkDeferredTasks() {
        const now = new Date();
        let tasksDue = false;
        
        this.tasks.forEach(task => {
            if (!task.completed && task.deferUntil && new Date(task.deferUntil) <= now) {
                tasksDue = true;
            }
        });
        
        return tasksDue;
    }
    
    setupDeferredTasksCheck() {
        // Check for tasks that should no longer be deferred
        const checkInterval = () => {
            if (this.checkDeferredTasks()) {
                // Notify UI to refresh
                document.dispatchEvent(new CustomEvent('tasksUpdated'));
            }
        };
        
        // Check every minute
        setInterval(checkInterval, 60000);
    }
}

// UI class to handle the user interface
class UI {
    constructor(taskManager, categoryManager) {
        this.taskManager = taskManager;
        this.categoryManager = categoryManager;
        
        // DOM Elements - Inputs and Buttons
        this.taskInput = document.getElementById('taskInput');
        this.categorySelect = document.getElementById('categorySelect');
        this.addTaskButton = document.getElementById('addTaskButton');
        this.importExportButton = document.getElementById('importExportButton');
        this.manageCategoriesButton = document.getElementById('manageCategoriesButton');
        this.deleteAllCompletedBtn = document.getElementById('deleteAllCompletedBtn');
        
        // Category filters
        this.activeFilterCategory = document.getElementById('activeFilterCategory');
        this.deferredFilterCategory = document.getElementById('deferredFilterCategory');
        this.completedFilterCategory = document.getElementById('completedFilterCategory');
        
        // Task Lists
        this.activeTaskList = document.getElementById('activeTaskList');
        this.deferredTaskList = document.getElementById('deferredTaskList');
        this.completedTaskList = document.getElementById('completedTaskList');
        
        // Empty Messages
        this.activeEmptyMessage = document.getElementById('activeEmptyMessage');
        this.deferredEmptyMessage = document.getElementById('deferredEmptyMessage');
        this.completedEmptyMessage = document.getElementById('completedEmptyMessage');
        
        // Tab Elements
        this.tabs = document.querySelectorAll('.tab');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Badge Elements
        this.activeBadge = document.getElementById('activeBadge');
        this.deferredBadge = document.getElementById('deferredBadge');
        this.completedBadge = document.getElementById('completedBadge');
        
        // Edit Modal Elements
        this.editModal = document.getElementById('editModal');
        this.editTaskInput = document.getElementById('editTaskInput');
        this.editCategorySelect = document.getElementById('editCategorySelect');
        this.editTaskId = document.getElementById('editTaskId');
        this.closeEditModal = document.getElementById('closeEditModal');
        this.cancelEdit = document.getElementById('cancelEdit');
        this.saveEdit = document.getElementById('saveEdit');
        
        // Notes Modal Elements
        this.notesModal = document.getElementById('notesModal');
        this.taskDescription = document.getElementById('taskDescription');
        this.notesList = document.getElementById('notesList');
        this.newNoteInput = document.getElementById('newNoteInput');
        this.notesTaskId = document.getElementById('notesTaskId');
        this.closeNotesModal = document.getElementById('closeNotesModal');
        this.closeNotes = document.getElementById('closeNotes');
        this.addNote = document.getElementById('addNote');
        
        // Defer Modal Elements
        this.deferModal = document.getElementById('deferModal');
        this.deferTaskDescription = document.getElementById('deferTaskDescription');
        this.deferTomorrow = document.getElementById('deferTomorrow');
        this.deferNextWeek = document.getElementById('deferNextWeek');
        this.deferDate = document.getElementById('deferDate');
        this.deferTaskId = document.getElementById('deferTaskId');
        this.closeDeferModal = document.getElementById('closeDeferModal');
        this.cancelDefer = document.getElementById('cancelDefer');
        this.saveDefer = document.getElementById('saveDefer');
        
        // Color Modal Elements
        this.colorModal = document.getElementById('colorModal');
        this.colorTaskDescription = document.getElementById('colorTaskDescription');
        this.colorOptions = document.querySelectorAll('.color-option');
        this.colorTaskId = document.getElementById('colorTaskId');
        this.selectedColor = document.getElementById('selectedColor');
        this.closeColorModal = document.getElementById('closeColorModal');
        this.cancelColor = document.getElementById('cancelColor');
        this.saveColor = document.getElementById('saveColor');
        
        // Report Modal Elements
        this.reportModal = document.getElementById('reportModal');
        this.reportContent = document.getElementById('reportContent');
        this.closeReportModal = document.getElementById('closeReportModal');
        this.closeReport = document.getElementById('closeReport');
        this.copyReport = document.getElementById('copyReport');
        
        // Import/Export Modal Elements
        this.importExportModal = document.getElementById('importExportModal');
        this.closeImportExportModal = document.getElementById('closeImportExportModal');
        this.closeImportExport = document.getElementById('closeImportExport');
        this.exportTasksBtn = document.getElementById('exportTasksBtn');
        this.importTasksInput = document.getElementById('importTasksInput');
        this.importTasksBtn = document.getElementById('importTasksBtn');
        
        // Categories Modal Elements
        this.categoriesModal = document.getElementById('categoriesModal');
        this.closeCategoriesModal = document.getElementById('closeCategoriesModal');
        this.closeCategories = document.getElementById('closeCategories');
        this.newCategoryInput = document.getElementById('newCategoryInput');
        this.categoryColorPreview = document.getElementById('categoryColorPreview');
        this.addCategoryBtn = document.getElementById('addCategoryBtn');
        this.categoriesList = document.getElementById('categoriesList');
        
        // Category Color Picker Modal
        this.categoryColorModal = document.getElementById('categoryColorModal');
        this.closeCategoryColorModal = document.getElementById('closeCategoryColorModal');
        this.categoryColorOptions = document.querySelectorAll('#categoryColorOptions .color-option');
        this.categoryColorPickerTarget = document.getElementById('categoryColorPickerTarget');
        this.cancelCategoryColor = document.getElementById('cancelCategoryColor');
        this.saveCategoryColor = document.getElementById('saveCategoryColor');
        
        // Set min date for defer date input
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.deferDate.min = this.formatDateForInput(tomorrow);
        
        // Initialize UI
        this.setupEventListeners();
        this.populateCategoryDropdowns();
        this.renderTasks();
        this.renderCategories();
    }
    
    setupEventListeners() {
        // Add task event
        this.addTaskButton.addEventListener('click', () => {
            this.handleAddTask();
        });
        
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddTask();
            }
        });
        
        // Import/Export button
        this.importExportButton.addEventListener('click', () => this.openModal(this.importExportModal));
        
        // Manage Categories button
        this.manageCategoriesButton.addEventListener('click', () => this.openModal(this.categoriesModal));
        
        // Delete all completed tasks
        this.deleteAllCompletedBtn.addEventListener('click', () => this.handleDeleteAllCompleted());
        
        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Category filter events
        this.activeFilterCategory.addEventListener('change', () => this.renderTasks());
        this.deferredFilterCategory.addEventListener('change', () => this.renderTasks());
        this.completedFilterCategory.addEventListener('change', () => this.renderTasks());
        
        // Task list event delegation for active tasks
        this.activeTaskList.addEventListener('click', (e) => {
            const target = e.target;
            const taskId = target.closest('tr')?.dataset.id;
            
            if (!taskId) return;
            
            if (target.classList.contains('btn-complete')) {
                this.handleCompleteTask(taskId);
            } else if (target.classList.contains('btn-edit')) {
                this.handleOpenEditModal(taskId);
            } else if (target.classList.contains('btn-notes')) {
                this.handleOpenNotesModal(taskId);
            } else if (target.classList.contains('btn-defer')) {
                this.handleOpenDeferModal(taskId);
            } else if (target.classList.contains('btn-color')) {
                this.handleOpenColorModal(taskId);
            } else if (target.classList.contains('btn-report')) {
                this.handleOpenReportModal(taskId);
            }
        });
        
        // Deferred tasks event delegation
        this.deferredTaskList.addEventListener('click', (e) => {
            const target = e.target;
            const taskId = target.closest('tr')?.dataset.id;
            
            if (!taskId) return;
            
            if (target.classList.contains('btn-undefer')) {
                this.handleUndeferTask(taskId);
            } else if (target.classList.contains('btn-edit')) {
                this.handleOpenEditModal(taskId);
            } else if (target.classList.contains('btn-notes')) {
                this.handleOpenNotesModal(taskId);
            } else if (target.classList.contains('btn-color')) {
                this.handleOpenColorModal(taskId);
            } else if (target.classList.contains('btn-report')) {
                this.handleOpenReportModal(taskId);
            }
        });
        
        // Completed tasks event delegation
        this.completedTaskList.addEventListener('click', (e) => {
            const target = e.target;
            const taskId = target.closest('tr')?.dataset.id;
            
            if (!taskId) return;
            
            if (target.classList.contains('btn-restore')) {
                this.handleRestoreTask(taskId);
            } else if (target.classList.contains('btn-delete')) {
                this.handleDeleteTask(taskId);
            } else if (target.classList.contains('btn-notes')) {
                this.handleOpenNotesModal(taskId);
            } else if (target.classList.contains('btn-report')) {
                this.handleOpenReportModal(taskId);
            }
        });
        
        // Edit modal events
        this.closeEditModal.addEventListener('click', () => this.closeModal(this.editModal));
        this.cancelEdit.addEventListener('click', () => this.closeModal(this.editModal));
        this.saveEdit.addEventListener('click', () => this.handleSaveEdit());
        
        // Notes modal events
        this.closeNotesModal.addEventListener('click', () => this.closeModal(this.notesModal));
        this.closeNotes.addEventListener('click', () => this.closeModal(this.notesModal));
        this.addNote.addEventListener('click', () => this.handleAddNote());
        this.newNoteInput.addEventListener('keypress', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.handleAddNote();
            }
        });
        
        // Defer modal events
        this.closeDeferModal.addEventListener('click', () => this.closeModal(this.deferModal));
        this.cancelDefer.addEventListener('click', () => this.closeModal(this.deferModal));
        this.saveDefer.addEventListener('click', () => this.handleSaveDefer());
        
        // Quick defer options
        this.deferTomorrow.addEventListener('click', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            this.deferDate.valueAsDate = tomorrow;
        });
        
        this.deferNextWeek.addEventListener('click', () => {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            this.deferDate.valueAsDate = nextWeek;
        });
        
        // Color modal events
        this.closeColorModal.addEventListener('click', () => this.closeModal(this.colorModal));
        this.cancelColor.addEventListener('click', () => this.closeModal(this.colorModal));
        this.saveColor.addEventListener('click', () => this.handleSaveColor());
        
        // Report modal events
        this.closeReportModal.addEventListener('click', () => this.closeModal(this.reportModal));
        this.closeReport.addEventListener('click', () => this.closeModal(this.reportModal));
        this.copyReport.addEventListener('click', () => this.handleCopyReport());
        
        // Import/Export modal events
        this.closeImportExportModal.addEventListener('click', () => this.closeModal(this.importExportModal));
        this.closeImportExport.addEventListener('click', () => this.closeModal(this.importExportModal));
        this.exportTasksBtn.addEventListener('click', () => this.handleExportTasks());
        this.importTasksBtn.addEventListener('click', () => this.handleImportTasks());
        
        // Categories modal events
        this.closeCategoriesModal.addEventListener('click', () => this.closeModal(this.categoriesModal));
        this.closeCategories.addEventListener('click', () => this.closeModal(this.categoriesModal));
        this.addCategoryBtn.addEventListener('click', () => this.handleAddCategory());
        this.categoryColorPreview.addEventListener('click', () => this.openCategoryColorPicker('new'));
        
        // Category Color Picker modal events
        this.closeCategoryColorModal.addEventListener('click', () => this.closeModal(this.categoryColorModal));
        this.cancelCategoryColor.addEventListener('click', () => this.closeModal(this.categoryColorModal));
        this.saveCategoryColor.addEventListener('click', () => this.handleSaveCategoryColor());
        
        // Category color options click events
        this.categoryColorOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.categoryColorOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        // Color options click event
        this.colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.colorOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedColor.value = option.dataset.color;
            });
        });
        
        // Keyboard shortcuts for coloring
        document.addEventListener('keydown', (e) => {
            // Only process shortcuts when active tasks tab is visible
            if (!document.getElementById('activeTasksTab').classList.contains('active')) {
                return;
            }
            
            const focusedRow = document.activeElement.closest('tr');
            if (!focusedRow) return;
            
            const taskId = focusedRow.dataset.id;
            if (!taskId) return;
            
            // Alt+R for red
            if (e.altKey && e.key === 'r') {
                e.preventDefault();
                this.handleSetTaskColor(taskId, '#FFCDD2');
            }
            // Alt+G for green
            else if (e.altKey && e.key === 'g') {
                e.preventDefault();
                this.handleSetTaskColor(taskId, '#C8E6C9');
            }
            // Alt+Y for yellow
            else if (e.altKey && e.key === 'y') {
                e.preventDefault();
                this.handleSetTaskColor(taskId, '#FFF9C4');
            }
        });
        
        // Listen for tasks updated event
        document.addEventListener('tasksUpdated', () => {
            this.renderTasks();
        });
        
        // Setup text direction detection for inputs
        this.taskInput.addEventListener('input', () => detectTextDirection(this.taskInput));
        this.editTaskInput.addEventListener('input', () => detectTextDirection(this.editTaskInput));
        this.newNoteInput.addEventListener('input', () => detectTextDirection(this.newNoteInput));
    }
    
    populateCategoryDropdowns() {
        // Clear existing options except the default one
        const dropdowns = [this.categorySelect, this.editCategorySelect, 
                          this.activeFilterCategory, this.deferredFilterCategory, 
                          this.completedFilterCategory];
                          
        dropdowns.forEach(dropdown => {
            // Keep only the first option (No Category/All Categories)
            while (dropdown.options.length > 1) {
                dropdown.remove(1);
            }
            
            // Add options for each category
            this.categoryManager.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                option.style.backgroundColor = category.color;
                option.style.color = this.getContrastColor(category.color);
                dropdown.appendChild(option);
            });
        });
    }
    
    getContrastColor(hexColor) {
        // If no color or empty string, return black
        if (!hexColor) return '#000000';
        
        // Convert hex to RGB
        let r = parseInt(hexColor.slice(1, 3), 16);
        let g = parseInt(hexColor.slice(3, 5), 16);
        let b = parseInt(hexColor.slice(5, 7), 16);
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return white for dark colors, black for light colors
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }
    
    switchTab(tabName) {
        // Update tab classes
        this.tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update content visibility
        this.tabContents.forEach(content => {
            if (content.id === `${tabName}TasksTab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }
    
    handleAddTask() {
        const description = this.taskInput.value.trim();
        const categoryId = this.categorySelect.value;
        
        if (description !== '') {
            try {
                const task = this.taskManager.addTask(description, categoryId);
                this.taskInput.value = '';
                this.renderTasks();
                this.taskInput.focus();
            } catch (error) {
                console.error('Error adding task:', error);
                alert('There was a problem adding your task. Please try again.');
            }
        }
    }
    
    handleDeleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.taskManager.deleteTask(id);
            this.renderTasks();
        }
    }
    
    handleDeleteAllCompleted() {
        if (confirm('Are you sure you want to delete ALL completed tasks? This cannot be undone.')) {
            const completedTasks = this.taskManager.getCompletedTasks();
            for (const task of completedTasks) {
                this.taskManager.deleteTask(task.id);
            }
            this.renderTasks();
        }
    }
    
    handleCompleteTask(id) {
        this.taskManager.completeTask(id);
        this.renderTasks();
    }
    
    handleRestoreTask(id) {
        this.taskManager.restoreTask(id);
        this.renderTasks();
    }
    
    handleOpenEditModal(id) {
        const task = this.taskManager.tasks.find(task => task.id === id);
        if (task) {
            this.editTaskInput.value = task.description;
            this.editTaskId.value = task.id;
            this.editCategorySelect.value = task.categoryId || "";
            detectTextDirection(this.editTaskInput);
            this.openModal(this.editModal);
            this.editTaskInput.focus();
        }
    }
    
    handleSaveEdit() {
        const id = this.editTaskId.value;
        const description = this.editTaskInput.value.trim();
        const categoryId = this.editCategorySelect.value;
        
        if (description !== '') {
            this.taskManager.editTask(id, description, categoryId);
            this.closeModal(this.editModal);
            this.renderTasks();
        }
    }
    
    handleOpenNotesModal(id) {
        const task = this.taskManager.tasks.find(task => task.id === id);
        if (task) {
            this.taskDescription.textContent = task.description;
            
            // Set the direction of the task description according to the language
            if (task.isHebrew) {
                this.taskDescription.dir = 'rtl';
            } else {
                this.taskDescription.dir = 'ltr';
            }
            
            this.notesTaskId.value = task.id;
            this.renderNotes(task.notes);
            this.openModal(this.notesModal);
            this.newNoteInput.focus();
            
            // Set the direction of the new note input according to task language
            this.newNoteInput.dir = task.isHebrew ? 'rtl' : 'ltr';
        }
    }
    
handleAddNote() {
       const id = this.notesTaskId.value;
       const text = this.newNoteInput.value.trim();
       
       if (text !== '') {
           const note = this.taskManager.addNote(id, text);
           if (note) {
               this.newNoteInput.value = '';
               const task = this.taskManager.tasks.find(task => task.id === id);
               this.renderNotes(task.notes);
               this.newNoteInput.focus();
           }
       }
   }
   
   handleOpenDeferModal(id) {
       const task = this.taskManager.tasks.find(task => task.id === id);
       if (task) {
           this.deferTaskDescription.textContent = task.description;
           this.deferTaskId.value = task.id;
           
           // Reset the date input
           this.deferDate.value = '';
           
           this.openModal(this.deferModal);
       }
   }
   
   handleSaveDefer() {
       const id = this.deferTaskId.value;
       const dateValue = this.deferDate.value;
       
       if (dateValue) {
           const deferDate = new Date(dateValue);
           // Set time to end of day
           deferDate.setHours(23, 59, 59);
           
           this.taskManager.deferTask(id, deferDate);
           this.closeModal(this.deferModal);
           this.renderTasks();
       } else {
           alert('Please select a date');
       }
   }
   
   handleUndeferTask(id) {
       this.taskManager.undeferTask(id);
       this.renderTasks();
   }
   
   handleOpenColorModal(id) {
       const task = this.taskManager.tasks.find(task => task.id === id);
       if (task) {
           this.colorTaskDescription.textContent = task.description;
           this.colorTaskId.value = task.id;
           
           // Reset selection
           this.colorOptions.forEach(option => {
               if (option.dataset.color === task.color) {
                   option.classList.add('selected');
                   this.selectedColor.value = task.color;
               } else {
                   option.classList.remove('selected');
               }
           });
           
           this.openModal(this.colorModal);
       }
   }
   
   handleSaveColor() {
       const id = this.colorTaskId.value;
       const color = this.selectedColor.value;
       
       this.handleSetTaskColor(id, color);
       this.closeModal(this.colorModal);
   }
   
   handleSetTaskColor(id, color) {
       this.taskManager.setTaskColor(id, color);
       this.renderTasks();
   }
   
   handleOpenReportModal(id) {
       const task = this.taskManager.tasks.find(task => task.id === id);
       if (task) {
           let report = `Task Report: ${task.description}\n`;
           report += `------------------------------------------\n`;
           report += `Status: ${task.completed ? 'Completed' : (task.deferUntil ? 'Deferred' : 'Active')}\n`;
           
           // Add category information to report
           const category = task.categoryId ? this.categoryManager.getCategoryById(task.categoryId) : null;
           report += `Category: ${category ? category.name : 'None'}\n`;
           
           report += `Date Added: ${this.formatDateTime(new Date(task.dateAdded))}\n`;
           
           if (task.completed) {
               report += `Completed On: ${this.formatDateTime(new Date(task.completedDate))}\n`;
           }
           
           if (task.deferUntil) {
               report += `Deferred Until: ${this.formatDate(new Date(task.deferUntil))}\n`;
           }
           
           report += `\nNotes (${task.notes.length}):\n`;
           report += `------------------------------------------\n`;
           
           if (task.notes.length === 0) {
               report += "No notes added yet.\n";
           } else {
               // Sort notes chronologically (oldest first)
               const sortedNotes = [...task.notes].sort((a, b) => new Date(a.date) - new Date(b.date));
               
               sortedNotes.forEach((note, index) => {
                   report += `Note ${index + 1} (${this.formatDateTime(new Date(note.date))}):\n${note.text}\n\n`;
               });
           }
           
           this.reportContent.textContent = report;
           
           // Set direction based on task language
           if (task.isHebrew) {
               this.reportContent.dir = 'rtl';
           } else {
               this.reportContent.dir = 'ltr';
           }
           
           this.openModal(this.reportModal);
       }
   }
   
   handleCopyReport() {
       const reportText = this.reportContent.textContent;
       navigator.clipboard.writeText(reportText).then(() => {
           alert('Report copied to clipboard!');
       }, (err) => {
           console.error('Could not copy text: ', err);
           // Fallback selection method
           const range = document.createRange();
           range.selectNode(this.reportContent);
           window.getSelection().removeAllRanges();
           window.getSelection().addRange(range);
           document.execCommand('copy');
           window.getSelection().removeAllRanges();
           alert('Report copied to clipboard!');
       });
   }
   
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
   
   handleImportTasks() {
       const fileInput = this.importTasksInput;
       if (!fileInput.files || fileInput.files.length === 0) {
           alert('Please select a file to import');
           return;
       }
       
       const file = fileInput.files[0];
       if (file.type !== 'application/json') {
           alert('Please select a valid JSON file');
           return;
       }
       
       const reader = new FileReader();
       reader.onload = (e) => {
           try {
               const importedData = JSON.parse(e.target.result);
               
               // Check if it's the new format or legacy format
               if (importedData.tasks && importedData.categories) {
                   // New format with categories and tasks
                   if (!Array.isArray(importedData.tasks) || !Array.isArray(importedData.categories)) {
                       throw new Error('Invalid data structure');
                   }
                   
                   if (confirm(`Import ${importedData.tasks.length} tasks and ${importedData.categories.length} categories? This will replace your current data.`)) {
                       // Replace current categories
                       this.categoryManager.categories = importedData.categories;
                       
                       // Replace current tasks
                       this.taskManager.tasks = importedData.tasks;
                       
                       // Restore date objects
                       this.restoreDateObjects();
                       
                       this.categoryManager.saveCategories();
                       this.taskManager.saveTasks();
                       this.populateCategoryDropdowns();
                       this.renderTasks();
                       this.renderCategories();
                       this.closeModal(this.importExportModal);
                       alert('Data imported successfully!');
                   }
               } else if (Array.isArray(importedData)) {
                   // Legacy format (just tasks)
                   if (confirm(`Import ${importedData.length} tasks? This will replace your current tasks.`)) {
                       // Replace current tasks with imported ones
                       this.taskManager.tasks = importedData;
                       
                       // Ensure all tasks have categoryId property
                       this.taskManager.tasks.forEach(task => {
                           if (task.categoryId === undefined) {
                               task.categoryId = "";
                           }
                       });
                       
                       // Restore date objects
                       this.restoreDateObjects();
                       
                       this.taskManager.saveTasks();
                       this.renderTasks();
                       this.closeModal(this.importExportModal);
                       alert('Tasks imported successfully!');
                   }
               } else {
                   throw new Error('Invalid data structure');
               }
           } catch (error) {
               console.error('Import error:', error);
               alert('Error importing data. Please check that the file is a valid task backup.');
           }
       };
       reader.readAsText(file);
   }
   
   restoreDateObjects() {
       this.taskManager.tasks.forEach(task => {
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
       });
   }
   
   handleAddCategory() {
       const name = this.newCategoryInput.value.trim();
       if (!name) {
           alert('Please enter a category name');
           return;
       }
       
       // Get the current background color of the preview
       const color = getComputedStyle(this.categoryColorPreview).backgroundColor;
       // Convert RGB to HEX
       const rgbToHex = (rgb) => {
           // Extract RGB values using regex
           const [r, g, b] = rgb.match(/\d+/g).map(Number);
           return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
       };
       const hexColor = rgbToHex(color);
       
       this.categoryManager.addCategory(name, hexColor);
       this.newCategoryInput.value = '';
       this.renderCategories();
       this.populateCategoryDropdowns();
   }
   
   handleEditCategory(id) {
       const category = this.categoryManager.getCategoryById(id);
       if (!category) return;
       
       const newName = prompt('Edit category name:', category.name);
       if (newName && newName.trim()) {
           this.categoryManager.updateCategory(id, newName.trim(), category.color);
           this.renderCategories();
           this.populateCategoryDropdowns();
       }
   }
   
   handleDeleteCategory(id) {
       // Find if category is in use
       const tasksUsingCategory = this.taskManager.tasks.filter(task => task.categoryId === id);
       
       if (tasksUsingCategory.length > 0) {
           if (!confirm(`This category is used by ${tasksUsingCategory.length} tasks. Do you want to remove the category from these tasks and delete it?`)) {
               return;
           }
           
           // Remove category from tasks
           tasksUsingCategory.forEach(task => {
               task.categoryId = "";
           });
           this.taskManager.saveTasks();
       } else {
           if (!confirm('Are you sure you want to delete this category?')) {
               return;
           }
       }
       
       if (this.categoryManager.deleteCategory(id)) {
           this.renderCategories();
           this.populateCategoryDropdowns();
           this.renderTasks();
       } else {
           alert('Default categories cannot be deleted.');
       }
   }
   
   openCategoryColorPicker(target) {
       // Reset selected color
       this.categoryColorOptions.forEach(option => {
           option.classList.remove('selected');
       });
       
       // Store the target (either 'new' for new category or category id for edit)
       this.categoryColorPickerTarget.value = target;
       
       // If editing existing category, highlight its current color
       if (target !== 'new') {
           const category = this.categoryManager.getCategoryById(target);
           if (category) {
               const colorOption = Array.from(this.categoryColorOptions).find(
                   option => option.dataset.color.toUpperCase() === category.color.toUpperCase()
               );
               if (colorOption) {
                   colorOption.classList.add('selected');
               }
           }
       } else {
           // For new category, select the current preview color
           const previewColor = getComputedStyle(this.categoryColorPreview).backgroundColor;
           const rgbToHex = (rgb) => {
               const [r, g, b] = rgb.match(/\d+/g).map(Number);
               return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
           };
           const hexColor = rgbToHex(previewColor);
           
           const colorOption = Array.from(this.categoryColorOptions).find(
               option => option.dataset.color.toUpperCase() === hexColor.toUpperCase()
           );
           if (colorOption) {
               colorOption.classList.add('selected');
           }
       }
       
       this.openModal(this.categoryColorModal);
   }
   
   handleSaveCategoryColor() {
       const target = this.categoryColorPickerTarget.value;
       const selectedOption = document.querySelector('#categoryColorOptions .color-option.selected');
       
       if (!selectedOption) {
           alert('Please select a color');
           return;
       }
       
       const selectedColor = selectedOption.dataset.color;
       
       if (target === 'new') {
           // Update the color preview for new category
           this.categoryColorPreview.style.backgroundColor = selectedColor;
       } else {
           // Update existing category
           const category = this.categoryManager.getCategoryById(target);
           if (category) {
               this.categoryManager.updateCategory(target, category.name, selectedColor);
               this.renderCategories();
               this.populateCategoryDropdowns();
           }
       }
       
       this.closeModal(this.categoryColorModal);
   }
   
   renderCategories() {
       this.categoriesList.innerHTML = '';
       
       this.categoryManager.categories.forEach(category => {
           const categoryItem = document.createElement('div');
           categoryItem.className = 'category-item';
           
           const colorSwatch = document.createElement('span');
           colorSwatch.className = 'category-color';
           colorSwatch.style.backgroundColor = category.color;
           
           const categoryName = document.createElement('span');
           categoryName.className = 'category-name';
           categoryName.textContent = category.name;
           
           const actionsDiv = document.createElement('div');
           actionsDiv.className = 'category-actions';
           
           // Only add edit/delete buttons for non-default categories
           if (!category.isDefault) {
               const editButton = document.createElement('button');
               editButton.className = 'btn';
               editButton.style.backgroundColor = '#FFC107';
               editButton.textContent = 'Edit';
               editButton.addEventListener('click', () => this.handleEditCategory(category.id));
               
               const colorButton = document.createElement('button');
               colorButton.className = 'btn';
               colorButton.style.backgroundColor = '#607D8B';
               colorButton.style.color = 'white';
               colorButton.textContent = 'Color';
               colorButton.addEventListener('click', () => this.openCategoryColorPicker(category.id));
               
               const deleteButton = document.createElement('button');
               deleteButton.className = 'btn';
               deleteButton.style.backgroundColor = '#F44336';
               deleteButton.style.color = 'white';
               deleteButton.textContent = 'Delete';
               deleteButton.addEventListener('click', () => this.handleDeleteCategory(category.id));
               
               actionsDiv.appendChild(editButton);
               actionsDiv.appendChild(colorButton);
               actionsDiv.appendChild(deleteButton);
           } else {
               const defaultLabel = document.createElement('span');
               defaultLabel.style.color = '#888';
               defaultLabel.style.fontStyle = 'italic';
               defaultLabel.textContent = 'Default';
               actionsDiv.appendChild(defaultLabel);
           }
           
           categoryItem.appendChild(colorSwatch);
           categoryItem.appendChild(categoryName);
           categoryItem.appendChild(actionsDiv);
           
           this.categoriesList.appendChild(categoryItem);
       });
   }
   
   openModal(modal) {
       modal.style.display = 'flex';
   }
   
   closeModal(modal) {
       modal.style.display = 'none';
       
       // If the notes modal is being closed, refresh task lists to update note counts
       if (modal === this.notesModal) {
           this.renderTasks();
       }
   }
   
   renderNotes(notes) {
       this.notesList.innerHTML = '';
       
       if (notes.length === 0) {
           this.notesList.innerHTML = '<div class="empty-message">No notes yet.</div>';
           return;
       }
       
       // Sort notes by date, newest first
       const sortedNotes = [...notes].sort((a, b) => new Date(b.date) - new Date(a.date));
       
       sortedNotes.forEach(note => {
           const noteElement = document.createElement('div');
           noteElement.className = 'note-item';
           noteElement.dataset.id = note.id;
           
           const headerElement = document.createElement('div');
           headerElement.className = 'note-header';
           headerElement.style.display = 'flex';
           headerElement.style.justifyContent = 'space-between';
           headerElement.style.alignItems = 'center';
           
           const dateElement = document.createElement('div');
           dateElement.className = 'note-date';
           dateElement.textContent = this.formatDateTime(new Date(note.date));
           
           const deleteButton = document.createElement('button');
           deleteButton.className = 'btn btn-delete note-delete-btn';
           deleteButton.textContent = 'Delete';
           deleteButton.style.padding = '2px 5px';
           deleteButton.style.fontSize = '12px';
           deleteButton.addEventListener('click', (e) => {
               e.stopPropagation();
               this.handleDeleteNote(note.id);
           });
           
           headerElement.appendChild(dateElement);
           headerElement.appendChild(deleteButton);
           
           const textElement = document.createElement('div');
           textElement.className = 'note-text';
           textElement.textContent = note.text;
           
           // Set text direction for the note based on content
           const isHebrewNote = /[\u0590-\u05FF]/.test(note.text);
           textElement.dir = isHebrewNote ? 'rtl' : 'ltr';
           
           noteElement.appendChild(headerElement);
           noteElement.appendChild(textElement);
           
           this.notesList.appendChild(noteElement);
       });
   }
   
   handleDeleteNote(noteId) {
       const taskId = this.notesTaskId.value;
       if (confirm('Are you sure you want to delete this note?')) {
           if (this.taskManager.deleteNote(taskId, noteId)) {
               const task = this.taskManager.tasks.find(task => task.id === taskId);
               this.renderNotes(task.notes);
               
               // Refresh all task lists to update note counts on buttons
               this.renderTasks();
           }
       }
   }
   
   formatDateTime(date) {
       return new Intl.DateTimeFormat('en-US', {
           year: 'numeric',
           month: 'short',
           day: 'numeric',
           hour: '2-digit',
           minute: '2-digit'
       }).format(date);
   }
   
   formatDate(date) {
       return new Intl.DateTimeFormat('en-US', {
           year: 'numeric',
           month: 'short',
           day: 'numeric'
       }).format(date);
   }
   
   formatDateForInput(date) {
       const year = date.getFullYear();
       const month = String(date.getMonth() + 1).padStart(2, '0');
       const day = String(date.getDate()).padStart(2, '0');
       return `${year}-${month}-${day}`;
   }
   
   updateTaskDirection(row, isHebrew) {
       if (isHebrew) {
           row.setAttribute('dir', 'rtl');
       } else {
           row.setAttribute('dir', 'ltr');
       }
   }
   
   createCategoryBadge(task) {
       if (!task.categoryId) return '';
       
       const category = this.categoryManager.getCategoryById(task.categoryId);
       if (!category) return '';
       
       return `<span class="category-badge" style="background-color: ${category.color}; color: ${this.getContrastColor(category.color)};">${category.name}</span>`;
   }
   
   renderTasks() {
       // Get the category filters
       const activeFilter = this.activeFilterCategory.value;
       const deferredFilter = this.deferredFilterCategory.value;
       const completedFilter = this.completedFilterCategory.value;
       
       // Get tasks by category
       const activeTasks = this.taskManager.getActiveTasks(activeFilter);
       const deferredTasks = this.taskManager.getDeferredTasks(deferredFilter);
       const completedTasks = this.taskManager.getCompletedTasks(completedFilter);
       
       // Update badges
       this.updateBadges(activeTasks.length, deferredTasks.length, completedTasks.length);
       
       // Render active tasks
       this.activeTaskList.innerHTML = '';
       if (activeTasks.length === 0) {
           this.activeEmptyMessage.style.display = 'block';
       } else {
           this.activeEmptyMessage.style.display = 'none';
           
           // Sort active tasks by date, newest first
           const sortedActiveTasks = [...activeTasks].sort((a, b) => 
               new Date(b.dateAdded) - new Date(a.dateAdded)
           );
           
           sortedActiveTasks.forEach(task => {
               const row = document.createElement('tr');
               row.dataset.id = task.id;
               
               if (task.color) {
                   row.style.backgroundColor = task.color;
               }
               
               this.updateTaskDirection(row, task.isHebrew);
               
               row.innerHTML = `
                   <td>${this.createCategoryBadge(task)}${task.description}</td>
                   <td>${this.formatDate(new Date(task.dateAdded))}</td>
                   <td>
                       <div class="action-buttons">
                           <button class="btn btn-complete" title="Complete Task">Complete</button>
                           <button class="btn btn-defer" title="Defer Task">Defer</button>
                           <button class="btn btn-notes" title="Task Notes">${task.notes.length > 0 ? `Notes (${task.notes.length})` : 'Add Notes'}</button>
                           <button class="btn btn-color" title="Set Color">Color</button>
                           <button class="btn btn-edit" title="Edit Task">Edit</button>
                           <button class="btn btn-report" title="View Report">Report</button>
                       </div>
                   </td>
               `;
               
               this.activeTaskList.appendChild(row);
           });
       }
       
       // Render deferred tasks
       this.deferredTaskList.innerHTML = '';
       if (deferredTasks.length === 0) {
           this.deferredEmptyMessage.style.display = 'block';
       } else {
           this.deferredEmptyMessage.style.display = 'none';
           
           // Sort deferred tasks by due date, nearest first
           const sortedDeferredTasks = [...deferredTasks].sort((a, b) => 
               new Date(a.deferUntil) - new Date(b.deferUntil)
           );
           
           sortedDeferredTasks.forEach(task => {
               const row = document.createElement('tr');
               row.dataset.id = task.id;
               
               if (task.color) {
                   row.style.backgroundColor = task.color;
               }
               
               this.updateTaskDirection(row, task.isHebrew);
               
               row.innerHTML = `
                   <td>${this.createCategoryBadge(task)}${task.description}</td>
                   <td>${this.formatDate(new Date(task.deferUntil))}</td>
                   <td>
                       <div class="action-buttons">
                           <button class="btn btn-undefer" title="Return to Active">Return to Active</button>
                           <button class="btn btn-notes" title="Task Notes">${task.notes.length > 0 ? `Notes (${task.notes.length})` : 'Add Notes'}</button>
                           <button class="btn btn-color" title="Set Color">Color</button>
                           <button class="btn btn-edit" title="Edit Task">Edit</button>
                           <button class="btn btn-report" title="View Report">Report</button>
                       </div>
                   </td>
               `;
               
               this.deferredTaskList.appendChild(row);
           });
       }
       
       // Render completed tasks
       this.completedTaskList.innerHTML = '';
       if (completedTasks.length === 0) {
           this.completedEmptyMessage.style.display = 'block';
       } else {
           this.completedEmptyMessage.style.display = 'none';
           
           // Sort completed tasks by completion date, newest first
           const sortedCompletedTasks = [...completedTasks].sort((a, b) => 
               new Date(b.completedDate) - new Date(a.completedDate)
           );
           
           sortedCompletedTasks.forEach(task => {
               const row = document.createElement('tr');
               row.dataset.id = task.id;
               
               this.updateTaskDirection(row, task.isHebrew);
               
               row.innerHTML = `
                   <td class="task-completed">${this.createCategoryBadge(task)}${task.description}</td>
                   <td>${this.formatDateTime(new Date(task.completedDate))}</td>
                   <td>
                       <div class="action-buttons">
                           <button class="btn btn-restore" title="Restore Task">Restore</button>
                           <button class="btn btn-notes" title="Task Notes">${task.notes.length > 0 ? `Notes (${task.notes.length})` : 'Add Notes'}</button>
                           <button class="btn btn-report" title="View Report">Report</button>
                           <button class="btn btn-delete" title="Delete Task">Delete</button>
                       </div>
                   </td>
               `;
               
               this.completedTaskList.appendChild(row);
           });
       }
   }
   
   updateBadges(activeCount, deferredCount, completedCount) {
       // Active tasks badge
       if (activeCount > 0) {
           this.activeBadge.textContent = activeCount;
           this.activeBadge.style.display = 'inline-block';
       } else {
           this.activeBadge.style.display = 'none';
       }
       
       // Deferred tasks badge
       if (deferredCount > 0) {
           this.deferredBadge.textContent = deferredCount;
           this.deferredBadge.style.display = 'inline-block';
       } else {
           this.deferredBadge.style.display = 'none';
       }
       
       // Completed tasks badge
       if (completedCount > 0) {
           this.completedBadge.textContent = completedCount;
           this.completedBadge.style.display = 'inline-block';
       } else {
           this.completedBadge.style.display = 'none';
       }
   }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
   try {
       const categoryManager = new CategoryManager();
       const taskManager = new TaskManager(categoryManager);
       const ui = new UI(taskManager, categoryManager);
       
       // Setup global text direction detection
       document.addEventListener('input', function(e) {
           if (e.target.tagName === 'INPUT' && (e.target.type === 'text' || e.target.type === 'search')) {
               detectTextDirection(e.target);
           } else if (e.target.tagName === 'TEXTAREA') {
               detectTextDirection(e.target);
           }
       });
       
       console.log('Task Manager initialized successfully');
   } catch (error) {
       console.error('Error initializing Task Manager:', error);
   }
});