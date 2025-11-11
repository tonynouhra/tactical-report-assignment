'use client';

import { motion } from 'framer-motion';
import { FiPackage, FiDollarSign, FiLayers } from 'react-icons/fi';
import Image from 'next/image';

export default function ItemCard({ item, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800';
      case 'DISCONTINUED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick?.(item)}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer border border-gray-200 hover:border-blue-400 transition-all"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            height={300}
            width={400}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiPackage size={64} className="text-gray-300" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
            {item.status?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate" title={item.name}>
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2" title={item.description}>
          {item.description || 'No description available'}
        </p>

        {/* Details */}
        <div className="space-y-2">
          {/* Price */}
          <div className="flex items-center text-sm">
            <FiDollarSign className="text-green-600 mr-2" size={16} />
            <span className="font-semibold text-gray-900">{formatPrice(item.price)}</span>
          </div>

          {/* Quantity */}
          <div className="flex items-center text-sm">
            <FiLayers className="text-blue-600 mr-2" size={16} />
            <span className="text-gray-700">
              <span className="font-medium">Qty:</span> {item.quantity}
            </span>
          </div>

          {/* Category */}
          {item.category && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                {item.category}
              </span>
            </div>
          )}
        </div>


      </div>
    </motion.div>
  );
}