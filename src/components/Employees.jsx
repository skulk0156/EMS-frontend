import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiPhone, FiMoreVertical } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import Navbar from './Navbar';
import Footer from './Footer';
import Toast from './Toast';

// ✅ Create axios instance with token automatically added
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Role Colors
const roleColors = {
  ADMIN: "bg-red-500",
  HR: "bg-green-500",
  EMPLOYEE: "bg-blue-500",
  MANAGER: "bg-yellow-500",
  DEFAULT: "bg-gray-500",
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [userRole, setUserRole] = useState("");

  const navigate = useNavigate();

  // ✅ Fetch employees with token
  useEffect(() => {
    const role = localStorage.getItem("role") || "";
    setUserRole(role.toLowerCase());
    
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/users");
        setEmployees(res.data);
        setFilteredEmployees(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Search filter
  useEffect(() => {
    if (!search) setFilteredEmployees(employees);
    else {
      setFilteredEmployees(
        employees.filter((emp) =>
          emp.name?.toLowerCase().includes(search.toLowerCase()) ||
          emp.role?.toLowerCase().includes(search.toLowerCase()) ||
          emp.department?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, employees]);

  // Open delete modal
  const confirmDelete = (id) => {
    setDeleteId(id);
    setModalOpen(true);
    setShowDropdown(null);
  };

  // ❌ Old delete request had no token
  // ✅ Fixed delete API call (token + correct url)
  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteId}`);
      setEmployees((prev) => prev.filter((emp) => emp._id !== deleteId));
      setFilteredEmployees((prev) => prev.filter((emp) => emp._id !== deleteId));
      setModalOpen(false);
      setToast({ show: true, message: 'Employee deleted successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to delete employee.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-blue-100">
      <Navbar />
      <div className="flex-1 p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-blue-700">Meet Our Team</h1>

          <div className="flex gap-3 flex-col sm:flex-row w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name, role or department..."
              className="px-4 py-2 rounded-full shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {(userRole === "admin" || userRole === "hr") && (
              <button
                onClick={() => navigate("/add-employee")}
                className="bg-blue-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                + Add Employee
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center text-lg">{error}</p>
        ) : filteredEmployees.length === 0 ? (
          <p className="text-gray-600 text-center text-lg mt-10">No employees found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredEmployees.map((emp, index) => (
              <div
                key={emp._id}
                className={`bg-white rounded-3xl shadow-md p-6 flex flex-col items-center text-center border border-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fadeIn`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Dropdown */}
                <div className="absolute top-4 right-4">
                  <button
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    onClick={() =>
                      setShowDropdown(showDropdown === emp._id ? null : emp._id)
                    }
                  >
                    <FiMoreVertical />
                  </button>

                  {/** Action Menu */}
                  <div
                    className={`absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10 overflow-hidden transition-all duration-300 ${
                      showDropdown === emp._id
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-blue-100"
                      onClick={() => navigate(`/edit-employee/${emp._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                      onClick={() => confirmDelete(emp._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Profile Image */}
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-blue-200 shadow-sm">
                  {emp.profileImage ? (
                    <img
                      src={`http://localhost:5000/${emp.profileImage}`}
                      alt={emp.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-400 flex items-center justify-center text-white font-bold text-2xl">
                      {emp.name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-semibold text-blue-700">{emp.name}</h2>
                <span
                  className={`text-white px-3 py-1 rounded-full mt-1 ${
                    roleColors[emp.role?.toUpperCase()] || roleColors.DEFAULT
                  }`}
                >
                  {emp.role?.toUpperCase()}
                </span>

                <p className="text-gray-500 text-sm">{emp.employeeId}</p>
                <p className="text-gray-500 text-sm mt-2">{emp.department}</p>
                <p className="text-gray-500 text-sm">{emp.designation}</p>

                {/* Contact */}
                <div className="flex flex-col items-center mt-3 gap-1">
                  <div
                    className="flex items-center gap-1 text-gray-600 text-sm hover:text-blue-600 transition cursor-pointer"
                    data-tooltip-id={`email-${emp._id}`}
                    data-tooltip-content={emp.email}
                  >
                    <FiMail /> {emp.email?.slice(0, 15)}
                  </div>
                  <Tooltip id={`email-${emp._id}`} />

                  <div
                    className="flex items-center gap-1 text-gray-600 text-sm hover:text-blue-600 transition cursor-pointer"
                    data-tooltip-id={`phone-${emp._id}`}
                    data-tooltip-content={emp.phone}
                  >
                    <FiPhone /> {emp.phone?.slice(0, 12)}
                  </div>
                  <Tooltip id={`phone-${emp._id}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96 text-center animate-fadeIn">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this employee?</p>

            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                onClick={handleDelete}
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

export default Employees;
