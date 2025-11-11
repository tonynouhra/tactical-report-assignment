'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ItemGrid from '@/components/items/ItemGrid';
import { useItems } from '@/lib/hooks/useItems';
import { motion } from 'framer-motion';
import { FiPackage, FiDollarSign, FiLayers, FiAlertCircle } from 'react-icons/fi';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  // Fetch items with pagination
  const { data, isLoading, error } = useItems(currentPage, itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemClick = (item) => {
    console.log('Item clicked:', item);
    // TODO: Open right drawer with item details
  };

  // Calculate stats from current page data
  const totalItems = data?.totalElements || 0;
  const currentPageItems = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <MainLayout>
      <div style={{ padding: '80px' }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* Total Items */}
          <div style={{
            backgroundColor: '#2563eb',
            borderRadius: '12px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>Total Items</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{totalItems} </div>
          </div>

          {/* Current Page Items */}
          <div style={{
            backgroundColor: '#16a34a',
            borderRadius: '12px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>Showing</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{currentPageItems.length}</div>
          </div>

          {/* Total Pages */}
          <div style={{
            backgroundColor: '#9333ea',
            borderRadius: '12px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>Total Pages</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{totalPages}</div>
          </div>
        </div>

        {/* Items Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <ItemGrid
            items={currentPageItems}
            isLoading={isLoading}
            error={error}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onItemClick={handleItemClick}
          />
        </motion.div>
      </div>
    </MainLayout>
  );
}