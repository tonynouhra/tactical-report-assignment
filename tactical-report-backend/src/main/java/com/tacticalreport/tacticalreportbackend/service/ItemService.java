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

        org.springframework.data.domain.Sort defaultSort =
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Order.desc("createdAt"));

        Pageable effectivePageable = pageable.getSort().isUnsorted()
                ? org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), defaultSort)
                : org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), defaultSort.and(pageable.getSort()));

        Page<Item> itemsPage = itemRepository.findAll(effectivePageable);
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
     * Search items by name with pagination (case-insensitive, partial match)
     *
     * @param name     Search term
     * @param pageable Pagination information
     * @return Page of matching items
     */
    public Page<Item> searchItemsByName(String name, Pageable pageable) {
        log.debug("Searching items by name: {} with pagination", name);
        return itemRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    /**
     * Get items by category with pagination
     *
     * @param category The category
     * @param pageable Pagination information
     * @return Page of items in category
     */
    public Page<Item> getItemsByCategory(String category, Pageable pageable) {
        log.debug("Fetching items by category: {} with pagination", category);
        return itemRepository.findByCategory(category, pageable);
    }

    /**
     * Get items by status with pagination
     *
     * @param status   The item status
     * @param pageable Pagination information
     * @return Page of items with given status
     */
    public Page<Item> getItemsByStatus(ItemStatus status, Pageable pageable) {
        log.debug("Fetching items by status: {} with pagination", status);
        return itemRepository.findByStatus(status, pageable);
    }

    /**
     * Get items by price range with pagination
     *
     * @param minPrice Minimum price
     * @param maxPrice Maximum price
     * @param pageable Pagination information
     * @return Page of items in price range
     */
    public Page<Item> getItemsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        log.debug("Fetching items by price range: {} - {} with pagination", minPrice, maxPrice);
        return itemRepository.findByPriceBetween(minPrice, maxPrice, pageable);
    }


    /**
     * Search across multiple fields (name, description, sku, category) with pagination.
     *
     * @param query    Search term
     * @param pageable Pagination information
     * @return Page of matching items
     */
    public Page<Item> searchAllFields(String query, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return getAllItems(pageable);
        }
        String q = query.trim();
        return itemRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrSkuContainingIgnoreCaseOrCategoryContainingIgnoreCase(
                q, q, q, q, pageable);
    }

}