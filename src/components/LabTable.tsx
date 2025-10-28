import { useState } from 'react';
import { Edit2, Lock, Unlock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Lab, Day, SlotTime } from '../types';
import { getAllDays, getAllTimes } from '../lib/dates';

export function LabTable() {
  const { labs, updateLab } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Lab>>({});

  const handleEdit = (lab: Lab) => {
    setEditingId(lab.id);
    setEditData({
      feasibleDays: lab.feasibleDays,
      feasibleTimes: lab.feasibleTimes,
      lockedDay: lab.lockedDay,
      lockedTime: lab.lockedTime
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateLab(editingId, editData);
      setEditingId(null);
      setEditData({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const toggleDay = (day: Day) => {
    setEditData(prev => ({
      ...prev,
      feasibleDays: prev.feasibleDays?.includes(day)
        ? prev.feasibleDays.filter(d => d !== day)
        : [...(prev.feasibleDays || []), day]
    }));
  };

  const toggleTime = (time: SlotTime) => {
    setEditData(prev => ({
      ...prev,
      feasibleTimes: prev.feasibleTimes?.includes(time)
        ? prev.feasibleTimes.filter(t => t !== time)
        : [...(prev.feasibleTimes || []), time]
    }));
  };

  const setLock = (day?: Day, time?: SlotTime) => {
    setEditData(prev => ({
      ...prev,
      lockedDay: day,
      lockedTime: time
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Labs</h2>

      {labs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No labs loaded. Fetch data from Ritaj or upload HTML file.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Section</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Instructor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Feasible Days</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Feasible Times</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Locked</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {labs.map(lab => (
                <tr key={lab.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{lab.code}</td>
                  <td className="py-3 px-4">{lab.title}</td>
                  <td className="py-3 px-4">{lab.section}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{lab.instructorName || '-'}</td>
                  <td className="py-3 px-4">
                    {editingId === lab.id ? (
                      <div className="flex flex-wrap gap-1">
                        {getAllDays().map(day => (
                          <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`px-2 py-1 text-xs rounded ${
                              editData.feasibleDays?.includes(day)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm">
                        {lab.feasibleDays.length > 0 ? lab.feasibleDays.join(', ') : 'All'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === lab.id ? (
                      <div className="flex flex-wrap gap-1">
                        {getAllTimes().map(time => (
                          <button
                            key={time}
                            onClick={() => toggleTime(time)}
                            className={`px-2 py-1 text-xs rounded ${
                              editData.feasibleTimes?.includes(time)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {time}:00
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm">
                        {lab.feasibleTimes.length > 0 
                          ? lab.feasibleTimes.map(t => `${t}:00`).join(', ') 
                          : 'All'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === lab.id ? (
                      <div className="space-y-1">
                        <select
                          value={editData.lockedDay || ''}
                          onChange={(e) => setLock(e.target.value as Day || undefined, editData.lockedTime)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="">No lock</option>
                          {getAllDays().map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                        {editData.lockedDay && (
                          <select
                            value={editData.lockedTime || ''}
                            onChange={(e) => setLock(editData.lockedDay, e.target.value ? parseInt(e.target.value) as SlotTime : undefined)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Select time</option>
                            {getAllTimes().map(time => (
                              <option key={time} value={time}>{time}:00</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm">
                        {lab.lockedDay && lab.lockedTime ? (
                          <span className="flex items-center space-x-1 text-orange-600">
                            <Lock className="w-3 h-3" />
                            <span>{lab.lockedDay} {lab.lockedTime}:00</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-gray-400">
                            <Unlock className="w-3 h-3" />
                            <span>-</span>
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === lab.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(lab)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
