# Task Manager User Guide

## Getting Started

### Installation
1. No installation is required. Simply save the HTML file to your computer.
2. Double-click the file to open it in your web browser.
3. The application works in any modern browser (Chrome, Firefox, Edge, Safari).
4. All your data is stored locally in your browser.

### Initial Setup
When you first open the Task Manager, you'll see an empty task list. The application is ready to use immediately.

## Basic Task Management

### Adding Tasks
1. Type your task in the input field at the top of the page.
2. Click the "Add Task" button or press Enter.
3. The task will appear in the "Active Tasks" list.
4. Both English and Hebrew text are supported and will be displayed correctly.

### Task Organization
The application organizes tasks into three tabs:
- **Active Tasks**: Tasks you're currently working on
- **Deferred Tasks**: Tasks scheduled for future dates
- **Completed Tasks**: Tasks you've finished

Switch between tabs by clicking on the tab names at the top of the task list.

### Editing Tasks
1. Click the "Edit" button on any task.
2. Modify the task description in the popup window.
3. Click "Save" to confirm your changes or "Cancel" to discard them.

### Completing Tasks
1. When you finish a task, click the "Complete" button.
2. The task will be moved from the Active Tasks tab to the Completed Tasks tab.
3. It will be marked with a strikethrough to show it's completed.

### Restoring Tasks
1. Go to the Completed Tasks tab.
2. Find the task you want to reactivate.
3. Click the "Restore" button.
4. The task will return to the Active Tasks tab.

### Deleting Tasks
1. **Important**: Tasks can only be deleted from the Completed Tasks tab.
2. Go to the Completed Tasks tab.
3. Click the "Delete" button on the task you want to remove.
4. Confirm the deletion when prompted.

### Deleting All Completed Tasks
1. Go to the Completed Tasks tab.
2. Click the "Delete All Completed Tasks" button at the top of the list.
3. Confirm the deletion when prompted.

## Advanced Features

### Deferring Tasks (Postponing)
Defer a task when you want to hide it until a future date:

1. Click the "Defer" button on any active task.
2. In the popup window, you can:
   - Click "Tomorrow" to defer until tomorrow
   - Click "Next Week" to defer for 7 days
   - Select a specific date from the calendar
3. Click "Defer Task" to confirm.
4. The task will move to the Deferred Tasks tab until its due date.
5. When the due date arrives, the task automatically returns to the Active Tasks tab.

### Returning Deferred Tasks to Active
If you want to work on a deferred task before its due date:
1. Go to the Deferred Tasks tab.
2. Click the "Return to Active" button on the task.

### Adding Notes to Tasks
Track progress or add details to tasks with notes:

1. Click the "Notes" or "Add Notes" button on any task.
2. In the popup window, type your note in the text box at the bottom.
3. Click "Add Note" to save it.
4. The note will appear in the list with a timestamp.
5. You can add unlimited notes to each task.
6. The button will show the number of notes (e.g., "Notes (3)").

### Deleting Notes
1. Open the Notes window for a task.
2. Click the "Delete" button on any note you want to remove.
3. Confirm the deletion when prompted.

### Color-Coding Tasks
Visually organize tasks with color backgrounds:

1. Click the "Color" button on any task.
2. Select a color from the palette.
3. Click "Apply Color" to set the color.

**Keyboard Shortcuts for Colors:**
- **Alt+R**: Apply red color
- **Alt+G**: Apply green color
- **Alt+Y**: Apply yellow color

### Viewing Task Reports
Generate a detailed report of any task:

1. Click the "Report" button on any task.
2. The report shows all task details and notes in chronological order.
3. Click "Copy to Clipboard" to copy the entire report.
4. Click "Close" to exit the report view.

## Data Management

### Backing Up Your Tasks
1. Click the "Import/Export" button at the top of the page.
2. Click "Export Tasks" to download a JSON file containing all your tasks.
3. Save this file to your preferred location.

### Importing Tasks
1. Click the "Import/Export" button at the top of the page.
2. Click "Choose File" and select a previously exported JSON file.
3. Click "Import Tasks" to load the tasks.
4. Confirm the import when prompted (this will replace all current tasks).

## Multilingual Support

### English and Hebrew Support
- The Task Manager automatically detects Hebrew and English text.
- Text direction (right-to-left or left-to-right) is set automatically.
- This works for tasks, notes, and reports.
- You can mix languages freely throughout the application.

## Tips and Tricks

### Organizing with Colors
- Use different colors for different types of tasks or priorities.
- Example: Red for urgent, Yellow for in-progress, Green for almost complete.

### Effective Deferring
- Defer routine tasks to their next relevant date.
- Use the Deferred Tasks tab to plan your upcoming work.

### Using Notes Effectively
- Use notes to track incremental progress on large tasks.
- Record important information or decisions related to the task.
- Document steps you've completed or next actions.

### Regular Backups
- Export your tasks regularly to avoid data loss.
- If you clear your browser data, your tasks will be lost unless exported.

## Troubleshooting

### Tasks Not Saving
- Ensure your browser has localStorage enabled.
- Check that you have available storage space in your browser.

### Text Direction Issues
- If text appears in the wrong direction, try adding some text in the detected language first.
- Hebrew characters will trigger right-to-left display.

### Import Problems
- Ensure you're importing a file previously exported from this application.
- Do not modify the exported JSON file manually.

### Deferred Tasks Not Returning
- Make sure your computer's date and time are accurate.
- Keep the application open or reload it to check for returned tasks.