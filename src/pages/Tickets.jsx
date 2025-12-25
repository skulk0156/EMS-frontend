import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import { FiMoreVertical, FiClock, FiUser, FiCalendar } from "react-icons/fi";

const statusColors = {
  Pending: "bg-yellow-500",
  "In Progress": "bg-blue-500",
  Completed: "bg-green-500",
};

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [managerFilter, setManagerFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [teams, setTeams] = useState([]);
  const [managers, setManagers] = useState([]);

  const [showDropdown, setShowDropdown] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [userRole, setUserRole] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  const token = localStorage.getItem("token");

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const role = localStorage.getItem("role") || "";
    setUserRole(role.toLowerCase());

    const loadData = async () => {
      try {
        const [ticketRes, teamRes, managerRes] = await Promise.all([
          axios.get("http://localhost:5000/api/tasks", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/teams"),
          axios.get("http://localhost:5000/api/users/managers"),
        ]);

        setTickets(ticketRes.data);
        setFilteredTickets(ticketRes.data);
        calculateSummary(ticketRes.data);

        setTeams(teamRes.data || []);
        setManagers(managerRes.data || []);
      } catch (err) {
        console.error("Error loading ticket data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* ================= SUMMARY ================= */
  const calculateSummary = (data) => {
    setSummary({
      total: data.length,
      pending: data.filter((t) => t.status === "Pending").length,
      inProgress: data.filter((t) => t.status === "In Progress").length,
      completed: data.filter((t) => t.status === "Completed").length,
    });
  };

  /* ================= FILTER LOGIC ================= */
  useEffect(() => {
    let temp = [...tickets];

    if (search) {
      temp = temp.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.assignedTo?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter) {
      temp = temp.filter((t) => t.status === statusFilter);
    }

    if (teamFilter) {
      temp = temp.filter((t) => t.team?._id === teamFilter);
    }

    if (managerFilter) {
      temp = temp.filter((t) => t.manager?._id === managerFilter);
    }

    if (fromDate) {
      temp = temp.filter((t) => new Date(t.deadline) >= new Date(fromDate));
    }

    if (toDate) {
      temp = temp.filter((t) => new Date(t.deadline) <= new Date(toDate));
    }

    setFilteredTickets(temp);
  }, [search, statusFilter, teamFilter, managerFilter, fromDate, toDate, tickets]);

  /* ================= DELETE ================= */
  const confirmDelete = (id) => {
    setDeleteId(id);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = tickets.filter((t) => t._id !== deleteId);
      setTickets(updated);
      setFilteredTickets(updated);
      calculateSummary(updated);

      setModalOpen(false);
      setToast({ show: true, message: "Ticket deleted successfully!", type: "success" });
    } catch (err) {
      setToast({ show: true, message: "Failed to delete ticket.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-blue-100">
      <Navbar />

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold text-blue-700">Tickets Overview</h1>

          {(userRole === "admin" || userRole === "manager") && (
            <button
              onClick={() => (window.location.href = "/AddTask")}
              className="bg-blue-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-blue-700 transition"
            >
              + Add Ticket
            </button>
          )}
        </div>

        {/* ================= SUMMARY CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <div className="text-sm text-gray-500">Total Tickets</div>
            <div className="text-2xl font-bold text-blue-700">{summary.total}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <div className="text-sm text-gray-500">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <div className="text-sm text-gray-500">In Progress</div>
            <div className="text-2xl font-bold text-blue-600">{summary.inProgress}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <div className="text-sm text-gray-500">Completed</div>
            <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
          </div>
        </div>

        {/* ================= BIG FILTER CARD ================= */}
        {(userRole === "admin" || userRole === "manager") && (
          <div className="bg-white p-4 rounded-xl shadow mb-6">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center">
              <input
                className="px-4 py-2 rounded-full border w-full sm:w-64"
                placeholder="Search ticket or assignee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select className="px-4 py-2 rounded-full border" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <select className="px-4 py-2 rounded-full border" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
                <option value="">All Teams</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>{t.team_name}</option>
                ))}
              </select>

              <select className="px-4 py-2 rounded-full border" value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)}>
                <option value="">All Managers</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>

              <input type="date" className="px-3 py-2 rounded-full border" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <input type="date" className="px-3 py-2 rounded-full border" value={toDate} onChange={(e) => setToDate(e.target.value)} />

              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setTeamFilter("");
                  setManagerFilter("");
                  setFromDate("");
                  setToDate("");
                }}
                className="px-4 py-2 rounded-full border"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* ================= TICKET GRID ================= */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <p className="text-center text-gray-600">No tickets found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredTickets.map((ticket) => (
              <div key={ticket._id} className="bg-white p-6 rounded-3xl shadow border hover:scale-105 transition relative">
                <h2 className="text-lg font-semibold text-blue-700">{ticket.title}</h2>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-white ${statusColors[ticket.status]}`}>
                  {ticket.status}
                </span>
                <div className="mt-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1"><FiUser /> {ticket.assignedTo?.name || "Unassigned"}</div>
                  <div className="flex items-center gap-1"><FiCalendar /> {ticket.deadline || "No deadline"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast message={toast.message} type={toast.type} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
      <Footer />
    </div>
  );
};

export default Tickets;