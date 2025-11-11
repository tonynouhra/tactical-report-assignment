'use client';

import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { ActivityType } from '@/lib/utils/activityTracker';

const ActivityItem = ({ activity, showLink = true }) => {
  // Get icon based on activity type
  const getIcon = () => {
    switch (activity.type) {
      case ActivityType.CREATE:
        return <FiPlus className="w-5 h-5" />;
      case ActivityType.UPDATE:
        return <FiEdit2 className="w-5 h-5" />;
      case ActivityType.DELETE:
        return <FiTrash2 className="w-5 h-5" />;
      default:
        return <FiClock className="w-5 h-5" />;
    }
  };

  // Get color classes based on activity type
  const getColorClasses = () => {
    switch (activity.type) {
      case ActivityType.CREATE:
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          icon: 'bg-green-500',
        };
      case ActivityType.UPDATE:
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-300',
          icon: 'bg-blue-500',
        };
      case ActivityType.DELETE:
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-300',
          icon: 'bg-red-500',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-300',
          icon: 'bg-gray-500',
        };
    }
  };

  // Format timestamp to relative time
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffInMs = now - activityDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return activityDate.toLocaleDateString();
  };

  const getActionText = () => {
    switch (activity.type) {
      case ActivityType.CREATE:
        return 'created';
      case ActivityType.UPDATE:
        return 'updated';
      case ActivityType.DELETE:
        return 'deleted';
      default:
        return 'modified';
    }
  };

  const colors = getColorClasses();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.icon} flex items-center justify-center text-white`}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {/* Action Badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
            {activity.type}
          </span>

          {/* Timestamp */}
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            {formatTimestamp(activity.timestamp)}
          </span>
        </div>

        {/* Activity Description */}
        <p className="text-sm text-gray-700 mb-1">
          <span className="font-medium text-gray-900">{activity.user}</span>
          {' '}{getActionText()}{' '}
          {showLink && activity.type !== ActivityType.DELETE ? (
            <Link
              href={`/items/${activity.itemId}`}
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              {activity.itemName}
            </Link>
          ) : (
            <span className="font-semibold text-gray-900">{activity.itemName}</span>
          )}
        </p>

        {/* Details */}
        {activity.details?.description && (
          <p className="text-xs text-gray-500 mt-1">
            {activity.details.description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ActivityItem;