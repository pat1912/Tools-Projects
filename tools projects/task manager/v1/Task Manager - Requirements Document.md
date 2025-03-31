# Task Manager Requirements Document

## Basic Features
* The task will be shown on grid where every line is a task.
* The application will use vanilla JavaScript only without the need to install anything.
* The application will be easy to use with a nice interface.

## Task Management
* The user will be able to defer tasks to a specific future date.
* Quick hotkeys for deferring until tomorrow or next week.
* Deferred tasks will disappear from the main grid.
* When the due date arrives, deferred tasks will automatically return to the main grid.
* The user will be able to view deferred tasks in a separate section.
* The user will be able to return tasks from deferred state to the main list manually.
* Completed tasks will be moved to a dedicated "Completed" section.
* The user will be able to restore completed tasks back to the active list.
* The user will only be able to delete tasks from the Completed tab.

## Task Notes
* The user will be able to add notes on the progress of tasks.
* The number of notes is not limited.
* Each note will automatically include the date it was added.
* Notes will be displayed chronologically.
* Notes count will be shown on the task button and updated in real-time.
* The user will be able to delete individual notes.
* The notes scrolling area will only scroll the notes list, not the input area or buttons.

## Task Reports
* Users can view a comprehensive report of any task with all associated notes.
* The report will include task details and chronological notes.
* Reports include a copy to clipboard button for easy sharing.
* Report text direction automatically adjusts based on task language.

## User Interface
* The application will support Hebrew and English text.
* All textboxes will automatically change direction based on the language being typed.
* Individual notes will automatically adjust direction based on content.
* The user will be able to set colors for task backgrounds.
* Fast hotkeys for 3 colors: red, green, yellow.
* Additional colors available through a color menu.
* A button to delete all completed tasks at once (with confirmation).

## Data Management
* Option to import and export task data as JSON for backup purposes.
* Tasks, notes, and settings are persisted in browser localStorage.

## Bug Fixes Implemented
* Fixed editing tasks with Hebrew text.
* Fixed text direction detection for input fields.
* Fixed deferred tasks not automatically returning to active list.
* Fixed notes display and scrolling in notes modal.
* Fixed note count display not updating when notes are deleted.