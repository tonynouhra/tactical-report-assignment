'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ItemGrid from '@/components/items/ItemGrid';
import RightDrawer from '@/components/layout/RightDrawer';
import ItemDetails from '@/components/items/ItemDetails';
import { useItems } from '@/lib/hooks/useItems';
import { useDeleteItem } from '@/lib/hooks/useDeleteItem';
import { motion } from 'framer-motion';
import { FiPackage, FiDollarSign, FiLayers, FiAlertCircle } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const itemsPerPage = 12;

  // Fetch items with pagination
  const { data, isLoading, error } = useItems(currentPage, itemsPerPage);

  // Delete item mutation
  const { mutate: deleteItemMutation } = useDeleteItem();

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemClick = (item) => {
    setSelectedItemId(item.id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedItemId(null), 300); // Clear after animation
  };

  const handleEdit = (item) => {
    // TODO: Navigate to edit page
    Swal.fire({
      title: 'Edit Item',
      text: `Edit functionality will be implemented next for: ${item.name}`,
      icon: 'info',
    });
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: 'Delete Item?',
      text: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      deleteItemMutation(item.id, {
        onSuccess: (response) => {
          Swal.fire({
            title: 'Deleted!',
            text: response?.message || `"${item.name}" has been successfully deleted.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
          handleCloseDrawer();
        },
        onError: (error) => {
          Swal.fire({
            title: 'Error',
            text: error.message || 'Failed to delete item. Please try again.',
            icon: 'error',
          });
        },
      });
    }
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

      {/* Right Drawer for Item Details */}
      <RightDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer}>
        {selectedItemId && (
          <ItemDetails
            itemId={selectedItemId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </RightDrawer>
    </MainLayout>
  );
}