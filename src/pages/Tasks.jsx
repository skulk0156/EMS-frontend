import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import { FiMoreVertical, FiClock, FiUser, FiCalendar } from "react-icons/fi";

const statusColors = {
  "Pending": "bg-yellow-500",
  "In Progress": "bg-blue-500",
  "Completed": "bg-green-500",
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [userRole, setUserRole] = useState("");

  const token = localStorage.getItem("token");

  // Fetch all tasks
  useEffect(() => {
    const role = localStorage.getItem("role") || "";
    setUserRole(role.toLowerCase());
    
    const loadTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTasks(res.data);
        setFilteredTasks(res.data);
      } catch (err) {
        console.error("Error loading tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Search filter
  useEffect(() => {
    if (!search) setFilteredTasks(tasks);
    else {
      setFilteredTasks(
        tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.status.toLowerCase().includes(search.toLowerCase()) ||
            task.assignedTo?.name?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, tasks]);

  // Confirm delete
  const confirmDelete = (id) => {
    setDeleteId(id);
    setModalOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks((prev) => prev.filter((t) => t._id !== deleteId));
      setFilteredTasks((prev) => prev.filter((t) => t._id !== deleteId));
      setModalOpen(false);
      setToast({ show: true, message: 'Task deleted successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to delete task.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-blue-100">
      <Navbar />

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">

        {/* Header + Search + Add btn */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-8">
          <h1 className="text-4xl font-extrabold text-blue-700">Tasks Overview</h1>

          <div className="flex gap-3 flex-col sm:flex-row w-full sm:w-auto">
            {(userRole === "admin" || userRole === "manager") && (
              <input
                type="text"
                placeholder="Search by task, status, or assignee..."
                className="px-4 py-2 rounded-full shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 sm:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            )}
            {(userRole === "admin" || userRole === "manager") && (
              <button
                onClick={() => (window.location.href = "/AddTask")}
                className="bg-blue-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                + Add Task
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <p className="text-gray-600 text-center text-lg mt-10">
            No tasks found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredTasks.map((task, index) => (
              <div
                key={task._id}
                className="bg-white rounded-3xl shadow-md p-6 flex flex-col items-center text-center border border-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fadeIn relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Dropdown Menu */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() =>
                      setShowDropdown(showDropdown === task._id ? null : task._id)
                    }
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <FiMoreVertical />
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10 overflow-hidden transition-all duration-300 ${
                      showDropdown === task._id
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    <button
                      onClick={() => (window.location.href = `/edit-task/${task._id}`)}
                      className="block w-full text-left px-4 py-2 hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(task._id)}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Task Icon */}
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
                  {task.assignedTo?.name || "Unassigned"}
                </p>
                <p className="text-gray-500 text-sm">
                  {task.deadline || "No deadline"}
                </p>
                <p className="text-gray-500 text-sm">
                  Priority: {task.priority}
                </p>

                {/* Task Details */}
                <div className="flex flex-col items-center mt-3 gap-1">
                  <div className="flex items-center gap-1 text-gray-600 text-sm">
                    <FiUser /> {task.assignedTo?.name || "Unassigned"}
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 text-sm">
                    <FiCalendar /> {task.deadline || "No deadline"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96 text-center animate-fadeIn">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Confirm Delete
            </h2>
            <p className="mb-6">Are you sure you want to delete this task?</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

export default Tasks;










// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import { FiMoreVertical, FiClock, FiUser, FiCalendar } from "react-icons/fi";

// const statusColors = {
//   "Pending": "bg-yellow-500",
//   "In Progress": "bg-blue-500",
//   "Completed": "bg-green-500",
// };

// const Tasks = () => {
//   const [tasks, setTasks] = useState([]);
//   const [filteredTasks, setFilteredTasks] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [showDropdown, setShowDropdown] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [deleteId, setDeleteId] = useState(null);

//   const token = localStorage.getItem("token");

//   // Fetch all tasks
//   useEffect(() => {
//     const loadTasks = async () => {
//       try {
//         const res = await axios.get("http://localhost:5000/api/tasks", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setTasks(res.data);
//         setFilteredTasks(res.data);
//       } catch (err) {
//         console.error("Error loading tasks:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadTasks();
//   }, []);

//   // Search filter
//   useEffect(() => {
//     if (!search) setFilteredTasks(tasks);
//     else {
//       setFilteredTasks(
//         tasks.filter(
//           (task) =>
//             task.title.toLowerCase().includes(search.toLowerCase()) ||
//             task.status.toLowerCase().includes(search.toLowerCase()) ||
//             task.assignedTo?.name?.toLowerCase().includes(search.toLowerCase())
//         )
//       );
//     }
//   }, [search, tasks]);

//   // Confirm delete
//   const confirmDelete = (id) => {
//     setDeleteId(id);
//     setModalOpen(true);
//   };

//   // Handle delete
//   const handleDelete = async () => {
//     try {
//       await axios.delete(`http://localhost:5000/api/tasks/${deleteId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setTasks((prev) => prev.filter((t) => t._id !== deleteId));
//       setFilteredTasks((prev) => prev.filter((t) => t._id !== deleteId));
//       setModalOpen(false);
//       alert("Task deleted successfully!");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to delete task.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-blue-100">
//       <Navbar />

//       <div className="flex-1 p-6 max-w-7xl mx-auto">

//         {/* Header + Search + Add btn */}
//         <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-12">
//           <h1 className="text-4xl font-extrabold text-blue-700">Tasks Overview</h1>

//           <div className="flex gap-3 flex-col sm:flex-row w-full sm:w-auto">
//             <input
//               type="text"
//               placeholder="Search by task, status, or assignee..."
//               className="px-4 py-2 rounded-full shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 sm:w-64"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//             <button
//               onClick={() => (window.location.href = "/add-task")}
//               className="bg-blue-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center gap-2"
//             >
//               + Add Task
//             </button>
//           </div>
//         </div>

//         {/* Loading */}
//         {loading ? (
//           <div className="flex justify-center items-center py-20">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600" />
//           </div>
//         ) : filteredTasks.length === 0 ? (
//           <p className="text-gray-600 text-center text-lg mt-10">
//             No tasks found.
//           </p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
//             {filteredTasks.map((task, index) => (
//               <div
//                 key={task._id}
//                 className="bg-white rounded-3xl shadow-md p-6 flex flex-col items-center text-center border border-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fadeIn"
//                 style={{ animationDelay: `${index * 100}ms` }}
//               >
//                 {/* Dropdown Menu */}
//                 <div className="absolute top-4 right-4">
//                   <button
//                     onClick={() =>
//                       setShowDropdown(showDropdown === task._id ? null : task._id)
//                     }
//                     className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
//                   >
//                     <FiMoreVertical />
//                   </button>

//                   <div
//                     className={`absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10 overflow-hidden transition-all duration-300 ${
//                       showDropdown === task._id
//                         ? "opacity-100 scale-100"
//                         : "opacity-0 scale-95 pointer-events-none"
//                     }`}
//                   >
//                     <button
//                       onClick={() => (window.location.href = `/edit-task/${task._id}`)}
//                       className="block w-full text-left px-4 py-2 hover:bg-blue-100"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => confirmDelete(task._id)}
//                       className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>

//                 {/* Task Icon */}
//                 <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-blue-200 shadow-sm bg-blue-400 flex items-center justify-center">
//                   <FiClock className="text-white text-4xl" />
//                 </div>

//                 <h2 className="text-2xl font-semibold text-blue-700">{task.title}</h2>
//                 <span
//                   className={`text-white px-3 py-1 rounded-full mt-1 ${
//                     statusColors[task.status] || "bg-gray-500"
//                   }`}
//                 >
//                   {task.status}
//                 </span>

//                 <p className="text-gray-500 text-sm mt-2">
//                   {task.assignedTo?.name || "Unassigned"}
//                 </p>
//                 <p className="text-gray-500 text-sm">
//                   {task.deadline || "No deadline"}
//                 </p>
//                 <p className="text-gray-500 text-sm">
//                   Priority: {task.priority}
//                 </p>

//                 {/* Task Details */}
//                 <div className="flex flex-col items-center mt-3 gap-1">
//                   <div className="flex items-center gap-1 text-gray-600 text-sm">
//                     <FiUser /> {task.assignedTo?.name || "Unassigned"}
//                   </div>
//                   <div className="flex items-center gap-1 text-gray-600 text-sm">
//                     <FiCalendar /> {task.deadline || "No deadline"}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Delete Modal */}
//       {modalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-lg p-6 w-96 text-center animate-fadeIn">
//             <h2 className="text-xl font-semibold text-red-600 mb-4">
//               Confirm Delete
//             </h2>
//             <p className="mb-6">Are you sure you want to delete this task?</p>

//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={() => setModalOpen(false)}
//                 className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <Footer />
//     </div>
//   );
// };

// export default Tasks;
