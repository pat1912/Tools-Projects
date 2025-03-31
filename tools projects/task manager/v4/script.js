// Helper function to detect text direction and set element direction
function detectTextDirection(element) {
    if (!element) return;
    const text = element.value || element.textContent; // Also check textContent for non-inputs
    const hebrewPattern = /[\u0590-\u05FF]/;
    element.dir = hebrewPattern.test(text) ? 'rtl' : 'ltr';
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
        this.sourceUrl = null; // <-- Stores the URL (e.g., OWA link)
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
        this.categoryManager = categoryManager;
        this.tasks = [];
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
            // Note: Saving is handled after potential sourceUrl addition or in handleAddTask
            // this.saveTasks();
            return task; // Return the created task object
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
        console.log("Tasks saved to localStorage");
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('advancedTasks');
        if (savedTasks) {
            try {
                this.tasks = JSON.parse(savedTasks);

                // Restore date objects and ensure properties exist
                this.tasks.forEach(task => {
                    task.dateAdded = new Date(task.dateAdded);

                    if (task.completedDate) {
                        task.completedDate = new Date(task.completedDate);
                    }

                    if (task.deferUntil) {
                        task.deferUntil = new Date(task.deferUntil);
                    }

                    task.notes = task.notes || [];
                    task.notes.forEach(note => {
                        note.date = new Date(note.date);
                    });

                    if (task.categoryId === undefined) task.categoryId = "";
                    if (task.sourceUrl === undefined) task.sourceUrl = null;
                    if (task.color === undefined) task.color = "";
                    task.isHebrew = this.containsHebrew(task.description);
                });
                console.log("Tasks loaded from localStorage");
            } catch (error) {
                console.error("Error parsing tasks from localStorage:", error);
                this.tasks = [];
                localStorage.removeItem('advancedTasks');
            }
        } else {
             this.tasks = [];
             console.log("No tasks found in localStorage, initialized empty array.");
        }
    }

    getActiveTasks(categoryFilter = "") {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return this.tasks.filter(task =>
            !task.completed &&
            (!task.deferUntil || new Date(task.deferUntil) <= now) &&
            (categoryFilter === "" || task.categoryId === categoryFilter)
        );
    }

    getDeferredTasks(categoryFilter = "") {
        const now = new Date();
         now.setHours(0, 0, 0, 0);
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
         now.setHours(0, 0, 0, 0);
        let tasksDue = false;

        this.tasks.forEach(task => {
            if (!task.completed && task.deferUntil && new Date(task.deferUntil) <= now) {
                tasksDue = true;
            }
        });
        return tasksDue;
    }

    setupDeferredTasksCheck() {
        const checkInterval = () => {
            if (this.checkDeferredTasks()) {
                console.log("Deferred tasks are due, triggering UI update.");
                document.dispatchEvent(new CustomEvent('tasksUpdated'));
            }
        };
        setInterval(checkInterval, 60000);
    }
}

