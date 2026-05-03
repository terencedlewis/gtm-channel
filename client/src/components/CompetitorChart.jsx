import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const COLORS = [
  'rgba(99, 102, 241, 0.8)',
  'rgba(16, 185, 129, 0.8)',
  'rgba(245, 158, 11, 0.8)',
  'rgba(239, 68, 68, 0.8)',
  'rgba(14, 165, 233, 0.8)',
];

export default function CompetitorChart({ refreshTrigger }) {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/competitors')
      .then(({ data }) => { setCompetitors(data); setLoading(false); })
      .catch(() => { setError('Failed to load competitors.'); setLoading(false); });
  }, [refreshTrigger]);

  async function handleDelete(id) {
    try {
      await axios.delete(`/api/competitors/${id}`);
      setCompetitors((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Failed to delete competitor.');
    }
  }

  if (loading) return <p className="text-sm text-gray-500 py-4">Loading competitors…</p>;
  if (error) return <p className="text-sm text-red-600 py-4">{error}</p>;
  if (!competitors.length) return (
    <p className="text-sm text-gray-400 py-4 text-center">No competitors yet — add one above.</p>
  );

  const chartData = {
    labels: competitors.map((c) => c.name),
    datasets: [
      {
        label: 'Monthly Price ($)',
        data: competitors.map((c) => c.pricing),
        backgroundColor: competitors.map((_, i) => COLORS[i % COLORS.length]),
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Competitor Pricing Comparison', font: { size: 14 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => `$${v}` } },
    },
  };

  // Collect all unique features across all competitors
  const allFeatures = [...new Set(competitors.flatMap((c) => c.features))];

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Feature comparison table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <h3 className="text-base font-semibold text-gray-800 px-6 py-4 border-b border-gray-100">
          Feature Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600 border-b border-gray-200 w-40">
                  Feature
                </th>
                {competitors.map((c) => (
                  <th key={c.id} className="text-center px-4 py-3 font-medium text-gray-600 border-b border-gray-200">
                    <div>{c.name}</div>
                    <div className="text-xs text-indigo-600 font-semibold">${c.pricing}/mo</div>
                  </th>
                ))}
                <th className="w-12 border-b border-gray-200" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allFeatures.map((feature) => (
                <tr key={feature} className="hover:bg-gray-50">
                  <td className="px-6 py-2.5 text-gray-700 font-medium">{feature}</td>
                  {competitors.map((c) => (
                    <td key={c.id} className="px-4 py-2.5 text-center">
                      {c.features.includes(feature) ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  ))}
                  <td />
                </tr>
              ))}
              {/* Delete row */}
              <tr className="bg-gray-50">
                <td className="px-6 py-2 text-xs text-gray-400 font-medium">Actions</td>
                {competitors.map((c) => (
                  <td key={c.id} className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-red-500 hover:text-red-700 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                ))}
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
