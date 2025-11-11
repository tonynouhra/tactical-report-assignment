'use client';

import { useState } from 'react';
import { useCreateItem } from '@/lib/hooks/useCreateItem';
import { useUpdateItem } from '@/lib/hooks/useUpdateItem';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { FiSave, FiX, FiUpload } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function ItemForm({ item, onSuccess, onCancel }) {
  const isEditMode = !!item;

  const [formData, setFormData] = useState(() => {
    if (item) {
      return {
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        quantity: item.quantity || '',
        category: item.category || '',
        sku: item.sku || '',
        status: item.status || 'AVAILABLE',
        image: item.image || '',
      };
    }
    return {
      name: '',
      description: '',
      price: '',
      quantity: '',
      category: '',
      sku: '',
      status: 'AVAILABLE',
      image: '',
    };
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(item?.image || '');

  const { mutate: createItem, isPending: isCreating } = useCreateItem();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateItem();

  const isSubmitting = isCreating || isUpdating;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        image: 'Please select a valid image file',
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: 'Image size must be less than 5MB',
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result; // This is already in format: data:image/png;base64,iVBORw0KG...
      setFormData((prev) => ({
        ...prev,
        image: base64String,
      }));
      setImagePreview(base64String);
      setErrors((prev) => ({
        ...prev,
        image: null,
      }));
    };
    reader.onerror = () => {
      setErrors((prev) => ({
        ...prev,
        image: 'Failed to read image file',
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: '',
    }));
    setImagePreview('');
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      category: formData.category.trim(),
      sku: formData.sku.trim(),
      status: formData.status,
      image: formData.image,
    };

    if (isEditMode) {
      updateItem(
        { id: item.id, data: submitData },
        {
          onSuccess: (response) => {
            Swal.fire({
              title: 'Updated!',
              text: 'Item updated successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
            onSuccess?.(response);
          },
          onError: (error) => {
            Swal.fire({
              title: 'Error',
              text: error.message || 'Failed to update item',
              icon: 'error',
            });
          },
        }
      );
    } else {
      createItem(submitData, {
        onSuccess: (response) => {
          Swal.fire({
            title: 'Created!',
            text: 'Item created successfully',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
          onSuccess?.(response);
        },
        onError: (error) => {
          Swal.fire({
            title: 'Error',
            text: error.message || 'Failed to create item',
            icon: 'error',
          });
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Item' : 'Create New Item'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {isEditMode ? 'Update the item details below' : 'Fill in the details to create a new item'}
        </p>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter item name"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter item description"
        />
      </div>

      {/* Price and Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent ${
              errors.quantity ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
          />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
        </div>
      </div>

      {/* Category and SKU */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Electronics"
          />
        </div>

        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., ABC-123"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="AVAILABLE">Available</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
          <option value="DISCONTINUED">Discontinued</option>
        </select>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Image
        </label>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-lg"
              title="Remove image"
            >
              <FiX size={16} />
            </button>
          </div>
        )}

        {/* File Input */}
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FiUpload size={32} className="text-gray-400 mb-2" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="small" />
              <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
            </>
          ) : (
            <>
              <FiSave size={18} />
              <span>{isEditMode ? 'Update Item' : 'Create Item'}</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <FiX size={18} />
          <span>Cancel</span>
        </button>
      </div>
    </form>
  );
}