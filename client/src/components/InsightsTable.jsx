import { useEffect, useState } from 'react';
import axios from 'axios';

export default function InsightsTable({ refreshTrigger }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/upload')
      .then(({ data }) => { setInsights(data); setLoading(false); })
      .catch(() => { setError('Failed to load insights.'); setLoading(false); });
  }, [refreshTrigger]);

  if (loading) return <p className="text-sm text-gray-500 py-4">Loading insights…</p>;
  if (error) return <p className="text-sm text-red-600 py-4">{error}</p>;
  if (!insights.length) return (
    <p className="text-sm text-gray-400 py-4 text-center">No data yet — upload a file above.</p>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-800 px-6 py-4 border-b border-gray-100">
        Customer Insights
      </h2>
      <ul className="divide-y divide-gray-100">
        {insights.map((insight) => {
          const isOpen = expanded === insight.id;
          const columns = insight.data.length > 0 ? Object.keys(insight.data[0]) : [];
          return (
            <li key={insight.id}>
              <button
                onClick={() => setExpanded(isOpen ? null : insight.id)}
                className="w-full flex items-center justify-between px-6 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div>
                  <span className="text-sm font-medium text-gray-800">{insight.fileName}</span>
                  {insight.persona && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {insight.persona}
                    </span>
                  )}
                  <span className="ml-2 text-xs text-gray-400">
                    {insight.data.length} rows · {new Date(insight.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && columns.length > 0 && (
                <div className="overflow-x-auto px-6 pb-4">
                  <table className="min-w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        {columns.map((col) => (
                          <th key={col} className="text-left px-3 py-2 font-medium text-gray-600 border-b border-gray-200">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {insight.data.slice(0, 50).map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {columns.map((col) => (
                            <td key={col} className="px-3 py-1.5 text-gray-700 whitespace-nowrap">
                              {String(row[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {insight.data.length > 50 && (
                    <p className="text-xs text-gray-400 mt-2">Showing first 50 of {insight.data.length} rows.</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
