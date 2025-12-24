import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from './Footer';
import Navbar from './Navbar';

const departments = [
  "Engineering",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "IT Support",
  "Customer Service",
  "Logistics",
  "Legal",
  "Procurement",
  "R&D",
  "Quality",
  "Admin",
  "Production",
  "Maintenance",
  "Design",
  "Training",
  "Compliance",
  "Analytics",
  "Strategy",
  "Security",
  "Public Relations",
  "Facilities",
  "Health & Safety",
  "UX/UI",
  "Data Science",
  "Content",
  "Business Development",
  "Innovation"
];

const designations = [
  "Manager",
  "Senior Engineer",
  "Junior Engineer",
  "Intern",
  "Team Lead",
  "HR Executive",
  "Finance Analyst",
  "Marketing Specialist",
  "Sales Associate",
  "Operations Manager",
  "IT Support Engineer",
  "Customer Support Rep",
  "Logistics Coordinator",
  "Legal Advisor",
  "Procurement Officer",
  "R&D Scientist",
  "Quality Analyst",
  "Admin Assistant",
  "Production Supervisor",
  "Maintenance Technician",
  "Designer",
  "Trainer",
  "Compliance Officer",
  "Data Analyst",
  "Strategy Consultant",
  "Security Officer",
  "PR Executive",
  "Facilities Manager",
  "Safety Officer",
  "Content Writer",
  "Business Developer",
  "Innovation Lead",
  "UX Designer",
  "UI Designer",
  "Data Engineer",
  "Product Manager",
  "Software Engineer",
  "Network Engineer",
  "Cloud Engineer",
  "DevOps Engineer",
  "Database Admin",
  "AI Specialist",
  "Machine Learning Engineer",
  "Cybersecurity Analyst",
  "Marketing Manager",
  "Sales Manager",
  "Operations Executive",
  "HR Manager",
  "Finance Manager",
  "Legal Manager",
  "Customer Success Manager"
];


const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId:'',name: '', email: '', role: '', department: '', designation: '', phone: '', gender:'',joining_date: '', dob: '',location:'',address:'',profileImage:'',
  });
  const [profileImage, setProfileImage] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${id}`);
        const data = res.data;
       setFormData({
           employeeId: data.employeeId || '',
             name: data.name || '',
             email: data.email || '',
            phone: data.phone || '',
            gender: data.gender || '',
           dob: data.dob?.slice(0, 10) || '',
            joining_date: data.joining_date?.slice(0, 10) || '',
            department: data.department || '',
            designation: data.designation || '',
            role: data.role || '',
            location: data.location || '',
            address: data.address || '',
          
            profileImage: data.profileImage || ''
        });

        setProfileImage(data.profileImage || '');
      } catch (err) {
        console.error(err);
        setError('Failed to load employee data');
      }
    };
    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Show confirmation modal
  const handleConfirmUpdate = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  // Actual submit
  const handleSubmit = async () => {
    const payload = new FormData();
    Object.keys(formData).forEach(key => payload.append(key, formData[key]));
    if (file) payload.append('profileImage', file);

    try {
      await axios.put(`http://localhost:5000/api/users/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNotification({ message: 'Employee updated successfully!', type: 'success' });
      setShowModal(false);
      setTimeout(() => navigate('/employees'), 1500);
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Failed to update employee.', type: 'error' });
      setShowModal(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Edit Employee</h2>

          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          {notification.message && (
            <div
              className={`mb-4 text-center px-4 py-2 rounded ${
                notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {notification.message}
            </div>
          )}

          <form onSubmit={handleConfirmUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
<div className="flex flex-col">
  <label className="mb-1 font-semibold text-gray-700">Employee ID</label>
  <input
    value={formData.employeeId}
    readOnly
    className="px-4 py-2 border bg-gray-100 rounded-lg"
  />
</div>



       {/* Email */}
<div className="flex flex-col">
  <label className="mb-1 font-semibold text-gray-700">Email</label>
  <input
    type="email"  
    name="email"
    value={formData.email}
    onChange={handleChange}
    placeholder="Enter email"
    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    required
  />
</div>

    {/* role */}
         <div className="flex flex-col">
  <label className="mb-1 font-semibold text-gray-700">Role</label>
  <select
    name="role"
    value={formData.role}
    onChange={handleChange}
    className="px-4 py-2 border rounded-lg"
    required
  >
    <option value="">Select Role</option>
    <option value="admin">ADMIN</option>
    <option value="manager">MANAGER</option>
    <option value="employee">EMPLOYEE</option>
    <option value="hr">HR</option>
  </select>
</div>


{/**gender */}
<div className="flex flex-col">
  <label className="mb-1 font-semibold text-gray-700">Gender</label>
  <select
    name="gender"
    value={formData.gender}
    onChange={handleChange}
    className="px-4 py-2 border rounded-lg"
    required
  >
    <option value="">Select Gender</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
</div>

            {/* location */}
<div className="flex flex-col">
  <label className="mb-1 font-semibold text-gray-700">Location</label>
  <input
    name="location"
    value={formData.location}
    onChange={handleChange}
    placeholder="Enter location"
    className="px-4 py-2 border rounded-lg"
    required
  />
</div>
 {/* address */}

<div className="flex flex-col md:col-span-2">
  <label className="mb-1 font-semibold text-gray-700">Address</label>
  <textarea
    name="address"
    value={formData.address}
    onChange={handleChange}
    rows={3}
    placeholder="Enter address"
    className="px-4 py-2 border rounded-lg"
    required
  />
</div>


            {/* Department */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Designation */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700">Designation</label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Designation</option>
                {designations.map((desig, index) => (
                  <option key={index} value={desig}>{desig}</option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700">Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Joining Date */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700">Joining Date</label>
              <input
                type="date"
                name="joining_date"
                value={formData.joining_date}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* DOB */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Profile Image */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700">Profile Image</label>
              <input type="file" onChange={handleFileChange} className="mb-2" />
              {profileImage && (
                <img
                  src={`http://localhost:5000/${profileImage}`}
                  alt="Profile"
                  className="w-32 h-32 object-cover rounded-full border border-gray-300"
                />
              )}
            </div>
          </form>

         
            {/* Update Button */}
<div className="mt-6 flex justify-center gap-4">
  <button
    type="submit"
    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
  >
    Update Employee
  </button>

  <button
    type="button"
    onClick={() => navigate('/employees')}
    className="bg-white text-blue-600 border-2 border-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 shadow-md transition"
  >
    Cancel
  </button>


          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-11/12 max-w-md">
            <h3 className="text-xl font-bold mb-4 text-center text-blue-700">Confirm Update</h3>
            <p className="text-gray-700 mb-6 text-center">Are you sure you want to update this employee's information?</p>
            <div className="flex justify-around">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EditEmployee;
