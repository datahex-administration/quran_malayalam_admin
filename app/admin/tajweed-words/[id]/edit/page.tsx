'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function EditTajweedWordPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customId: '',
    surahNo: '',
    ayahNo: '',
    wordPos: '',
    wordText: '',
    imageUrl: '',
  });

  useEffect(() => { fetchWord(); }, [id]);

  const fetchWord = async () => {
    try {
      const res = await fetch(`/api/tajweed-words/${id}`);
      if (!res.ok) { router.push('/admin/tajweed-words'); return; }
      const data = await res.json();
      setFormData({
        customId: data.customId.toString(),
        surahNo: data.surahNo.toString(),
        ayahNo: data.ayahNo.toString(),
        wordPos: data.wordPos.toString(),
        wordText: data.wordText || '',
        imageUrl: data.imageUrl,
      });
    } catch { router.push('/admin/tajweed-words'); }
    finally { setFetching(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/tajweed-words/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customId: parseInt(formData.customId),
          surahNo: parseInt(formData.surahNo),
          ayahNo: parseInt(formData.ayahNo),
          wordPos: parseInt(formData.wordPos),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to update tajweed word'); return; }
      router.push('/admin/tajweed-words');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/tajweed-words" className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><FiArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Tajweed Word</h1>
          <p className="text-gray-500 mt-1">Update tajweed word details</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID *</label>
              <input type="number" value={formData.customId} onChange={(e) => setFormData({ ...formData, customId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Surah No *</label>
              <input type="number" min="1" max="114" value={formData.surahNo} onChange={(e) => setFormData({ ...formData, surahNo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ayah No *</label>
              <input type="number" min="1" value={formData.ayahNo} onChange={(e) => setFormData({ ...formData, ayahNo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Word Position *</label>
              <input type="number" min="1" value={formData.wordPos} onChange={(e) => setFormData({ ...formData, wordPos: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Word Text</label>
            <input type="text" value={formData.wordText} onChange={(e) => setFormData({ ...formData, wordText: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Optional: Arabic word text" dir="rtl" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
            <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
              <FiSave className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/admin/tajweed-words" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
