package com.tacticalreport.tacticalreportbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * MongoDB Configuration
 * Enables automatic timestamp management for createdAt and updatedAt fields
 */
@Configuration
@EnableMongoAuditing  // Enables @CreatedDate and @LastModifiedDate annotations
public class MongoConfig {
}