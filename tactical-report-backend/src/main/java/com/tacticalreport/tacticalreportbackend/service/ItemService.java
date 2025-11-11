package com.tacticalreport.tacticalreportbackend.service;

import com.tacticalreport.tacticalreportbackend.exception.DuplicateSkuException;
import com.tacticalreport.tacticalreportbackend.exception.ItemNotFoundException;
import com.tacticalreport.tacticalreportbackend.model.Item;
import com.tacticalreport.tacticalreportbackend.model.ItemStatus;
import com.tacticalreport.tacticalreportbackend.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService {

    private final ItemRepository itemRepository;

    /**
     * Create a new item
     * Business rules:
     * - SKU must be unique (if provided)
     * - Quantity defaults to 0 if not provided
     * - Status defaults to AVAILABLE
     *
     * @param item The item to create
     * @return The created item with generated ID
     * @throws DuplicateSkuException if SKU already exists
     */
    public Item createItem(Item item) {
        log.info("Creating new item: {}", item.getName());
        if (item.getSku() != null && !item.getSku().isEmpty()) {
            if (itemRepository.existsBySku(item.getSku())) {
                log.error("Attempted to create item with duplicate SKU: {}", item.getSku());
                throw new DuplicateSkuException(item.getSku());
            }
        }

        if (item.getQuantity() == null) {
            item.setQuantity(0);
        }

        if (item.getStatus() == null) {
            item.setStatus(ItemStatus.AVAILABLE);
        }

        if (item.getQuantity() == 0) {
            item.setStatus(ItemStatus.OUT_OF_STOCK);
        }

        Item savedItem = itemRepository.save(item);
        log.info("Item created successfully with ID: {}", savedItem.getId());
        return savedItem;
    }

    /**
     * Get item by ID
     *
     * @param id The item ID
     * @return The item
     * @throws ItemNotFoundException if item not found
     */
    public Item getItemById(String id) {
        log.debug("Fetching item with ID: {}", id);

        return itemRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Item not found with ID: {}", id);
                    return new ItemNotFoundException(id);
                });
    }

    /**
     * Get all items with pagination
     *
     * @param pageable Pagination information (page number, size, sort)
     * @return Page of items with pagination metadata
     */
    public Page<Item> getAllItems(Pageable pageable) {
        log.debug("Fetching items with pagination: page={}, size={}",
                  pageable.getPageNumber(), pageable.getPageSize());
        Page<Item> itemsPage = itemRepository.findAll(pageable);
        log.info("Found {} items on page {} of {}",
                 itemsPage.getNumberOfElements(),
                 itemsPage.getNumber() + 1,
                 itemsPage.getTotalPages());
        return itemsPage;
    }

    /**
     * Update an existing item
     * Business rules:
     * - Item must exist
     * - SKU must be unique (if changed)
     * - Status auto-updates based on quantity
     *
     * @param id          The item ID to update
     * @param itemDetails The updated item details
     * @return The updated item
     * @throws ItemNotFoundException if item not found
     * @throws DuplicateSkuException if new SKU already exists
     */
    public Item updateItem(String id, Item itemDetails) {
        log.info("Updating item with ID: {}", id);

        Item existingItem = getItemById(id);

        if (itemDetails.getSku() != null &&
                !itemDetails.getSku().equals(existingItem.getSku()) &&
                itemRepository.existsBySku(itemDetails.getSku())) {
            log.error("Attempted to update item with duplicate SKU: {}", itemDetails.getSku());
            throw new DuplicateSkuException(itemDetails.getSku());
        }

        // Update fields
        existingItem.setName(itemDetails.getName());
        existingItem.setDescription(itemDetails.getDescription());
        existingItem.setPrice(itemDetails.getPrice());
        existingItem.setQuantity(itemDetails.getQuantity());
        existingItem.setCategory(itemDetails.getCategory());
        existingItem.setSku(itemDetails.getSku());
        existingItem.setImage(itemDetails.getImage());

        if (itemDetails.getQuantity() != null) {
            if (itemDetails.getQuantity() == 0) {
                existingItem.setStatus(ItemStatus.OUT_OF_STOCK);
            } else if (itemDetails.getQuantity() > 0 &&
                    existingItem.getStatus() == ItemStatus.OUT_OF_STOCK) {
                existingItem.setStatus(ItemStatus.AVAILABLE);
            } else if (itemDetails.getStatus() != null) {
                existingItem.setStatus(itemDetails.getStatus());
            }
        }

        Item updatedItem = itemRepository.save(existingItem);
        log.info("Item updated successfully: {}", updatedItem.getId());
        return updatedItem;
    }

    /**
     * Delete an item by ID
     * This operation is idempotent - deleting a non-existent item will not throw an error
     *
     * @param id The item ID to delete
     */
    public void deleteItem(String id) {
        log.info("Deleting item with ID: {}", id);

        if (itemRepository.existsById(id)) {
            itemRepository.deleteById(id);
            log.info("Item deleted successfully: {}", id);
        } else {
            log.warn("Attempted to delete non-existent item with ID: {}", id);
        }
    }


    /**
     * Search items by name (case-insensitive, partial match)
     *
     * @param name Search term
     * @return List of matching items
     */
    public List<Item> searchItemsByName(String name) {
        log.debug("Searching items by name: {}", name);
        return itemRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Get items by category
     *
     * @param category The category
     * @return List of items in category
     */
    public List<Item> getItemsByCategory(String category) {
        log.debug("Fetching items by category: {}", category);
        return itemRepository.findByCategory(category);
    }

    /**
     * Get items by status
     *
     * @param status The item status
     * @return List of items with given status
     */
    public List<Item> getItemsByStatus(ItemStatus status) {
        log.debug("Fetching items by status: {}", status);
        return itemRepository.findByStatus(status);
    }

    /**
     * Get item by SKU
     *
     * @param sku The SKU
     * @return The item
     * @throws ItemNotFoundException if item not found
     */
    public Item getItemBySku(String sku) {
        log.debug("Fetching item by SKU: {}", sku);

        return itemRepository.findBySku(sku)
                .orElseThrow(() -> {
                    log.error("Item not found with SKU: {}", sku);
                    return new ItemNotFoundException("Item not found with SKU: " + sku, true);
                });
    }

    /**
     * Get items by price range
     *
     * @param minPrice Minimum price
     * @param maxPrice Maximum price
     * @return List of items in price range
     */
    public List<Item> getItemsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        log.debug("Fetching items by price range: {} - {}", minPrice, maxPrice);
        return itemRepository.findByPriceBetween(minPrice, maxPrice);
    }

    /**
     * Get available items (in stock)
     * Returns items with status AVAILABLE and quantity > 0
     *
     * @return List of available items
     */
    public List<Item> getAvailableItems() {
        log.debug("Fetching available items");
        return itemRepository.findByStatusAndQuantityGreaterThan(ItemStatus.AVAILABLE, 0);
    }


    /**
     * Get items sorted by price (ascending)
     *
     * @return List of items sorted by price (cheapest first)
     */
    public List<Item> getItemsSortedByPriceAsc() {
        log.debug("Fetching items sorted by price (ascending)");
        return itemRepository.findAllByOrderByPriceAsc();
    }

    /**
     * Get items sorted by price (descending)
     *
     * @return List of items sorted by price (most expensive first)
     */
    public List<Item> getItemsSortedByPriceDesc() {
        log.debug("Fetching items sorted by price (descending)");
        return itemRepository.findAllByOrderByPriceDesc();
    }

    /**
     * Get newest items
     *
     * @return List of items sorted by creation date (newest first)
     */
    public List<Item> getNewestItems() {
        log.debug("Fetching newest items");
        return itemRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Get items by multiple categories
     *
     * @param categories List of categories
     * @return List of items in any of the categories
     */
    public List<Item> getItemsByCategories(List<String> categories) {
        log.debug("Fetching items by categories: {}", categories);
        return itemRepository.findByCategories(categories);
    }
}