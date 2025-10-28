import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Calendar, Download, Upload, Trash2, Play } from 'lucide-react';
import { useStore } from '../store/useStore';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { 
    globalSeed, 
    randomizeGlobalSeed, 
    runScheduler, 
    exportData, 
    importData,
    clearAll,
    isScheduling,
    error 
  } = useStore();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearInput, setClearInput] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-schedule-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Schedule exported successfully', 'success');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          importData(text);
          showToast('Schedule imported successfully', 'success');
        } catch (error) {
          showToast('Failed to import schedule', 'error');
        }
      }
    };
    input.click();
  };

  const handleClearAll = async () => {
    if (clearInput === 'CLEAR') {
      await clearAll();
      setShowClearConfirm(false);
      setClearInput('');
      showToast('All data cleared', 'success');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Birzeit Lab Scheduler</h1>
                <p className="text-blue-100 text-sm">TA Lab Scheduling System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-blue-100">Seed:</span>
                <span className="ml-2 font-mono bg-blue-800 px-2 py-1 rounded">
                  {globalSeed}
                </span>
                <button
                  onClick={randomizeGlobalSeed}
                  className="ml-2 text-blue-100 hover:text-white"
                  title="Randomize seed"
                >
                  🎲
                </button>
              </div>
              
              <button
                onClick={runScheduler}
                disabled={isScheduling}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>{isScheduling ? 'Scheduling...' : 'Run Scheduler'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={handleImport}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-red-600 mb-4">Clear All Data?</h3>
            <p className="text-gray-700 mb-4">
              This will permanently delete all labs, TAs, assignments, and cached data. 
              This action cannot be undone.
            </p>
            <p className="text-gray-700 mb-4">
              Type <strong>CLEAR</strong> to confirm:
            </p>
            <input
              type="text"
              value={clearInput}
              onChange={(e) => setClearInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              placeholder="Type CLEAR"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleClearAll}
                disabled={clearInput !== 'CLEAR'}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium"
              >
                Clear All Data
              </button>
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  setClearInput('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
