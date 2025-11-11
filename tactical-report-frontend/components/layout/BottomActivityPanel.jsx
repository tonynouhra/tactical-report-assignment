'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronUp, FiChevronDown, FiActivity, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { getRecentActivities, ActivityType } from '@/lib/utils/activityTracker';

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

    const handleActivitiesCleared = () => {
      setActivities([]);
    };

    window.addEventListener('activity-added', handleNewActivity);
    window.addEventListener('activities-cleared', handleActivitiesCleared);

    return () => {
      window.removeEventListener('activity-added', handleNewActivity);
      window.removeEventListener('activities-cleared', handleActivitiesCleared);
    };
  }, []);

  const loadActivities = () => {
    setActivities(getRecentActivities(10));
  };

  const getIcon = (type) => {
    switch (type) {
      case ActivityType.CREATE:
        return <FiPlus className="w-4 h-4" />;
      case ActivityType.UPDATE:
        return <FiEdit2 className="w-4 h-4" />;
      case ActivityType.DELETE:
        return <FiTrash2 className="w-4 h-4" />;
      default:
        return <FiActivity className="w-4 h-4" />;
    }
  };

  const getColorClasses = (type) => {
    switch (type) {
      case ActivityType.CREATE:
        return 'bg-green-100 text-green-800 border-green-300';
      case ActivityType.UPDATE:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case ActivityType.DELETE:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffInMs = now - activityDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    return `${diffInDays}d ago`;
  };

  if (activities.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t-2 border-gray-200 shadow-lg lg:left-64"
      style={{
        height: isExpanded ? '250px' : '60px',
        transition: 'height 0.3s ease',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FiActivity className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {activities.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/activity-log"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            View All
          </Link>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isExpanded ? (
              <FiChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <FiChevronUp className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Activities List - Expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-y-auto h-[190px] px-6 py-3"
          >
            <div className="space-y-2">
              {activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getColorClasses(activity.type)} border flex items-center justify-center`}>
                    {getIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getColorClasses(activity.type)} border`}>
                        {activity.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 truncate">
                      <span className="font-medium">{activity.user}</span>
                      {' '}{activity.type.toLowerCase()}d{' '}
                      {activity.type !== ActivityType.DELETE ? (
                        <Link
                          href={`/items/${activity.itemId}`}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {activity.itemName}
                        </Link>
                      ) : (
                        <span className="font-semibold">{activity.itemName}</span>
                      )}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Preview */}
      {!isExpanded && activities.length > 0 && (
        <div className="px-6 py-2">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
            {activities.slice(0, 3).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-2 flex-shrink-0 px-3 py-1.5 bg-gray-50 rounded-md"
              >
                <div className={`w-6 h-6 rounded-full ${getColorClasses(activity.type)} flex items-center justify-center`}>
                  {getIcon(activity.type)}
                </div>
                <span className="text-xs text-gray-700">
                  <span className="font-medium">{activity.type}</span>
                  {' - '}
                  <span className="truncate max-w-[150px] inline-block align-bottom">
                    {activity.itemName}
                  </span>
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            ))}
            {activities.length > 3 && (
              <span className="text-xs text-gray-500 flex-shrink-0">
                +{activities.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}