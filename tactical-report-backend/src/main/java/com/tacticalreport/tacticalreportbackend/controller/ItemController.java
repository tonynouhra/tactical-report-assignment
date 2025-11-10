package com.tacticalreport.tacticalreportbackend.controller;

import com.tacticalreport.tacticalreportbackend.model.Item;
import com.tacticalreport.tacticalreportbackend.model.ItemStatus;
import com.tacticalreport.tacticalreportbackend.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST Controller for Item management
 * Base URL: /api/items
 */
@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@Slf4j
public class ItemController {

    private final ItemService itemService;

    /**
     * Create a new item
     * POST /api/items
     *
     * @param item The item to create (validated)
     * @return 201 Created with the created item
     */
    @PostMapping
    public ResponseEntity<Item> createItem(@Valid @RequestBody Item item) {
        log.info("REST request to create item: {}", item.getName());
        Item createdItem = itemService.createItem(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
    }

    /**
     * Get all items
     * GET /api/items
     *
     * @return 200 OK with list of all items
     */
    @GetMapping
    public ResponseEntity<List<Item>> getAllItems(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sku
    ) {
        log.info("REST request to get items with filters - name: {}, category: {}, status: {}, minPrice: {}, maxPrice: {}, sortBy: {}, sku: {}",
                name, category, status, minPrice, maxPrice, sortBy, sku);

        List<Item> items;

        if (sku != null && !sku.isEmpty()) {
            Item item = itemService.getItemBySku(sku);
            return ResponseEntity.ok(List.of(item));
        }

        if (name != null && !name.isEmpty()) {
            items = itemService.searchItemsByName(name);
        }
        else if (category != null && !category.isEmpty()) {
            items = itemService.getItemsByCategory(category);
        }
        else if (status != null) {
            items = itemService.getItemsByStatus(status);
        }
        else if (minPrice != null && maxPrice != null) {
            items = itemService.getItemsByPriceRange(minPrice, maxPrice);
        }
        else if (sortBy != null) {
            items = switch (sortBy.toLowerCase()) {
                case "price-asc" -> itemService.getItemsSortedByPriceAsc();
                case "price-desc" -> itemService.getItemsSortedByPriceDesc();
                case "newest" -> itemService.getNewestItems();
                default -> itemService.getAllItems();
            };
        }
        else {
            items = itemService.getAllItems();
        }

        return ResponseEntity.ok(items);
    }

    /**
     * Get item by ID
     * GET /api/items/{id}
     *
     * @param id The item ID
     * @return 200 OK with the item, or 404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable String id) {
        log.info("REST request to get item by ID: {}", id);
        Item item = itemService.getItemById(id);
        return ResponseEntity.ok(item);
    }

    /**
     * Update an existing item
     * PUT /api/items/{id}
     *
     * @param id          The item ID to update
     * @param itemDetails The updated item details (validated)
     * @return 200 OK with the updated item, or 404 Not Found
     */
    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(
            @PathVariable String id,
            @Valid @RequestBody Item itemDetails
    ) {
        log.info("REST request to update item with ID: {}", id);
        Item updatedItem = itemService.updateItem(id, itemDetails);
        return ResponseEntity.ok(updatedItem);
    }

    /**
     * Delete an item by ID
     * DELETE /api/items/{id}
     *
     * @param id The item ID to delete
     * @return 204 No Content, or 404 Not Found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable String id) {
        log.info("REST request to delete item with ID: {}", id);
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get available items (in stock)
     * GET /api/items/available
     *
     * @return 200 OK with list of available items
     */
    @GetMapping("/available")
    public ResponseEntity<List<Item>> getAvailableItems() {
        log.info("REST request to get available items");
        List<Item> items = itemService.getAvailableItems();
        return ResponseEntity.ok(items);
    }
}