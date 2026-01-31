'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function EditTranslationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    suraNumber: '',
    ayaRangeStart: '',
    ayaRangeEnd: '',
    language: '',
    translationText: '',
  });

  useEffect(() => {
    fetchTranslation();
  }, [id]);

  const fetchTranslation = async () => {
    try {
      const res = await fetch(`/api/translations/${id}`);
      if (!res.ok) {
        router.push('/admin/translations');
        return;
      }
      const data = await res.json();
      setFormData({
        suraNumber: data.suraNumber.toString(),
        ayaRangeStart: data.ayaRangeStart.toString(),
        ayaRangeEnd: data.ayaRangeEnd.toString(),
        language: data.language,
        translationText: data.translationText,
      });
    } catch (err) {
      router.push('/admin/translations');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/translations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          suraNumber: parseInt(formData.suraNumber),
          ayaRangeStart: parseInt(formData.ayaRangeStart),
          ayaRangeEnd: parseInt(formData.ayaRangeEnd),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update translation');
        return;
      }

      router.push('/admin/translations');
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
          href="/admin/translations"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Translation</h1>
          <p className="text-gray-500 mt-1">Update translation details</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                Aya Start *
              </label>
              <input
                type="number"
                min="1"
                value={formData.ayaRangeStart}
                onChange={(e) =>
                  setFormData({ ...formData, ayaRangeStart: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aya End *
              </label>
              <input
                type="number"
                min="1"
                value={formData.ayaRangeEnd}
                onChange={(e) =>
                  setFormData({ ...formData, ayaRangeEnd: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language *
            </label>
            <select
              value={formData.language}
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="Malayalam">Malayalam</option>
              <option value="English">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Translation Text *
            </label>
            <textarea
              value={formData.translationText}
              onChange={(e) =>
                setFormData({ ...formData, translationText: e.target.value })
              }
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter the translation text..."
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href="/admin/translations"
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
              {loading ? 'Saving...' : 'Update Translation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
