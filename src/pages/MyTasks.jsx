import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FiClock, FiUser, FiCalendar } from "react-icons/fi";

const statusColors = {
  "Pending": "bg-yellow-500",
  "In Progress": "bg-blue-500",
  "Completed": "bg-green-500",
};

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadMyTasks = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/tasks/my-tasks/${user.employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
        setFilteredTasks(res.data);
      } catch (err) {
        console.error("Error loading my tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.employeeId) {
      loadMyTasks();
    }
  }, [user?.employeeId, token]);

  useEffect(() => {
    let filtered = [...tasks];
    
    if (search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.status.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    setFilteredTasks(filtered);
  }, [search, statusFilter, tasks]);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/tasks/${taskId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTasks(prev => prev.map(task => 
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-blue-100">
      <Navbar />

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-blue-700">My Tasks</h1>

          <div className="flex gap-3 flex-col sm:flex-row w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search tasks..."
              className="px-4 py-2 rounded-full shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <p className="text-gray-600 text-center text-lg mt-10">
            No tasks assigned to you.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredTasks.map((task, index) => (
              <div
                key={task._id}
                className="bg-white rounded-3xl shadow-md p-6 flex flex-col items-center text-center border border-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-blue-200 shadow-sm bg-blue-400 flex items-center justify-center">
                  <FiClock className="text-white text-4xl" />
                </div>

                <h2 className="text-2xl font-semibold text-blue-700">{task.title}</h2>
                <span
                  className={`text-white px-3 py-1 rounded-full mt-1 ${
                    statusColors[task.status] || "bg-gray-500"
                  }`}
                >
                  {task.status}
                </span>

                <p className="text-gray-500 text-sm mt-2">
                  Priority: {task.priority}
                </p>
                <p className="text-gray-500 text-sm">
                  {task.deadline || "No deadline"}
                </p>

                <div className="flex flex-col items-center mt-3 gap-1">
                  <div className="flex items-center gap-1 text-gray-600 text-sm">
                    <FiUser /> {user.name}
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 text-sm">
                    <FiCalendar /> {task.deadline || "No deadline"}
                  </div>
                </div>

                <div className="mt-4 w-full">
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyTasks;