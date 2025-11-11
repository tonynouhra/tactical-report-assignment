import { apiClient } from './client';

/**
 * Get all items with pagination
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Items per page
 * @returns {Promise} Paginated items response
 */
export const getAllItems = (page = 0, size = 12) => {
  return apiClient(`/items?page=${page}&size=${size}`);
};

/**
 * Get single item by ID
 * @param {string} id - Item ID
 * @returns {Promise} Item data
 */
export const getItemById = (id) => {
  return apiClient(`/items/${id}`);
};

/**
 * Create new item
 * @param {object} data - Item data
 * @returns {Promise} Created item
 */
export const createItem = (data) => {
  return apiClient('/items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Update existing item
 * @param {string} id - Item ID
 * @param {object} data - Updated item data
 * @returns {Promise} Updated item
 */
export const updateItem = (id, data) => {
  return apiClient(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Delete item
 * @param {string} id - Item ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteItem = (id) => {
  return apiClient(`/items/${id}`, {
    method: 'DELETE',
  });
};