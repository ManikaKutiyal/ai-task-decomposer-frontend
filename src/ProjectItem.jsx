import axios from 'axios';

function ProjectItem({
  project,
  API_URL,
  isSelected,
  onSelect,
  onProjectDeleted,
}) {

  const handleDelete = async (e) => {
    // Stop the click from also selecting the project
    e.stopPropagation(); 

    if (window.confirm('Delete this project and all its tasks?')) {
      try {
        await axios.delete(`${API_URL}/projects/${project._id}`);
        onProjectDeleted(project._id); // Tell App.jsx to update state
      } catch (err) {
        console.error('Error deleting project:', err);
      }
    }
  };

  return (
    <div
      className={`project-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(project._id)}
    >
      <span className="project-title">{project.title}</span>
      <button onClick={handleDelete} className="delete-button">
        &times;
      </button>
    </div>
  );
}

export default ProjectItem;