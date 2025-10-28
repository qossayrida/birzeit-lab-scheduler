import { useStore } from '../store/useStore';

export function UnassignedPanel() {
  const { unassignedLabs } = useStore();

  if (unassignedLabs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Unassigned Labs</h2>

      <div className="space-y-3">
        {unassignedLabs.map(({ lab, reason }) => (
          <div
            key={lab.id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="font-medium text-gray-900">
              {lab.code} - {lab.title}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Section: {lab.section}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Feasible slots:{' '}
              <span className="font-medium text-gray-700">
                {lab.feasibleDays.join(', ')} @{' '}
                {lab.feasibleTimes.map((time) => `${time}:00`).join(', ')}
              </span>
            </div>
            <div className="mt-3 text-sm text-red-600">{reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
