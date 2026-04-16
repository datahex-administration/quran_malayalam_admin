'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function EditChapterDescriptionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customId: '',
    chapterNo: '',
    chapterNameMal: '',
    chapterNameArabic: '',
    chapterDesMal: '',
    chapterDesArabic: '',
    position: '',
  });

  useEffect(() => { fetchDescription(); }, [id]);

  const fetchDescription = async () => {
    try {
      const res = await fetch(`/api/chapter-descriptions/${id}`);
      if (!res.ok) { router.push('/admin/chapter-descriptions'); return; }
      const data = await res.json();
      setFormData({
        customId: data.customId.toString(),
        chapterNo: data.chapterNo.toString(),
        chapterNameMal: data.chapterNameMal,
        chapterNameArabic: data.chapterNameArabic || '',
        chapterDesMal: data.chapterDesMal || '',
        chapterDesArabic: data.chapterDesArabic || '',
        position: data.position != null ? data.position.toString() : '',
      });
    } catch { router.push('/admin/chapter-descriptions'); }
    finally { setFetching(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/chapter-descriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customId: parseInt(formData.customId),
          chapterNo: parseInt(formData.chapterNo),
          position: formData.position ? parseInt(formData.position) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to update chapter description'); return; }
      router.push('/admin/chapter-descriptions');
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
        <Link href="/admin/chapter-descriptions" className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><FiArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Chapter Description</h1>
          <p className="text-gray-500 mt-1">Update chapter description details</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID *</label>
              <input type="number" value={formData.customId} onChange={(e) => setFormData({ ...formData, customId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chapter No *</label>
              <input type="number" min="1" max="114" value={formData.chapterNo} onChange={(e) => setFormData({ ...formData, chapterNo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <input type="number" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chapter Name (Malayalam) *</label>
              <input type="text" value={formData.chapterNameMal} onChange={(e) => setFormData({ ...formData, chapterNameMal: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chapter Name (Arabic)</label>
              <input type="text" value={formData.chapterNameArabic} onChange={(e) => setFormData({ ...formData, chapterNameArabic: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" dir="rtl" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chapter Description (Malayalam)</label>
            <textarea value={formData.chapterDesMal} onChange={(e) => setFormData({ ...formData, chapterDesMal: e.target.value })}
              rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chapter Description (Arabic)</label>
            <textarea value={formData.chapterDesArabic} onChange={(e) => setFormData({ ...formData, chapterDesArabic: e.target.value })}
              rows={5} dir="rtl"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
              <FiSave className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/admin/chapter-descriptions" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
