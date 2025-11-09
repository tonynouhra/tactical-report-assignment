package com.tacticalreport.tacticalreportbackend.repository;

import com.tacticalreport.tacticalreportbackend.model.Item;
import com.tacticalreport.tacticalreportbackend.model.ItemStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;


@Repository
public interface ItemRepository extends MongoRepository<Item, String> {
    /**
     * Find items by exact name match
     * Query: { "name": "Laptop" }
     */
    List<Item> findByName(String name);

    /**
     * Find items by name containing text (case-insensitive)
     * Query: { "name": { $regex: "laptop", $options: "i" } }
     */
    List<Item> findByNameContainingIgnoreCase(String name);

    /**
     * Find items by category
     * Query: { "category": "Electronics" }
     */
    List<Item> findByCategory(String category);

    /**
     * Find items by status
     * Query: { "status": "AVAILABLE" }
     */
    List<Item> findByStatus(ItemStatus status);

    /**
     * Find items by SKU (Stock Keeping Unit)
     * Query: { "sku": "LAP-2024-001" }
     */
    Optional<Item> findBySku(String sku);

    /**
     * Find items where quantity is greater than specified value
     * Query: { "quantity": { $gt: 10 } }
     */
    List<Item> findByQuantityGreaterThan(Integer quantity);

    /**
     * Find items where quantity is less than or equal to specified value
     * Query: { "quantity": { $lte: 5 } }
     */
    List<Item> findByQuantityLessThanEqual(Integer quantity);

    /**
     * Find items by price range
     * Query: { "price": { $gte: 100, $lte: 500 } }
     */
    List<Item> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    /**
     * Find items by price less than
     * Query: { "price": { $lt: 1000 } }
     */
    List<Item> findByPriceLessThan(BigDecimal price);

    /**
     * Find items by price greater than
     * Query: { "price": { $gt: 1000 } }
     */
    List<Item> findByPriceGreaterThan(BigDecimal price);

    /**
     * Find items by category and status (multiple conditions)
     * Query: { "category": "Electronics", "status": "AVAILABLE" }
     */
    List<Item> findByCategoryAndStatus(String category, ItemStatus status);

    /**
     * Find items by status and quantity greater than
     * Query: { "status": "AVAILABLE", "quantity": { $gt: 0 } }
     */
    List<Item> findByStatusAndQuantityGreaterThan(ItemStatus status, Integer quantity);

    /**
     * Find items ordered by price ascending
     * Query: { } (all items), sort: { "price": 1 }
     */
    List<Item> findAllByOrderByPriceAsc();

    /**
     * Find items ordered by price descending
     * Query: { } (all items), sort: { "price": -1 }
     */
    List<Item> findAllByOrderByPriceDesc();

    /**
     * Find items ordered by creation date descending (newest first)
     * Query: { }, sort: { "createdAt": -1 }
     */
    List<Item> findAllByOrderByCreatedAtDesc();

    /**
     * Check if item with SKU exists
     * Query: { "sku": "LAP-2024-001" }
     * Returns: true or false
     */
    boolean existsBySku(String sku);

    /**
     * Count items by category
     * Query: db.items.count({ "category": "Electronics" })
     */
    long countByCategory(String category);

    /**
     * Count items by status
     * Query: db.items.count({ "status": "AVAILABLE" })
     */
    long countByStatus(ItemStatus status);


    /**
     * Find items by multiple categories (OR condition)
     * Query: { "category": { $in: ["Electronics", "Computers"] } }
     */
    @Query("{ 'category': { $in: ?0 } }")
    List<Item> findByCategories(List<String> categories);


}