# Task Manager Testing Document

## Testing Overview
This document provides a comprehensive checklist for testing all features of the Task Manager application. Use this document to verify that all functionality is working correctly after implementation or updates.

## Test Environment
- Browser: [Chrome/Firefox/Safari/Edge]
- Version: [Browser Version]
- Device: [Desktop/Laptop/Tablet]
- Date: [Test Date]
- Tester: [Your Name]

## Basic Task Management

### Task Creation
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Add task in English | 1. Enter English text in input field<br>2. Select a category<br>3. Click "Add Task" | Task appears in Active Tasks list with correct text direction (LTR) and category badge | □ |
| Add task in Hebrew | 1. Enter Hebrew text in input field<br>2. Select a category<br>3. Click "Add Task" | Task appears in Active Tasks list with correct text direction (RTL) and category badge | □ |
| Add task with Enter key | 1. Enter text in input field<br>2. Select a category<br>3. Press Enter key | Task is added successfully with selected category | □ |
| Add empty task | 1. Leave input field empty<br>2. Click "Add Task" | No task is added | □ |

### Task Editing
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Edit English task | 1. Click "Edit" on an English task<br>2. Modify text<br>3. Change category<br>4. Click "Save" | Task text and category update correctly | □ |
| Edit Hebrew task | 1. Click "Edit" on a Hebrew task<br>2. Modify text<br>3. Change category<br>4. Click "Save" | Task text updates correctly with RTL direction and new category | □ |
| Change language during edit | 1. Edit an English task<br>2. Change text to Hebrew<br>3. Save | Task updates with correct RTL direction | □ |
| Cancel edit | 1. Click "Edit" on a task<br>2. Modify text and category<br>3. Click "Cancel" | Original task text and category remain unchanged | □ |

### Task Completion
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Complete task | 1. Click "Complete" on an active task | Task moves to Completed Tasks tab with strikethrough styling, keeping its category | □ |
| Restore completed task | 1. Go to Completed Tasks tab<br>2. Click "Restore" on a task | Task returns to Active Tasks tab without strikethrough, keeping its category | □ |
| Badge counter update | 1. Complete a task<br>2. Check badge on Completed tab | Badge shows correct number of completed tasks | □ |

### Task Deletion
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Delete from Completed tab | 1. Go to Completed Tasks tab<br>2. Click "Delete" on a task<br>3. Confirm deletion | Task is removed from list | □ |
| Verify no Delete in Active tab | 1. Go to Active Tasks tab<br>2. Verify no Delete button exists | No Delete button should be present | □ |
| Verify no Delete in Deferred tab | 1. Go to Deferred Tasks tab<br>2. Verify no Delete button exists | No Delete button should be present | □ |
| Delete all completed tasks | 1. Have multiple completed tasks<br>2. Click "Delete All Completed Tasks"<br>3. Confirm deletion | All completed tasks are removed | □ |

## Task Categories

### Category Management
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| View default categories | 1. Open the Categories modal | Default categories are displayed (Work, Personal, Home, Shopping, Urgent) | □ |
| Add new category | 1. Open Categories modal<br>2. Enter a name<br>3. Select a color<br>4. Click "Add" | New category appears in the list and in all category dropdowns | □ |
| Edit category name | 1. Open Categories modal<br>2. Click "Edit" on a custom category<br>3. Enter new name<br>4. Confirm | Category name updates in list and all dropdowns | □ |
| Change category color | 1. Open Categories modal<br>2. Click "Color" on a category<br>3. Select new color<br>4. Click "Select Color" | Category color updates in list and on all tasks with that category | □ |
| Delete custom category | 1. Open Categories modal<br>2. Click "Delete" on a custom category<br>3. Confirm deletion | Category is removed from list and tasks using it have no category | □ |
| Attempt to delete default category | 1. Open Categories modal<br>2. Verify no Delete button on default categories | Default categories cannot be deleted | □ |
| Delete category in use | 1. Create a task with a custom category<br>2. Delete that category<br>3. Confirm when prompted | Category is removed and task now has no category | □ |

### Category Filtering
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Filter active tasks | 1. Create tasks with different categories<br>2. Use category filter dropdown in Active tab<br>3. Select a specific category | Only tasks with selected category are displayed | □ |
| Filter deferred tasks | 1. Create deferred tasks with different categories<br>2. Use category filter in Deferred tab<br>3. Select a specific category | Only deferred tasks with selected category are displayed | □ |
| Filter completed tasks | 1. Complete tasks with different categories<br>2. Use category filter in Completed tab<br>3. Select a specific category | Only completed tasks with selected category are displayed | □ |
| Clear filters | 1. Apply a category filter<br>2. Select "All Categories" | All tasks in the tab are displayed | □ |

