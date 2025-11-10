package com.tacticalreport.tacticalreportbackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tacticalreport.tacticalreportbackend.exception.DuplicateSkuException;
import com.tacticalreport.tacticalreportbackend.exception.ItemNotFoundException;
import com.tacticalreport.tacticalreportbackend.model.Item;
import com.tacticalreport.tacticalreportbackend.model.ItemStatus;
import com.tacticalreport.tacticalreportbackend.service.ItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller layer tests for ItemController
 * Uses @WebMvcTest to test only the controller layer with mocked service
 * Does not require database or full Spring context
 */
@WebMvcTest(ItemController.class)
@DisplayName("ItemController Tests")
class ItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean // required because service isn't loaded
    private ItemService itemService;

    private Item testItem;

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
        testItem.setStatus(ItemStatus.AVAILABLE);
    }


    @Test
    @DisplayName("POST /api/items - Should create item successfully")
    void shouldCreateItemSuccessfully() throws Exception {
        when(itemService.createItem(any(Item.class))).thenReturn(testItem);

        mockMvc.perform(post("/api/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testItem)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("test-id-123"))
                .andExpect(jsonPath("$.name").value("Test Laptop"))
                .andExpect(jsonPath("$.price").value(999.99))
                .andExpect(jsonPath("$.quantity").value(10))
                .andExpect(jsonPath("$.sku").value("TEST-001"))
                .andExpect(jsonPath("$.status").value("AVAILABLE"));
    }

    @Test
    @DisplayName("POST /api/items - Should return 400 for invalid item")
    void shouldReturn400ForInvalidItem() throws Exception {
        Item invalidItem = new Item();
        invalidItem.setName("");
        invalidItem.setPrice(new BigDecimal("-10"));
        invalidItem.setQuantity(-5);

        mockMvc.perform(post("/api/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidItem)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value(containsString("Validation failed")));
    }

    @Test
    @DisplayName("POST /api/items - Should return 409 for duplicate SKU")
    void shouldReturn409ForDuplicateSku() throws Exception {
        when(itemService.createItem(any(Item.class)))
                .thenThrow(new DuplicateSkuException("TEST-001"));

        mockMvc.perform(post("/api/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testItem)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value(containsString("TEST-001")));
    }



    @Test
    @DisplayName("GET /api/items - Should return all items")
    void shouldReturnAllItems() throws Exception {
        Item item2 = new Item();
        item2.setId("test-id-456");
        item2.setName("Test Mouse");
        item2.setPrice(new BigDecimal("29.99"));
        item2.setQuantity(50);

        List<Item> items = Arrays.asList(testItem, item2);
        when(itemService.getAllItems()).thenReturn(items);

        mockMvc.perform(get("/api/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Test Laptop"))
                .andExpect(jsonPath("$[1].name").value("Test Mouse"));
    }

    @Test
    @DisplayName("GET /api/items/{id} - Should return item by ID")
    void shouldReturnItemById() throws Exception {
        when(itemService.getItemById("test-id-123")).thenReturn(testItem);

        mockMvc.perform(get("/api/items/test-id-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("test-id-123"))
                .andExpect(jsonPath("$.name").value("Test Laptop"))
                .andExpect(jsonPath("$.sku").value("TEST-001"));
    }

    @Test
    @DisplayName("GET /api/items/{id} - Should return 404 for non-existent item")
    void shouldReturn404ForNonExistentItem() throws Exception {
        when(itemService.getItemById("invalid-id"))
                .thenThrow(new ItemNotFoundException("invalid-id"));

        mockMvc.perform(get("/api/items/invalid-id"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value(containsString("invalid-id")));
    }


    @Test
    @DisplayName("PUT /api/items/{id} - Should update item successfully")
    void shouldUpdateItemSuccessfully() throws Exception {
        Item updatedItem = new Item();
        updatedItem.setId("test-id-123");
        updatedItem.setName("Updated Laptop");
        updatedItem.setPrice(new BigDecimal("1299.99"));
        updatedItem.setQuantity(15);
        updatedItem.setSku("TEST-001");

        when(itemService.updateItem(eq("test-id-123"), any(Item.class))).thenReturn(updatedItem);

        mockMvc.perform(put("/api/items/test-id-123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedItem)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("test-id-123"))
                .andExpect(jsonPath("$.name").value("Updated Laptop"))
                .andExpect(jsonPath("$.price").value(1299.99));
    }

    @Test
    @DisplayName("PUT /api/items/{id} - Should return 404 when updating non-existent item")
    void shouldReturn404WhenUpdatingNonExistentItem() throws Exception {
        when(itemService.updateItem(eq("invalid-id"), any(Item.class)))
                .thenThrow(new ItemNotFoundException("invalid-id"));

        mockMvc.perform(put("/api/items/invalid-id")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testItem)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }


    @Test
    @DisplayName("DELETE /api/items/{id} - Should delete item successfully")
    void shouldDeleteItemSuccessfully() throws Exception {
        mockMvc.perform(delete("/api/items/test-id-123"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/items/{id} - Should return 404 when deleting non-existent item")
    void shouldReturn404WhenDeletingNonExistentItem() throws Exception {
        doThrow(new ItemNotFoundException("invalid-id"))
                .when(itemService).deleteItem("invalid-id");

        mockMvc.perform(delete("/api/items/invalid-id"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }


    @Test
    @DisplayName("GET /api/items?name=laptop - Should search by name")
    void shouldSearchByName() throws Exception {
        when(itemService.searchItemsByName("laptop")).thenReturn(Arrays.asList(testItem));

        mockMvc.perform(get("/api/items").param("name", "laptop"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Test Laptop"));
    }

    @Test
    @DisplayName("GET /api/items?category=Electronics - Should filter by category")
    void shouldFilterByCategory() throws Exception {
        when(itemService.getItemsByCategory("Electronics")).thenReturn(Arrays.asList(testItem));

        mockMvc.perform(get("/api/items").param("category", "Electronics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].category").value("Electronics"));
    }

    @Test
    @DisplayName("GET /api/items?sku=TEST-001 - Should search by SKU")
    void shouldSearchBySku() throws Exception {
        when(itemService.getItemBySku("TEST-001")).thenReturn(testItem);

        mockMvc.perform(get("/api/items").param("sku", "TEST-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].sku").value("TEST-001"));
    }

    @Test
    @DisplayName("GET /api/items?sortBy=price-asc - Should sort by price ascending")
    void shouldSortByPriceAsc() throws Exception {
        Item cheapItem = new Item();
        cheapItem.setId("id-1");
        cheapItem.setName("Cheap Item");
        cheapItem.setPrice(new BigDecimal("29.99"));
        cheapItem.setQuantity(10);

        when(itemService.getItemsSortedByPriceAsc()).thenReturn(Arrays.asList(cheapItem, testItem));

        mockMvc.perform(get("/api/items").param("sortBy", "price-asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].price").value(29.99))
                .andExpect(jsonPath("$[1].price").value(999.99));
    }
}