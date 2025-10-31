import { useState } from 'react';
import axios from 'axios';

// We get the API_URL and a function to add the project to our state
function ProjectForm({ API_URL, onProjectCreated }) {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop the browser from refreshing
    if (!title) return; // Don't submit if empty

    try {
      // Send the new project title to our backend API
      const res = await axios.post(`${API_URL}/projects`, { title });
      
      // 'res.data' is the new project object from the server
      onProjectCreated(res.data); // Add the new project to our App.jsx state
      setTitle(''); // Clear the input field
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <input
        type="text"
        placeholder="Enter new project name..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit" className="button-add">
        + Add Project
      </button>    
    </form>
  );
}

export default ProjectForm;