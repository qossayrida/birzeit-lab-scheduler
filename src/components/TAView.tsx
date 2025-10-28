import { Lock, Unlock } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Assignment, Day } from '../types';
import { formatTime } from '../lib/dates';

const DAY_ORDER: Record<Day, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};

export function TAView() {
  const { assignments, labs, tas, lockAssignment } = useStore();

  const labMap = new Map(labs.map((lab) => [lab.id, lab]));

  const assignmentsByTA = new Map<string, typeof assignments>();
  for (const assignment of assignments) {
    const list = assignmentsByTA.get(assignment.taId) || [];
    list.push(assignment);
    assignmentsByTA.set(assignment.taId, list);
  }

  const sortAssignments = (items: Assignment[]) =>
    [...items].sort((a, b) => {
      const dayDiff = (DAY_ORDER[a.day] ?? 0) - (DAY_ORDER[b.day] ?? 0);
      if (dayDiff !== 0) {
        return dayDiff;
      }
      return a.time - b.time;
    });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">TA Assignments</h2>

      {tas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No TAs added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tas.map((ta) => {
            const taAssignments = sortAssignments(assignmentsByTA.get(ta.id) || []);
            const utilization =
              ta.maxLabs > 0
                ? Math.round((taAssignments.length / ta.maxLabs) * 100)
                : 0;

            const assignmentsByDay = new Map<Day, Assignment[]>();
            taAssignments.forEach((assignment) => {
              const list = assignmentsByDay.get(assignment.day) || [];
              list.push(assignment);
              assignmentsByDay.set(assignment.day, list);
            });
            const orderedDays = Array.from(assignmentsByDay.keys()).sort(
              (a, b) => (DAY_ORDER[a] ?? 0) - (DAY_ORDER[b] ?? 0)
            );

            return (
              <div
                key={ta.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="mb-3">
                  <h3 className="font-bold text-gray-800">{ta.name}</h3>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {taAssignments.length} / {ta.maxLabs} labs
                    </span>
                    <span
                      className={`font-medium ${
                        utilization >= 100
                          ? 'text-red-600'
                          : utilization >= 80
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}
                    >
                      {utilization}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        utilization >= 100
                          ? 'bg-red-600'
                          : utilization >= 80
                          ? 'bg-orange-600'
                          : 'bg-green-600'
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
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Assigned Labs
                      </h4>
                      <div className="space-y-2">
                        {taAssignments.map((assignment) => {
                          const lab = labMap.get(assignment.labId);
                          const labLabel = lab
                            ? `${lab.code}${lab.section ? ` (${lab.section})` : ''}`
                            : 'Unknown';

                          return (
                            <div
                              key={assignment.labId}
                              className={`p-3 rounded border ${
                                assignment.locked
                                  ? 'bg-orange-50 border-orange-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-800 truncate">
                                    {labLabel}
                                  </div>
                                  {lab?.title && (
                                    <div className="text-xs text-gray-600 truncate">
                                      {lab.title}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500 mt-1">
                                    {assignment.day} {formatTime(assignment.time)}
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    lockAssignment(assignment.labId, !assignment.locked)
                                  }
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
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Weekly Schedule
                      </h4>
                      <div className="space-y-2">
                        {orderedDays.map((day) => (
                          <div
                            key={day}
                            className="flex items-start gap-3 text-xs text-gray-700"
                          >
                            <span className="w-12 uppercase text-gray-500 font-medium">
                              {day}
                            </span>
                            <div className="flex-1 flex flex-wrap gap-2">
                              {assignmentsByDay.get(day)?.map((assignment) => {
                                const lab = labMap.get(assignment.labId);
                                const label = lab
                                  ? `${lab.code}${lab.section ? ` (${lab.section})` : ''}`
                                  : 'Unknown';
                                return (
                                  <span
                                    key={assignment.labId}
                                    className="inline-flex items-center px-2 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full"
                                  >
                                    {formatTime(assignment.time)} - {label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
