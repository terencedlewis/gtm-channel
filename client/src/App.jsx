import { useState } from 'react';
import FileUpload from './components/FileUpload';
import InsightsTable from './components/InsightsTable';
import CompetitorForm from './components/CompetitorForm';
import CompetitorChart from './components/CompetitorChart';

const TABS = ['Market Research', 'Competitor Analysis'];

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [insightRefresh, setInsightRefresh] = useState(0);
  const [competitorRefresh, setCompetitorRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">G</span>
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900 leading-tight">GTM Platform</h1>
          <p className="text-xs text-gray-400">Market Research & Insights</p>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex gap-1">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === i
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {activeTab === 0 && (
          <>
            <FileUpload onSuccess={() => setInsightRefresh((n) => n + 1)} />
            <InsightsTable refreshTrigger={insightRefresh} />
          </>
        )}
        {activeTab === 1 && (
          <>
            <CompetitorForm onSuccess={() => setCompetitorRefresh((n) => n + 1)} />
            <CompetitorChart refreshTrigger={competitorRefresh} />
          </>
        )}
      </main>
    </div>
  );
}
