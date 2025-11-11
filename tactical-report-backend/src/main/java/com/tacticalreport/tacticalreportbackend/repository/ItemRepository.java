package com.tacticalreport.tacticalreportbackend.repository;

import com.tacticalreport.tacticalreportbackend.model.Item;
import com.tacticalreport.tacticalreportbackend.model.ItemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;


@Repository
public interface ItemRepository extends MongoRepository<Item, String> {


    /**
     * Find items by SKU (Stock Keeping Unit)
     * Query: { "sku": "LAP-2024-001" }
     */
    Optional<Item> findBySku(String sku);



    /**
     * Find items by status and quantity greater than
     * Query: { "status": "AVAILABLE", "quantity": { $gt: 0 } }
     */
    List<Item> findByStatusAndQuantityGreaterThan(ItemStatus status, Integer quantity);


    /**
     * Check if item with SKU exists
     * Query: { "sku": "LAP-2024-001" }
     * Returns: true or false
     */
    boolean existsBySku(String sku);

    /**
     * Find items by name containing text with pagination (case-insensitive)
     * Query: { "name": { $regex: "laptop", $options: "i" } }
     */
    Page<Item> findByNameContainingIgnoreCase(String name, Pageable pageable);

    /**
     * Find items by category with pagination
     * Query: { "category": "Electronics" }
     */
    Page<Item> findByCategory(String category, Pageable pageable);

    /**
     * Find items by status with pagination
     * Query: { "status": "AVAILABLE" }
     */
    Page<Item> findByStatus(ItemStatus status, Pageable pageable);

    /**
     * Find items by price range with pagination
     * Query: { "price": { $gte: 100, $lte: 500 } }
     */
    Page<Item> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    /**
     * Search items across multiple fields with pagination (name OR description OR sku OR category)
     * Query: { $or: [
     *   { "name": { $regex: "query", $options: "i" } },
     *   { "description": { $regex: "query", $options: "i" } },
     *   { "sku": { $regex: "query", $options: "i" } },
     *   { "category": { $regex: "query", $options: "i" } }
     * ]}
     */
    Page<Item> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrSkuContainingIgnoreCaseOrCategoryContainingIgnoreCase(
            String name, String description, String sku, String category, Pageable pageable);

}