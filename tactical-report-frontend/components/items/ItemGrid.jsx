'use client';

import { motion } from 'framer-motion';
import ItemCard from './ItemCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { FiChevronLeft, FiChevronRight, FiPackage } from 'react-icons/fi';

export default function ItemGrid({
  items = [],
  isLoading = false,
  error = null,
  currentPage = 0,
  totalPages = 0,
  onPageChange,
  onItemClick
}) {
  // Loading State
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-4 bg-red-50 rounded-lg">
          <p className="text-red-600 font-medium">Error loading items</p>
          <p className="text-sm text-red-500 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16">
        <FiPackage size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Items Found</h3>
        <p className="text-gray-500">Start by adding your first item to the inventory</p>
      </div>
    );
  }

  return (
    <div>
      {/* Items Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <ItemCard item={item} onClick={onItemClick} />
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center space-x-4">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <FiChevronLeft size={20} />
            <span>Previous</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-2">
            {[...Array(totalPages)].map((_, index) => {
              // Show first page, last page, current page, and pages around current
              const showPage =
                index === 0 ||
                index === totalPages - 1 ||
                (index >= currentPage - 1 && index <= currentPage + 1);

              // Show ellipsis
              const showEllipsis =
                (index === currentPage - 2 && currentPage > 2) ||
                (index === currentPage + 2 && currentPage < totalPages - 3);

              if (showEllipsis) {
                return <span key={index} className="text-gray-400">...</span>;
              }

              if (!showPage) return null;

              return (
                <button
                  key={index}
                  onClick={() => onPageChange(index)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === index
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span>Next</span>
            <FiChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Page Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Page {currentPage + 1} of {totalPages} ({items.length} items)
      </div>
    </div>
  );
}