import React, { useState, useEffect } from 'react';
import { SchoolService } from '../services/SchoolService';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let result = [];
        if (activeTab === 'students') result = await SchoolService.fetchStudents();
        else if (activeTab === 'teachers') result = await SchoolService.fetchTeachers();
        
        console.log("Data received for", activeTab, ":", result); // Check console for this!
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
      setLoading(false);
    };
    loadData();
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 bg-white border-r p-6">
        {['students', 'teachers'].map(m => (
          <button key={m} onClick={() => setActiveTab(m)} className="block w-full text-left font-bold uppercase text-xs p-2">{m}</button>
        ))}
      </div>
      <div className="flex-1 p-8">
        {loading ? <p>Loading data from database...</p> : (
          <table className="w-full bg-white shadow-sm border">
            <thead><tr><th className="p-4">Name</th><th className="p-4">Email</th></tr></thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan="2" className="p-4 text-center">No data found in the {activeTab} table.</td></tr>
              ) : (
                data.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="p-4">{item.first_name} {item.surname}</td>
                    <td className="p-4">{item.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
