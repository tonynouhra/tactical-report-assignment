'use client';

import {useState} from 'react';
import {FiSearch, FiX, FiFilter} from 'react-icons/fi';

export default function SearchFilter({onFilterChange, onReset}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        status: '',
        minQuantity: '',
        maxQuantity: '',
        maxPrice: '',
        minPrice: ''
    });

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        const updatedFilters = {...filters, [name]: value};
        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            search: '',
            category: '',
            status: '',
            minQuantity: '',
            maxQuantity: ''
        };
        setFilters(resetFilters);
        onReset();
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            {/* Search Bar */}
            <div className="p-4">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                  size={20}/>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleInputChange}
                            placeholder="Search by name, description, SKU..."
                            className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                            isExpanded || hasActiveFilters
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <FiFilter size={18}/>
                        Filters
                        {hasActiveFilters && !isExpanded && (
                            <span className="ml-1 px-2 py-0.5 bg-white text-blue-600 text-xs rounded-full font-medium">
                {Object.values(filters).filter(v => v !== '').length}
              </span>
                        )}
                    </button>
                    {hasActiveFilters && (
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <FiX size={18}/>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Advanced Filters */}
            {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <input
                                type="text"
                                name="category"
                                value={filters.category}
                                onChange={handleInputChange}
                                placeholder="e.g., Electronics"
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="">All Status</option>
                                <option value="AVAILABLE">Available</option>
                                <option value="OUT_OF_STOCK">Out of Stock</option>
                                <option value="DISCONTINUED">Discontinued</option>
                            </select>
                        </div>

                        {/* Min Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Quantity
                            </label>
                            <input
                                type="number"
                                name="minQuantity"
                                value={filters.minQuantity}
                                onChange={handleInputChange}
                                placeholder="0"
                                min="0"
                                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Max Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Quantity
                            </label>
                            <input
                                type="number"
                                name="maxQuantity"
                                value={filters.maxQuantity}
                                onChange={handleInputChange}
                                placeholder="9999"
                                min="0"
                                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Proce
                            </label>
                            <input
                                type="number"
                                name="minPrice"
                                value={filters.minPrice}
                                onChange={handleInputChange}
                                placeholder="0"
                                min="0"
                                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Price
                            </label>
                            <input
                                type="number"
                                name="maxPrice"
                                value={filters.maxPrice}
                                onChange={handleInputChange}
                                placeholder="9999"
                                min="0"
                                className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}