// UI class to handle the user interface
class UI {
    constructor(taskManager, categoryManager) {
        this.taskManager = taskManager;
        this.categoryManager = categoryManager;
        // Get references to all DOM elements...
        this.taskInput = document.getElementById('taskInput'); this.categorySelect = document.getElementById('categorySelect'); this.addTaskButton = document.getElementById('addTaskButton'); this.importExportButton = document.getElementById('importExportButton'); this.manageCategoriesButton = document.getElementById('manageCategoriesButton'); this.deleteAllCompletedBtn = document.getElementById('deleteAllCompletedBtn'); this.emailDropZone = document.getElementById('emailDropZone'); this.activeFilterCategory = document.getElementById('activeFilterCategory'); this.deferredFilterCategory = document.getElementById('deferredFilterCategory'); this.completedFilterCategory = document.getElementById('completedFilterCategory'); this.activeTaskList = document.getElementById('activeTaskList'); this.deferredTaskList = document.getElementById('deferredTaskList'); this.completedTaskList = document.getElementById('completedTaskList'); this.activeEmptyMessage = document.getElementById('activeEmptyMessage'); this.deferredEmptyMessage = document.getElementById('deferredEmptyMessage'); this.completedEmptyMessage = document.getElementById('completedEmptyMessage'); this.tabs = document.querySelectorAll('.tab'); this.tabContents = document.querySelectorAll('.tab-content'); this.activeBadge = document.getElementById('activeBadge'); this.deferredBadge = document.getElementById('deferredBadge'); this.completedBadge = document.getElementById('completedBadge'); this.editModal = document.getElementById('editModal'); this.editTaskInput = document.getElementById('editTaskInput'); this.editCategorySelect = document.getElementById('editCategorySelect'); this.editTaskId = document.getElementById('editTaskId'); this.closeEditModal = document.getElementById('closeEditModal'); this.cancelEdit = document.getElementById('cancelEdit'); this.saveEdit = document.getElementById('saveEdit'); this.notesModal = document.getElementById('notesModal'); this.taskDescription = document.getElementById('taskDescription'); this.notesList = document.getElementById('notesList'); this.newNoteInput = document.getElementById('newNoteInput'); this.notesTaskId = document.getElementById('notesTaskId'); this.closeNotesModal = document.getElementById('closeNotesModal'); this.closeNotes = document.getElementById('closeNotes'); this.addNote = document.getElementById('addNote'); this.deferModal = document.getElementById('deferModal'); this.deferTaskDescription = document.getElementById('deferTaskDescription'); this.deferTomorrow = document.getElementById('deferTomorrow'); this.deferNextWeek = document.getElementById('deferNextWeek'); this.deferDate = document.getElementById('deferDate'); this.deferTaskId = document.getElementById('deferTaskId'); this.closeDeferModal = document.getElementById('closeDeferModal'); this.cancelDefer = document.getElementById('cancelDefer'); this.saveDefer = document.getElementById('saveDefer'); this.colorModal = document.getElementById('colorModal'); this.colorTaskDescription = document.getElementById('colorTaskDescription'); this.colorOptions = document.querySelectorAll('.color-option'); this.colorTaskId = document.getElementById('colorTaskId'); this.selectedColor = document.getElementById('selectedColor'); this.closeColorModal = document.getElementById('closeColorModal'); this.cancelColor = document.getElementById('cancelColor'); this.saveColor = document.getElementById('saveColor'); this.reportModal = document.getElementById('reportModal'); this.reportContent = document.getElementById('reportContent'); this.closeReportModal = document.getElementById('closeReportModal'); this.closeReport = document.getElementById('closeReport'); this.copyReport = document.getElementById('copyReport'); this.importExportModal = document.getElementById('importExportModal'); this.closeImportExportModal = document.getElementById('closeImportExportModal'); this.closeImportExport = document.getElementById('closeImportExport'); this.exportTasksBtn = document.getElementById('exportTasksBtn'); this.importTasksInput = document.getElementById('importTasksInput'); this.importTasksBtn = document.getElementById('importTasksBtn'); this.categoriesModal = document.getElementById('categoriesModal'); this.closeCategoriesModal = document.getElementById('closeCategoriesModal'); this.closeCategories = document.getElementById('closeCategories'); this.newCategoryInput = document.getElementById('newCategoryInput'); this.categoryColorPreview = document.getElementById('categoryColorPreview'); this.addCategoryBtn = document.getElementById('addCategoryBtn'); this.categoriesList = document.getElementById('categoriesList'); this.categoryColorModal = document.getElementById('categoryColorModal'); this.closeCategoryColorModal = document.getElementById('closeCategoryColorModal'); this.categoryColorOptions = document.querySelectorAll('#categoryColorOptions .color-option'); this.categoryColorPickerTarget = document.getElementById('categoryColorPickerTarget'); this.cancelCategoryColor = document.getElementById('cancelCategoryColor'); this.saveCategoryColor = document.getElementById('saveCategoryColor');

        const today = new Date(); this.deferDate.min = this.formatDateForInput(today);
        this.setupEventListeners(); this.populateCategoryDropdowns(); this.renderTasks(); this.renderCategories();
    }

