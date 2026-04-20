'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiSearch,
  FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown,
  FiEye,
} from 'react-icons/fi';

interface TajweedRule {
  _id: string;
  title: string;
  description: string;
  isVerified: boolean;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
}

interface UserSession {
  loginCode: string;
  role: 'creator' | 'verifier';
}

export default function TajweedRulesPage() {
  const [rules, setRules] = useState<TajweedRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [user, setUser] = useState<UserSession | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewRule, setPreviewRule] = useState<TajweedRule | null>(null);
  const [sort, setSort] = useState({ by: 'createdAt', order: 'desc' });

  const handleSort = (field: string) => {
    setSort((prev) =>
      prev.by === field
        ? { by: field, order: prev.order === 'asc' ? 'desc' : 'asc' }
        : { by: field, order: 'asc' }
    );
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sort.by !== field) return <FiChevronDown className="w-3 h-3 opacity-30" />;
    return sort.order === 'asc' ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />;
  };

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => { if (d.authenticated) setUser(d.user); });
  }, []);

  useEffect(() => { fetchRules(); }, [page, search, verificationStatus, sort]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(verificationStatus !== '' && { isVerified: verificationStatus }),
        sortBy: sort.by,
        sortOrder: sort.order,
      });
      const res = await fetch(`/api/tajweed-rules?${params}`);
      const data = await res.json();
      setRules(data.rules);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch tajweed rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tajweed-rules/${id}`, { method: 'DELETE' });
      if (res.ok) fetchRules();
    } catch (error) {
      console.error('Failed to delete tajweed rule:', error);
    }
    setDeleteId(null);
  };

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/tajweed-rules/${id}/verify`, { method: 'POST' });
      if (res.ok) fetchRules();
    } catch (error) {
      console.error('Failed to verify tajweed rule:', error);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tajweed Rules</h1>
          <p className="text-gray-500 mt-1">Manage tajweed rule entries with rich descriptions</p>
        </div>
        <Link
          href="/admin/tajweed-rules/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Tajweed Rule</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={verificationStatus}
            onChange={(e) => { setVerificationStatus(e.target.value); setPage(1); }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="false">Pending</option>
            <option value="true">Verified</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('title')}
                >
                  <span className="inline-flex items-center gap-1">Title <SortIcon field="title" /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                  Description Preview
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('isVerified')}
                >
                  <span className="inline-flex items-center gap-1">Status <SortIcon field="isVerified" /></span>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('createdBy')}
                >
                  <span className="inline-flex items-center gap-1">Created By <SortIcon field="createdBy" /></span>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <span className="inline-flex items-center gap-1">Date <SortIcon field="createdAt" /></span>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No tajweed rules found</td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{rule.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="tajweed-preview text-sm text-gray-600 max-h-20 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: rule.description }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {rule.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          <FiCheckCircle className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{rule.createdBy}</p>
                      <p className="text-xs text-gray-500">{rule.createdByRole}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(rule.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewRule(rule)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {user?.role === 'verifier' && !rule.isVerified && (
                          <button
                            onClick={() => handleVerify(rule._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Verify"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          href={`/admin/tajweed-rules/${rule._id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(rule._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Page {page} of {pagination.pages} ({pagination.total} items)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Tajweed Rule</h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete this rule? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Description Preview Modal */}
      {previewRule && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewRule(null)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">{previewRule.title}</h3>
              <button
                onClick={() => setPreviewRule(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div
                className="tajweed-content"
                dangerouslySetInnerHTML={{ __html: previewRule.description }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
