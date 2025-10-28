import { useState } from 'react';
import { Download, Upload, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { isDataStale } from '../lib/storage';
import { formatDate } from '../lib/dates';

export function FetchPanel() {
  const { 
    sourceUrl, 
    lastFetch,
    labs,
    isFetching,
    setSourceUrl, 
    fetchAndParseLabs, 
    uploadHTML 
  } = useStore();
  
  const [url, setUrl] = useState(sourceUrl);
  const isStale = isDataStale(lastFetch);

  const handleFetch = async () => {
    setSourceUrl(url);
    await fetchAndParseLabs(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadHTML(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Fetch Labs Data</h2>
      
      {/* Status */}
      {lastFetch && (
        <div className={`mb-4 p-3 rounded-lg ${
          isStale ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
        }`}>
          <p className="text-sm">
            <span className="font-medium">Last fetch:</span> {formatDate(lastFetch)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Labs found:</span> {labs.length}
          </p>
          {isStale && (
            <p className="text-sm text-yellow-700 mt-1">
              ⚠️ Data is older than 7 days. Consider refreshing.
            </p>
          )}
        </div>
      )}

      {/* URL Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ritaj Course List URL
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://ritaj.birzeit.edu/hemis/bu-courses-list?..."
        />
      </div>

      {/* Fetch Button */}
      <button
        onClick={handleFetch}
        disabled={isFetching || !url}
        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors mb-4"
      >
        {isFetching ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Fetching...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Fetch & Parse Labs</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload HTML File
        </label>
        <label className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg px-4 py-8 cursor-pointer transition-colors">
          <Upload className="w-5 h-5 text-gray-400" />
          <span className="text-gray-600">Click to upload HTML file</span>
          <input
            type="file"
            accept=".html,.htm"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Upload the saved HTML page from Ritaj course list
        </p>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">ℹ️ How it works</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Fetches course data from Ritaj</li>
          <li>• Extracts labs with code ENCS_1[0-5]</li>
          <li>• Caches data for offline use</li>
          <li>• Upload HTML if fetch fails (CORS)</li>
        </ul>
      </div>
    </div>
  );
}
