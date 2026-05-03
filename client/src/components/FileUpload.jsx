import { useState } from 'react';
import axios from 'axios';

const ALLOWED_TYPES = ['.csv', '.json', '.xlsx', '.xls'];

export default function FileUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [persona, setPersona] = useState('');
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);

  function validateFile(f) {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
      return `Unsupported file type "${ext}". Allowed: ${ALLOWED_TYPES.join(', ')}`;
    }
    if (f.size > 10 * 1024 * 1024) {
      return 'File exceeds the 10 MB limit.';
    }
    return null;
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    const err = validateFile(f);
    if (err) { setErrorMsg(err); setFile(null); return; }
    setFile(f);
    setErrorMsg('');
    setStatus('idle');
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (!f) return;
    const err = validateFile(f);
    if (err) { setErrorMsg(err); setFile(null); return; }
    setFile(f);
    setErrorMsg('');
    setStatus('idle');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (persona.trim()) formData.append('persona', persona.trim());

    setStatus('uploading');
    setErrorMsg('');

    try {
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('success');
      setFile(null);
      setPersona('');
      onSuccess?.(data);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.error || 'Upload failed. Please try again.');
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Customer Data</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop zone */}
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors
            ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'}`}
        >
          <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm text-gray-600">
            {file ? file.name : 'Drag & drop or click to browse'}
          </span>
          <span className="text-xs text-gray-400 mt-1">CSV, JSON, XLSX, XLS · Max 10 MB</span>
          <input type="file" className="hidden" accept=".csv,.json,.xlsx,.xls" onChange={handleFileChange} />
        </label>

        {/* Persona */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Persona <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="e.g. Small Business Owner"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Error */}
        {errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorMsg}</p>
        )}

        {/* Success */}
        {status === 'success' && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            File uploaded and processed successfully!
          </p>
        )}

        <button
          type="submit"
          disabled={!file || status === 'uploading'}
          className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'uploading' ? 'Uploading…' : 'Upload & Process'}
        </button>
      </form>
    </div>
  );
}
