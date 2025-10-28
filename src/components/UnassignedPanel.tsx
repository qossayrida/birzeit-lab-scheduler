import { AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export function UnassignedPanel() {
  const { unassignedLabs } = useStore();

  if (unassignedLabs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
      <div className="flex items-center space-x-2 mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <h2 className="text-xl font-bold text-red-600">Unassigned Labs</h2>
      </div>

      <p className="text-gray-700 mb-4">
        The following labs could not be assigned. Review the reasons and adjust constraints or add more TAs.
      </p>

      <div className="space-y-3">
        {unassignedLabs.map(({ lab, reason }) => (
          <div key={lab.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {lab.code} - {lab.title}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Section: {lab.section}
                </div>
                <div className="mt-2 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{reason}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Suggestions</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Add more TAs or increase maxLabs for existing TAs</li>
          <li>• Adjust lab feasible days/times to be more flexible</li>
          <li>• Check for conflicts with locked assignments</li>
          <li>• Review TA preferences to ensure coverage</li>
        </ul>
      </div>
    </div>
  );
}
