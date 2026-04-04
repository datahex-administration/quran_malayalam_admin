'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';

interface EntryForm {
  surahNumber: string;
  ayahFrom: string;
  ayahTo: string;
  blockFrom: string;
  blockTo: string;
}

export default function EditPageHandlerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [pageNo, setPageNo] = useState('');
  const [entries, setEntries] = useState<EntryForm[]>([
    { surahNumber: '', ayahFrom: '', ayahTo: '', blockFrom: '', blockTo: '' },
  ]);

  useEffect(() => {
    fetchPageHandler();
  }, [id]);

  const fetchPageHandler = async () => {
    try {
      const res = await fetch(`/api/page-handlers/${id}`);
      if (!res.ok) {
        router.push('/admin/page-handlers');
        return;
      }
      const data = await res.json();
      setPageNo(data.pageNo.toString());
      setEntries(
        data.entries.map((entry: any) => ({
          surahNumber: entry.surahNumber.toString(),
          ayahFrom: entry.ayahFrom.toString(),
          ayahTo: entry.ayahTo.toString(),
          blockFrom: entry.blockFrom.toString(),
          blockTo: entry.blockTo.toString(),
        }))
      );
    } catch (err) {
      router.push('/admin/page-handlers');
    } finally {
      setFetching(false);
    }
  };

  const addEntry = () => {
    setEntries([...entries, { surahNumber: '', ayahFrom: '', ayahTo: '', blockFrom: '', blockTo: '' }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length === 1) return;
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof EntryForm, value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/page-handlers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageNo: parseInt(pageNo),
          entries: entries.map((entry) => ({
            surahNumber: parseInt(entry.surahNumber),
            ayahFrom: parseInt(entry.ayahFrom),
            ayahTo: parseInt(entry.ayahTo),
            blockFrom: parseInt(entry.blockFrom),
            blockTo: parseInt(entry.blockTo),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update page handler');
        return;
      }

      router.push('/admin/page-handlers');
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
          href="/admin/page-handlers"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Page</h1>
          <p className="text-gray-500 mt-1">Update page mapping details</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Number *
            </label>
            <input
              type="number"
              min="1"
              value={pageNo}
              onChange={(e) => setPageNo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., 1"
              required
            />
          </div>

          {/* Surah Entries */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Surah Entries *
              </label>
              <button
                type="button"
                onClick={addEntry}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Add Surah
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              A page can contain verses from multiple surahs. Add an entry for each surah present on this page.
            </p>

            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Surah Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="114"
                        value={entry.surahNumber}
                        onChange={(e) =>
                          updateEntry(index, 'surahNumber', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="1-114"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Ayah From
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={entry.ayahFrom}
                        onChange={(e) =>
                          updateEntry(index, 'ayahFrom', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="From"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Ayah To
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={entry.ayahTo}
                        onChange={(e) =>
                          updateEntry(index, 'ayahTo', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="To"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Block From
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={entry.blockFrom}
                        onChange={(e) =>
                          updateEntry(index, 'blockFrom', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="From"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Block To
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={entry.blockTo}
                        onChange={(e) =>
                          updateEntry(index, 'blockTo', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="To"
                        required
                      />
                    </div>
                  </div>
                  {entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-5"
                      title="Remove entry"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href="/admin/page-handlers"
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
              {loading ? 'Saving...' : 'Update Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
