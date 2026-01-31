'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

interface Sura {
  _id: string;
  suraNumber: number;
  name: string;
  arabicName?: string;
  description?: string;
  ayathCount: number;
  place: 'Mecca' | 'Medina';
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

export default function SurasPage() {
  const [suras, setSuras] = useState<Sura[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [user, setUser] = useState<UserSession | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    fetchSuras();
  }, [page, search]);

  const fetchSuras = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
      });
      const res = await fetch(`/api/suras?${params}`);
      const data = await res.json();
      setSuras(data.suras);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch suras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/suras/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSuras();
      }
    } catch (error) {
      console.error('Failed to delete sura:', error);
    }
    setDeleteId(null);
  };

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/suras/${id}/verify`, { method: 'POST' });
      if (res.ok) {
        fetchSuras();
      }
    } catch (error) {
      console.error('Failed to verify sura:', error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Suras</h1>
          <p className="text-gray-500 mt-1">Manage Quran chapters</p>
        </div>
        <Link
          href="/admin/suras/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Sura</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search suras..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ayath
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Place
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
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
              ) : suras.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No suras found
                  </td>
                </tr>
              ) : (
                suras.map((sura) => (
                  <tr key={sura._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {sura.suraNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {sura.name}
                        </p>
                        {sura.arabicName && (
                          <p className="text-sm text-gray-500">{sura.arabicName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {sura.ayathCount}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          sura.place === 'Mecca'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {sura.place}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {sura.isVerified ? (
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
                      <p className="text-sm text-gray-900">{sura.createdBy}</p>
                      <p className="text-xs text-gray-500">{sura.createdByRole}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {user?.role === 'verifier' && !sura.isVerified && (
                          <button
                            onClick={() => handleVerify(sura._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Verify"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          href={`/admin/suras/${sura._id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(sura._id)}
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
              Delete Sura
            </h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete this sura? This action cannot be
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
