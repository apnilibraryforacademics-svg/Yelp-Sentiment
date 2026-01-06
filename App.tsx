import React, { useState, useCallback } from 'react';
import { Upload, Play, RefreshCw, FileText, BarChart2 } from 'lucide-react';
import { DEFAULT_STRATEGIES, SAMPLE_DATA } from './constants';
import { PromptStrategy, ReviewData, RowResult, ProcessingStatus } from './types';
import { parseCSV } from './utils';
import { geminiService } from './services/geminiService';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [dataset, setDataset] = useState<ReviewData[]>([]);
  const [strategies] = useState<PromptStrategy[]>(DEFAULT_STRATEGIES);
  const [results, setResults] = useState<RowResult[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = parseCSV(text);
      setDataset(parsed.slice(0, 200)); // Cap at 200 for demo efficiency
      setResults([]);
      setStatus('idle');
    };
    reader.readAsText(file);
  };

  const loadSampleData = () => {
    setDataset(SAMPLE_DATA);
    setResults([]);
    setStatus('idle');
  };

  const runEvaluation = useCallback(async () => {
    if (dataset.length === 0) return;
    setStatus('running');
    setProgress(0);

    // Initialize empty results
    const initialResults: RowResult[] = dataset.map(review => ({
      review,
      results: {}
    }));
    setResults(initialResults);

    let processedCount = 0;
    const totalOps = dataset.length * strategies.length;

    // Process sequentially to avoid rate limits on preview models
    // In a real prod app, we would use a queue with concurrency control
    
    // We will process row by row
    for (let i = 0; i < dataset.length; i++) {
        const row = dataset[i];
        const newRowResults = { ...initialResults[i].results };

        for (const strategy of strategies) {
            const result = await geminiService.analyzeReview(row.text, strategy.template);
            newRowResults[strategy.id] = result;
            
            processedCount++;
            setProgress((processedCount / totalOps) * 100);

            // Update state incrementally so user sees progress
            setResults(prev => {
                const next = [...prev];
                next[i] = { ...next[i], results: newRowResults };
                return next;
            });
            
            // Small delay to be nice to the rate limiter if needed
            await new Promise(r => setTimeout(r, 200)); 
        }
    }

    setStatus('completed');
  }, [dataset, strategies]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">Y</div>
               <h1 className="text-xl font-bold text-gray-900 tracking-tight">Yelp Sentiment Auditor</h1>
            </div>
            
            <div className="flex items-center gap-4">
               {status === 'running' && (
                 <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                    <RefreshCw className="animate-spin" size={16} />
                    Processing... {Math.round(progress)}%
                 </div>
               )}
               <div className="text-xs text-gray-500 hidden sm:block">
                 Powered by Gemini 1.5
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">1. Select Dataset</h2>
                    <p className="text-sm text-gray-500 mt-1">Upload a CSV or use the sample subset.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={loadSampleData}
                        disabled={status === 'running'}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <FileText size={16} /> Load Sample (12 Rows)
                    </button>
                    <label className={`px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${status === 'running' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Upload size={16} /> 
                        Upload CSV
                        <input type="file" accept=".csv" onChange={handleFileUpload} disabled={status === 'running'} className="hidden" />
                    </label>
                </div>
            </div>

            {dataset.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div>
                        <h2 className="text-lg font-semibold text-gray-900">2. Run Evaluation</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Analyze <span className="font-bold text-gray-900">{dataset.length} reviews</span> using 3 different prompt strategies.
                        </p>
                    </div>
                    <button
                        onClick={runEvaluation}
                        disabled={status === 'running'}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-sm shadow-blue-200 transition-all flex items-center gap-2"
                    >
                        {status === 'running' ? 'Running...' : 'Start Analysis'} <Play size={16} />
                    </button>
                </div>
            )}
        </div>

        {/* Visualization & Results */}
        {dataset.length > 0 ? (
            <Dashboard 
                rows={results.length > 0 ? results : dataset.map(r => ({ review: r, results: {} }))} 
                strategies={strategies}
                isProcessing={status === 'running'}
                progress={progress}
            />
        ) : (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
                <BarChart2 className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-gray-500 font-medium">No data loaded</h3>
                <p className="text-gray-400 text-sm mt-1">Load sample data to see the app in action.</p>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;