    setupEventListeners() {
        // Standard Listeners
        this.addTaskButton.addEventListener('click', () => this.handleAddTask());
        this.taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.handleAddTask(); });
        this.importExportButton.addEventListener('click', () => this.openModal(this.importExportModal));
        this.manageCategoriesButton.addEventListener('click', () => this.openModal(this.categoriesModal));
        this.deleteAllCompletedBtn.addEventListener('click', () => this.handleDeleteAllCompleted());
        this.tabs.forEach(tab => tab.addEventListener('click', () => this.switchTab(tab.dataset.tab)));
        this.activeFilterCategory.addEventListener('change', () => this.renderTasks());
        this.deferredFilterCategory.addEventListener('change', () => this.renderTasks());
        this.completedFilterCategory.addEventListener('change', () => this.renderTasks());

        // Drag/Drop Listeners
        this.emailDropZone.addEventListener('dragenter', (e) => { e.preventDefault(); e.stopPropagation(); this.emailDropZone.classList.add('drag-over'); });
        this.emailDropZone.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy'; this.emailDropZone.classList.add('drag-over'); });
        this.emailDropZone.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); if (e.target === this.emailDropZone || !this.emailDropZone.contains(e.relatedTarget)) { this.emailDropZone.classList.remove('drag-over'); } });
        this.emailDropZone.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); this.emailDropZone.classList.remove('drag-over'); console.log("Drop event triggered"); this.handleDrop(e.dataTransfer); });

        // Task Actions Delegation
        const handleTaskActions = (e) => {
            const target = e.target.closest('button, a'); if (!target) return;
            const taskId = target.closest('tr')?.dataset.id; if (!taskId) return;
            if (target.classList.contains('btn-complete')) this.handleCompleteTask(taskId);
            else if (target.classList.contains('btn-edit')) this.handleOpenEditModal(taskId);
            else if (target.classList.contains('btn-notes')) this.handleOpenNotesModal(taskId);
            else if (target.classList.contains('btn-defer')) this.handleOpenDeferModal(taskId);
            else if (target.classList.contains('btn-color')) this.handleOpenColorModal(taskId);
            else if (target.classList.contains('btn-report')) this.handleOpenReportModal(taskId);
            else if (target.classList.contains('btn-undefer')) this.handleUndeferTask(taskId);
            else if (target.classList.contains('btn-restore')) this.handleRestoreTask(taskId);
            else if (target.classList.contains('btn-delete')) this.handleDeleteTask(taskId);
        };
        this.activeTaskList.addEventListener('click', handleTaskActions);
        this.deferredTaskList.addEventListener('click', handleTaskActions);
        this.completedTaskList.addEventListener('click', handleTaskActions);

        // Modal & Other Listeners
        // Edit Modal
        this.closeEditModal.addEventListener('click', () => this.closeModal(this.editModal));
        this.cancelEdit.addEventListener('click', () => this.closeModal(this.editModal));
        this.saveEdit.addEventListener('click', () => this.handleSaveEdit());
        // Notes Modal
        this.closeNotesModal.addEventListener('click', () => this.closeModal(this.notesModal));
        this.closeNotes.addEventListener('click', () => this.closeModal(this.notesModal));
        this.addNote.addEventListener('click', () => this.handleAddNote());
        this.newNoteInput.addEventListener('keypress', (e) => { if (e.ctrlKey && e.key === 'Enter') this.handleAddNote(); });
        // Defer Modal
        this.closeDeferModal.addEventListener('click', () => this.closeModal(this.deferModal));
        this.cancelDefer.addEventListener('click', () => this.closeModal(this.deferModal));
        this.saveDefer.addEventListener('click', () => this.handleSaveDefer());
        this.deferTomorrow.addEventListener('click', () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); this.deferDate.valueAsDate = d; });
        this.deferNextWeek.addEventListener('click', () => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(0, 0, 0, 0); this.deferDate.valueAsDate = d; });
        // Color Modal
        this.closeColorModal.addEventListener('click', () => this.closeModal(this.colorModal));
        this.cancelColor.addEventListener('click', () => this.closeModal(this.colorModal));
        this.saveColor.addEventListener('click', () => this.handleSaveColor());
        this.colorOptions.forEach(o => o.addEventListener('click', () => { this.colorOptions.forEach(opt => opt.classList.remove('selected')); o.classList.add('selected'); this.selectedColor.value = o.dataset.color; }));
        // Report Modal
        this.closeReportModal.addEventListener('click', () => this.closeModal(this.reportModal));
        this.closeReport.addEventListener('click', () => this.closeModal(this.reportModal));
        this.copyReport.addEventListener('click', () => this.handleCopyReport());
        // Import/Export Modal
        this.closeImportExportModal.addEventListener('click', () => this.closeModal(this.importExportModal));
        this.closeImportExport.addEventListener('click', () => this.closeModal(this.importExportModal));
        this.exportTasksBtn.addEventListener('click', () => this.handleExportTasks());
        this.importTasksBtn.addEventListener('click', () => this.handleImportTasks());
        // Categories Modal
        this.closeCategoriesModal.addEventListener('click', () => this.closeModal(this.categoriesModal));
        this.closeCategories.addEventListener('click', () => this.closeModal(this.categoriesModal));
        this.addCategoryBtn.addEventListener('click', () => this.handleAddCategory());
        this.categoryColorPreview.addEventListener('click', () => this.openCategoryColorPicker('new'));
        // Category Color Picker Modal
        this.closeCategoryColorModal.addEventListener('click', () => this.closeModal(this.categoryColorModal));
        this.cancelCategoryColor.addEventListener('click', () => this.closeModal(this.categoryColorModal));
        this.saveCategoryColor.addEventListener('click', () => this.handleSaveCategoryColor());
        this.categoryColorOptions.forEach(o => o.addEventListener('click', () => { this.categoryColorOptions.forEach(opt => opt.classList.remove('selected')); o.classList.add('selected'); }));
        // Other Listeners
        document.addEventListener('tasksUpdated', () => this.renderTasks());
        this.taskInput.addEventListener('input', () => detectTextDirection(this.taskInput));
        this.editTaskInput.addEventListener('input', () => detectTextDirection(this.editTaskInput));
        this.newNoteInput.addEventListener('input', () => detectTextDirection(this.newNoteInput));
    }

    // --- START: Handle Drop Logic (Simplified Subject, Auto-Edit) ---
    handleDrop(dataTransfer) {
        console.log("Handling drop. Available types:", dataTransfer.types);

        let htmlData = null, plainText = null, uriList = null;
        let sourceUrl = null;
        const subject = "New Dropped Task"; // Use a fixed placeholder

        // --- Get Data ---
        if (dataTransfer.types.includes('text/html')) htmlData = dataTransfer.getData('text/html');
        if (dataTransfer.types.includes('text/uri-list')) uriList = dataTransfer.getData('text/uri-list');
        if (dataTransfer.types.includes('text/plain')) plainText = dataTransfer.getData('text/plain');

        // --- URL Extraction Logic (same as before) ---
        if (htmlData) { try { const doc = new DOMParser().parseFromString(htmlData, 'text/html'); const link = doc.querySelector('a'); if (link?.href) sourceUrl = link.href; } catch (e) { console.error("Err parsing HTML URL:", e); } }
        if (!sourceUrl && uriList) sourceUrl = uriList.split(/[\r\n]+/)[0].trim();
        if (!sourceUrl && plainText) { const m = plainText.match(/https?:\/\/[^\s\r\n]+/); if (m) sourceUrl = m[0]; }

        if(sourceUrl) console.log(`Extracted URL: ${sourceUrl}`);
        else console.log("Failed to extract URL.");

        // --- Task Creation (using placeholder subject) ---
        if (sourceUrl) { // Only need URL now
            console.log(`Creating task with placeholder: Subject='${subject}', URL='${sourceUrl}'`);
            const currentCategory = this.categorySelect.value;
            const newTask = this.taskManager.addTask(subject, currentCategory); // Use placeholder

            if (newTask) {
                newTask.sourceUrl = sourceUrl; // Assign the extracted URL
                this.taskManager.saveTasks(); // Save task with URL
                this.renderTasks(); // Update the UI to show the new task
                console.log("Task created, now opening edit modal:", newTask.id);

                // *** Open Edit Modal Immediately ***
                setTimeout(() => {
                    this.handleOpenEditModal(newTask.id);
                }, 100); // Small delay

            } else {
                 console.error("Task object creation failed in TaskManager.");
                 this.showAlert('Error creating task object.');
            }
        } else {
            console.log("Drop handling finished. No task created (missing URL).");
            this.showAlert("Could not extract a usable link from the dropped item.");
        }
    }
    // --- END: Handle Drop Logic ---


    // --- Other UI Methods ---
    populateCategoryDropdowns() { const dds = [this.categorySelect, this.editCategorySelect, this.activeFilterCategory, this.deferredFilterCategory, this.completedFilterCategory]; dds.forEach(dd => { while (dd.options.length > 1) dd.remove(1); this.categoryManager.categories.forEach(cat => { const opt = document.createElement('option'); opt.value = cat.id; opt.textContent = cat.name; dd.appendChild(opt); }); }); }
    getContrastColor(hex) { if (!hex || hex.length < 4) return '#000'; try { hex = hex.replace('#', ''); if (hex.length === 3) hex = hex.split('').map(c => c + c).join(''); let r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16); const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255; return lum > 0.5 ? '#000' : '#fff'; } catch (e) { return '#000'; } }
    switchTab(tabName) { this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName)); this.tabContents.forEach(c => c.classList.toggle('active', c.id === `${tabName}TasksTab`)); }
    handleAddTask() { const desc = this.taskInput.value.trim(), catId = this.categorySelect.value; if (desc) { try { const task = this.taskManager.addTask(desc, catId); if (task) { this.taskManager.saveTasks(); this.taskInput.value = ''; this.renderTasks(); this.taskInput.focus(); } } catch (e) { this.showAlert('Error adding task.'); console.error(e); } } }
    handleDeleteTask(id) { this.showConfirmDialog('Delete Task', 'Delete this task permanently?', () => { this.taskManager.deleteTask(id); this.renderTasks(); }); }
    handleDeleteAllCompleted() { this.showConfirmDialog('Delete All Completed', 'Delete ALL completed tasks permanently?', () => { this.taskManager.getCompletedTasks().forEach(t => this.taskManager.deleteTask(t.id)); this.renderTasks(); }); }
    showConfirmDialog(title, msg, onConfirm) { let cd = document.getElementById('confirmDialog'); if (!cd) { cd = document.createElement('div'); cd.id = 'confirmDialog'; cd.className = 'modal'; cd.style.zIndex = '2000'; cd.innerHTML = `<div class="modal-content" style="max-width: 400px;"><div class="modal-header"><h2 id="confirmDialogTitle"></h2><span class="close-button" id="closeConfirmDialog">×</span></div><div class="modal-body"><p id="confirmDialogMessage"></p></div><div class="modal-footer"><button class="cancel-button" id="cancelConfirm">Cancel</button><button class="save-button danger-button" id="confirmAction">Confirm</button></div></div>`; document.body.appendChild(cd); document.getElementById('closeConfirmDialog').onclick = () => cd.style.display = 'none'; document.getElementById('cancelConfirm').onclick = () => cd.style.display = 'none'; } document.getElementById('confirmDialogTitle').textContent = title; document.getElementById('confirmDialogMessage').textContent = msg; const cb = document.getElementById('confirmAction'), ncb = cb.cloneNode(true); cb.parentNode.replaceChild(ncb, cb); ncb.onclick = () => { onConfirm(); cd.style.display = 'none'; }; cd.style.display = 'flex'; }
    handleCompleteTask(id) { this.taskManager.completeTask(id); this.renderTasks(); }
    handleRestoreTask(id) { this.taskManager.restoreTask(id); this.renderTasks(); }
    handleOpenEditModal(id) { const task = this.taskManager.tasks.find(t => t.id === id); if (task) { this.editTaskInput.value = task.description; this.editTaskId.value = task.id; this.editCategorySelect.value = task.categoryId || ""; detectTextDirection(this.editTaskInput); this.openModal(this.editModal); this.editTaskInput.focus(); this.editTaskInput.select(); /* Select text */ } }
    handleSaveEdit() { const id = this.editTaskId.value, desc = this.editTaskInput.value.trim(), catId = this.editCategorySelect.value; if (desc) { this.taskManager.editTask(id, desc, catId); this.closeModal(this.editModal); this.renderTasks(); } else { this.showAlert("Task description cannot be empty."); } }
    handleOpenNotesModal(id) { const task = this.taskManager.tasks.find(t => t.id === id); if (task) { this.taskDescription.textContent = task.description; detectTextDirection(this.taskDescription); this.notesTaskId.value = task.id; this.renderNotes(task.notes); this.openModal(this.notesModal); this.newNoteInput.value = ''; this.newNoteInput.focus(); this.newNoteInput.dir = task.isHebrew ? 'rtl' : 'ltr'; } }
    handleAddNote() { const id = this.notesTaskId.value, text = this.newNoteInput.value.trim(); if (text) { const note = this.taskManager.addNote(id, text); if (note) { this.newNoteInput.value = ''; const task = this.taskManager.tasks.find(t => t.id === id); this.renderNotes(task?.notes || []); this.newNoteInput.focus(); this.renderTasks(); } } }
    handleDeleteNote(noteId) { const taskId = this.notesTaskId.value; this.showConfirmDialog('Delete Note', 'Delete this note permanently?', () => { if (this.taskManager.deleteNote(taskId, noteId)) { const task = this.taskManager.tasks.find(t => t.id === taskId); this.renderNotes(task?.notes || []); this.renderTasks(); } }); }
    handleOpenDeferModal(id) { const task = this.taskManager.tasks.find(t => t.id === id); if (task) { this.deferTaskDescription.textContent = task.description; detectTextDirection(this.deferTaskDescription); this.deferTaskId.value = task.id; this.deferDate.value = ''; this.openModal(this.deferModal); this.deferDate.focus(); } }
    handleSaveDefer() { const id = this.deferTaskId.value, val = this.deferDate.value; if (val) { const [y, m, d] = val.split('-').map(Number); const date = new Date(y, m - 1, d, 0, 0, 0, 0); if (date < new Date().setHours(0, 0, 0, 0)) { this.showAlert('Cannot defer to past date.'); return; } this.taskManager.deferTask(id, date); this.closeModal(this.deferModal); this.renderTasks(); } else { this.showAlert('Select date'); } }
    handleUndeferTask(id) { this.taskManager.undeferTask(id); this.renderTasks(); }
    showAlert(msg) { let ad = document.getElementById('alertDialog'); if (!ad) { ad = document.createElement('div'); ad.id = 'alertDialog'; ad.className = 'modal'; ad.style.zIndex = '2000'; ad.innerHTML = `<div class="modal-content" style="max-width: 400px;"><div class="modal-header"><h2>Alert</h2><span class="close-button" id="closeAlertDialog">×</span></div><div class="modal-body"><p id="alertDialogMessage"></p></div><div class="modal-footer"><button class="save-button" id="okAlert" style="min-width: 80px;">OK</button></div></div>`; document.body.appendChild(ad); document.getElementById('closeAlertDialog').onclick = () => ad.style.display = 'none'; document.getElementById('okAlert').onclick = () => ad.style.display = 'none'; } document.getElementById('alertDialogMessage').textContent = msg; ad.style.display = 'flex'; }
    handleOpenColorModal(id) { const task = this.taskManager.tasks.find(t => t.id === id); if (task) { this.colorTaskDescription.textContent = task.description; detectTextDirection(this.colorTaskDescription); this.colorTaskId.value = task.id; this.selectedColor.value = task.color || ""; this.colorOptions.forEach(o => o.classList.toggle('selected', o.dataset.color === task.color)); this.openModal(this.colorModal); } }
    handleSaveColor() { this.handleSetTaskColor(this.colorTaskId.value, this.selectedColor.value); this.closeModal(this.colorModal); }
    handleSetTaskColor(id, color) { this.taskManager.setTaskColor(id, color); this.renderTasks(); }
    handleOpenReportModal(id) { const task = this.taskManager.tasks.find(t => t.id === id); if (task) { let rpt = `Task Report: ${task.description}\n------------------------------------------\nStatus: ${task.completed ? 'Completed' : (task.deferUntil && new Date(task.deferUntil) > new Date().setHours(0, 0, 0, 0) ? 'Deferred' : 'Active')}\n`; const cat = task.categoryId ? this.categoryManager.getCategoryById(task.categoryId) : null; rpt += `Category: ${cat ? cat.name : 'None'}\nDate Added: ${this.formatDateTime(new Date(task.dateAdded))}\n`; if (task.sourceUrl) rpt += `Source Link: ${task.sourceUrl}\n`; if (task.completed) rpt += `Completed On: ${this.formatDateTime(new Date(task.completedDate))}\n`; if (task.deferUntil && new Date(task.deferUntil) > new Date().setHours(0, 0, 0, 0)) rpt += `Deferred Until: ${this.formatDate(new Date(task.deferUntil))}\n`; rpt += `\nNotes (${task.notes.length}):\n------------------------------------------\n`; if (task.notes.length === 0) { rpt += "No notes.\n"; } else { [...task.notes].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((n, i) => { rpt += `Note ${i + 1} (${this.formatDateTime(new Date(n.date))}):\n${n.text}\n\n`; }); } this.reportContent.textContent = rpt; detectTextDirection(this.reportContent); this.openModal(this.reportModal); } }
    handleCopyReport() { navigator.clipboard.writeText(this.reportContent.textContent).then(() => this.showAlert('Report copied!'), () => { try { const range = document.createRange(); range.selectNode(this.reportContent); window.getSelection().removeAllRanges(); window.getSelection().addRange(range); document.execCommand('copy'); window.getSelection().removeAllRanges(); this.showAlert('Report copied! (Fallback)'); } catch (e) { this.showAlert('Failed to copy.'); console.error(e); } }); }
    handleExportTasks() { const d = { tasks: this.taskManager.tasks, categories: this.categoryManager.categories }; const data = JSON.stringify(d, null, 2), blob = new Blob([data], { type: 'application/json' }), url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `tasks-${new Date().toISOString().split('T')[0]}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }
    handleImportTasks() { const fi = this.importTasksInput; if (!fi.files?.length) { this.showAlert('Select file'); return; } const file = fi.files[0]; if (file.type !== 'application/json') { this.showAlert('Select JSON'); fi.value = ''; return; } const reader = new FileReader(); reader.onload = (e) => { try { const data = JSON.parse(e.target.result); const isNew = data.tasks && data.categories && Array.isArray(data.tasks) && Array.isArray(data.categories); const isLegacy = !isNew && Array.isArray(data); if (isNew) { this.showConfirmDialog('Import Data', `Replace ALL data with ${data.tasks.length} tasks & ${data.categories.length} cats?`, () => { this.categoryManager.categories = data.categories; this.taskManager.tasks = data.tasks; this.taskManager.loadTasks(); this.categoryManager.saveCategories(); this.taskManager.saveTasks(); this.populateCategoryDropdowns(); this.renderTasks(); this.renderCategories(); this.closeModal(this.importExportModal); this.showAlert('Data imported!'); fi.value = ''; }); } else if (isLegacy) { this.showConfirmDialog('Import (Legacy)', `Replace tasks with ${data.length} tasks? Cats unchanged.`, () => { this.taskManager.tasks = data; this.taskManager.loadTasks(); this.taskManager.saveTasks(); this.renderTasks(); this.closeModal(this.importExportModal); this.showAlert('Legacy imported!'); fi.value = ''; }); } else throw new Error('Invalid structure'); } catch (err) { this.showAlert(`Import Error: ${err.message}`); console.error(err); fi.value = ''; } }; reader.readAsText(file); }
    handleAddCategory() { const name = this.newCategoryInput.value.trim(); if (!name) { this.showAlert('Enter name'); return; } const color = getComputedStyle(this.categoryColorPreview).backgroundColor; const hx = (rgb) => { try { const r = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/); if (!r) return '#CCC'; const [rd, g, b] = r.slice(1).map(Number); return "#" + ((1 << 24) + (rd << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase(); } catch { return '#CCC'; } }; this.categoryManager.addCategory(name, hx(color)); this.newCategoryInput.value = ''; this.categoryColorPreview.style.backgroundColor = '#4caf50'; this.renderCategories(); this.populateCategoryDropdowns(); }
    handleEditCategory(id) { const cat = this.categoryManager.getCategoryById(id); if (!cat || cat.isDefault) { this.showAlert("Defaults cannot be renamed."); return; } let ed = document.getElementById('editCategoryDialog'); if (!ed) { ed = document.createElement('div'); ed.id = 'editCategoryDialog'; ed.className = 'modal'; ed.style.zIndex = '1500'; ed.innerHTML = `<div class="modal-content"><div class="modal-header"><h2>Edit Cat Name</h2><span class="close-button" id="closeEditCat">×</span></div><div class="modal-body"><label for="editCatName">Name:</label><input type="text" id="editCatName"><input type="hidden" id="editCatId"></div><div class="modal-footer"><button class="cancel-button" id="cancelEditCat">Cancel</button><button class="save-button" id="saveEditCat">Save</button></div></div>`; document.body.appendChild(ed); document.getElementById('closeEditCat').onclick = () => ed.style.display = 'none'; document.getElementById('cancelEditCat').onclick = () => ed.style.display = 'none'; document.getElementById('saveEditCat').onclick = () => { const cid = document.getElementById('editCatId').value, nName = document.getElementById('editCatName').value.trim(), oCat = this.categoryManager.getCategoryById(cid); if (nName && oCat) { this.categoryManager.updateCategory(cid, nName, oCat.color); this.renderCategories(); this.populateCategoryDropdowns(); ed.style.display = 'none'; } else if (!nName) this.showAlert('Enter name'); }; document.getElementById('editCatName').oninput = function() { detectTextDirection(this); }; } document.getElementById('editCatId').value = id; document.getElementById('editCatName').value = cat.name; detectTextDirection(document.getElementById('editCatName')); ed.style.display = 'flex'; document.getElementById('editCatName').focus(); }
    handleDeleteCategory(id) { const cat = this.categoryManager.getCategoryById(id); if (!cat || cat.isDefault) { this.showAlert('Defaults cannot be deleted.'); return; } const tasks = this.taskManager.tasks.filter(t => t.categoryId === id); const msg = tasks.length ? `Cat "${cat.name}" used by ${tasks.length} task(s). Remove from tasks & delete?` : `Delete cat "${cat.name}"?`; this.showConfirmDialog('Delete Cat', msg, () => { if (tasks.length) tasks.forEach(t => this.taskManager.setTaskCategory(t.id, "")); if (this.categoryManager.deleteCategory(id)) { this.renderCategories(); this.populateCategoryDropdowns(); this.renderTasks(); } }); }
    openCategoryColorPicker(target) { this.categoryColorOptions.forEach(o => o.classList.remove('selected')); this.categoryColorPickerTarget.value = target; let curColor = '#4caf50'; if (target !== 'new') { const cat = this.categoryManager.getCategoryById(target); if (cat && !cat.isDefault) curColor = cat.color; else if (cat?.isDefault) { this.showAlert("Cannot change default color."); return; } } else { const pc = getComputedStyle(this.categoryColorPreview).backgroundColor; const hx = (rgb) => { try { const r = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/); if (!r) return '#CCC'; const [rd, g, b] = r.slice(1).map(Number); return "#" + ((1 << 24) + (rd << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase(); } catch { return '#CCC'; } }; curColor = hx(pc); } const co = Array.from(this.categoryColorOptions).find(o => o.dataset.color.toUpperCase() === curColor.toUpperCase()); if (co) co.classList.add('selected'); this.openModal(this.categoryColorModal); }
    handleSaveCategoryColor() { const target = this.categoryColorPickerTarget.value, selOpt = document.querySelector('#categoryColorOptions .color-option.selected'); if (!selOpt) { this.showAlert('Select color'); return; } const selColor = selOpt.dataset.color; if (target === 'new') this.categoryColorPreview.style.backgroundColor = selColor; else { const cat = this.categoryManager.getCategoryById(target); if (cat && !cat.isDefault) { this.categoryManager.updateCategory(target, cat.name, selColor); this.renderCategories(); this.populateCategoryDropdowns(); this.renderTasks(); } } this.closeModal(this.categoryColorModal); }
    renderCategories() { this.categoriesList.innerHTML = ''; if (this.categoryManager.categories.length === 0) { this.categoriesList.innerHTML = '<div class="empty-message">No cats.</div>'; return; } this.categoryManager.categories.forEach(cat => { const item = document.createElement('div'); item.className = 'category-item'; const swatch = document.createElement('span'); swatch.className = 'category-color'; swatch.style.backgroundColor = cat.color; const name = document.createElement('span'); name.className = 'category-name'; name.textContent = cat.name; detectTextDirection(name); const acts = document.createElement('div'); acts.className = 'category-actions'; if (!cat.isDefault) { const ed = document.createElement('button'); ed.className = 'btn'; ed.style.backgroundColor = '#FFC107'; ed.textContent = 'Rename'; ed.title = 'Rename Cat'; ed.onclick = () => this.handleEditCategory(cat.id); const co = document.createElement('button'); co.className = 'btn'; co.style.cssText = 'background-color:#607D8B;color:white;'; co.textContent = 'Color'; co.title = 'Change Color'; co.onclick = () => this.openCategoryColorPicker(cat.id); const de = document.createElement('button'); de.className = 'btn'; de.style.cssText = 'background-color:#F44336;color:white;'; de.textContent = 'Delete'; de.title = 'Delete Cat'; de.onclick = () => this.handleDeleteCategory(cat.id); acts.append(ed, co, de); } else { const lbl = document.createElement('span'); lbl.style.cssText = 'color:#888;font-style:italic;font-size:12px;'; lbl.textContent = 'Default'; acts.appendChild(lbl); } item.append(swatch, name, acts); this.categoriesList.appendChild(item); }); }
    openModal(modal) { modal.style.display = 'flex'; }
    closeModal(modal) { modal.style.display = 'none'; }
    renderNotes(notes) { this.notesList.innerHTML = ''; if (!notes?.length) { this.notesList.innerHTML = '<div class="empty-message" style="padding:10px 0;">No notes.</div>'; return; } [...notes].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(note => { const el = document.createElement('div'); el.className = 'note-item'; el.dataset.id = note.id; const h = document.createElement('div'); h.className = 'note-header'; const d = document.createElement('div'); d.className = 'note-date'; d.textContent = this.formatDateTime(new Date(note.date)); const b = document.createElement('button'); b.className = 'btn btn-delete note-delete-btn'; b.textContent = 'Del'; b.title = 'Delete Note'; b.onclick = (e) => { e.stopPropagation(); this.handleDeleteNote(note.id); }; h.append(d, b); const t = document.createElement('div'); t.className = 'note-text'; t.textContent = note.text; detectTextDirection(t); el.append(h, t); this.notesList.appendChild(el); }); }
    formatDateTime(d) { if (!(d instanceof Date) || isNaN(d)) return 'Invalid'; return new Intl.DateTimeFormat(navigator.language || 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d); }
    formatDate(d) { if (!(d instanceof Date) || isNaN(d)) return 'Invalid'; return new Intl.DateTimeFormat(navigator.language || 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(d); }
    formatDateForInput(d) { if (!(d instanceof Date) || isNaN(d)) return ''; const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dy = String(d.getDate()).padStart(2, '0'); return `${y}-${m}-${dy}`; }
    updateTaskDirection(row, task) { const rtl = task.isHebrew; row.querySelectorAll('td').forEach(td => td.dir = rtl ? 'rtl' : 'ltr'); row.querySelector('.action-buttons').style.justifyContent = rtl ? 'flex-start' : 'flex-end'; }
    createCategoryBadge(task) { if (!task.categoryId) return ''; const cat = this.categoryManager.getCategoryById(task.categoryId); if (!cat) return ''; const contrast = this.getContrastColor(cat.color); return `<span class="category-badge" style="background-color: ${cat.color}; color: ${contrast};">${cat.name}</span>`; }
    renderTasks() { console.log("Rendering..."); const af = this.activeFilterCategory.value, df = this.deferredFilterCategory.value, cf = this.completedFilterCategory.value; const at = this.taskManager.getActiveTasks(af), dt = this.taskManager.getDeferredTasks(df), ct = this.taskManager.getCompletedTasks(cf); this.updateBadges(this.taskManager.getActiveTasks().length, this.taskManager.getDeferredTasks().length, this.taskManager.getCompletedTasks().length); this.activeTaskList.innerHTML = ''; this.activeEmptyMessage.style.display = at.length ? 'none' : 'block'; [...at].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).forEach(t => { const r = document.createElement('tr'); r.dataset.id = t.id; r.style.backgroundColor = t.color || 'transparent'; const dH = `${this.createCategoryBadge(t)}${t.description}`; let aH = '<div class="action-buttons">'; if (t.sourceUrl) aH += `<a href="${t.sourceUrl}" target="_blank" class="btn btn-open-email" title="Open Source Link"><i class="fas fa-envelope"></i></a>`; aH += `<button class="btn btn-complete" title="Complete">Comp</button><button class="btn btn-defer" title="Defer">Defer</button><button class="btn btn-notes" title="Notes">${t.notes.length ? `Notes(${t.notes.length})` : 'Note'}</button><button class="btn btn-color" title="Color">Color</button><button class="btn btn-edit" title="Edit">Edit</button><button class="btn btn-report" title="Report">Report</button></div>`; r.innerHTML = `<td>${dH}</td><td>${this.formatDate(new Date(t.dateAdded))}</td><td>${aH}</td>`; this.activeTaskList.appendChild(r); this.updateTaskDirection(r, t); }); this.deferredTaskList.innerHTML = ''; this.deferredEmptyMessage.style.display = dt.length ? 'none' : 'block'; [...dt].sort((a, b) => new Date(a.deferUntil) - new Date(b.deferUntil)).forEach(t => { const r = document.createElement('tr'); r.dataset.id = t.id; r.style.backgroundColor = t.color || 'transparent'; const dH = `${this.createCategoryBadge(t)}${t.description}`; let aH = '<div class="action-buttons">'; if (t.sourceUrl) aH += `<a href="${t.sourceUrl}" target="_blank" class="btn btn-open-email" title="Open Source Link"><i class="fas fa-envelope"></i></a>`; aH += `<button class="btn btn-undefer" title="Activate">Activate</button><button class="btn btn-notes" title="Notes">${t.notes.length ? `Notes(${t.notes.length})` : 'Note'}</button><button class="btn btn-color" title="Color">Color</button><button class="btn btn-edit" title="Edit">Edit</button><button class="btn btn-report" title="Report">Report</button></div>`; r.innerHTML = `<td>${dH}</td><td>${this.formatDate(new Date(t.deferUntil))}</td><td>${aH}</td>`; this.deferredTaskList.appendChild(r); this.updateTaskDirection(r, t); }); this.completedTaskList.innerHTML = ''; this.completedEmptyMessage.style.display = ct.length ? 'none' : 'block'; this.deleteAllCompletedBtn.style.display = ct.length ? 'inline-block' : 'none'; [...ct].sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate)).forEach(t => { const r = document.createElement('tr'); r.dataset.id = t.id; const dH = `<span class="task-completed">${this.createCategoryBadge(t)}${t.description}</span>`; let aH = '<div class="action-buttons">'; if (t.sourceUrl) aH += `<a href="${t.sourceUrl}" target="_blank" class="btn btn-open-email" title="Open Source Link"><i class="fas fa-envelope"></i></a>`; aH += `<button class="btn btn-restore" title="Restore">Restore</button><button class="btn btn-notes" title="Notes">${t.notes.length ? `Notes(${t.notes.length})` : 'Notes'}</button><button class="btn btn-report" title="Report">Report</button><button class="btn btn-delete" title="Delete">Delete</button></div>`; r.innerHTML = `<td>${dH}</td><td>${this.formatDateTime(new Date(t.completedDate))}</td><td>${aH}</td>`; this.completedTaskList.appendChild(r); this.updateTaskDirection(r, t); }); console.log("Render complete."); }
    updateBadges(active, deferred, completed) { this.activeBadge.textContent = active; this.activeBadge.style.display = active > 0 ? 'inline-block' : 'none'; this.deferredBadge.textContent = deferred; this.deferredBadge.style.display = deferred > 0 ? 'inline-block' : 'none'; this.completedBadge.textContent = completed; this.completedBadge.style.display = completed > 0 ? 'inline-block' : 'none'; }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
   try {
       console.log("DOM Loaded. Initializing...");
       const catMgr = new CategoryManager();
       const taskMgr = new TaskManager(catMgr);
       const ui = new UI(taskMgr, catMgr);
       document.querySelectorAll('input[type="text"], textarea').forEach(el => detectTextDirection(el));
       console.log('Initialized OK.');
   } catch (e) {
       console.error('Init Error:', e);
       document.body.innerHTML = `<div style="color:red;padding:20px;font-family:sans-serif;"><h1>Init Error</h1><p>Check console.</p><pre>${e.stack}</pre></div>`;
   }
});