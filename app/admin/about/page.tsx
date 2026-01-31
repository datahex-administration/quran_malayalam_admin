'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiCheckCircle } from 'react-icons/fi';

interface AboutUsItem {
  _id: string;
  title: string;
  description: string;
  isVerified: boolean;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
}

export default function AboutUsPage() {
  const [items, setItems] = useState<AboutUsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/about');
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/about/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
    setDeleteId(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">About Us</h1>
          <p className="text-gray-500 mt-1">Manage about us content</p>
        </div>
        <Link
          href="/admin/about/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Entry</span>
        </Link>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No entries found. Add your first about us entry.
          </div>
        ) : (
          items.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.title}
                    </h3>
                    {item.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        <FiCheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {item.description}
                  </p>
                  <p className="text-sm text-gray-400 mt-3">
                    Created by {item.createdBy} ({item.createdByRole})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/about/${item._id}/edit`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteId(item._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Delete Entry
            </h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete this entry?
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
