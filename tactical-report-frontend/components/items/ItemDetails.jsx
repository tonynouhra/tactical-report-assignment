'use client';

import { useItem } from '@/lib/hooks/useItem';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { FiPackage, FiDollarSign, FiLayers, FiTag, FiCalendar, FiEdit, FiTrash2 } from 'react-icons/fi';
import Image from 'next/image';

export default function ItemDetails({ itemId, onEdit, onDelete }) {
  const { data: item, isLoading, error } = useItem(itemId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 font-medium">Error loading item details</p>
        <p className="text-sm text-red-500 mt-1">{error.message}</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Item not found</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'DISCONTINUED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Image */}
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            height={400}
            width={600}

          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiPackage size={80} className="text-gray-300" />
          </div>
        )}

        {/* Status Badge Overlay */}
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(item.status)}`}>
            {item.status?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Item Name */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
        {item.description && (
          <p className="text-gray-600 mt-2">{item.description}</p>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Price */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-600 text-sm mb-1">
            <FiDollarSign size={16} className="mr-1" />
            <span>Price</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatPrice(item.price)}</p>
        </div>

        {/* Quantity */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-600 text-sm mb-1">
            <FiLayers size={16} className="mr-1" />
            <span>Quantity</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{item.quantity}</p>
        </div>

        {/* Category */}
        {item.category && (
          <div className="bg-gray-50 p-4 rounded-lg col-span-2">
            <div className="flex items-center text-gray-600 text-sm mb-1">
              <FiTag size={16} className="mr-1" />
              <span>Category</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{item.category}</p>
          </div>
        )}

        {/* SKU */}
        {item.sku && (
          <div className="bg-gray-50 p-4 rounded-lg col-span-2">
            <div className="flex items-center text-gray-600 text-sm mb-1">
              <FiPackage size={16} className="mr-1" />
              <span>SKU</span>
            </div>
            <p className="text-lg font-mono text-gray-900">{item.sku}</p>
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="border-t pt-4 space-y-2">
        {item.createdAt && (
          <div className="flex items-center text-sm text-gray-600">
            <FiCalendar size={14} className="mr-2" />
            <span>Created: {formatDate(item.createdAt)}</span>
          </div>
        )}
        {item.updatedAt && (
          <div className="flex items-center text-sm text-gray-600">
            <FiCalendar size={14} className="mr-2" />
            <span>Last Updated: {formatDate(item.updatedAt)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t">
        <button
          onClick={() => onEdit?.(item)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <FiEdit size={18} />
          <span>Edit Item</span>
        </button>
        <button
          onClick={() => onDelete?.(item)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          <FiTrash2 size={18} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}