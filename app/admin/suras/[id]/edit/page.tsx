'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function EditSuraPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    suraNumber: '',
    name: '',
    arabicName: '',
    description: '',
    ayathCount: '',
    place: 'Mecca',
  });

  useEffect(() => {
    fetchSura();
  }, [id]);

  const fetchSura = async () => {
    try {
      const res = await fetch(`/api/suras/${id}`);
      if (!res.ok) {
        router.push('/admin/suras');
        return;
      }
      const data = await res.json();
      setFormData({
        suraNumber: data.suraNumber.toString(),
        name: data.name,
        arabicName: data.arabicName || '',
        description: data.description || '',
        ayathCount: data.ayathCount.toString(),
        place: data.place,
      });
    } catch (err) {
      router.push('/admin/suras');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/suras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          suraNumber: parseInt(formData.suraNumber),
          ayathCount: parseInt(formData.ayathCount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update sura');
        return;
      }

      router.push('/admin/suras');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/suras"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Sura</h1>
          <p className="text-gray-500 mt-1">Update sura details</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sura Number *
              </label>
              <input
                type="number"
                min="1"
                max="114"
                value={formData.suraNumber}
                onChange={(e) =>
                  setFormData({ ...formData, suraNumber: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ayath Count *
              </label>
              <input
                type="number"
                min="1"
                value={formData.ayathCount}
                onChange={(e) =>
                  setFormData({ ...formData, ayathCount: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Al-Fatihah"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arabic Name
              </label>
              <input
                type="text"
                value={formData.arabicName}
                onChange={(e) =>
                  setFormData({ ...formData, arabicName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., الفاتحة"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Place of Revelation *
            </label>
            <select
              value={formData.place}
              onChange={(e) =>
                setFormData({ ...formData, place: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="Mecca">Mecca</option>
              <option value="Medina">Medina</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Brief description about the sura..."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href="/admin/suras"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              {loading ? 'Saving...' : 'Update Sura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
