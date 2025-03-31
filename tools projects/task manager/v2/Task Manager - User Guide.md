# Task Manager User Guide

## Getting Started

### Installation
1. No installation is required. Simply save the HTML file to your computer.
2. Double-click the file to open it in your web browser.
3. The application works in any modern browser (Chrome, Firefox, Edge, Safari).
4. All your data is stored locally in your browser.

### Initial Setup
When you first open the Task Manager, you'll see an empty task list. The application is ready to use immediately with default categories already set up.

## Basic Task Management

### Adding Tasks
1. Type your task in the input field at the top of the page.
2. Select a category from the dropdown menu (or leave as "No Category").
3. Click the "Add Task" button or press Enter.
4. The task will appear in the "Active Tasks" list with its category badge.
5. Both English and Hebrew text are supported and will be displayed correctly.

### Task Organization
The application organizes tasks into three tabs:
- **Active Tasks**: Tasks you're currently working on
- **Deferred Tasks**: Tasks scheduled for future dates
- **Completed Tasks**: Tasks you've finished

Switch between tabs by clicking on the tab names at the top of the task list.

### Editing Tasks
1. Click the "Edit" button on any task.
2. Modify the task description in the popup window.
3. Change the task category if needed.
4. Click "Save" to confirm your changes or "Cancel" to discard them.

### Completing Tasks
1. When you finish a task, click the "Complete" button.
2. The task will be moved from the Active Tasks tab to the Completed Tasks tab.
3. It will be marked with a strikethrough to show it's completed.
4. The task will retain its category.

### Restoring Tasks
1. Go to the Completed Tasks tab.
2. Find the task you want to reactivate.
3. Click the "Restore" button.
4. The task will return to the Active Tasks tab with its category preserved.

### Deleting Tasks
1. **Important**: Tasks can only be deleted from the Completed Tasks tab.
2. Go to the Completed Tasks tab.
3. Click the "Delete" button on the task you want to remove.
4. Confirm the deletion when prompted.

### Deleting All Completed Tasks
1. Go to the Completed Tasks tab.
2. Click the "Delete All Completed Tasks" button at the top of the list.
3. Confirm the deletion when prompted.

## Category Management

### Using Categories
1. When adding or editing a task, select a category from the dropdown menu.
2. Each category has a distinct color that appears as a badge on the task.
3. Default categories include Work, Personal, Home, Shopping, and Urgent.

### Filtering by Category
1. Use the "Filter by Category" dropdown at the top of any tab.
2. Select a category to show only tasks from that category.
3. Select "All Categories" to show all tasks again.

### Managing Categories
1. Click the "Categories" button at the top of the page.
2. In the popup window, you can:
   - Add new categories with custom names and colors
   - Edit existing custom category names
   - Change category colors
   - Delete custom categories
3. Note: Default categories cannot be deleted.

### Adding a New Category
1. Click the "Categories" button at the top of the page.
2. Enter a name for the new category in the input field.
3. Click the color preview circle to choose a color.
4. Click "Add" to create the new category.
5. The new category will appear in all category dropdown menus.

### Editing Categories
1. Click the "Categories" button at the top of the page.
2. Find the category you want to edit.
3. Click "Edit" to change the name, or "Color" to change the color.
4. Make your changes and save them.

### Deleting Categories
1. Click the "Categories" button at the top of the page.
2. Find the custom category you want to delete.
3. Click the "Delete" button.
4. If tasks are using this category, you'll be prompted to confirm removal.
5. After deletion, any tasks using that category will have no category.

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
5. The task maintains its category in the Deferred tab.
6. When the due date arrives, the task automatically returns to the Active Tasks tab.

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
Visually organize tasks with color backgrounds (in addition to category colors):

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
2. The report shows all task details (including category) and notes in chronological order.
3. Click "Copy to Clipboard" to copy the entire report.
4. Click "Close" to exit the report view.

## Data Management

### Backing Up Your Tasks
1. Click the "Import/Export" button at the top of the page.
2. Click "Export Tasks" to download a JSON file containing all your tasks and categories.
3. Save this file to your preferred location.

### Importing Tasks
1. Click the "Import/Export" button at the top of the page.
2. Click "Choose File" and select a previously exported JSON file.
3. Click "Import Tasks" to load the tasks and categories.
4. Confirm the import when prompted (this will replace all current tasks and categories).

## Multilingual Support

### English and Hebrew Support
- The Task Manager automatically detects Hebrew and English text.
- Text direction (right-to-left or left-to-right) is set automatically.
- This works for tasks, notes, and reports.
- You can mix languages freely throughout the application.

## Tips and Tricks

### Using Categories Effectively
- Use categories to separate work and personal tasks.
- Filter by category when focusing on a specific area.
- Create custom categories for projects or goals.

### Organizing with Colors
- Use background colors for priority, while using categories for type of task.
- Example: Red background for urgent, Yellow for in-progress, Green for almost complete.

### Effective Deferring
- Defer routine tasks to their next relevant date.
- Use the Deferred Tasks tab to plan your upcoming work.
- Filter deferred tasks by category to focus on specific areas.

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

### Category Issues
- If categories aren't appearing in dropdowns, try refreshing the page.
- If a category appears to be missing after import, check that it wasn't renamed.