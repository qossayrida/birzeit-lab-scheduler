import { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { TA, Day, SlotTime } from '../types';
import { getAllDays, getAllTimes } from '../lib/dates';

export function TAFormList() {
  const { tas, addTA, updateTA, removeTA } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<TA, 'id'>>({
    name: '',
    preferredDays: [],
    preferredTimes: [],
    maxLabs: 3,
    seed: undefined
  });

  const resetForm = () => {
    setFormData({
      name: '',
      preferredDays: [],
      preferredTimes: [],
      maxLabs: 3,
      seed: undefined
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    if (editingId) {
      updateTA(editingId, formData);
    } else {
      addTA(formData);
    }
    
    resetForm();
  };

  const handleEdit = (ta: TA) => {
    setFormData({
      name: ta.name,
      preferredDays: ta.preferredDays,
      preferredTimes: ta.preferredTimes,
      maxLabs: ta.maxLabs,
      seed: ta.seed
    });
    setEditingId(ta.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this TA?')) {
      removeTA(id);
    }
  };

  const toggleDay = (day: Day) => {
    setFormData(prev => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter(d => d !== day)
        : [...prev.preferredDays, day]
    }));
  };

  const toggleTime = (time: SlotTime) => {
    setFormData(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes.includes(time)
        ? prev.preferredTimes.filter(t => t !== time)
        : [...prev.preferredTimes, time]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Teaching Assistants</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add TA</span>
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-4">
            {editingId ? 'Edit TA' : 'Add New TA'}
          </h3>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter TA name"
              required
            />
          </div>

          {/* Max Labs */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Labs
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={formData.maxLabs}
              onChange={(e) => setFormData({ ...formData, maxLabs: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preferred Days */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Days
            </label>
            <div className="flex flex-wrap gap-2">
              {getAllDays().map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    formData.preferredDays.includes(day)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Times */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Times
            </label>
            <div className="flex flex-wrap gap-2">
              {getAllTimes().map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => toggleTime(time)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    formData.preferredTimes.includes(time)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {time}:00
                </button>
              ))}
            </div>
          </div>

          {/* Seed (Optional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seed (Optional)
            </label>
            <input
              type="number"
              value={formData.seed || ''}
              onChange={(e) => setFormData({ ...formData, seed: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Leave empty to use global seed"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{editingId ? 'Update' : 'Add'}</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      )}

      {/* TA List */}
      <div className="space-y-3">
        {tas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No TAs added yet. Click "Add TA" to get started.</p>
          </div>
        ) : (
          tas.map(ta => (
            <div key={ta.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{ta.name}</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Max Labs:</span> {ta.maxLabs}
                    </p>
                    {ta.preferredDays.length > 0 && (
                      <p>
                        <span className="font-medium">Preferred Days:</span>{' '}
                        {ta.preferredDays.join(', ')}
                      </p>
                    )}
                    {ta.preferredTimes.length > 0 && (
                      <p>
                        <span className="font-medium">Preferred Times:</span>{' '}
                        {ta.preferredTimes.map(t => `${t}:00`).join(', ')}
                      </p>
                    )}
                    {ta.seed && (
                      <p>
                        <span className="font-medium">Seed:</span> {ta.seed}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(ta)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ta.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
