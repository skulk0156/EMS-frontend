// AddTask.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Toast from "../components/Toast";

const AddTask = () => {
  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    team: "",
    startDate: "",
    dueDate: "",
    estimatedHours: "",
    priority: "Medium",
    status: "Not Started",
    category: "Development",
    progress: 0,
    dependencies: [],
    tags: "",
    notes: "",
    notifyAssignee: true
  });
  
  const [attachments, setAttachments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Fetch employees and teams from API
  useEffect(() => {
    // Fetch employees
    axios.get("http://localhost:5000/api/employees")
      .then(res => setEmployees(res.data))
      .catch(err => console.error(err));
      
    // Fetch teams
    axios.get("http://localhost:5000/api/teams")
      .then(res => setTeams(res.data))
      .catch(err => console.error(err));
  }, []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTask(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleFileChange = (e) => {
    setAttachments(e.target.files);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Add all task fields to formData
    Object.keys(task).forEach(key => {
      if (Array.isArray(task[key])) {
        task[key].forEach(item => formData.append(key, item));
      } else {
        formData.append(key, task[key]);
      }
    });
    
    // Add attachments
    Array.from(attachments).forEach(file => {
      formData.append('attachments', file);
    });
    
    // Send to API
    axios.post("http://localhost:5000/api/tasks", formData)
      .then(res => {
        setToast({ show: true, message: 'Task created successfully!', type: 'success' });
        setTimeout(() => {
          window.location.href = "/tasks";
        }, 1500);
      })
      .catch(err => {
        console.error(err);
        setToast({ show: true, message: 'Failed to create task.', type: 'error' });
      });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
      <Navbar />
      
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-6">Add New Task</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          {/* Core Task Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Task Information</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Task Title *</label>
              <input
                type="text"
                name="title"
                value={task.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={task.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
          
          {/* Assignment */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Assignment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Team</label>
                <select
                  name="team"
                  value={task.team}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Team</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>{team.team_name}</option>
                  ))}
                </select>
              </div>
               <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Assigned To *</label>
                <select
                  name="assignedTo"
                  value={task.assignedTo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Time Management */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Time Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={task.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Due Date *</label>
                <input
                  type="date"
                  name="dueDate"
                  value={task.dueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Estimated Hours</label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={task.estimatedHours}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Task Properties */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Task Properties</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Priority</label>
                <select
                  name="priority"
                  value={task.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Status</label>
                <select
                  name="status"
                  value={task.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Category</label>
                <select
                  name="category"
                  value={task.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Testing">Testing</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Research">Research</option>
                </select>
              </div>
              
              {/* <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Progress ({task.progress}%)</label>
                <input
                  type="range"
                  name="progress"
                  value={task.progress}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="5"
                  className="w-full"
                />
              </div> */}
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Tags</label>
              <input
                type="text"
                name="tags"
                value={task.tags}
                onChange={handleChange}
                placeholder="e.g., urgent, client, internal"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Notes</label>
              <textarea
                name="notes"
                value={task.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Attachments</label>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Settings</h2>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="notifyAssignee"
                  checked={task.notifyAssignee}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Notify assignee when task is created</span>
              </label>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
      
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
      
      <Footer />
    </div>
  );
};

export default AddTask;