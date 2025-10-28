import { useStore } from '../store/useStore';
import { Lock, Unlock } from 'lucide-react';

export function TAView() {
  const { assignments, labs, tas, lockAssignment } = useStore();

  const labMap = new Map(labs.map(lab => [lab.id, lab]));

  // Group assignments by TA
  const assignmentsByTA = new Map<string, typeof assignments>();
  for (const assignment of assignments) {
    const existing = assignmentsByTA.get(assignment.taId) || [];
    existing.push(assignment);
    assignmentsByTA.set(assignment.taId, existing);
  }

  // Sort assignments by day and time
  const sortAssignments = (assignments: typeof assignments) => {
    const dayOrder = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return [...assignments].sort((a, b) => {
      const dayDiff = dayOrder[a.day] - dayOrder[b.day];
      if (dayDiff !== 0) return dayDiff;
      return a.time - b.time;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">TA Assignments</h2>

      {tas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No TAs added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tas.map(ta => {
            const taAssignments = sortAssignments(assignmentsByTA.get(ta.id) || []);
            const utilization = ta.maxLabs > 0 
              ? Math.round((taAssignments.length / ta.maxLabs) * 100) 
              : 0;

            return (
              <div key={ta.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="mb-3">
                  <h3 className="font-bold text-gray-800">{ta.name}</h3>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {taAssignments.length} / {ta.maxLabs} labs
                    </span>
                    <span className={`font-medium ${
                      utilization >= 100 ? 'text-red-600' :
                      utilization >= 80 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {utilization}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        utilization >= 100 ? 'bg-red-600' :
                        utilization >= 80 ? 'bg-orange-600' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {taAssignments.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No assignments
                  </div>
                ) : (
                  <div className="space-y-2">
                    {taAssignments.map(assignment => {
                      const lab = labMap.get(assignment.labId);
                      
                      return (
                        <div
                          key={assignment.labId}
                          className={`p-2 rounded text-sm ${
                            assignment.locked 
                              ? 'bg-orange-50 border border-orange-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 truncate">
                                {lab?.code || 'Unknown'}
                              </div>
                              <div className="text-xs text-gray-600">
                                {assignment.day} {assignment.time}:00
                              </div>
                            </div>
                            <button
                              onClick={() => lockAssignment(assignment.labId, !assignment.locked)}
                              className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                              title={assignment.locked ? 'Unlock' : 'Lock'}
                            >
                              {assignment.locked ? (
                                <Lock className="w-4 h-4 text-orange-600" />
                              ) : (
                                <Unlock className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
