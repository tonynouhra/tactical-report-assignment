package com.tacticalreport.tacticalreportbackend.model;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Item entity representing a product that can be purchased
 * Stored in MongoDB "items" collection
 */
@Data  // Lombok: generates getters, setters, toString, equals, hashCode
@NoArgsConstructor  // Lombok: generates no-args constructor (required by MongoDB)
@AllArgsConstructor  // Lombok: generates constructor with all fields
@Document(collection = "items")
public class Item {

    @Id
    private String id;

    @NotBlank(message = "Name is required and cannot be empty")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price must have at most 2 decimal places")
    private BigDecimal price;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category;

    @Size(max = 50, message = "SKU cannot exceed 50 characters")
    private String sku;

    @Size(max = 500, message = "Image URL cannot exceed 500 characters")
    private String imageUrl;

    private ItemStatus status = ItemStatus.AVAILABLE;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    /**
     * Check if item is in stock
     *
     * @return true if quantity > 0, false otherwise
     */
    public boolean isInStock() {

        return quantity != null && quantity > 0;
    }

    /**
     * Check if item is available for purchase
     *
     * @return true if status is AVAILABLE and in stock
     */
    public boolean isAvailableForPurchase() {
        return status == ItemStatus.AVAILABLE && isInStock();
    }
}