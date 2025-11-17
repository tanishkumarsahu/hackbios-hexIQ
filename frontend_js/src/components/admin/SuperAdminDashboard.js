'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Shield, Activity, Database } from 'lucide-react';
import AdminDashboard from './AdminDashboard';

export default function SuperAdminDashboard() {
  const { fetchAuditLogs } = useAdmin();
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  useEffect(() => {
    if (showAuditLogs) {
      loadAuditLogs();
    }
  }, [showAuditLogs]);

  const loadAuditLogs = async () => {
    const logs = await fetchAuditLogs({ limit: 50 });
    setAuditLogs(logs || []);
  };

  return (
    <div>
      <AdminDashboard />
      
      {/* Super Admin Only Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Super Admin Tools</h2>
          </div>
          <button
            onClick={() => setShowAuditLogs(!showAuditLogs)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {showAuditLogs ? 'Hide' : 'Show'} Audit Logs
          </button>
        </div>

        {showAuditLogs && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Audit Logs
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.user?.name || log.user?.email || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
