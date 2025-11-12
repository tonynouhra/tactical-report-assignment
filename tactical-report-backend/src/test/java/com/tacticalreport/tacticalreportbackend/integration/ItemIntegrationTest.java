package com.tacticalreport.tacticalreportbackend.integration;

import com.tacticalreport.tacticalreportbackend.model.Item;
import com.tacticalreport.tacticalreportbackend.model.ItemStatus;
import com.tacticalreport.tacticalreportbackend.repository.ItemRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for Item API
 * Uses embedded MongoDB (Flapdoodle) for end-to-end testing
 * Tests the entire stack: Controller -> Service -> Repository -> Database
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application-test.properties")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Item API Integration Tests")
class ItemIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ItemRepository itemRepository;

    private String baseUrl;
    private Item testItem;
    private static final String SAMPLE_BASE64_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api/items";

        // Clear database before each test
        itemRepository.deleteAll();

        // Create test item
        testItem = new Item();
        testItem.setName("Integration Test Laptop");
        testItem.setDescription("Test description for integration testing");
        testItem.setPrice(new BigDecimal("1299.99"));
        testItem.setQuantity(15);
        testItem.setCategory("Electronics");
        testItem.setSku("INT-TEST-001");
        testItem.setImage(SAMPLE_BASE64_IMAGE);
        testItem.setStatus(ItemStatus.AVAILABLE);
    }

    @AfterEach
    void tearDown() {
        // Clean up after each test
        itemRepository.deleteAll();
    }


    @Test
    @Order(1)
    @DisplayName("POST /api/items - Should create item successfully with embedded MongoDB")
    void shouldCreateItemSuccessfully() {
        // When
        ResponseEntity<Item> response = restTemplate.postForEntity(
                baseUrl,
                testItem,
                Item.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("Integration Test Laptop");
        assertThat(response.getBody().getSku()).isEqualTo("INT-TEST-001");
        assertThat(response.getBody().getPrice()).isEqualByComparingTo(new BigDecimal("1299.99"));
        assertThat(response.getBody().getQuantity()).isEqualTo(15);
        assertThat(response.getBody().getStatus()).isEqualTo(ItemStatus.AVAILABLE);

        // Verify item is actually saved in database
        List<Item> itemsInDb = itemRepository.findAll();
        assertThat(itemsInDb).hasSize(1);
        assertThat(itemsInDb.get(0).getSku()).isEqualTo("INT-TEST-001");
    }

    @Test
    @Order(2)
    @DisplayName("POST /api/items - Should return 409 when creating duplicate SKU")
    void shouldReturn409ForDuplicateSku() {
        // Given - Save first item
        itemRepository.save(testItem);

        // When - Try to create duplicate
        Item duplicateItem = new Item();
        duplicateItem.setName("Duplicate Item");
        duplicateItem.setSku("INT-TEST-001"); // Same SKU
        duplicateItem.setPrice(new BigDecimal("500.00"));
        duplicateItem.setQuantity(5);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                baseUrl,
                duplicateItem,
                Map.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo(409);
        assertThat(response.getBody().get("message").toString()).contains("INT-TEST-001");

        // Verify only one item exists in database
        assertThat(itemRepository.findAll()).hasSize(1);
    }

    @Test
    @Order(3)
    @DisplayName("POST /api/items - Should return 400 for invalid item data")
    void shouldReturn400ForInvalidData() {
        // Given - Invalid item (negative price)
        Item invalidItem = new Item();
        invalidItem.setName(""); // Empty name
        invalidItem.setPrice(new BigDecimal("-100.00")); // Negative price
        invalidItem.setQuantity(-5); // Negative quantity

        // When
        ResponseEntity<Map> response = restTemplate.postForEntity(
                baseUrl,
                invalidItem,
                Map.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(itemRepository.findAll()).isEmpty();
    }


    @Test
    @Order(4)
    @DisplayName("GET /api/items - Should return paginated items from database")
    void shouldGetAllItems() {
        // Given - Save multiple items
        Item item1 = itemRepository.save(testItem);

        Item item2 = new Item();
        item2.setName("Test Mouse");
        item2.setPrice(new BigDecimal("49.99"));
        item2.setQuantity(100);
        item2.setSku("INT-TEST-002");
        item2.setCategory("Electronics");
        itemRepository.save(item2);

        // When
        ResponseEntity<Map> response = restTemplate.getForEntity(
                baseUrl,
                Map.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).containsKey("content");
        assertThat(response.getBody()).containsKey("totalElements");
        assertThat(response.getBody()).containsKey("totalPages");
        assertThat(response.getBody().get("totalElements")).isEqualTo(2);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> content = (List<Map<String, Object>>) response.getBody().get("content");
        assertThat(content).hasSize(2);
    }

    @Test
    @Order(5)
    @DisplayName("GET /api/items/{id} - Should return item by ID from database")
    void shouldGetItemById() {
        // Given
        Item savedItem = itemRepository.save(testItem);

        // When
        ResponseEntity<Item> response = restTemplate.getForEntity(
                baseUrl + "/" + savedItem.getId(),
                Item.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isEqualTo(savedItem.getId());
        assertThat(response.getBody().getName()).isEqualTo("Integration Test Laptop");
    }

    @Test
    @Order(6)
    @DisplayName("GET /api/items/{id} - Should return 404 for non-existent item")
    void shouldReturn404ForNonExistentItem() {
        // When
        ResponseEntity<Map> response = restTemplate.getForEntity(
                baseUrl + "/non-existent-id",
                Map.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo(404);
    }


    @Test
    @Order(7)
    @DisplayName("PUT /api/items/{id} - Should update item in database")
    void shouldUpdateItem() {
        // Given
        Item savedItem = itemRepository.save(testItem);
        String itemId = savedItem.getId();

        // Prepare update
        Item updateData = new Item();
        updateData.setName("Updated Laptop");
        updateData.setDescription("Updated description");
        updateData.setPrice(new BigDecimal("1499.99"));
        updateData.setQuantity(20);
        updateData.setCategory("Electronics");
        updateData.setSku("INT-TEST-001");

        // When
        ResponseEntity<Item> response = restTemplate.exchange(
                baseUrl + "/" + itemId,
                HttpMethod.PUT,
                new HttpEntity<>(updateData),
                Item.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("Updated Laptop");
        assertThat(response.getBody().getPrice()).isEqualByComparingTo(new BigDecimal("1499.99"));
        assertThat(response.getBody().getQuantity()).isEqualTo(20);

        // Verify update persisted in database
        Item itemFromDb = itemRepository.findById(itemId).orElseThrow();
        assertThat(itemFromDb.getName()).isEqualTo("Updated Laptop");
        assertThat(itemFromDb.getPrice()).isEqualByComparingTo(new BigDecimal("1499.99"));
    }

    @Test
    @Order(8)
    @DisplayName("PUT /api/items/{id} - Should update status to OUT_OF_STOCK when quantity is 0")
    void shouldUpdateStatusWhenQuantityIsZero() {
        // Given
        Item savedItem = itemRepository.save(testItem);
        String itemId = savedItem.getId();

        // Update to quantity 0
        Item updateData = new Item();
        updateData.setName("Integration Test Laptop");
        updateData.setPrice(new BigDecimal("1299.99"));
        updateData.setQuantity(0);
        updateData.setSku("INT-TEST-001");
        updateData.setCategory("Electronics");

        // When
        ResponseEntity<Item> response = restTemplate.exchange(
                baseUrl + "/" + itemId,
                HttpMethod.PUT,
                new HttpEntity<>(updateData),
                Item.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getQuantity()).isEqualTo(0);
        assertThat(response.getBody().getStatus()).isEqualTo(ItemStatus.OUT_OF_STOCK);

        // Verify in database
        Item itemFromDb = itemRepository.findById(itemId).orElseThrow();
        assertThat(itemFromDb.getStatus()).isEqualTo(ItemStatus.OUT_OF_STOCK);
    }


    @Test
    @Order(9)
    @DisplayName("DELETE /api/items/{id} - Should delete item from database")
    void shouldDeleteItem() {
        // Given
        Item savedItem = itemRepository.save(testItem);
        String itemId = savedItem.getId();

        // Verify item exists
        assertThat(itemRepository.findById(itemId)).isPresent();

        // When
        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/" + itemId,
                HttpMethod.DELETE,
                null,
                Map.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("message")).isEqualTo("Item deleted successfully");
        assertThat(response.getBody().get("id")).isEqualTo(itemId);

        // Verify item is deleted from database
        assertThat(itemRepository.findById(itemId)).isEmpty();
        assertThat(itemRepository.findAll()).isEmpty();
    }

    @Test
    @Order(10)
    @DisplayName("DELETE /api/items/{id} - Should return 404 when deleting non-existent item")
    void shouldReturn404WhenDeletingNonExistentItem() {
        // When
        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/non-existent-id",
                HttpMethod.DELETE,
                null,
                Map.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }


    @Test
    @Order(11)
    @DisplayName("GET /api/items?name=laptop - Should search by name in database")
    void shouldSearchByName() {
        // Given
        itemRepository.save(testItem);

        Item mouse = new Item();
        mouse.setName("Wireless Mouse");
        mouse.setSku("INT-TEST-002");
        mouse.setPrice(new BigDecimal("29.99"));
        mouse.setQuantity(50);
        itemRepository.save(mouse);

        // When
        ResponseEntity<Map> response = restTemplate.getForEntity(
                baseUrl + "?name=laptop",
                Map.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> content = (List<Map<String, Object>>) response.getBody().get("content");
        assertThat(content).hasSize(1);
        assertThat(content.get(0).get("name").toString()).containsIgnoringCase("laptop");
    }

    @Test
    @Order(12)
    @DisplayName("GET /api/items?category=Electronics - Should filter by category in database")
    void shouldFilterByCategory() {
        // Given
        itemRepository.save(testItem);

        Item book = new Item();
        book.setName("Programming Book");
        book.setSku("INT-TEST-003");
        book.setPrice(new BigDecimal("39.99"));
        book.setQuantity(25);
        book.setCategory("Books");
        itemRepository.save(book);

        // When
        ResponseEntity<Map> response = restTemplate.getForEntity(
                baseUrl + "?category=Electronics",
                Map.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> content = (List<Map<String, Object>>) response.getBody().get("content");
        assertThat(content).hasSize(1);
        assertThat(content.get(0).get("category")).isEqualTo("Electronics");
    }

    @Test
    @Order(13)
    @DisplayName("GET /api/items?sku=INT-TEST-001 - Should search by SKU in database")
    void shouldSearchBySku() {
        // Given
        itemRepository.save(testItem);

        // When
        ResponseEntity<Map> response = restTemplate.getForEntity(
                baseUrl + "?sku=INT-TEST-001",
                Map.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> content = (List<Map<String, Object>>) response.getBody().get("content");
        assertThat(content).hasSize(1);
        assertThat(content.get(0).get("sku")).isEqualTo("INT-TEST-001");
    }


    @Test
    @Order(14)
    @DisplayName("E2E: Create -> Read -> Update -> Delete workflow")
    void shouldCompleteFullCrudWorkflow() {
        // 1. CREATE
        ResponseEntity<Item> createResponse = restTemplate.postForEntity(
                baseUrl,
                testItem,
                Item.class
        );
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        String itemId = createResponse.getBody().getId();
        assertThat(itemId).isNotNull();

        // 2. READ
        ResponseEntity<Item> readResponse = restTemplate.getForEntity(
                baseUrl + "/" + itemId,
                Item.class
        );
        assertThat(readResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(readResponse.getBody().getName()).isEqualTo("Integration Test Laptop");

        // 3. UPDATE
        Item updateData = new Item();
        updateData.setName("Updated Laptop Name");
        updateData.setPrice(new BigDecimal("1599.99"));
        updateData.setQuantity(30);
        updateData.setSku("INT-TEST-001");
        updateData.setCategory("Electronics");

        ResponseEntity<Item> updateResponse = restTemplate.exchange(
                baseUrl + "/" + itemId,
                HttpMethod.PUT,
                new HttpEntity<>(updateData),
                Item.class
        );
        assertThat(updateResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updateResponse.getBody().getName()).isEqualTo("Updated Laptop Name");

        // 4. DELETE
        ResponseEntity<Map> deleteResponse = restTemplate.exchange(
                baseUrl + "/" + itemId,
                HttpMethod.DELETE,
                null,
                Map.class
        );
        assertThat(deleteResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // 5. VERIFY DELETED
        ResponseEntity<Map> verifyResponse = restTemplate.getForEntity(
                baseUrl + "/" + itemId,
                Map.class
        );
        assertThat(verifyResponse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(itemRepository.findAll()).isEmpty();
    }

    @Test
    @Order(15)
    @DisplayName("E2E: Test business logic - Status auto-updates based on quantity")
    void shouldAutoUpdateStatusBasedOnQuantity() {
        // 1. Create item with quantity > 0
        ResponseEntity<Item> createResponse = restTemplate.postForEntity(
                baseUrl,
                testItem,
                Item.class
        );
        String itemId = createResponse.getBody().getId();
        assertThat(createResponse.getBody().getStatus()).isEqualTo(ItemStatus.AVAILABLE);

        // 2. Update quantity to 0 - should auto-change status to OUT_OF_STOCK
        Item updateToZero = new Item();
        updateToZero.setName("Integration Test Laptop");
        updateToZero.setPrice(new BigDecimal("1299.99"));
        updateToZero.setQuantity(0);
        updateToZero.setSku("INT-TEST-001");
        updateToZero.setCategory("Electronics");

        ResponseEntity<Item> updateResponse1 = restTemplate.exchange(
                baseUrl + "/" + itemId,
                HttpMethod.PUT,
                new HttpEntity<>(updateToZero),
                Item.class
        );
        assertThat(updateResponse1.getBody().getStatus()).isEqualTo(ItemStatus.OUT_OF_STOCK);

        // 3. Update quantity back to positive - should auto-change to AVAILABLE
        Item updateToPositive = new Item();
        updateToPositive.setName("Integration Test Laptop");
        updateToPositive.setPrice(new BigDecimal("1299.99"));
        updateToPositive.setQuantity(10);
        updateToPositive.setSku("INT-TEST-001");
        updateToPositive.setCategory("Electronics");

        ResponseEntity<Item> updateResponse2 = restTemplate.exchange(
                baseUrl + "/" + itemId,
                HttpMethod.PUT,
                new HttpEntity<>(updateToPositive),
                Item.class
        );
        assertThat(updateResponse2.getBody().getStatus()).isEqualTo(ItemStatus.AVAILABLE);

        // Verify final state in database
        Item finalItem = itemRepository.findById(itemId).orElseThrow();
        assertThat(finalItem.getStatus()).isEqualTo(ItemStatus.AVAILABLE);
        assertThat(finalItem.getQuantity()).isEqualTo(10);
    }
}