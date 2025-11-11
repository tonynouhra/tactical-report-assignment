'use client';

import { useState, useEffect } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { getRecentActivities } from '@/lib/utils/activityTracker';

export default function BottomActivityPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Load initial activities
    loadActivities();

    // Listen for new activities
    const handleNewActivity = () => {
      loadActivities();
    };

    window.addEventListener('activity-added', handleNewActivity);
    return () => window.removeEventListener('activity-added', handleNewActivity);
  }, []);

  const loadActivities = () => {
    setActivities(getRecentActivities(10));
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (activities.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg lg:left-64">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sm">Recent Activity</span>
          <span className="text-xs text-gray-500">({activities.length})</span>
        </div>
        {isExpanded ? <FiChevronDown size={20} /> : <FiChevronUp size={20} />}
      </button>

      {/* Activity List */}
      {isExpanded && (
        <div className="max-h-48 overflow-y-auto p-4 space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center space-x-3 text-sm p-2 rounded-lg hover:bg-gray-50"
            >
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getActivityColor(activity.type)}`}>
                {activity.type}
              </span>
              <span className="flex-1 truncate">{activity.itemName}</span>
              <span className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}