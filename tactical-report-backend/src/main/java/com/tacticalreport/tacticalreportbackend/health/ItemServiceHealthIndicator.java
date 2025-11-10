package com.tacticalreport.tacticalreportbackend.health;

import com.tacticalreport.tacticalreportbackend.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * Custom health indicator for Item Service
 * Checks if the item repository is accessible and working
 * Appears in /actuator/health endpoint
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ItemServiceHealthIndicator implements HealthIndicator {

    private final ItemRepository itemRepository;

    @Override
    public Health health() {
        try {
            long itemCount = itemRepository.count();

            log.debug("Health check: Item repository is accessible. Total items: {}", itemCount);

            return Health.up()
                    .withDetail("service", "ItemService")
                    .withDetail("status", "operational")
                    .withDetail("totalItems", itemCount)
                    .withDetail("message", "Item service is healthy and operational")
                    .build();

        } catch (Exception e) {
            log.error("Health check failed: Item repository is not accessible", e);

            return Health.down()
                    .withDetail("service", "ItemService")
                    .withDetail("status", "down")
                    .withDetail("error", e.getClass().getSimpleName())
                    .withDetail("message", "Item service is unavailable: " + e.getMessage())
                    .build();
        }
    }
}