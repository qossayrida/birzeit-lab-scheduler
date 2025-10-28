import { useStore } from '../store/useStore';
import { getAllDays, getAllTimes } from '../lib/dates';
import { Lock } from 'lucide-react';

export function ScheduleGrid() {
  const { assignments, labs, tas } = useStore();

  const labMap = new Map(labs.map(lab => [lab.id, lab]));
  const taMap = new Map(tas.map(ta => [ta.id, ta]));

  // Create a map of assignments by day and time
  const scheduleMap = new Map<string, typeof assignments>();
  
  for (const assignment of assignments) {
    const key = `${assignment.day}_${assignment.time}`;
    const existing = scheduleMap.get(key) || [];
    existing.push(assignment);
    scheduleMap.set(key, existing);
  }

  const days = getAllDays().filter(day => 
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].includes(day)
  );
  const times = getAllTimes();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Schedule Grid</h2>

      {assignments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No schedule generated yet. Add TAs and run the scheduler.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-100 p-3 text-left font-medium text-gray-700 w-24">
                  Time
                </th>
                {days.map(day => (
                  <th key={day} className="border border-gray-300 bg-gray-100 p-3 text-center font-medium text-gray-700">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map(time => (
                <tr key={time}>
                  <td className="border border-gray-300 bg-gray-50 p-3 font-medium text-gray-700">
                    {time}:00
                  </td>
                  {days.map(day => {
                    const key = `${day}_${time}`;
                    const cellAssignments = scheduleMap.get(key) || [];
                    
                    return (
                      <td key={day} className="border border-gray-300 p-2 align-top">
                        {cellAssignments.length === 0 ? (
                          <div className="text-gray-400 text-sm text-center py-2">-</div>
                        ) : (
                          <div className="space-y-2">
                            {cellAssignments.map(assignment => {
                              const lab = labMap.get(assignment.labId);
                              const ta = taMap.get(assignment.taId);
                              
                              return (
                                <div
                                  key={assignment.labId}
                                  className={`p-2 rounded text-sm ${
                                    assignment.locked 
                                      ? 'bg-orange-100 border border-orange-300' 
                                      : 'bg-blue-100 border border-blue-300'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-800 truncate">
                                        {lab?.code || 'Unknown'}
                                      </div>
                                      <div className="text-xs text-gray-600 truncate">
                                        {lab?.section}
                                      </div>
                                      <div className="text-xs text-blue-700 font-medium mt-1 truncate">
                                        {ta?.name || 'Unknown TA'}
                                      </div>
                                    </div>
                                    {assignment.locked && (
                                      <Lock className="w-3 h-3 text-orange-600 flex-shrink-0 ml-1" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
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
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span className="text-gray-600">Assigned</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
          <span className="text-gray-600">Locked</span>
        </div>
      </div>
    </div>
  );
}
