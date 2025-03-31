# Task Manager Requirements Document

## Basic Features
*   The task will be shown on grid where every line is a task.
*   The application will use vanilla JavaScript only without the need to install anything.
*   The application will be easy to use with a nice interface.
*   Tasks, notes, categories, and settings are persisted in browser localStorage.

## Task Management
*   Users can add tasks manually via the input field.
*   Tasks can be assigned to user-defined categories.
*   Tasks can be edited (description, category).
*   The user will be able to defer tasks to a specific future date.
    *   Quick options for deferring until tomorrow or next week.
    *   Deferred tasks will disappear from the main "Active Tasks" grid.
    *   When the due date arrives, deferred tasks will automatically return to the main grid upon next refresh/check.
    *   The user will be able to view deferred tasks in a separate "Deferred Tasks" tab.
    *   The user will be able to return tasks from deferred state to the active list manually.
*   Completed tasks will be moved to a dedicated "Completed Tasks" tab.
    *   The user will be able to restore completed tasks back to the active list.
    *   The user can delete all completed tasks at once (with confirmation).
*   The user will only be able to delete individual active/deferred tasks after moving them to the "Completed" tab, or directly from the "Completed" tab.

## Task Categories
*   Users can create, rename, and delete custom categories.
*   Each category can be assigned a distinct color.
*   Default categories (Work, Personal, etc.) are provided and cannot be deleted or renamed (but color might be changeable if implemented).
*   Tasks display a color-coded badge representing their assigned category.
*   Each task list (Active, Deferred, Completed) can be filtered by category.

## Drag and Drop Task Creation (from Links/Emails)
*   A dedicated visual drop zone ("Drop Link or Email Here...") is provided.
*   Users can drag links (e.g., from browser address bar, other web pages, or emails in web clients like OWA) and drop them onto the zone.
*   The system attempts to extract a URL from the dropped item (prioritizing `text/html`, then `text/uri-list`, then `text/plain`).
*   If a URL is successfully extracted:
    *   A new task is automatically created in the "Active Tasks" list.
    *   The task description is initially set to a placeholder text (e.g., "New Dropped Task").
    *   The extracted URL is stored internally with the task (`sourceUrl`).
    *   The "Edit Task" modal **automatically opens** for this newly created task, allowing the user to immediately correct the description (subject). The placeholder text in the modal is pre-selected for easy typing.
    *   The task will display a clickable link icon (e.g., an envelope) in its action buttons area, which opens the stored `sourceUrl` in a new tab.
*   Drops that do not contain a parsable URL will be ignored.

## Task Notes
*   The user will be able to add notes on the progress of tasks.
*   The number of notes is not limited.
*   Each note will automatically include the date and time it was added.
*   Notes will be displayed chronologically (newest first) within a dedicated modal.
*   The notes button on the task row shows the current count of notes (e.g., "Notes (3)").
*   The user will be able to delete individual notes (with confirmation).
*   The notes scrolling area within the modal scrolls only the notes list, keeping the input area and buttons fixed.

## Task Reports
*   Users can view a comprehensive report of any task.
*   The report includes task details (status, category, dates), the source URL (if added via drag-and-drop), and all associated notes in chronological order (oldest first).
*   Reports include a "Copy to Clipboard" button for easy sharing.
*   Report text direction automatically adjusts based on task description language.

## User Interface
*   The application supports Hebrew and English text.
*   Text input fields (task input, edit task, notes, category name) automatically detect typing direction (LTR/RTL) and adjust accordingly.
*   Individual notes automatically adjust direction based on their content.
*   The user will be able to set background colors for individual tasks via a color picker modal.
*   A button to delete all completed tasks at once (with confirmation).
*   Visual feedback (highlighting) is provided on the drop zone during a drag operation.
*   Modals are used for editing, notes, deferral, color selection, reporting, category management, import/export, confirmations, and alerts.

## Data Management
*   Option to import and export all task and category data as a single JSON file for backup/transfer purposes.
*   Supports importing legacy format (tasks only array).
*   Confirmation prompts are used for potentially destructive actions (deletions, import overwrite).

