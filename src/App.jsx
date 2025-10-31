import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ProjectForm from './ProjectForm'; 
import TaskForm from './TaskForm'; 
import TaskItem from './TaskItem'; 
import ProjectItem from './ProjectItem';
import Confetti from 'react-confetti';

// We'll set the base URL for our API
const API_URL = 'http://localhost:5001/api';

function App() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isProjectComplete, setIsProjectComplete] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false); 

  // --- Effect to fetch projects on page load ---
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_URL}/projects`);
        setProjects(res.data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    fetchProjects();
  }, []); // Empty array means this runs once on mount

// --- NEW: Effect to fetch tasks when a project is selected ---
  useEffect(() => {
    // If no project is selected, clear the tasks
    if (!selectedProjectId) {
      setTasks([]);
      return;
    }
    // Fetch tasks for the selected project
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${API_URL}/tasks/${selectedProjectId}`);
        setTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    fetchTasks();
  }, [selectedProjectId]); // This effect re-runs whenever selectedProjectId changes

  // --- NEW: Effect to check if project is complete ---
  useEffect(() => {
    // Check if there are any tasks and if all of them are complete
    const allComplete = tasks.length > 0 && tasks.every(t => t.isCompleted);
    setIsProjectComplete(allComplete);

    // If it's NOT complete, make sure confetti is turned off
    if (!allComplete) {
      setShowConfetti(false);
    }
  }, [tasks]); // This runs every time the 'tasks' array changes

  // Handle adding new project (no change)
  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
  };
  
  // --- 3. NEW: Handle adding new tasks ---
  // This function works for both single tasks and arrays of tasks
  const handleTasksAdded = (newTasks) => {
    if (Array.isArray(newTasks)) {
      // AI breakdown returns an array
      setTasks([...newTasks, ...tasks]);
    } else {
      // Manual add returns a single object
      setTasks([newTasks, ...tasks]);
    }
  };

// Handle updating a task
  const handleTaskUpdated = (updatedTask) => {
    const newTasks = tasks.map((task) =>
      task._id === updatedTask._id ? updatedTask : task
    );

    // Check if this update made the project complete
    const newAllComplete = newTasks.length > 0 && newTasks.every(t => t.isCompleted);

    // If it just became complete (and wasn't before), fire confetti!
    if (newAllComplete && !isProjectComplete) {
      setShowConfetti(true);
    }

    setTasks(newTasks);
  };
  
  // Handle deleting a task
  const handleTaskDeleted = (deletedTaskId) => {
    setTasks(tasks.filter((task) => task._id !== deletedTaskId));
  };

  // Handle deleting a project
  const handleProjectDeleted = (deletedProjectId) => {
    // Remove the project from the list
    setProjects(projects.filter((p) => p._id !== deletedProjectId));

    // If the deleted project was the one selected, clear the tasks
    if (selectedProjectId === deletedProjectId) {
      setSelectedProjectId(null);
      setTasks([]);
    }
  };
  
  // --- Render ---
  return (
    <div className="app-container">
      <header>
        <h1>AI Task Decomposer</h1>
      </header>
      {showConfetti && (
        <Confetti
          recycle={false}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}
      
      <main>
        <div className="projects-column">
          <h2>My Projects</h2>
          {/* <-- 3. ADD THE FORM COMPONENT HERE */}
          <ProjectForm API_URL={API_URL} onProjectCreated={handleProjectCreated} />

          <div className="project-list"> {/* Added a wrapper for scrolling */}
          {projects.map((project) => (
            <ProjectItem
              key={project._id}
              project={project}
              API_URL={API_URL}
              isSelected={project._id === selectedProjectId}
              onSelect={setSelectedProjectId}
              onProjectDeleted={handleProjectDeleted}
            />
          ))}
        </div>
      </div>

      <div className="tasks-column">
          <h2>Tasks</h2>
          {/* --- 5. Render TaskForm OR "Complete" message --- */}
          {selectedProjectId &&
            (isProjectComplete ? (
              <div className="project-complete-message">
                <h2>Project Complete!</h2>
              </div>
            ) : (
              <TaskForm
                API_URL={API_URL}
                selectedProjectId={selectedProjectId}
                onTasksAdded={handleTasksAdded}
                setIsAILoading={setIsAILoading}
              />
            ))}          
          {/* NEW: Render the list of tasks */}
          <div className="task-list">
            {isAILoading ? (
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                <p>AI is thinking...</p>
              </div>
            ) : (
            tasks.length > 0 ? (
              // --- 6. NEW: Map and render TaskItem components ---
              tasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  API_URL={API_URL}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                />
              ))        
            ) : (
              // Show a helpful message
              <p className="no-tasks-msg">
                {selectedProjectId
                  ? 'No tasks for this project yet.'
                  : 'Select a project to see its tasks.'}
              </p>
            )
            )}
          </div>        
        </div>
      </main>
    </div>
  );
}

export default App;