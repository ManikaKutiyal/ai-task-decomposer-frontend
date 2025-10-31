import { useState } from 'react';
import axios from 'axios';

// 1. Add 'setIsAILoading' prop, remove 'useState' import
function TaskForm({ API_URL, selectedProjectId, onTasksAdded, setIsAILoading }) {
  const [text, setText] = useState('');
  // We no longer need the 'isLoading' state here

  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!text) return;
    try {
      const res = await axios.post(`${API_URL}/tasks`, {
        text,
        project: selectedProjectId,
      });
      onTasksAdded(res.data);
      setText('');
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleAIBreakdown = async (e) => {
    e.preventDefault();
    if (!text) return;

    setIsAILoading(true); // <-- 2. SET TO TRUE
    try {
      const res = await axios.post(`${API_URL}/ai/breakdown`, {
        text,
        projectId: selectedProjectId,
      });
      onTasksAdded(res.data);
      setText('');
    } catch (err) {
      console.error('Error with AI breakdown:', err);
    } finally {
      setIsAILoading(false); // <-- 3. SET TO FALSE
    }
  };

  return (
    <form className="task-form">
      <input
        type="text"
        // 4. Update placeholder to check prop (or just remove it)
        placeholder={"Enter a big task or a sub-task..."}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleManualAdd} className="button-add">Add Task</button>
      <button onClick={handleAIBreakdown} className="button-ai">
        Breakdown with AI
      </button>
    </form>
  );
}

export default TaskForm;