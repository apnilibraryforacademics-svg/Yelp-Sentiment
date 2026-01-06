import React from 'react';
import { PromptStrategy } from '../types';

interface Props {
  strategy: PromptStrategy;
  metrics?: { accuracy: number; mae: number; validityRate: number };
}

const StrategyCard: React.FC<Props> = ({ strategy, metrics }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-100" style={{ borderTop: `4px solid ${strategy.color}` }}>
        <h3 className="font-bold text-lg text-gray-800">{strategy.name}</h3>
        <p className="text-xs text-gray-500 mt-1">{strategy.description}</p>
      </div>
      
      <div className="p-4 flex-grow bg-gray-50">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Prompt Template</h4>
        <div className="text-xs text-gray-600 font-mono bg-white p-2 border rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
          {strategy.template}
        </div>
      </div>

      {metrics && (
        <div className="p-4 bg-white border-t border-gray-100 grid grid-cols-3 gap-2">
            <div className="text-center">
                <div className="text-xs text-gray-400">Accuracy</div>
                <div className="font-bold text-gray-800">{metrics.accuracy.toFixed(1)}%</div>
            </div>
            <div className="text-center">
                <div className="text-xs text-gray-400">Valid JSON</div>
                <div className="font-bold text-gray-800">{metrics.validityRate.toFixed(1)}%</div>
            </div>
             <div className="text-center">
                <div className="text-xs text-gray-400">MAE</div>
                <div className="font-bold text-gray-800">{metrics.mae.toFixed(2)}</div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StrategyCard;
