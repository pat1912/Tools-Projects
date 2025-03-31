# Advanced Task Manager - Technical Specification

## 1. Overview

Advanced Task Manager is a client-side, single-page web application designed for managing personal or work tasks. It allows users to add, categorize, defer, color-code, and track tasks with associated notes. A key feature is the ability to create tasks by dragging links (like email permalinks from OWA) onto a drop zone. The application prioritizes ease of use, persistence via browser storage, and support for both LTR and RTL languages.

## 2. Architecture

### 2.1. Technology Stack

*   **Frontend**: HTML5, CSS3 (embedded in HTML), JavaScript (ES6+ Classes)
*   **Storage**: Browser's `localStorage` API
*   **Dependencies**:
    *   Font Awesome 5.15.4 (via CDN for icons, e.g., link icon)
    *   No build tools or server-side components required.

### 2.2. Code Structure (`script.js`)

The JavaScript is organized into classes:

*   **`Category`**: Represents a single category object (`id`, `name`, `color`, `isDefault`).
*   **`CategoryManager`**: Manages the collection of `Category` objects, handles CRUD operations, default categories, and saving/loading from `localStorage`.
*   **`Task`**: Represents a single task object (`id`, `description`, `completed`, `dateAdded`, `completedDate`, `deferUntil`, `notes` array, `color`, `categoryId`, `isHebrew`, `sourceUrl`).
*   **`Note`**: Represents a single note object associated with a task (`id`, `text`, `date`).
*   **`TaskManager`**: Manages the collection of `Task` objects, handles CRUD operations, status changes (complete, defer, restore), note management, and saving/loading tasks from `localStorage`. Includes logic for checking deferred task status.
*   **`UI`**: Handles all DOM manipulation, event listening, rendering, modal management, and interaction logic. Acts as the interface between the data managers (`TaskManager`, `CategoryManager`) and the user.

### 2.3. Data Model

*   **Tasks**: Stored as an array of `Task` objects.
*   **Categories**: Stored as an array of `Category` objects.
*   **Notes**: Stored within the `notes` array property of each `Task` object.

### 2.4. Storage Schema (`localStorage`)

*   `advancedTasks`: JSON-stringified array of `Task` objects.
*   `taskManagerCategories`: JSON-stringified array of `Category` objects.

## 3. Key Features & Implementation

### 3.1. Task Management

*   **Creation**:
    *   Manual: Via `taskInput`, `categorySelect`, and `addTaskButton`. Handled by `UI.handleAddTask()` which calls `TaskManager.addTask()`.
    *   Drag & Drop: See section 3.7.
*   **Editing**: Via Edit Modal. Handled by `UI.handleOpenEditModal()` and `UI.handleSaveEdit()`, calling `TaskManager.editTask()`.
*   **Completion/Restoration**: Via buttons in task rows. Handled by `UI` event listeners calling `TaskManager.completeTask()` or `TaskManager.restoreTask()`. Completed tasks are visually distinct and moved to the "Completed" tab.
*   **Deferral**: Via Defer Modal. Handled by `UI.handleOpenDeferModal()` and `UI.handleSaveDefer()`, calling `TaskManager.deferTask()`. Deferred tasks moved to "Deferred" tab. Active tasks list automatically includes tasks whose `deferUntil` date has passed (`TaskManager.getActiveTasks()` logic). Manual undeferral via `UI.handleUndeferTask()` calls `TaskManager.undeferTask()`.
*   **Deletion**: Only possible from "Completed" tab via button (`UI.handleDeleteTask()` -> `TaskManager.deleteTask()`), or via "Delete All Completed" button (`UI.handleDeleteAllCompleted()`). Requires confirmation.
*   **Coloring**: Via Color Modal. Handled by `UI.handleOpenColorModal()`, `UI.handleSaveColor()`, `UI.handleSetTaskColor()` calling `TaskManager.setTaskColor()`. Task row background color is updated in `UI.renderTasks()`.

### 3.2. Category Management

*   **Creation/Editing/Deletion**: Via Categories Modal. Handled by `UI` methods (`handleAddCategory`, `handleEditCategory`, `handleDeleteCategory`, `openCategoryColorPicker`, `handleSaveCategoryColor`) interacting with `CategoryManager`. Default categories have restrictions.
*   **Assignment**: During task creation (manual/edit) via `<select>` dropdowns populated by `UI.populateCategoryDropdowns()`.
*   **Display**: Badges rendered in task rows by `UI.createCategoryBadge()`.
*   **Filtering**: `<select>` elements (`activeFilterCategory`, etc.) trigger `UI.renderTasks()` on change, which uses the filter value when calling `TaskManager.getActive/Deferred/CompletedTasks()`.

### 3.3. Task Notes

*   **Adding/Viewing**: Via Notes Modal. Opened by `UI.handleOpenNotesModal()`. Notes added via `UI.handleAddNote()` -> `TaskManager.addNote()`. Notes displayed via `UI.renderNotes()`.
*   **Deletion**: Via delete button on note item. Handled by `UI.handleDeleteNote()` -> `TaskManager.deleteNote()`. Confirmation required.
*   **Display**: Note count shown on task button, updated during `UI.renderTasks()`.

### 3.4. Task Reporting

*   **Viewing**: Via Report Modal. Opened by `UI.handleOpenReportModal()`. Content generated dynamically based on `Task` properties, including `sourceUrl` and formatted notes.
*   **Copying**: Via "Copy" button, using `navigator.clipboard.writeText()` with fallback. Handled by `UI.handleCopyReport()`.

