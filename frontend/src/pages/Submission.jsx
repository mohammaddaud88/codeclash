import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Submission = ({ problemId }) => {
  const userId = localStorage.getItem('email');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!userId) {
        toast.warn("Please log in to see your submissions.");
        return;
      };
      setLoading(true);
      let url = `http://localhost:8000/api/submissions/${userId}`;
      if (problemId) url += `?problemId=${problemId}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
          setSubmissions(data.submissions);
        } else {
          toast.error(data.message || 'Failed to fetch submissions.');
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        toast.error('An error occurred while fetching submissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.length > 0 ? submissions.map((sub, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${sub.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>{sub.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.language}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.createdAt).toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan="3" className="text-center py-10 text-gray-500">No submissions for this problem.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Submission;
