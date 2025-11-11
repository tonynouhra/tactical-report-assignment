'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiClock, FiTrash2, FiDownload } from 'react-icons/fi';
import Swal from 'sweetalert2';
import ActivityList from '@/components/activity/ActivityList';
import ActivityFilters from '@/components/activity/ActivityFilters';
import { getActivities, filterActivities, clearActivities } from '@/lib/utils/activityTracker';

const ITEMS_PER_PAGE = 3;

export default function ActivityDrawer({ isOpen, onClose }) {
  const [activities, setActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const allActivities = getActivities();
      setActivities(allActivities);
    }
  }, [isOpen, refreshKey]);

  useEffect(() => {
    const handleActivityAdded = () => {
      setRefreshKey(prev => prev + 1);
    };

    const handleActivitiesCleared = () => {
      setActivities([]);
    };

    window.addEventListener('activity-added', handleActivityAdded);
    window.addEventListener('activities-cleared', handleActivitiesCleared);

    return () => {
      window.removeEventListener('activity-added', handleActivityAdded);
      window.removeEventListener('activities-cleared', handleActivitiesCleared);
    };
  }, []);

  const filteredActivities = useMemo(() => {
    return filterActivities(appliedFilters);
  }, [appliedFilters, refreshKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  const handleFilterChange = (filters) => {
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setAppliedFilters({});
  };

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[600px] lg:w-[800px] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FiClock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
                    <p className="text-sm text-gray-600">Track all inventory actions</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Close drawer"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {filteredActivities.length > 0 && (
                  <button
                    onClick={handleExportActivities}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <FiDownload className="w-4 h-4" />
                    Export
                  </button>
                )}
                {activities.length > 0 && (
                  <button
                    onClick={handleClearAllActivities}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Total</p>
                  <p className="text-xl font-bold text-gray-900">{activities.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Filtered</p>
                  <p className="text-xl font-bold text-gray-900">{filteredActivities.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Page</p>
                  <p className="text-xl font-bold text-gray-900">
                    {currentPage} / {totalPages || 1}
                  </p>
                </div>
              </div>

              {/* Filters */}
              <ActivityFilters
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />

              {/* Activity List */}
              <div className="mt-6">
                <ActivityList
                  activities={paginatedActivities}
                  showPagination={true}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}