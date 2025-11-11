'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiTrash2, FiDownload } from 'react-icons/fi';
import Swal from 'sweetalert2';
import ActivityList from '@/components/activity/ActivityList';
import ActivityFilters from '@/components/activity/ActivityFilters';
import { getActivities, filterActivities, clearActivities } from '@/lib/utils/activityTracker';

const ITEMS_PER_PAGE = 20;

export default function ActivityLogPage() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({});

  // Load activities on mount
  useEffect(() => {
    loadActivities();

    // Listen for activity changes
    const handleActivityAdded = () => {
      loadActivities();
    };

    const handleActivitiesCleared = () => {
      setActivities([]);
      setFilteredActivities([]);
    };

    window.addEventListener('activity-added', handleActivityAdded);
    window.addEventListener('activities-cleared', handleActivitiesCleared);

    return () => {
      window.removeEventListener('activity-added', handleActivityAdded);
      window.removeEventListener('activities-cleared', handleActivitiesCleared);
    };
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [activities, appliedFilters]);

  const loadActivities = () => {
    const allActivities = getActivities();
    setActivities(allActivities);
  };

  const applyFilters = () => {
    const filtered = filterActivities(appliedFilters);
    setFilteredActivities(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFilterChange = (filters) => {
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setAppliedFilters({});
  };

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all activities
  const handleClearAllActivities = async () => {
    const result = await Swal.fire({
      title: 'Clear All Activities?',
      text: 'This action cannot be undone. All activity history will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, clear all',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      clearActivities();
      Swal.fire(
        'Cleared!',
        'All activities have been cleared.',
        'success'
      );
    }
  };

  // Export activities to JSON
  const handleExportActivities = () => {
    const dataStr = JSON.stringify(filteredActivities, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `activities_export_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    Swal.fire({
      title: 'Export Successful',
      text: `${filteredActivities.length} activities exported to JSON`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <FiClock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
                <p className="text-gray-600 mt-1">
                  Track all your inventory actions and changes
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {filteredActivities.length > 0 && (
                <button
                  onClick={handleExportActivities}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                  Export
                </button>
              )}
              {activities.length > 0 && (
                <button
                  onClick={handleClearAllActivities}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <p className="text-sm text-gray-600 mb-1">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <p className="text-sm text-gray-600 mb-1">Filtered Results</p>
              <p className="text-2xl font-bold text-gray-900">{filteredActivities.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <p className="text-sm text-gray-600 mb-1">Current Page</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentPage} / {totalPages || 1}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Filters */}
        <ActivityFilters
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Activity List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
        >
          <ActivityList
            activities={paginatedActivities}
            showPagination={true}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </motion.div>
      </div>
    </div>
  );
}