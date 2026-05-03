import { useState } from 'react';
import axios from 'axios';

export default function CompetitorForm({ onSuccess }) {
  const [name, setName] = useState('');
  const [pricing, setPricing] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState([]);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function addFeature() {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
    }
    setFeatureInput('');
  }

  function removeFeature(f) {
    setFeatures(features.filter((x) => x !== f));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim()) return setErrorMsg('Name is required.');
    if (!pricing || isNaN(parseFloat(pricing)) || parseFloat(pricing) < 0) return setErrorMsg('Enter a valid price.');
    if (features.length === 0) return setErrorMsg('Add at least one feature.');

    setStatus('saving');
    try {
      const { data } = await axios.post('/api/competitors', {
        name: name.trim(),
        pricing: parseFloat(pricing),
        features,
      });
      setName(''); setPricing(''); setFeatures([]); setFeatureInput('');
      setStatus('idle');
      onSuccess?.(data);
    } catch (err) {
      setStatus('idle');
      const apiErrors = err.response?.data?.errors;
      setErrorMsg(apiErrors ? apiErrors.map((e) => e.msg).join(' ') : 'Failed to save competitor.');
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Competitor</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Competitor Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Competitor A"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
              placeholder="e.g. 29.99"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
              placeholder="Type a feature and press Enter"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              Add
            </button>
          </div>
          {features.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {features.map((f) => (
                <span key={f} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                  {f}
                  <button type="button" onClick={() => removeFeature(f)} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === 'saving'}
          className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'saving' ? 'Saving…' : 'Add Competitor'}
        </button>
      </form>
    </div>
  );
}
