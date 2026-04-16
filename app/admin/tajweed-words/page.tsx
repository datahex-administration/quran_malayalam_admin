'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiSearch,
  FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown,
} from 'react-icons/fi';

interface TajweedWord {
  _id: string;
  customId: number;
  surahNo: number;
  ayahNo: number;
  wordPos: number;
  wordText?: string;
  imageUrl: string;
  isVerified: boolean;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
}

interface UserSession {
  loginCode: string;
  role: 'creator' | 'verifier';
}

export default function TajweedWordsPage() {
  const [words, setWords] = useState<TajweedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [user, setUser] = useState<UserSession | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sort, setSort] = useState({ by: 'customId', order: 'asc' });

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

  useEffect(() => { fetchWords(); }, [page, search, verificationStatus, sort]);

  const fetchWords = async () => {
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
      const res = await fetch(`/api/tajweed-words?${params}`);
      const data = await res.json();
      setWords(data.words);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch tajweed words:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tajweed-words/${id}`, { method: 'DELETE' });
      if (res.ok) fetchWords();
    } catch (error) {
      console.error('Failed to delete tajweed word:', error);
    }
    setDeleteId(null);
  };

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/tajweed-words/${id}/verify`, { method: 'POST' });
      if (res.ok) fetchWords();
    } catch (error) {
      console.error('Failed to verify tajweed word:', error);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tajweed Words</h1>
          <p className="text-gray-500 mt-1">Manage tajweed word image records</p>
        </div>
        <Link
          href="/admin/tajweed-words/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Tajweed Word</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by word text or surah..."
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('customId')}>
                  <span className="inline-flex items-center gap-1">ID <SortIcon field="customId" /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('surahNo')}>
                  <span className="inline-flex items-center gap-1">Surah <SortIcon field="surahNo" /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('ayahNo')}>
                  <span className="inline-flex items-center gap-1">Ayah <SortIcon field="ayahNo" /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('wordPos')}>
                  <span className="inline-flex items-center gap-1">Word Pos <SortIcon field="wordPos" /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word Text</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('isVerified')}>
                  <span className="inline-flex items-center gap-1">Status <SortIcon field="isVerified" /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('createdBy')}>
                  <span className="inline-flex items-center gap-1">Created By <SortIcon field="createdBy" /></span>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : words.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No tajweed words found</td></tr>
              ) : (
                words.map((word) => (
                  <tr key={word._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{word.customId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{word.surahNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{word.ayahNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{word.wordPos}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{word.wordText || '—'}</td>
                    <td className="px-4 py-3">
                      {word.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          <FiCheckCircle className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{word.createdBy}</p>
                      <p className="text-xs text-gray-500">{word.createdByRole}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {user?.role === 'verifier' && !word.isVerified && (
                          <button onClick={() => handleVerify(word._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Verify">
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <Link href={`/admin/tajweed-words/${word._id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDeleteId(word._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
            <p className="text-sm text-gray-500">Page {page} of {pagination.pages} ({pagination.total} items)</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setPage(page + 1)} disabled={page === pagination.pages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Tajweed Word</h3>
            <p className="text-gray-500 mb-4">Are you sure you want to delete this record? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
