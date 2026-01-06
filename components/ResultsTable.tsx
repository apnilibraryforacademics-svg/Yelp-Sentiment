import React from 'react';
import { RowResult, PromptStrategy } from '../types';
import { Star, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
  rows: RowResult[];
  strategies: PromptStrategy[];
}

const ResultsTable: React.FC<Props> = ({ rows, strategies }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500 w-64">Review Snippet</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500 w-16">Actual</th>
            {strategies.map(s => (
              <th key={s.id} className="px-4 py-3 text-left font-medium text-gray-500" style={{ borderBottom: `2px solid ${s.color}` }}>
                {s.name} Output
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((row) => (
            <tr key={row.review.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-700">
                <div className="line-clamp-3" title={row.review.text}>{row.review.text}</div>
              </td>
              <td className="px-4 py-3 text-center font-bold text-gray-800">
                <div className="flex items-center justify-center gap-1">
                    {row.review.actual_stars} <Star size={12} className="fill-yellow-400 text-yellow-400" />
                </div>
              </td>
              {strategies.map(s => {
                const res = row.results[s.id];
                if (!res) return <td key={s.id} className="px-4 py-3 text-gray-400 italic">Pending...</td>;
                
                const isMatch = res.predicted_stars === row.review.actual_stars;
                const isClose = Math.abs(res.predicted_stars - row.review.actual_stars) <= 1;
                
                return (
                  <td key={s.id} className="px-4 py-3 align-top">
                    {!res.is_valid_json ? (
                        <div className="text-red-500 flex items-center gap-1 text-xs">
                            <AlertCircle size={14} /> Invalid JSON
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`font-bold px-2 py-0.5 rounded text-xs ${isMatch ? 'bg-green-100 text-green-700' : isClose ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                    {res.predicted_stars} Stars
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-3" title={res.explanation}>
                                {res.explanation}
                            </p>
                        </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
