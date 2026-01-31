'use client';

import { useState, useEffect } from 'react';
import { FiClock, FiFilter, FiRefreshCw } from 'react-icons/fi';

interface AuditLog {
  _id: string;
  contentType: string;
  contentId: string;
  action: string;
  performedBy: string;
  role: string;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    contentType: '',
    action: '',
    performedBy: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const contentTypes = [
    'sura',
    'translation',
    'interpretation',
    'about',
    'author',
    'contact',
    'help',
  ];

  const actions = ['create', 'update', 'delete', 'verify'];

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (filters.contentType) params.set('contentType', filters.contentType);
      if (filters.action) params.set('action', filters.action);
      if (filters.performedBy) params.set('performedBy', filters.performedBy);

      const res = await fetch(`/api/audit?${params}`);
      const data = await res.json();

      if (res.ok) {
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilter = () => {
    fetchLogs(1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ contentType: '', action: '', performedBy: '' });
    fetchLogs(1);
    setShowFilters(false);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'verify':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Audit Log</h1>
          <p className="text-gray-500 mt-1">Track all content changes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchLogs(pagination.page)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiFilter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={filters.contentType}
                onChange={(e) =>
                  setFilters({ ...filters, contentType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {contentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Actions</option>
                {actions.map((action) => (
                  <option key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performed By
              </label>
              <input
                type="text"
                value={filters.performedBy}
                onChange={(e) =>
                  setFilters({ ...filters, performedBy: e.target.value })
                }
                placeholder="Search by user..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <FiClock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No audit logs found</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {logs.map((log) => (
                <div key={log._id} className="p-4 hover:bg-gray-50">
                  <div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 cursor-pointer"
                    onClick={() =>
                      setExpandedLog(expandedLog === log._id ? null : log._id)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action.toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-800">
                        {log.contentType.charAt(0).toUpperCase() +
                          log.contentType.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        by{' '}
                        <span className="font-medium text-gray-700">
                          {log.performedBy}
                        </span>{' '}
                        ({log.role})
                      </span>
                      <span>{formatDate(log.createdAt)}</span>
                    </div>
                  </div>

                  {expandedLog === log._id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-600 mb-2">
                        Content ID:{' '}
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {log.contentId}
                        </span>
                      </div>

                      {log.newData && Object.keys(log.newData).length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            {log.action === 'delete' ? 'Deleted Data:' : 'New Data:'}
                          </p>
                          <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-48">
                            {JSON.stringify(log.newData, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.previousData &&
                        Object.keys(log.previousData).length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Previous Data:
                            </p>
                            <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-48">
                              {JSON.stringify(log.previousData, null, 2)}
                            </pre>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchLogs(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchLogs(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
