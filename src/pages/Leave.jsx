// src/pages/Leave.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FiMoreVertical, FiUser, FiCalendar, FiFileText, FiX } from "react-icons/fi";

/*
  Important behavior:
  - Employees cannot set the status when creating a leave. The frontend forces status = "Pending".
  - Only admins should call PATCH /api/leaves/:id to change status to Approved/Rejected.
  - Backend should also enforce that clients cannot set arbitrary status when creating a leave.
*/

const statusColors = {
  Approved: "bg-green-500",
  Pending: "bg-yellow-500",
  Rejected: "bg-red-500",
};

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");
  const [showDropdown, setShowDropdown] = useState(null);
  const [userRole, setUserRole] = useState("");

  // Add-leave modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employee_name: "",
    type: "Sick leave",
    from: "",
    to: "",
    reason: "",
  });

  // Quota for summary - change as required or fetch from backend
  const leaveQuota = 4;

  useEffect(() => {
    const role = localStorage.getItem("role") || "";
    setUserRole(role.toLowerCase());
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves");
      setLeaves(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error("Failed to fetch leaves", err);
    }
  };

  useEffect(() => {
    let temp = [...leaves];

    if (search) {
      temp = temp.filter((l) =>
        (l.employee_name || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    if (typeFilter) {
      temp = temp.filter((l) => (l.type || "").toLowerCase() === typeFilter.toLowerCase());
    }

    if (status) {
      temp = temp.filter((l) => (l.status || "").toLowerCase() === status.toLowerCase());
    }

    if (fromDateFilter) {
      const f = new Date(fromDateFilter);
      temp = temp.filter((l) => {
        const leaveFrom = new Date(l.from);
        return !isNaN(leaveFrom) && leaveFrom >= f;
      });
    }

    if (toDateFilter) {
      const t = new Date(toDateFilter);
      temp = temp.filter((l) => {
        const leaveTo = new Date(l.to);
        return !isNaN(leaveTo) && leaveTo <= t;
      });
    }

    setFiltered(temp);
  }, [search, status, typeFilter, fromDateFilter, toDateFilter, leaves]);

  // Summary numbers
  const totalLeaves = leaves.length;
  const usedLeaves = leaves.filter((l) => (l.status || "").toLowerCase() === "approved").length;
  const remainingLeaves = Math.max(leaveQuota - usedLeaves, 0);

  // Update status (admin action)
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/leaves/${id}`, { status: newStatus });
      await fetchLeaves();
      setShowDropdown(null);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Add leave handler - frontend forces status to "Pending"
  const handleAddLeave = async (e) => {
    e.preventDefault();
    try {
      if (!newLeave.employee_name || !newLeave.from || !newLeave.to) {
        alert("Please fill employee name, from and to dates.");
        return;
      }

      // IMPORTANT: Force status to "Pending" here so user cannot create with Approved/Rejected
      const payload = {
        ...newLeave,
        status: "Pending",
      };

      await axios.post("http://localhost:5000/api/leaves", payload);
      setShowAddModal(false);
      setNewLeave({
        employee_name: "",
        type: "Sick leave",
        from: "",
        to: "",
        reason: "",
      });
      await fetchLeaves();
    } catch (err) {
      console.error("Failed to add leave", err);
      alert("Failed to add leave");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto flex-1 w-full">
        {/* --- UPDATED SECTION --- */}
        {/* Added flex-grow to heading and margin-left to button for more horizontal space */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 w-full">
          <h1 className="text-3xl font-extrabold text-blue-700 flex-grow">Leave Requests</h1>

          {(userRole === "admin" || userRole === "hr") && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-full bg-blue-600 text-white shadow hover:bg-blue-700 ml-8"
            >
              + Add Leave
            </button>
          )}
        </div>

        {/* Leave Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow flex flex-col">
            <span className="text-sm text-gray-600">Total Leaves</span>
            <span className="text-2xl font-bold text-blue-700">{totalLeaves}</span>
            <div className="h-2 bg-blue-100 rounded-full mt-3">
              <div
                className="h-2 bg-blue-600 rounded-full"
                style={{ width: `${(totalLeaves / Math.max(leaveQuota, 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow flex flex-col">
            <span className="text-sm text-gray-600">Used Leaves</span>
            <span className="text-2xl font-bold text-green-600">{usedLeaves}</span>
            <div className="h-2 bg-green-100 rounded-full mt-3">
              <div
                className="h-2 bg-green-600 rounded-full"
                style={{ width: `${(usedLeaves / Math.max(leaveQuota, 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow flex flex-col">
            <span className="text-sm text-gray-600">Remaining Leaves</span>
            <span className="text-2xl font-bold text-yellow-600">{remainingLeaves}</span>
            <div className="h-2 bg-yellow-100 rounded-full mt-3">
              <div
                className="h-2 bg-yellow-600 rounded-full"
                style={{ width: `${(remainingLeaves / Math.max(leaveQuota, 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filters (Only for admin and manager) */}
        {(userRole === "admin" || userRole === "manager") && (
          <div className="bg-white p-4 rounded-xl shadow mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <input
                type="text"
                placeholder="Search employee..."
                className="px-4 py-2 rounded-full border border-gray-300 flex-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="px-4 py-2 rounded-full border border-gray-300"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Leave Types</option>
                <option value="Sick leave">Sick leave</option>
                <option value="Casual leave">Casual leave</option>
                <option value="Paid leave">Paid leave</option>
                <option value="Other">Other</option>
              </select>

              {/* Status filter - useful for admin view. Employees will still only see current statuses */}
              <select
                className="px-4 py-2 rounded-full border border-gray-300"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">From</label>
                <input
                  type="date"
                  className="px-3 py-2 rounded-full border border-gray-300"
                  value={fromDateFilter}
                  onChange={(e) => setFromDateFilter(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">To</label>
                <input
                  type="date"
                  className="px-3 py-2 rounded-full border border-gray-300"
                  value={toDateFilter}
                  onChange={(e) => setToDateFilter(e.target.value)}
                />
              </div>

              <button
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setTypeFilter("");
                  setFromDateFilter("");
                  setToDateFilter("");
                }}
                className="px-4 py-2 rounded-full border border-gray-300"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((leave, i) => (
            <div
              key={leave._id || i}
              className="bg-white p-6 rounded-3xl shadow-lg border border-blue-200 hover:scale-105 transition-all relative"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Dropdown (admin actions) */}
              <button
                className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                onClick={() =>
                  setShowDropdown(showDropdown === (leave._id || i) ? null : (leave._id || i))
                }
              >
                <FiMoreVertical />
              </button>

              {showDropdown === (leave._id || i) && (
                <div className="absolute top-12 right-4 bg-white border rounded-md shadow-lg w-36 z-10">
                  <button
                    onClick={() => updateStatus(leave._id, "Approved")}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(leave._id, "Pending")}
                    className="w-full text-left px-4 py-2 hover:bg-yellow-50"
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => updateStatus(leave._id, "Rejected")}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                  >
                    Reject
                  </button>
                </div>
              )}

              <h2 className="text-xl font-bold text-blue-700">{leave.employee_name}</h2>

              <p className="text-gray-600 mt-2">
                {leave.from} → {leave.to}
              </p>

              <p className="text-sm text-gray-500 mt-3">Type: {leave.type || "—"}</p>

              <p className="text-gray-500 mt-3">{leave.reason}</p>

              <span
                className={`px-4 py-1 mt-4 inline-block rounded-full text-white ${
                  statusColors[leave.status] || "bg-gray-500"
                }`}
              >
                {leave.status || "Pending"}
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No leave requests found.
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* --- IMPROVED ADD LEAVE MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Request Leave</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddLeave} className="p-6 space-y-6">
              {/* Employee Name Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={newLeave.employee_name}
                    onChange={(e) => setNewLeave({ ...newLeave, employee_name: e.target.value })}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Leave Details Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Leave Type</label>
                  <select
                    value={newLeave.type}
                    onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option>Sick Leave</option>
                    <option>Casual Leave</option>
                    <option>Paid Leave</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={newLeave.from}
                      onChange={(e) => setNewLeave({ ...newLeave, from: e.target.value })}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={newLeave.to}
                      onChange={(e) => setNewLeave({ ...newLeave, to: e.target.value })}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Reason Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Leave</label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <FiFileText className="text-gray-400 mt-1" />
                  </div>
                  <textarea
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    rows={4}
                    placeholder="Please provide a brief reason for your leave request..."
                    required
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;







// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import { FiMoreVertical } from "react-icons/fi";

// const statusColors = {
//   Approved: "bg-green-500",
//   Pending: "bg-yellow-500",
//   Rejected: "bg-red-500",
// };

// const Leaves = () => {
//   const [leaves, setLeaves] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("");
//   const [showDropdown, setShowDropdown] = useState(null);

//   useEffect(() => {
//     const fetchLeaves = async () => {
//       const res = await axios.get("http://localhost:5000/api/leaves");
//       setLeaves(res.data);
//       setFiltered(res.data);
//     };
//     fetchLeaves();
//   }, []);

//   useEffect(() => {
//     let temp = leaves;

//     if (search)
//       temp = temp.filter((l) =>
//         l.employee_name.toLowerCase().includes(search.toLowerCase())
//       );

//     if (status)
//       temp = temp.filter((l) => l.status === status);

//     setFiltered(temp);
//   }, [search, status, leaves]);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
//       <Navbar />

//       <div className="p-6 max-w-7xl mx-auto flex-1">
//         <h1 className="text-4xl font-extrabold text-blue-700 mb-8">Leave Requests</h1>

//         {/* Filters */}
//         <div className="flex flex-col sm:flex-row gap-4 mb-8">
//           <input
//             type="text"
//             placeholder="Search employee..."
//             className="px-4 py-2 rounded-full border border-gray-300"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//           <select
//             className="px-4 py-2 rounded-full border border-gray-300"
//             value={status}
//             onChange={(e) => setStatus(e.target.value)}
//           >
//             <option value="">All Status</option>
//             <option value="Approved">Approved</option>
//             <option value="Pending">Pending</option>
//             <option value="Rejected">Rejected</option>
//           </select>
//         </div>

//         {/* Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {filtered.map((leave, i) => (
//             <div
//               key={leave._id}
//               className="bg-white p-6 rounded-3xl shadow-lg border border-blue-200 hover:scale-105 transition-all relative animate-fadeIn"
//               style={{ animationDelay: `${i * 80}ms` }}
//             >
//               {/* Dropdown */}
//               <button
//                 className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
//                 onClick={() =>
//                   setShowDropdown(showDropdown === leave._id ? null : leave._id)
//                 }
//               >
//                 <FiMoreVertical />
//               </button>

//               {showDropdown === leave._id && (
//                 <div className="absolute top-12 right-4 bg-white border rounded-md shadow-lg w-32">
//                   <button className="w-full px-4 py-2 hover:bg-blue-100">
//                     Approve
//                   </button>
//                   <button className="w-full px-4 py-2 hover:bg-yellow-100">
//                     Pending
//                   </button>
//                   <button className="w-full px-4 py-2 hover:bg-red-100 text-red-600">
//                     Reject
//                   </button>
//                 </div>
//               )}

//               <h2 className="text-xl font-bold text-blue-700">
//                 {leave.employee_name}
//               </h2>

//               <p className="text-gray-600 mt-2">
//                 {leave.from} → {leave.to}
//               </p>

//               <p className="text-gray-500 mt-3">{leave.reason}</p>

//               <span
//                 className={`px-4 py-1 mt-4 inline-block rounded-full text-white ${
//                   statusColors[leave.status] || "bg-gray-500"
//                 }`}
//               >
//                 {leave.status}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default Leaves;