### Category Persistence
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Category persistence in deferrals | 1. Create a task with a category<br>2. Defer the task<br>3. Check its category in Deferred tab | Task maintains its category | □ |
| Category persistence in completion | 1. Create a task with a category<br>2. Complete the task<br>3. Check its category in Completed tab | Task maintains its category | □ |
| Category persistence in restoration | 1. Complete a task with a category<br>2. Restore the task<br>3. Check its category in Active tab | Task maintains its category | □ |
| Category in task report | 1. Create a task with a category<br>2. Open the task report | Report shows the task's category | □ |

## Task Deferral

### Defer Tasks
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Defer to tomorrow | 1. Click "Defer" on a task<br>2. Click "Tomorrow" button<br>3. Click "Defer Task" | Task moves to Deferred tab with tomorrow's date | □ |
| Defer to next week | 1. Click "Defer" on a task<br>2. Click "Next Week" button<br>3. Click "Defer Task" | Task moves to Deferred tab with date 7 days ahead | □ |
| Defer to specific date | 1. Click "Defer" on a task<br>2. Select a date from calendar<br>3. Click "Defer Task" | Task moves to Deferred tab with selected date | □ |
| Cancel defer | 1. Click "Defer" on a task<br>2. Click "Cancel" | Task remains in Active tab unchanged | □ |
| Defer without date | 1. Click "Defer" on a task<br>2. Click "Defer Task" without selecting date | Error message appears | □ |

### Deferred Task Management
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Return deferred task | 1. Go to Deferred Tasks tab<br>2. Click "Return to Active" on a task | Task moves back to Active tab | □ |
| Task sorting by due date | 1. Create multiple deferred tasks with different dates<br>2. Go to Deferred Tasks tab | Tasks should be sorted by due date (earliest first) | □ |
| Badge counter for deferred | 1. Defer a task<br>2. Check badge on Deferred tab | Badge shows correct number of deferred tasks | □ |

### Automatic Return
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Auto-return on due date | 1. Defer a task to a date/time just a few minutes in the future<br>2. Wait until that time passes<br>3. Check Active Tasks tab | Task should automatically appear in Active Tasks | □ |
| Auto-return after refresh | 1. Defer a task to a date in the past<br>2. Refresh the page | Task should appear in Active Tasks | □ |

## Task Notes

### Adding Notes
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Add note in English | 1. Click "Notes" on a task<br>2. Enter English text<br>3. Click "Add Note" | Note appears with LTR direction and timestamp | □ |
| Add note in Hebrew | 1. Click "Notes" on a task<br>2. Enter Hebrew text<br>3. Click "Add Note" | Note appears with RTL direction and timestamp | □ |
| Add note with Ctrl+Enter | 1. Click "Notes" on a task<br>2. Enter text<br>3. Press Ctrl+Enter | Note is added successfully | □ |
| Add empty note | 1. Click "Notes" on a task<br>2. Leave note input empty<br>3. Click "Add Note" | No note is added | □ |
| Notes counter on button | 1. Add notes to a task<br>2. Close notes modal<br>3. Check task in list | Button should show "Notes (X)" where X is the count | □ |

### Managing Notes
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Delete note | 1. Open Notes modal<br>2. Click "Delete" on a note<br>3. Confirm deletion | Note is removed from list | □ |
| Note sorting | 1. Add multiple notes over time<br>2. Open Notes modal | Notes should be sorted by date (newest first) | □ |
| Notes counter updates | 1. Open Notes modal<br>2. Delete a note<br>3. Close modal<br>4. Check task in list | Notes counter on button should update | □ |
| Delete all notes | 1. Open Notes modal with multiple notes<br>2. Delete all notes<br>3. Close modal | Button should show "Add Notes" instead of counter | □ |

### Notes Interface
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Scrolling behavior | 1. Add many notes to a task<br>2. Open Notes modal<br>3. Scroll through notes | Only notes area should scroll, input area stays fixed | □ |
| Mixed language notes | 1. Add notes in both Hebrew and English<br>2. Open Notes modal | Each note should have correct text direction | □ |
| Note input direction | 1. Open Notes for Hebrew task<br>2. Check input field direction | Input should default to RTL for Hebrew tasks | □ |

## Task Reports

### Generating Reports
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Generate report for task | 1. Click "Report" on any task | Report modal opens with complete task details including category | □ |
| Report for English task | 1. Generate report for English task | Report text should have LTR direction | □ |
| Report for Hebrew task | 1. Generate report for Hebrew task | Report text should have RTL direction | □ |
| Report with notes | 1. Generate report for task with notes | All notes should be listed chronologically | □ |
| Report content accuracy | 1. Generate report<br>2. Verify all task details are correct | Report should show correct dates, status, category, and notes | □ |

