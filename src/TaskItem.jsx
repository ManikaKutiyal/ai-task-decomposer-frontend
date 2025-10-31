import { useState } from 'react';   
import axios from 'axios';

function TaskItem({ task, API_URL, onTaskUpdated, onTaskDeleted}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(task.text);
  // Toggle the completion status
  const handleToggle = async () => {
    try {
      const res = await axios.put(`${API_URL}/tasks/${task._id}`, {
        isCompleted: !task.isCompleted, // Send the opposite status
      });
      onTaskUpdated(res.data); // Send the updated task back to App.jsx
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };
  // 2. Add a new function to handle deleting
  const handleDelete = async () => {
    // Optional: Add a confirmation dialog
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/tasks/${task._id}`);
      onTaskDeleted(task._id); // Tell App.jsx to remove this task from state
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };
  // --- 3. New function to handle saving the edit ---
  const handleEditSave = async () => {
    // If text hasn't changed, or is empty, just exit edit mode
    if (editedText.trim() === task.text || !editedText.trim()) {
      setIsEditing(false);
      setEditedText(task.text); // Reset to original text
      return;
    }

    try {
      // Send the 'text' field to the PUT route
      const res = await axios.put(`${API_URL}/tasks/${task._id}`, {
        text: editedText.trim(),
      });
      onTaskUpdated(res.data); // Update App.jsx state
    } catch (err) {
      console.error('Error editing task:', err);
    } finally {
      setIsEditing(false); // Exit edit mode
    }
  };
  // --- 4. New function to handle key presses (Enter/Escape) ---
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      setEditedText(task.text); // Reset to original text
      setIsEditing(false); // Exit edit mode
    }
  };

  return (
    <div className={`task-item ${task.isCompleted ? 'completed' : ''}`}>
     <div className="task-content">
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={handleToggle}
        disabled={isEditing} // Disable checkbox while editing
      />

      {/* --- 5. This is the main conditional logic --- */}
        {isEditing ? (
          <input
            type="text"
            className="edit-task-input"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onBlur={handleEditSave} // Save when user clicks away
            onKeyDown={handleKeyDown} // Save on Enter, cancel on Escape
            autoFocus // Automatically focus the input
          />
        ) : (
          <span onDoubleClick={() => setIsEditing(true)} title="Double-click to edit">
            {task.text}
          </span>
        )}  
     </div>
      <button onClick={handleDelete} className="delete-button">
        &times; 
      </button>
    </div>
  );
}

export default TaskItem;