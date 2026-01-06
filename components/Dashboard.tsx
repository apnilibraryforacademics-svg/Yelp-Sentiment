import React, { useMemo } from 'react';
import { RowResult, PromptStrategy, AggregateMetrics } from '../types';
import { calculateMetrics } from '../utils';
import StrategyCard from './StrategyCard';
import ResultsTable from './ResultsTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  rows: RowResult[];
  strategies: PromptStrategy[];
  isProcessing: boolean;
  progress: number;
}

const Dashboard: React.FC<Props> = ({ rows, strategies, isProcessing, progress }) => {
  const metrics = useMemo(() => {
    const m: Record<string, AggregateMetrics> = {};
    strategies.forEach(s => {
      m[s.id] = calculateMetrics(rows, s.id);
    });
    return m;
  }, [rows, strategies]);

  const chartData = strategies.map(s => ({
    name: s.name,
    Accuracy: metrics[s.id].accuracy,
    Validity: metrics[s.id].validityRate,
  }));

  const hasData = rows.some(r => Object.keys(r.results).length > 0);

  return (
    <div className="space-y-8">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {strategies.map(s => (
          <StrategyCard key={s.id} strategy={s} metrics={hasData ? metrics[s.id] : undefined} />
        ))}
      </div>

      {/* Analytics Section */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Comparison</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Accuracy" fill="#3b82f6" name="Accuracy %" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Validity" fill="#10b981" name="JSON Validity %" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                    <p><strong>Accuracy:</strong> Exact match between predicted and actual stars.</p>
                    <p><strong>Validity:</strong> Percentage of responses that parsed correctly as JSON.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                 <h3 className="text-lg font-bold text-gray-800 mb-4">Discussion & Trade-offs</h3>
                 <div className="space-y-3 text-sm text-gray-600">
                    <p>
                        <span className="font-semibold text-blue-600">Zero-Shot:</span> Usually fastest but may miss nuances or hallucinate output formats if strict JSON isn't enforced.
                    </p>
                    <p>
                        <span className="font-semibold text-purple-600">Few-Shot:</span> Providing examples significantly stabilizes output format and aligns the model's calibration with the dataset's ground truth.
                    </p>
                    <p>
                        <span className="font-semibold text-green-600">Chain-of-Thought:</span> Forcing an explanation <em>before</em> the rating (or as part of the object) typically improves accuracy on ambiguous reviews by forcing the model to "think" first.
                    </p>
                 </div>
            </div>
        </div>
      )}

      {/* Raw Data Table */}
      {rows.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed Results ({rows.length} rows)</h3>
          <ResultsTable rows={rows} strategies={strategies} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
