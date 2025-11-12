# Tactical Report Backend API

A Spring Boot REST API for managing tactical report items with full CRUD operations, search, filtering, and pagination capabilities.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing the API](#testing-the-api)
- [Docker Container](#docker-container)
- [Health Checks](#health-checks)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Technology Stack

- **Java 21** - Programming language
- **Spring Boot 3.5.7** - Application framework
- **MongoDB 7.0** - NoSQL database
- **Gradle 8.5** - Build tool
- **Docker & Docker Compose** - Containerization
- **Lombok** - Code generation
- **Spring Boot Actuator** - Health checks and monitoring

## Prerequisites

### For Local Development
- **Java 21** (JDK 21) - [Download here](https://adoptium.net/)
- **MongoDB 7.0** or higher
- **Gradle 8.5** or higher (or use included Gradle wrapper)

### For Docker Deployment
- **Docker 20.10** or higher - [Download here](https://www.docker.com/products/docker-desktop)
- **Docker Compose 2.0** or higher (included with Docker Desktop)

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tactical-report-backend
```

### 2. Verify Java Installation

```bash
java -version
```

Expected output:
```
openjdk version "21.0.x" ...
```

### 3. Build the Project

```bash
# On macOS/Linux
./gradlew build

# On Windows
gradlew.bat build
```

This command will:
- Download all required dependencies
- Compile the source code
- Run all unit tests
- Create an executable JAR file in `build/libs/`

## Running the Application

### Option 1: Local Development (Using Gradle)

This is the recommended approach for development.

**Step 1: Start MongoDB**

```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or if you have MongoDB installed locally
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: net start MongoDB
```

**Step 2: Run the Application**

```bash
# Using Gradle wrapper (recommended)
./gradlew bootRun

# Or with specific profile
./gradlew bootRun --args='--spring.profiles.active=dev'
```

The application will start on **http://localhost:8080**

You should see output like:
```
Started TacticalReportBackendApplication in X.XXX seconds
```

### Option 2: Running JAR File

**Step 1: Build the JAR**

```bash
./gradlew clean bootJar
```

**Step 2: Run the JAR**

```bash
java -jar build/libs/tactical-report-backend-0.0.1-SNAPSHOT.jar
```

### Option 3: Using Docker Compose (Recommended for Production-like Setup)

This is the **easiest way** to run the complete stack - it includes both the API and MongoDB.

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

Services will be available at:
- **API**: http://localhost:8080
- **MongoDB**: localhost:27017

**To stop the services:**

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (clears database)
docker-compose down -v
```

**To view logs:**

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View only API logs
docker-compose logs -f api
```

## API Documentation

### Base URL

```
http://localhost:8080/api
```

### Available Endpoints

#### Items Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/items` | Create a new item |
| GET | `/api/items` | Get all items (paginated) |
| GET | `/api/items/{id}` | Get item by ID |
| PUT | `/api/items/{id}` | Update an item |
| DELETE | `/api/items/{id}` | Delete an item |
| GET | `/api/items/available` | Get available items (in stock) |

#### Health & Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/actuator/health` | Health check status |
| GET | `/actuator/info` | Application information |

### Query Parameters

All GET endpoints support pagination and filtering:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | Integer | Page number (0-indexed) | `?page=0` |
| `size` | Integer | Items per page (default: 20) | `?size=10` |
| `name` | String | Filter by name (partial match) | `?name=laptop` |
| `category` | String | Filter by category | `?category=Electronics` |
| `status` | String | Filter by status | `?status=AVAILABLE` |
| `sku` | String | Search by SKU (exact match) | `?sku=APPLE-001` |
| `minPrice` | Decimal | Minimum price filter | `?minPrice=100.00` |
| `maxPrice` | Decimal | Maximum price filter | `?maxPrice=5000.00` |
| `minQuantity` | Integer | Minimum quantity filter | `?minQuantity=1` |
| `maxQuantity` | Integer | Maximum quantity filter | `?maxQuantity=100` |
| `search` | String | Search across all fields | `?search=macbook` |

### Item Status Values

- `AVAILABLE` - Item is in stock
- `OUT_OF_STOCK` - Item is out of stock
- `DISCONTINUED` - Item is no longer available

### Request/Response Examples

#### Create Item

**Request:**
```bash
curl -X POST http://localhost:8080/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro 16-inch",
    "description": "Apple M3 Max chip with 16-core CPU and 40-core GPU, 48GB RAM, 1TB SSD",
    "price": 3499.99,
    "quantity": 25,
    "category": "Electronics",
    "sku": "APPLE-MBP16-M3MAX-001",
    "status": "AVAILABLE"
  }'
```

**Response (201 Created):**
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "MacBook Pro 16-inch",
  "description": "Apple M3 Max chip with 16-core CPU and 40-core GPU, 48GB RAM, 1TB SSD",
  "price": 3499.99,
  "quantity": 25,
  "category": "Electronics",
  "sku": "APPLE-MBP16-M3MAX-001",
  "status": "AVAILABLE",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

#### Get All Items (Paginated)

**Request:**
```bash
curl http://localhost:8080/api/items?page=0&size=10
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "MacBook Pro 16-inch",
      "price": 3499.99,
      "quantity": 25,
      "category": "Electronics",
      "sku": "APPLE-MBP16-M3MAX-001",
      "status": "AVAILABLE"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 100,
  "totalPages": 10,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false
}
```

#### Search by Name

**Request:**
```bash
curl "http://localhost:8080/api/items?name=macbook"
```

#### Filter by Category

**Request:**
```bash
curl "http://localhost:8080/api/items?category=Electronics"
```

#### Filter by Price Range

**Request:**
```bash
curl "http://localhost:8080/api/items?minPrice=1000&maxPrice=5000"
```

#### Get Item by ID

**Request:**
```bash
curl http://localhost:8080/api/items/65a1b2c3d4e5f6g7h8i9j0k1
```

#### Update Item

**Request:**
```bash
curl -X PUT http://localhost:8080/api/items/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro 16-inch (Updated)",
    "description": "Apple M3 Max chip, 48GB RAM, 2TB SSD",
    "price": 3999.99,
    "quantity": 20,
    "category": "Electronics",
    "sku": "APPLE-MBP16-M3MAX-001",
    "status": "AVAILABLE"
  }'
```

#### Delete Item

**Request:**
```bash
curl -X DELETE http://localhost:8080/api/items/65a1b2c3d4e5f6g7h8i9j0k1
```

**Response (200 OK):**
```json
{
  "message": "Item deleted successfully",
  "id": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

### Error Responses

#### Item Not Found (404)

```json
{
  "message": "Item not found with id: 65a1b2c3d4e5f6g7h8i9j0k1",
  "timestamp": "2024-01-15T10:30:00"
}
```

#### Validation Error (400)

```json
{
  "message": "Validation failed",
  "errors": {
    "name": "Name cannot be blank",
    "price": "Price must be positive",
    "quantity": "Quantity cannot be negative"
  }
}
```

#### Duplicate SKU (409)

```json
{
  "message": "Item with SKU 'APPLE-MBP16-M3MAX-001' already exists",
  "timestamp": "2024-01-15T10:30:00"
}
```

## Testing the API

### Using Postman

A complete Postman collection is included: **`Tactical-Report-API.postman_collection.json`**

#### Import the Collection

1. Open Postman
2. Click **"Import"** button
3. Select `Tactical-Report-API.postman_collection.json`
4. The collection will be imported with all requests

#### Configure Environment

The collection uses the variable `{{base_url}}` with default value `http://localhost:8080`

To change it:
1. Click on the collection
2. Go to **Variables** tab
3. Update `base_url` if needed

#### Available Request Groups

1. **Items** - CRUD operations
   - Create Item
   - Get All Items (Paginated)
   - Get Items - Page 1 Size 10
   - Get Item by ID
   - Update Item
   - Delete Item

2. **Search & Filter** - Query examples
   - Search by Name
   - Filter by Category
   - Search by SKU
   - Filter by Status
   - Filter by Price Range
   - Get Available Items

3. **Sorting** - Sorting examples
   - Sort by Price (Ascending)
   - Sort by Price (Descending)
   - Sort by Name (Ascending)
   - Sort by Name (Descending)

4. **Error Cases** - Error handling
   - Create Item - Duplicate SKU (409)
   - Create Item - Invalid Data (400)
   - Get Item - Not Found (404)
   - Update Item - Not Found (404)
   - Delete Item - Not Found (404)

5. **Health Check**
   - Actuator Health
   - Actuator Info

6. **Sample Data**
   - Pre-configured requests to populate the database

#### Running Tests

Each request includes automated tests. To run them:

1. Select a request
2. Click **"Send"**
3. View test results in the **"Test Results"** tab

Or run the entire collection:

1. Click on collection → **"Run"**
2. Select requests to run
3. Click **"Run Tactical Report API"**

### Using curl (Command Line)

See the [Request/Response Examples](#requestresponse-examples) section above for curl commands.

### Using Unit Tests

Run the included unit and integration tests:

```bash
# Run all tests
./gradlew test

# Run tests with detailed output
./gradlew test --info

# Run specific test class
./gradlew test --tests ItemServiceTest

# Run tests and generate coverage report
./gradlew test jacocoTestReport
```

Test reports will be generated at:
- **Test Results**: `build/reports/tests/test/index.html`
- **Coverage Report**: `build/reports/jacoco/test/html/index.html`

Open in browser:
```bash
# macOS
open build/reports/tests/test/index.html

# Linux
xdg-open build/reports/tests/test/index.html

# Windows
start build/reports/tests/test/index.html
```

## Docker Container

### Using Docker Compose (Recommended)

This is the easiest approach as it includes both the API and MongoDB.

**Start Everything:**
```bash
# Build and start (first time or after code changes)
docker-compose up --build

# Start existing containers
docker-compose up

# Start in background (detached mode)
docker-compose up -d
```

**View Logs:**
```bash
# All services
docker-compose logs -f

# Only API
docker-compose logs -f api

# Only MongoDB
docker-compose logs -f mongodb
```

**Stop Services:**
```bash
# Stop containers (keeps data)
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down

# Stop, remove containers, and delete all data
docker-compose down -v
```

**Rebuild After Code Changes:**
```bash
docker-compose up --build
```

### Using Docker (Manual Approach)

#### Build the Docker Image

```bash
docker build -t tactical-report-api .
```

This creates a Docker image named `tactical-report-api` using the multi-stage build process defined in the Dockerfile.

#### Run MongoDB Container

```bash
docker run -d \
  -p 27017:27017 \
  --name mongodb \
  --network tactical-network \
  mongo:7.0
```

#### Run the Application Container

```bash
# Create network first (if not exists)
docker network create tactical-network

# Run the application
docker run -d \
  -p 8080:8080 \
  --name tactical-report-api \
  --network tactical-network \
  -e MONGODB_URI=mongodb://mongodb:27017/tactical-report \
  -e MONGODB_DATABASE=tactical-report \
  tactical-report-api
```

#### Container Management Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View container logs
docker logs tactical-report-api

# Follow logs in real-time
docker logs -f tactical-report-api

# Stop container
docker stop tactical-report-api

# Start container
docker start tactical-report-api

# Restart container
docker restart tactical-report-api

# Remove container
docker rm tactical-report-api

# Remove image
docker rmi tactical-report-api

# Execute command in container
docker exec -it tactical-report-api /bin/sh
```

### Docker Image Details

The Dockerfile uses a **multi-stage build**:

1. **Builder Stage** (gradle:8.5-jdk21)
   - Downloads dependencies
   - Compiles source code
   - Creates JAR file

2. **Runtime Stage** (eclipse-temurin:21-jre)
   - Minimal JRE image (smaller size)
   - Copies only the JAR file
   - Runs as non-root user
   - Includes health checks

**Image Features:**
- Optimized layer caching for faster builds
- Security: Runs as non-root user
- Health checks included
- Automatic health monitoring
- Small runtime image (~200-300MB)

### Health Checks

Docker includes automatic health checks:

```bash
# Check container health status
docker ps

# Detailed health information
docker inspect tactical-report-api | grep -A 10 Health

# View health check logs
docker inspect tactical-report-api --format='{{json .State.Health}}' | jq
```

## Health Checks

### Health Check Endpoint

**Request:**
```bash
curl http://localhost:8080/actuator/health
```

**Response:**
```json
{
  "status": "UP",
  "components": {
    "mongo": {
      "status": "UP"
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

### Application Info

**Request:**
```bash
curl http://localhost:8080/actuator/info
```

**Response:**
```json
{
  "app": {
    "name": "Tactical Report Backend",
    "description": "Spring Boot REST API for Tactical Report Management",
    "version": "1.0.0"
  }
}
```

## Configuration

### Environment Variables

Configure the application using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Server port | 8080 |
| `MONGODB_URI` | MongoDB connection URI | mongodb://localhost:27017/tactical-report |
| `MONGODB_DATABASE` | Database name | tactical-report |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | default |
| `JAVA_OPTS` | JVM options | -Xmx512m -Xms256m |

### Setting Environment Variables

**Local Development:**
```bash
# Linux/macOS
export SERVER_PORT=8081
export MONGODB_URI=mongodb://localhost:27017/mydb
./gradlew bootRun

# Windows (CMD)
set SERVER_PORT=8081
gradlew.bat bootRun

# Windows (PowerShell)
$env:SERVER_PORT="8081"
gradlew.bat bootRun
```

**Docker:**
```bash
docker run -e SERVER_PORT=8081 -e MONGODB_URI=mongodb://... tactical-report-api
```

**Docker Compose:**

Edit `docker-compose.yml` or create `.env` file:
```env
SERVER_PORT=8081
MONGODB_URI=mongodb://mongodb:27017/custom-db
```

### Application Profiles

| Profile | Description | Use Case |
|---------|-------------|----------|
| `default` | Standard configuration | Production |
| `dev` | Debug logging enabled | Local development |
| `test` | Embedded MongoDB | Testing |
| `docker` | Docker-optimized settings | Docker containers |

**Activate Profile:**
```bash
# Gradle
./gradlew bootRun --args='--spring.profiles.active=dev'

# JAR
java -jar app.jar --spring.profiles.active=dev

# Docker
docker run -e SPRING_PROFILES_ACTIVE=dev tactical-report-api
```

### Configuration Files

- `src/main/resources/application.properties` - Main configuration
- `src/main/resources/application-dev.properties` - Development settings
- `src/main/resources/application-test.properties` - Test settings
- `src/main/resources/application-prod.properties` - Production settings

## Troubleshooting

### Port Already in Use

**Error:** `Port 8080 is already in use`

**Solution:**
```bash
# Find process using port 8080
# macOS/Linux
lsof -i :8080
netstat -vanp tcp | grep 8080

# Windows
netstat -ano | findstr :8080

# Kill the process
# macOS/Linux
kill -9 <PID>

# Windows
taskkill /PID <PID> /F

# Or use a different port
SERVER_PORT=8081 ./gradlew bootRun
```

### MongoDB Connection Failed

**Error:** `Connection refused to MongoDB` or `MongoTimeoutException`

**Solutions:**

1. **Check if MongoDB is running:**
   ```bash
   # Docker
   docker ps | grep mongo

   # If not running, start it
   docker start mongodb
   # Or
   docker-compose up mongodb
   ```

2. **Verify MongoDB port:**
   ```bash
   # Check if port 27017 is listening
   # macOS/Linux
   lsof -i :27017

   # Windows
   netstat -ano | findstr :27017
   ```

3. **Check connection URI:**
   ```bash
   # Test connection with mongosh
   mongosh mongodb://localhost:27017/tactical-report
   ```

4. **Check Docker network (if using Docker):**
   ```bash
   docker network ls
   docker network inspect tactical-report-network
   ```

### Build Failures

**Error:** `Build failed` or `Could not resolve dependencies`

**Solutions:**

1. **Clean build:**
   ```bash
   ./gradlew clean build
   ```

2. **Refresh dependencies:**
   ```bash
   ./gradlew build --refresh-dependencies
   ```

3. **Clear Gradle cache:**
   ```bash
   # Remove cache directory
   rm -rf ~/.gradle/caches/

   # Rebuild
   ./gradlew build
   ```

4. **Check Java version:**
   ```bash
   java -version
   # Must be Java 21
   ```

### Docker Build Issues

**Solutions:**

1. **Clean Docker cache:**
   ```bash
   # Remove old images
   docker rmi tactical-report-api

   # Build without cache
   docker build --no-cache -t tactical-report-api .
   ```

2. **Check Docker resources:**
   ```bash
   # View disk usage
   docker system df

   # Clean up
   docker system prune -a
   ```

3. **Check Docker Compose:**
   ```bash
   # Rebuild everything
   docker-compose build --no-cache
   docker-compose up --force-recreate
   ```

### Application Won't Start

**Check logs for specific errors:**

```bash
# Local
./gradlew bootRun --debug

# Docker
docker logs tactical-report-api

# Docker Compose
docker-compose logs api
```

**Common issues:**
- MongoDB not running
- Port conflicts
- Missing dependencies
- Configuration errors
- Java version mismatch

### Database Issues

**Access MongoDB directly:**

```bash
# Using Docker
docker exec -it tactical-report-mongodb mongosh

# Or if MongoDB is installed locally
mongosh mongodb://localhost:27017/tactical-report
```

**Useful MongoDB commands:**
```javascript
// Show databases
show dbs

// Use database
use tactical-report

// Show collections
show collections

// Count items
db.items.countDocuments()

// View items
db.items.find().pretty()

// Delete all items
db.items.deleteMany({})

// Drop database
db.dropDatabase()
```

### API Not Responding

**Debug checklist:**

1. Check if application is running:
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. Check Docker containers:
   ```bash
   docker ps
   docker logs tactical-report-api
   ```

3. Check network connectivity:
   ```bash
   # Test local connection
   telnet localhost 8080

   # Check listening ports
   netstat -an | grep 8080
   ```

4. Check firewall settings (if applicable)

### Test Failures

**Run tests with detailed output:**
```bash
./gradlew test --info --stacktrace
```

**Run specific test:**
```bash
./gradlew test --tests ItemControllerTest
./gradlew test --tests ItemServiceTest.testCreateItem
```

**Clean test cache:**
```bash
./gradlew cleanTest test
```

## Project Structure

```
tactical-report-backend/
├── src/
│   ├── main/
│   │   ├── java/com/tacticalreport/tacticalreportbackend/
│   │   │   ├── controller/          # REST API controllers
│   │   │   │   └── ItemController.java
│   │   │   ├── model/               # Domain models
│   │   │   │   ├── Item.java
│   │   │   │   └── ItemStatus.java
│   │   │   ├── repository/          # MongoDB repositories
│   │   │   │   └── ItemRepository.java
│   │   │   ├── service/             # Business logic
│   │   │   │   └── ItemService.java
│   │   │   ├── exception/           # Custom exceptions & handlers
│   │   │   │   ├── ItemNotFoundException.java
│   │   │   │   ├── DuplicateSkuException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   └── ErrorResponse.java
│   │   │   ├── config/              # Configuration classes
│   │   │   │   ├── MongoConfig.java
│   │   │   │   └── WebConfig.java
│   │   │   ├── health/              # Custom health indicators
│   │   │   │   └── ItemServiceHealthIndicator.java
│   │   │   └── TacticalReportBackendApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── application-test.properties
│   │       └── application-prod.properties
│   └── test/
│       └── java/com/tacticalreport/tacticalreportbackend/
│           ├── controller/
│           ├── service/
│           └── repository/
├── gradle/                          # Gradle wrapper files
├── build.gradle                     # Build configuration
├── settings.gradle                  # Project settings
├── gradlew                          # Gradle wrapper (Unix)
├── gradlew.bat                      # Gradle wrapper (Windows)
├── Dockerfile                       # Docker image definition
├── docker-compose.yml               # Docker Compose configuration
├── Tactical-Report-API.postman_collection.json
├── sample-data-100-items.json      # Sample data for testing
└── README.md                        # This file
```

## Development Workflow

### Typical Development Cycle

1. **Start MongoDB:**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   ```

2. **Start application in dev mode:**
   ```bash
   ./gradlew bootRun --args='--spring.profiles.active=dev'
   ```

3. **Make code changes**

4. **Run tests:**
   ```bash
   ./gradlew test
   ```

5. **Test API using Postman or curl**

6. **Commit changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

### Before Deployment

1. **Run all tests:**
   ```bash
   ./gradlew clean test
   ```

2. **Build production JAR:**
   ```bash
   ./gradlew clean bootJar
   ```

3. **Test Docker build:**
   ```bash
   docker-compose up --build
   ```

4. **Verify health checks:**
   ```bash
   curl http://localhost:8080/actuator/health
   ```

## Performance Tuning

### JVM Options

Configure JVM memory settings:

```bash
# Local
export JAVA_OPTS="-Xmx1024m -Xms512m"
java $JAVA_OPTS -jar app.jar

# Docker - edit docker-compose.yml
environment:
  JAVA_OPTS: "-Xmx1024m -Xms512m"
```

### MongoDB Connection Pooling

Edit `application.properties`:
```properties
spring.data.mongodb.max-connection-pool-size=100
spring.data.mongodb.min-connection-pool-size=10
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Write/update tests
5. Run tests: `./gradlew test`
6. Commit: `git commit -m "Add my feature"`
7. Push: `git push origin feature/my-feature`
8. Create a Pull Request

## License

Copyright © 2024 Tactical Report Team

## Support & Contact

For questions, issues, or contributions:
- Review this README
- Check the [Troubleshooting](#troubleshooting) section
- Review application logs
- Check GitHub issues

## Quick Reference

### Start Application Locally
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### Start with Docker Compose
```bash
docker-compose up -d --build
```

### Test API
```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/items
```

### View Logs
```bash
docker-compose logs -f api
```

### Stop Everything
```bash
docker-compose down
docker stop mongodb
```

---