### Report Actions
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Copy report to clipboard | 1. Generate report<br>2. Click "Copy to Clipboard" | Report text is copied to clipboard | □ |
| Close report | 1. Generate report<br>2. Click "Close" | Report modal closes | □ |

## Task Styling

### Color Coding
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Apply color | 1. Click "Color" on a task<br>2. Select a color<br>3. Click "Apply Color" | Task background changes to selected color | □ |
| Remove color | 1. Click "Color" on a colored task<br>2. Select the transparent option<br>3. Click "Apply Color" | Task background returns to default | □ |
| Color persistence | 1. Apply color to task<br>2. Refresh page | Task color should remain | □ |
| Color across tabs | 1. Apply color to active task<br>2. Defer the task | Task should retain color in Deferred tab | □ |
| Category with background color | 1. Create a task with a category<br>2. Apply a background color<br>3. View the task | Both category badge and background color should be visible | □ |

### Keyboard Shortcuts
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Alt+R for red | 1. Focus on a task row<br>2. Press Alt+R | Task background changes to red | □ |
| Alt+G for green | 1. Focus on a task row<br>2. Press Alt+G | Task background changes to green | □ |
| Alt+Y for yellow | 1. Focus on a task row<br>2. Press Alt+Y | Task background changes to yellow | □ |

## Data Management

### Persistence
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Task data persistence | 1. Add tasks, notes, colors<br>2. Refresh page | All task data should remain intact | □ |
| Category persistence | 1. Create custom categories<br>2. Refresh page | All categories should remain intact | □ |
| Date object restoration | 1. Create tasks with various states<br>2. Refresh page<br>3. Test date-dependent features | All date-based functions should work properly | □ |

### Import/Export
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Export tasks and categories | 1. Click "Import/Export"<br>2. Click "Export Tasks" | JSON file is downloaded with all task and category data | □ |
| Import tasks and categories | 1. Click "Import/Export"<br>2. Select a valid export file<br>3. Click "Import Tasks" | All tasks and categories from file are loaded correctly | □ |
| Import validation | 1. Click "Import/Export"<br>2. Select an invalid file<br>3. Click "Import Tasks" | Error message appears | □ |
| Import confirmation | 1. Have existing tasks and categories<br>2. Attempt to import new data | Confirmation dialog appears warning about replacement | □ |
| Legacy import compatibility | 1. Import an older format JSON file (without categories) | Tasks are imported correctly with empty categories | □ |

## Tab Navigation

### Tab Switching
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Switch to Active tab | 1. Click on "Active Tasks" tab | Active tab is displayed with active tasks | □ |
| Switch to Deferred tab | 1. Click on "Deferred Tasks" tab | Deferred tab is displayed with deferred tasks | □ |
| Switch to Completed tab | 1. Click on "Completed Tasks" tab | Completed tab is displayed with completed tasks | □ |
| Badge counters | 1. Have tasks in different states<br>2. Check tab badges | Each tab should show correct count of tasks | □ |

### Empty States
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Empty Active tab | 1. Complete or defer all active tasks | Message "No active tasks" should appear | □ |
| Empty Deferred tab | 1. Ensure no tasks are deferred | Message "No deferred tasks" should appear | □ |
| Empty Completed tab | 1. Delete all completed tasks | Message "No completed tasks" should appear | □ |
| Empty category filter | 1. Filter by a category with no tasks | Appropriate empty message should appear | □ |

## Responsive Design
| Test | Steps | Expected Result | Status (✓/✗) |
|------|-------|-----------------|--------------|
| Mobile view | 1. Open app on mobile or resize browser to mobile width | UI should adjust to remain usable | □ |
| Button wrapping | 1. View task with many buttons on narrow screen | Buttons should wrap to new lines as needed | □ |
| Modal on small screen | 1. Open any modal on small screen | Modal should be usable and correctly positioned | □ |
| Category badges on mobile | 1. View tasks with categories on mobile screen | Category badges should be visible and readable | □ |

## Cross-Browser Testing
| Browser | Version | Functionality | Appearance | Notes |
|---------|---------|---------------|------------|-------|
| Chrome  |         | □             | □          |       |
| Firefox |         | □             | □          |       |
| Safari  |         | □             | □          |       |
| Edge    |         | □             | □          |       |

## Test Summary
- Total Tests: [COUNT]
- Passed: [COUNT]
- Failed: [COUNT]
- Not Tested: [COUNT]

## Issues Found
1. [Issue description, steps to reproduce, severity]
2. [Issue description, steps to reproduce, severity]

## Notes and Recommendations
- [Any additional testing notes or improvement recommendations]