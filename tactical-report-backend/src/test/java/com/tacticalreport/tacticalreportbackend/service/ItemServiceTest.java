package com.tacticalreport.tacticalreportbackend.service;

import com.tacticalreport.tacticalreportbackend.exception.DuplicateSkuException;
import com.tacticalreport.tacticalreportbackend.exception.ItemNotFoundException;
import com.tacticalreport.tacticalreportbackend.model.Item;
import com.tacticalreport.tacticalreportbackend.model.ItemStatus;
import com.tacticalreport.tacticalreportbackend.repository.ItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ItemService
 * Uses Mockito to mock the ItemRepository dependency
 * Tests business logic in isolation without database
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ItemService Unit Tests")
class ItemServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private ItemService itemService;

    private Item testItem;
    private static final String SAMPLE_BASE64_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    @BeforeEach
    void setUp() {
        testItem = new Item();
        testItem.setId("test-id-123");
        testItem.setName("Test Laptop");
        testItem.setDescription("Test description");
        testItem.setPrice(new BigDecimal("999.99"));
        testItem.setQuantity(10);
        testItem.setCategory("Electronics");
        testItem.setSku("TEST-001");
        testItem.setImage(SAMPLE_BASE64_IMAGE);
        testItem.setStatus(ItemStatus.AVAILABLE);
    }


    @Test
    @DisplayName("Should create item successfully with all fields")
    void shouldCreateItemSuccessfully() {
        // Given
        when(itemRepository.existsBySku("TEST-001")).thenReturn(false);
        when(itemRepository.save(any(Item.class))).thenReturn(testItem);

        // When
        Item result = itemService.createItem(testItem);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Test Laptop");
        assertThat(result.getSku()).isEqualTo("TEST-001");
        assertThat(result.getStatus()).isEqualTo(ItemStatus.AVAILABLE);

        verify(itemRepository, times(1)).existsBySku("TEST-001");
        verify(itemRepository, times(1)).save(testItem);
    }

    @Test
    @DisplayName("Should throw DuplicateSkuException when SKU already exists")
    void shouldThrowExceptionWhenSkuExists() {
        // Given
        when(itemRepository.existsBySku("TEST-001")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> itemService.createItem(testItem))
                .isInstanceOf(DuplicateSkuException.class)
                .hasMessageContaining("TEST-001");

        verify(itemRepository, times(1)).existsBySku("TEST-001");
        verify(itemRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should set quantity to 0 if null")
    void shouldSetDefaultQuantity() {
        // Given
        testItem.setQuantity(null);
        when(itemRepository.existsBySku(any())).thenReturn(false);
        when(itemRepository.save(any(Item.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Item result = itemService.createItem(testItem);

        // Then
        assertThat(result.getQuantity()).isEqualTo(0);
        verify(itemRepository, times(1)).save(any(Item.class));
    }

    @Test
    @DisplayName("Should set status to AVAILABLE if null and quantity > 0")
    void shouldSetDefaultStatus() {
        // Given
        testItem.setStatus(null);
        testItem.setQuantity(5);
        when(itemRepository.existsBySku(any())).thenReturn(false);
        when(itemRepository.save(any(Item.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Item result = itemService.createItem(testItem);

        // Then
        assertThat(result.getStatus()).isEqualTo(ItemStatus.AVAILABLE);
    }

    @Test
    @DisplayName("Should set status to OUT_OF_STOCK when quantity is 0")
    void shouldSetOutOfStockWhenQuantityIsZero() {
        // Given
        testItem.setQuantity(0);
        when(itemRepository.existsBySku(any())).thenReturn(false);
        when(itemRepository.save(any(Item.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Item result = itemService.createItem(testItem);

        // Then
        assertThat(result.getStatus()).isEqualTo(ItemStatus.OUT_OF_STOCK);
    }


    @Test
    @DisplayName("Should get item by ID successfully")
    void shouldGetItemById() {
        // Given
        when(itemRepository.findById("test-id-123")).thenReturn(Optional.of(testItem));

        // When
        Item result = itemService.getItemById("test-id-123");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("test-id-123");
        assertThat(result.getName()).isEqualTo("Test Laptop");

        verify(itemRepository, times(1)).findById("test-id-123");
    }

    @Test
    @DisplayName("Should throw ItemNotFoundException when item not found by ID")
    void shouldThrowExceptionWhenItemNotFound() {
        // Given
        when(itemRepository.findById("invalid-id")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> itemService.getItemById("invalid-id"))
                .isInstanceOf(ItemNotFoundException.class)
                .hasMessageContaining("invalid-id");

        verify(itemRepository, times(1)).findById("invalid-id");
    }

    @Test
    @DisplayName("Should get all items")
    void shouldGetAllItems() {
        // Given
        Item item2 = new Item();
        item2.setId("test-id-456");
        item2.setName("Test Mouse");

        List<Item> items = Arrays.asList(testItem, item2);
        when(itemRepository.findAll()).thenReturn(items);

        // When
        List<Item> result = itemService.getAllItems();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).contains(testItem, item2);

        verify(itemRepository, times(1)).findAll();
    }


    @Test
    @DisplayName("Should update item successfully")
    void shouldUpdateItemSuccessfully() {
        // Given
        Item updatedDetails = new Item();
        updatedDetails.setName("Updated Laptop");
        updatedDetails.setDescription("Updated description");
        updatedDetails.setPrice(new BigDecimal("1299.99"));
        updatedDetails.setQuantity(15);
        updatedDetails.setCategory("Electronics");
        updatedDetails.setSku("TEST-001");

        when(itemRepository.findById("test-id-123")).thenReturn(Optional.of(testItem));
        // No need to stub existsBySku since SKU is not changing
        when(itemRepository.save(any(Item.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Item result = itemService.updateItem("test-id-123", updatedDetails);

        // Then
        assertThat(result.getName()).isEqualTo("Updated Laptop");
        assertThat(result.getPrice()).isEqualByComparingTo(new BigDecimal("1299.99"));
        assertThat(result.getQuantity()).isEqualTo(15);

        verify(itemRepository, times(1)).findById("test-id-123");
        verify(itemRepository, times(1)).save(any(Item.class));
    }

    @Test
    @DisplayName("Should throw exception when updating with duplicate SKU")
    void shouldThrowExceptionWhenUpdatingWithDuplicateSku() {
        // Given
        Item updatedDetails = new Item();
        updatedDetails.setName("Updated Laptop");
        updatedDetails.setSku("DUPLICATE-SKU");

        when(itemRepository.findById("test-id-123")).thenReturn(Optional.of(testItem));
        when(itemRepository.existsBySku("DUPLICATE-SKU")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> itemService.updateItem("test-id-123", updatedDetails))
                .isInstanceOf(DuplicateSkuException.class)
                .hasMessageContaining("DUPLICATE-SKU");

        verify(itemRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should set status to OUT_OF_STOCK when updating quantity to 0")
    void shouldSetOutOfStockWhenUpdatingQuantityToZero() {
        // Given
        Item updatedDetails = new Item();
        updatedDetails.setName("Test Laptop");
        updatedDetails.setQuantity(0);
        updatedDetails.setSku("TEST-001");
        updatedDetails.setPrice(new BigDecimal("999.99"));

        when(itemRepository.findById("test-id-123")).thenReturn(Optional.of(testItem));
        // No need to stub existsBySku since SKU is not changing
        when(itemRepository.save(any(Item.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Item result = itemService.updateItem("test-id-123", updatedDetails);

        // Then
        assertThat(result.getStatus()).isEqualTo(ItemStatus.OUT_OF_STOCK);
    }

    @Test
    @DisplayName("Should set status to AVAILABLE when updating quantity from 0 to positive")
    void shouldSetAvailableWhenUpdatingQuantityFromZero() {
        // Given
        testItem.setStatus(ItemStatus.OUT_OF_STOCK);
        testItem.setQuantity(0);

        Item updatedDetails = new Item();
        updatedDetails.setName("Test Laptop");
        updatedDetails.setQuantity(10);
        updatedDetails.setSku("TEST-001");
        updatedDetails.setPrice(new BigDecimal("999.99"));

        when(itemRepository.findById("test-id-123")).thenReturn(Optional.of(testItem));
        // No need to stub existsBySku since SKU is not changing
        when(itemRepository.save(any(Item.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Item result = itemService.updateItem("test-id-123", updatedDetails);

        // Then
        assertThat(result.getStatus()).isEqualTo(ItemStatus.AVAILABLE);
    }


    @Test
    @DisplayName("Should delete item successfully")
    void shouldDeleteItemSuccessfully() {
        // Given
        when(itemRepository.findById("test-id-123")).thenReturn(Optional.of(testItem));
        doNothing().when(itemRepository).deleteById("test-id-123");

        // When
        itemService.deleteItem("test-id-123");

        // Then
        verify(itemRepository, times(1)).findById("test-id-123");
        verify(itemRepository, times(1)).deleteById("test-id-123");
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent item")
    void shouldThrowExceptionWhenDeletingNonExistentItem() {
        // Given
        when(itemRepository.findById("invalid-id")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> itemService.deleteItem("invalid-id"))
                .isInstanceOf(ItemNotFoundException.class)
                .hasMessageContaining("invalid-id");

        verify(itemRepository, never()).deleteById(any());
    }


    @Test
    @DisplayName("Should search items by name")
    void shouldSearchItemsByName() {
        // Given
        List<Item> items = Arrays.asList(testItem);
        when(itemRepository.findByNameContainingIgnoreCase("laptop")).thenReturn(items);

        // When
        List<Item> result = itemService.searchItemsByName("laptop");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).containsIgnoringCase("laptop");

        verify(itemRepository, times(1)).findByNameContainingIgnoreCase("laptop");
    }

    @Test
    @DisplayName("Should get items by category")
    void shouldGetItemsByCategory() {
        // Given
        List<Item> items = Arrays.asList(testItem);
        when(itemRepository.findByCategory("Electronics")).thenReturn(items);

        // When
        List<Item> result = itemService.getItemsByCategory("Electronics");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory()).isEqualTo("Electronics");

        verify(itemRepository, times(1)).findByCategory("Electronics");
    }

    @Test
    @DisplayName("Should get items by status")
    void shouldGetItemsByStatus() {
        // Given
        List<Item> items = Arrays.asList(testItem);
        when(itemRepository.findByStatus(ItemStatus.AVAILABLE)).thenReturn(items);

        // When
        List<Item> result = itemService.getItemsByStatus(ItemStatus.AVAILABLE);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(ItemStatus.AVAILABLE);

        verify(itemRepository, times(1)).findByStatus(ItemStatus.AVAILABLE);
    }

    @Test
    @DisplayName("Should get item by SKU")
    void shouldGetItemBySku() {
        // Given
        when(itemRepository.findBySku("TEST-001")).thenReturn(Optional.of(testItem));

        // When
        Item result = itemService.getItemBySku("TEST-001");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getSku()).isEqualTo("TEST-001");

        verify(itemRepository, times(1)).findBySku("TEST-001");
    }

    @Test
    @DisplayName("Should throw exception when item not found by SKU")
    void shouldThrowExceptionWhenItemNotFoundBySku() {
        // Given
        when(itemRepository.findBySku("INVALID-SKU")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> itemService.getItemBySku("INVALID-SKU"))
                .isInstanceOf(ItemNotFoundException.class)
                .hasMessageContaining("INVALID-SKU");

        verify(itemRepository, times(1)).findBySku("INVALID-SKU");
    }

    @Test
    @DisplayName("Should get items by price range")
    void shouldGetItemsByPriceRange() {
        // Given
        BigDecimal minPrice = new BigDecimal("500");
        BigDecimal maxPrice = new BigDecimal("1500");
        List<Item> items = Arrays.asList(testItem);

        when(itemRepository.findByPriceBetween(minPrice, maxPrice)).thenReturn(items);

        // When
        List<Item> result = itemService.getItemsByPriceRange(minPrice, maxPrice);

        // Then
        assertThat(result).hasSize(1);
        verify(itemRepository, times(1)).findByPriceBetween(minPrice, maxPrice);
    }

    @Test
    @DisplayName("Should get available items")
    void shouldGetAvailableItems() {
        // Given
        List<Item> items = Arrays.asList(testItem);
        when(itemRepository.findByStatusAndQuantityGreaterThan(ItemStatus.AVAILABLE, 0)).thenReturn(items);

        // When
        List<Item> result = itemService.getAvailableItems();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(ItemStatus.AVAILABLE);
        assertThat(result.get(0).getQuantity()).isGreaterThan(0);

        verify(itemRepository, times(1)).findByStatusAndQuantityGreaterThan(ItemStatus.AVAILABLE, 0);
    }
}