### 3.5. Import/Export

*   **Functionality**: Via Import/Export Modal.
*   **Export**: `UI.handleExportTasks()` bundles `TaskManager.tasks` and `CategoryManager.categories` into JSON and triggers download.
*   **Import**: `UI.handleImportTasks()` reads JSON file, detects format (new or legacy), confirms overwrite, replaces data in managers, saves, and re-renders UI. Uses `TaskManager.loadTasks()` to normalize imported data.

### 3.6. Language Support (RTL/LTR)

*   **Detection**: `detectTextDirection()` helper function checks text content/value for Hebrew characters.
*   **Application**:
    *   Input fields (`input[type=text]`, `textarea`) have `dir` attribute set dynamically via `input` event listeners in `UI.setupEventListeners()`.
    *   Task rows (`<tr>`) and specific cells (`<td>`) have `dir` set in `UI.updateTaskDirection()` based on `task.isHebrew`.
    *   Action buttons justification adjusted in CSS (`[dir="rtl"]`) and potentially via JS in `UI.updateTaskDirection()`.
    *   Notes text (`div.note-text`) and report content (`div#reportContent`) have `dir` set based on content.

### 3.7. Drag and Drop Task Creation

*   **Trigger**: Dropping an item onto `#emailDropZone`.
*   **Event Handling (`UI.setupEventListeners`)**:
    *   `dragenter`, `dragover`: Prevent default, add `.drag-over` class for visual feedback.
    *   `dragleave`: Remove `.drag-over` class.
    *   `drop`: Prevent default, remove `.drag-over` class, call `UI.handleDrop(event.dataTransfer)`.
*   **Data Extraction (`UI.handleDrop`)**:
    *   Retrieves data for `text/html`, `text/uri-list`, `text/plain` types.
    *   Attempts to extract a URL (`sourceUrl`) by prioritizing HTML `<a>` tags, then `text/uri-list`, then searching `text/plain`.
    *   Uses a fixed placeholder string ("New Dropped Task") for the initial task description (`subject`).
*   **Task Creation (`UI.handleDrop`)**:
    *   Checks if `sourceUrl` was successfully extracted.
    *   If yes, calls `TaskManager.addTask()` with the placeholder description.
    *   Assigns the extracted `sourceUrl` to the `newTask.sourceUrl` property.
    *   Calls `TaskManager.saveTasks()`.
    *   Calls `UI.renderTasks()` to display the new task.
    *   **Crucially**, calls `setTimeout(() => { UI.handleOpenEditModal(newTask.id); }, 100)` to automatically open the Edit modal for the new task.
*   **UI Display**: `UI.renderTasks()` conditionally adds an `<a>` tag (`.btn-open-email` with `fas fa-envelope` icon) to the action buttons if `task.sourceUrl` exists. This link opens the `sourceUrl`.

## 4. User Interface Components

*   **Main Layout**: Single container (`.container`) using Flexbox/basic layout.
*   **Input Area**: `div.input-container` with text input, category select, Add button.
*   **Drop Zone**: `div#emailDropZone` with specific styling and hover state (`.drag-over`).
*   **Tabs**: `div.tabs` with `.tab` elements controlling visibility of `.tab-content` sections. Badges (`.tab-badge`) show counts.
*   **Task Grids**: `table.task-grid` within each tab content. Rows (`<tr>`) represent tasks, styled based on state (color, completed). Action buttons (`div.action-buttons`) within last `<td>`.
*   **Modals (`div.modal`)**: Standard structure (`.modal-content`, `.modal-header`, `.modal-body`, `.modal-footer`) used for:
    *   Edit Task (`#editModal`)
    *   Notes (`#notesModal`)
    *   Defer Task (`#deferModal`)
    *   Set Color (`#colorModal`)
    *   Report (`#reportModal`)
    *   Manage Categories (`#categoriesModal`)
    *   Import/Export (`#importExportModal`)
    *   Category Color Picker (`#categoryColorModal`)
    *   Confirmation (`#confirmDialog` - dynamically created)
    *   Alert (`#alertDialog` - dynamically created)

## 5. Technical Considerations

*   **State Management**: Managed implicitly through the `TaskManager` and `CategoryManager` instances holding the data arrays. UI re-renders based on this state.
*   **Persistence**: Relies entirely on `localStorage`. Data is lost if browser data is cleared. Limit is ~5MB.
*   **Error Handling**: Basic `try...catch` blocks for initialization and JSON parsing (load/import). User feedback via `UI.showAlert()`.
*   **Performance**: Rendering large numbers of tasks could become slow. No explicit optimization techniques (like virtualization) are used. Frequent saving after minor changes (like category assignment per task during delete-category) could be optimized.
*   **Browser Compatibility**: Assumed modern browsers supporting ES6, localStorage, Flexbox, Grid, Drag & Drop API, `Intl` (for date formatting).

## 6. Future Enhancement Possibilities

*   Search/Filter tasks by text content.
*   Task prioritization (e.g., high/medium/low).
*   Subtasks.
*   Reminders/Notifications.
*   More robust drag-and-drop parsing (if specific sources beyond OWA become important).
*   Improved UI/UX for large numbers of tasks (pagination, virtualization).
*   Cloud sync/backup option.
*   Keyboard navigation improvements.