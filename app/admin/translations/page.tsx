'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi';

interface Translation {
  _id: string;
  suraNumber: number;
  ayaRangeStart: number;
  ayaRangeEnd: number;
  language: string;
  translationText: string;
  isVerified: boolean;
  createdBy: string;
  createdByRole: string;
  verifiedBy?: string;
  createdAt: string;
}

interface UserSession {
  loginCode: string;
  role: 'creator' | 'verifier';
}

export default function TranslationsPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [user, setUser] = useState<UserSession | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    suraNumber: '',
    language: '',
    verificationStatus: '',
  });
  const [sort, setSort] = useState({ by: 'suraNumber', order: 'asc' });

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
    return sort.order === 'asc'
      ? <FiChevronUp className="w-3 h-3" />
      : <FiChevronDown className="w-3 h-3" />;
  };

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        }
      });
  }, []);

  useEffect(() => {
    fetchTranslations();
  }, [page, filters, sort]);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.suraNumber && { suraNumber: filters.suraNumber }),
        ...(filters.language && { language: filters.language }),
        ...(filters.verificationStatus !== '' && { isVerified: filters.verificationStatus }),
        sortBy: sort.by,
        sortOrder: sort.order,
      });
      const res = await fetch(`/api/translations?${params}`);
      const data = await res.json();
      setTranslations(data.translations);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/translations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTranslations();
      }
    } catch (error) {
      console.error('Failed to delete translation:', error);
    }
    setDeleteId(null);
  };

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/translations/${id}/verify`, { method: 'POST' });
      if (res.ok) {
        fetchTranslations();
      }
    } catch (error) {
      console.error('Failed to verify translation:', error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Translations</h1>
          <p className="text-gray-500 mt-1">Manage verse translations</p>
        </div>
        <Link
          href="/admin/translations/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Translation</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FiFilter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <input
              type="number"
              placeholder="Sura Number"
              value={filters.suraNumber}
              onChange={(e) => {
                setFilters({ ...filters, suraNumber: e.target.value });
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filters.language}
              onChange={(e) => {
                setFilters({ ...filters, language: e.target.value });
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Languages</option>
              <option value="Malayalam">Malayalam</option>
              <option value="English">English</option>
            </select>
          </div>
          <div>
            <select
              value={filters.verificationStatus}
              onChange={(e) => {
                setFilters({ ...filters, verificationStatus: e.target.value });
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="false">Pending</option>
              <option value="true">Verified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('suraNumber')}
                >
                  <span className="inline-flex items-center gap-1">Sura <SortIcon field="suraNumber" /></span>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('ayaRangeStart')}
                >
                  <span className="inline-flex items-center gap-1">Aya Range <SortIcon field="ayaRangeStart" /></span>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                  onClick={() => handleSort('language')}
                >
                  <span className="inline-flex items-center gap-1">Language <SortIcon field="language" /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Translation
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
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : translations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No translations found
                  </td>
                </tr>
              ) : (
                translations.map((trans) => (
                  <tr key={trans._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {trans.suraNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {trans.ayaRangeStart} - {trans.ayaRangeEnd}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {trans.language}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {trans.translationText}
                    </td>
                    <td className="px-4 py-3">
                      {trans.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          <FiCheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{trans.createdBy}</p>
                      <p className="text-xs text-gray-500">{trans.createdByRole}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {user?.role === 'verifier' && !trans.isVerified && (
                          <button
                            onClick={() => handleVerify(trans._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Verify"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          href={`/admin/translations/${trans._id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(trans._id)}
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

        {/* Pagination */}
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

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Delete Translation
            </h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete this translation? This action cannot be
              undone.
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
    </div>
  );
}
