import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import { FiSearch, FiCalendar } from "react-icons/fi";

const statusColors = {
  Present: "bg-green-500",
  Absent: "bg-red-500",
  Leave: "bg-yellow-500",
};

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState('');
  const [loginTime, setLoginTime] = useState(localStorage.getItem('attendanceLoginTime') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [currentTimer, setCurrentTimer] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [attendanceRecord, setAttendanceRecord] = useState(
    localStorage.getItem('attendanceRecord') ? JSON.parse(localStorage.getItem('attendanceRecord')) : null
  );
  const [logoutTime, setLogoutTime] = useState(localStorage.getItem('attendanceLogoutTime') || '');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    punch_in: "",
    punch_out: "",
    status: "Present",
  });
  
  const user = JSON.parse(localStorage.getItem('user'));
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  // Function to calculate working hours and return an object with hours, minutes, seconds
  const calculateWorkingHours = (loginTime, logoutTime) => {
    if (!loginTime || !logoutTime) return { hours: 0, minutes: 0, seconds: 0 };
    
    const parseTime = (timeStr) => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes, seconds] = time.split(':').map(Number);
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;
      return new Date(2000, 0, 1, hour24, minutes, seconds || 0);
    };
    
    const login = parseTime(loginTime);
    const logout = parseTime(logoutTime);
    const diffMs = logout - login;
    
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return { hours, minutes, seconds };
  };
  
  // Function to format the timer object for display
  const formatTimer = (timer) => {
    const parts = [];
    if (timer.hours > 0) parts.push(`${timer.hours}h`);
    if (timer.minutes > 0 || timer.hours > 0) parts.push(`${timer.minutes}m`);
    parts.push(`${timer.seconds}s`);
    return parts.join(' ');
  };
  
  // Timer effect - updates every second
  useEffect(() => {
    let interval;
    if (isLoggedIn && loginTime) {
      interval = setInterval(() => {
        const now = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setCurrentTimer(calculateWorkingHours(loginTime, now));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoggedIn, loginTime]);

  // Clear attendance data when user logs out of account
  useEffect(() => {
    if (!user) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('attendanceLoginTime');
      localStorage.removeItem('attendanceRecord');
      localStorage.removeItem('attendanceLogoutTime');
      setIsLoggedIn(false);
      setAttendanceRecord(null);
      setLoginTime('');
      setLogoutTime('');
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/attendance");
        setRecords(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let temp = [...records];

    if (search.trim() !== "")
      temp = temp.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      );

    if (date.trim() !== "") temp = temp.filter((r) => r.date.startsWith(date));

    setFiltered(temp);
  }, [search, date, records]);

  const submitAttendance = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/attendance",
        formData
      );

      setRecords([...records, res.data]);
      setShowForm(false);

      setFormData({
        name: "",
        date: "",
        punch_in: "",
        punch_out: "",
        status: "Present",
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto flex-1 w-full">
        {/* Header with Login/Logout buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 w-full">
          <h1 className="text-4xl font-extrabold text-blue-700 flex-grow">Attendance</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 active:scale-95 transition"
            >
              Login
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 active:scale-95 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* TIMER DISPLAY */}
        

        {/* --- FILTERS SECTION (Only for admin and manager) --- */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <div className="relative w-full sm:w-2/5 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search employee..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="relative w-full sm:w-1/4 max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                type="date"
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ATTENDANCE TABLE */}
        {attendanceRecord && (
          <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
            <div className="bg-blue-600 text-white p-4">
              <h3 className="text-lg font-semibold">Today's Attendance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logout Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timer</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attendanceRecord.empId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attendanceRecord.empName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attendanceRecord.loginTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{logoutTime || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {logoutTime ? formatTimer(calculateWorkingHours(attendanceRecord.loginTime, logoutTime)) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isLoggedIn ? (
                        <span className="text-green-600 font-bold text-lg">
                          {formatTimer(currentTimer)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty message */}
        {filtered.length === 0 && (
          <div className="text-center text-gray-600 text-xl mt-10">
            No attendance records found.
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((rec, i) => (
            <div
              key={rec._id}
              className="bg-white p-6 rounded-3xl shadow-md border border-blue-200 hover:scale-105 transition-all opacity-0 animate-fadeIn"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "forwards" }}
            >
              <h2 className="text-2xl font-bold text-blue-700">{rec.name}</h2>
              <p className="text-gray-500 mt-1">Date: {rec.date}</p>
              <p className="text-gray-500">Punch In: {rec.punch_in}</p>
              <p className="text-gray-500">Punch Out: {rec.punch_out}</p>

              <span
                className={`px-4 py-1 mt-3 inline-block text-white rounded-full ${
                  statusColors[rec.status] || "bg-gray-500"
                }`}
              >
                {rec.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
      
      <Footer />

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-green-600 text-center">Login Attendance</h2>
            
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-gray-700">Employee ID</label>
                <input type="text" value={user?.employeeId || ''} readOnly className="w-full p-3 bg-gray-200 rounded-xl" />
              </div>
              
              <div>
                <label className="font-semibold text-gray-700">Employee Name</label>
                <input type="text" value={user?.name || ''} readOnly className="w-full p-3 bg-gray-200 rounded-xl" />
              </div>
              
              <div>
                <label className="font-semibold text-gray-700">Date</label>
                <input type="text" value={currentDate} readOnly className="w-full p-3 bg-gray-200 rounded-xl" />
              </div>
              
              <div>
                <label className="font-semibold text-gray-700">Current Time</label>
                <input type="text" value={currentTime} readOnly className="w-full p-3 bg-gray-200 rounded-xl" />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setLoginTime(currentTime);
                  setConfirmType('login');
                  setShowLoginModal(false);
                  setShowConfirmModal(true);
                }}
                className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-red-600 text-center">Logout Attendance</h2>
            
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-gray-700">Employee ID</label>
                <input type="text" value={user?.employeeId || ''} readOnly className="w-full p-3 bg-gray-200 rounded-xl" />
              </div>
              
              <div>
                <label className="font-semibold text-gray-700">Employee Name</label>
                <input type="text" value={user?.name || ''} readOnly className="w-full p-3 bg-gray-200 rounded-xl" />
              </div>
              
              <div>
                <label className="font-semibold text-gray-700">Date</label>
                <input type="text" value={currentDate} readOnly className="w-full p-3 bg-gray-200 rounded-xl" />
              </div>
              
              <div>
                <label className="font-semibold text-gray-700">Login Time</label>
                <input type="text" value={loginTime || '09:00 AM'} readOnly className="w-full p-3 bg-gray-200 rounded-xl" />
              </div>
              
              <div>
                <label className="font-semibold text-gray-700">Logout Time</label>
                <input type="text" value={currentTime} readOnly className="w-full p-3 bg-gray-200 rounded-xl" />
              </div>
              
              <div>
                <label className="font-semibold text-gray-700">Total Time Worked</label>
                <input type="text" value={loginTime ? formatTimer(calculateWorkingHours(loginTime, currentTime)) : '0s'} readOnly className="w-full p-3 bg-gray-200 rounded-xl" />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmType('logout');
                  setShowLogoutModal(false);
                  setShowConfirmModal(true);
                }}
                className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
            {confirmType === 'login' ? (
              <>
                <h2 className="text-2xl font-bold mb-6 text-green-600 text-center">Confirm Your Attendance</h2>
                <p className="text-center text-gray-700 mb-6">Are you sure you want to mark your login attendance?</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsLoggedIn(true);
                      const record = {
                        empId: user?.employeeId,
                        empName: user?.name,
                        loginTime: loginTime,
                        date: currentDate
                      };
                      setAttendanceRecord(record);
                      localStorage.setItem('isLoggedIn', 'true');
                      localStorage.setItem('attendanceLoginTime', loginTime);
                      localStorage.setItem('attendanceRecord', JSON.stringify(record));
                      setShowConfirmModal(false);
                      setToast({ show: true, message: 'Your attendance has been confirmed!', type: 'success' });
                    }}
                    className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    Confirm
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6 text-red-600 text-center">Logout Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="font-semibold">Login Time:</span>
                    <span>{loginTime || '09:00 AM'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Logout Time:</span>
                    <span>{currentTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Working Hours:</span>
                    <span>{loginTime ? formatTimer(calculateWorkingHours(loginTime, currentTime)) : '0s'}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setLogoutTime(currentTime);
                    setIsLoggedIn(false);
                    localStorage.setItem('attendanceLogoutTime', currentTime);
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('attendanceLoginTime');
                    localStorage.removeItem('attendanceRecord');
                    setShowConfirmModal(false);
                    setToast({ show: true, message: 'Logout completed successfully!', type: 'success' });
                  }}
                  className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";

// const statusColors = {
//   Present: "bg-green-500",
//   Absent: "bg-red-500",
//   Leave: "bg-yellow-500",
// };

// const Attendance = () => {
//   const [records, setRecords] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [search, setSearch] = useState("");
//   const [date, setDate] = useState("");

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const res = await axios.get("http://localhost:5000/api/attendance");
//         setRecords(res.data);
//         setFiltered(res.data);
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     loadData();
//   }, []);

//   useEffect(() => {
//     let temp = records;

//     if (search)
//       temp = temp.filter((r) =>
//         r.name.toLowerCase().includes(search.toLowerCase())
//       );

//     if (date)
//       temp = temp.filter((r) => r.date.startsWith(date));

//     setFiltered(temp);
//   }, [search, date, records]);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
//       <Navbar />

//       <div className="p-6 max-w-7xl mx-auto flex-1">
//         <h1 className="text-4xl font-extrabold text-blue-700 mb-6">Attendance</h1>

//         {/* Filters */}
//         <div className="flex flex-col sm:flex-row gap-4 mb-8">
//           <input
//             type="text"
//             placeholder="Search employee..."
//             className="px-4 py-2 rounded-full border border-gray-300"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//           <input
//             type="date"
//             className="px-4 py-2 rounded-full border border-gray-300"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//           />
//         </div>

//         {/* Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {filtered.map((rec, i) => (
//             <div
//               key={rec._id}
//               className="bg-white p-6 rounded-3xl shadow-md border border-blue-200 hover:scale-105 transition-all animate-fadeIn"
//               style={{ animationDelay: `${i * 80}ms` }}
//             >
//               <h2 className="text-2xl font-bold text-blue-700">{rec.name}</h2>
//               <p className="text-gray-500 mt-1">Date: {rec.date}</p>
//               <p className="text-gray-500">Punch In: {rec.punch_in}</p>
//               <p className="text-gray-500">Punch Out: {rec.punch_out}</p>

//               <span
//                 className={`px-4 py-1 mt-3 inline-block text-white rounded-full ${
//                   statusColors[rec.status] || "bg-gray-500"
//                 }`}
//               >
//                 {rec.status}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default Attendance;
