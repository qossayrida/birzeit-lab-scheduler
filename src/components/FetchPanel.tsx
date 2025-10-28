import { Upload } from 'lucide-react';
import { useStore } from '../store/useStore';
import { isDataStale } from '../lib/storage';
import { formatDate } from '../lib/dates';

export function FetchPanel() {
  const { lastFetch, labs, isFetching, uploadHTML } = useStore();
  const isStale = isDataStale(lastFetch);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadHTML(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Labs Data</h2>

      {lastFetch && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            isStale
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-green-50 border border-green-200'
          }`}
        >
          <p className="text-sm">
            <span className="font-medium">Last upload:</span>{' '}
            {formatDate(lastFetch)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Labs found:</span> {labs.length}
          </p>
          {isStale && (
            <p className="text-sm text-yellow-700 mt-1">
              Data is older than 7 days. Upload a newer HTML file when
              available.
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload HTML File
        </label>
        <label className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg px-4 py-8 cursor-pointer transition-colors">
          <Upload className="w-5 h-5 text-gray-400" />
          <span className="text-gray-600">
            {isFetching ? 'Uploading...' : 'Click to upload the saved HTML file'}
          </span>
          <input
            type="file"
            accept=".html,.htm"
            onChange={handleFileUpload}
            disabled={isFetching}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Save the Ritaj course list page as an HTML file, then upload it here.
        </p>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">How it works</h3>
        <ul className="text-xs text-blue-800 space-y-1 list-disc pl-4">
          <li>Open the Ritaj course list in your browser.</li>
          <li>Save the page locally as an HTML file.</li>
          <li>Upload the file to extract ENCS lab information.</li>
        </ul>
      </div>
    </div>
  );
}
