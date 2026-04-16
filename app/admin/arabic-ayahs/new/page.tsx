'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function NewArabicAyahPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customId: '',
    chapterNo: '',
    verseFrom: '',
    verseTo: '',
    dataArabic: '',
    position: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/arabic-ayahs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customId: parseInt(formData.customId),
          chapterNo: parseInt(formData.chapterNo),
          verseFrom: parseInt(formData.verseFrom),
          verseTo: parseInt(formData.verseTo),
          position: parseInt(formData.position),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create Arabic ayah'); return; }
      router.push('/admin/arabic-ayahs');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/arabic-ayahs" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add Arabic Ayah</h1>
          <p className="text-gray-500 mt-1">Create a new Arabic Quran ayah record</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID *</label>
              <input type="number" value={formData.customId} onChange={(e) => setFormData({ ...formData, customId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter unique ID" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chapter No *</label>
              <input type="number" min="1" max="114" value={formData.chapterNo} onChange={(e) => setFormData({ ...formData, chapterNo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="1–114" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verse From *</label>
              <input type="number" min="1" value={formData.verseFrom} onChange={(e) => setFormData({ ...formData, verseFrom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verse To *</label>
              <input type="number" min="1" value={formData.verseTo} onChange={(e) => setFormData({ ...formData, verseTo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
              <input type="number" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Arabic Data *</label>
            <textarea value={formData.dataArabic} onChange={(e) => setFormData({ ...formData, dataArabic: e.target.value })}
              rows={6} dir="rtl"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-arabic text-lg"
              placeholder="أدخل النص العربي" required />
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
              <FiSave className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Ayah'}
            </button>
            <Link href="/admin/arabic-ayahs" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
