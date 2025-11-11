'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {  FiFilter, FiX, FiCalendar } from 'react-icons/fi';
import { ActivityType } from '@/lib/utils/activityTracker';

const ActivityFilters = ({ onFilterChange, onClearFilters }) => {
  const [filters, setFilters] = useState({
    search: '',
    type: 'ALL',
    dateRange: 'ALL',
    startDate: '',
    endDate: '',
  });

  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    applyFilters(newFilters);
  };

  const applyFilters = (currentFilters) => {
    const appliedFilters = {
      search: currentFilters.search,
      type: currentFilters.type,
    };

    const now = new Date();
    if (currentFilters.dateRange === 'TODAY') {
      appliedFilters.startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      appliedFilters.endDate = new Date(now.setHours(23, 59, 59, 999)).toISOString();
    } else if (currentFilters.dateRange === 'LAST_7_DAYS') {
      appliedFilters.startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
      appliedFilters.endDate = new Date().toISOString();
    } else if (currentFilters.dateRange === 'LAST_30_DAYS') {
      appliedFilters.startDate = new Date(now.setDate(now.getDate() - 30)).toISOString();
      appliedFilters.endDate = new Date().toISOString();
    } else if (currentFilters.dateRange === 'CUSTOM') {
      appliedFilters.startDate = currentFilters.startDate;
      appliedFilters.endDate = currentFilters.endDate;
    }

    onFilterChange(appliedFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      search: '',
      type: 'ALL',
      dateRange: 'ALL',
      startDate: '',
      endDate: '',
    };
    setFilters(defaultFilters);
    setShowCustomDateRange(false);
    onClearFilters();
  };

  const handleDateRangeChange = (value) => {
    setShowCustomDateRange(value === 'CUSTOM');
    handleChange('dateRange', value);
  };

  const hasActiveFilters = filters.search || filters.type !== 'ALL' || filters.dateRange !== 'ALL';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <FiX className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search by Item Name
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Search activities..."
              className="w-full pl-10 pr-4 text-black py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Activity Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Activity Type
          </label>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Types</option>
            <option value={ActivityType.CREATE}>Create</option>
            <option value={ActivityType.UPDATE}>Update</option>
            <option value={ActivityType.DELETE}>Delete</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="relative">
            <FiCalendar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              id="dateRange"
              value={filters.dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="w-full pl-10 pr-4 text-black py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {showCustomDateRange && (
          <>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full px-4 py-2 text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full px-4 py-2 border  text-black border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ActivityFilters;