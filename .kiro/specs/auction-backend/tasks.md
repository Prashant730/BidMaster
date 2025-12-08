# Implementation Plan

- [x] 1. Project Setup and Configuration

  - [x] 1.1 Initialize Node.js project with package.json

    - Create backend directory structure
    - Initialize npm with required dependencies (express, mongoose, socket.io, bcryptjs, jsonwebtoken, cors, dotenv, node-cron)
    - Add dev dependencies (jest, fast-check, supertest, mongodb-memory-server, nodemon)
    - Configure npm scripts for dev, start, and test
    - _Requirements: 9.1, 9.2_

  - [x] 1.2 Create environment configuration

    - Create .env.example with required variables (MONGODB_URI, JWT_SECRET, PORT, FRONTEND_URL)
    - Create config/db.js for MongoDB connection
    - Create config/socket.js for Socket.IO setup
    - _Requirements: 9.1, 10.4_

  - [x] 1.3 Set up Express app with middleware

    - Create src/app.js with Express configuration
    - Configure CORS, JSON parsing, and error handling middleware
    - Create server.js entry point
    - _Requirements: 10.4, 10.5_

- [ ] 2. Database Models

  - [ ] 2.1 Create User model with Mongoose schema

    - Define User schema with all fields (username, email, password, role, status, seller fields, profile fields)
    - Add pre-save hook for password hashing
    - Add method for password comparison
    - Add indexes for email and username
    - _Requirements: 1.6, 9.1_

  - [ ] 2.2 Write property test for password security

    - **Property 2: Password Security**
    - **Validates: Requirements 1.6**

  - [ ] 2.3 Create Auction model with Mongoose schema

    - Define Auction schema with all fields (title, description, category, prices, bids, seller, status)
    - Add embedded bid subdocument schema
    - Add indexes for category, status, and endTime
    - _Requirements: 9.2, 9.3_

  - [ ] 2.4 Create Settings model with Mongoose schema

    - Define Settings schema for platform configuration
    - Add default values for commission rate, categories, and site rules
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 2.5 Write property test for schema validation
    - **Property 15: Schema Validation Enforcement**
    - **Validates: Requirements 9.1, 9.2**

- [ ] 3. Authentication System

  - [ ] 3.1 Create authentication middleware

    - Create middleware/auth.js for JWT verification
    - Extract token from Authorization header
    - Verify token and attach user to request
    - _Requirements: 10.1_

  - [ ] 3.2 Create role-based authorization middleware

    - Create middleware/roleCheck.js for role verification
    - Implement isAdmin middleware
    - Implement isSeller middleware
    - Implement isSellerOrAdmin middleware
    - _Requirements: 10.2, 10.3_

  - [ ] 3.3 Create authentication controller

    - Implement register function with validation
    - Implement login function with credential verification
    - Implement getMe function for current user
    - Generate JWT tokens with user data
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 3.4 Create authentication routes

    - POST /api/auth/register
    - POST /api/auth/login
    - GET /api/auth/me (protected)
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 3.5 Write property test for authentication round-trip
    - **Property 1: Authentication Round-Trip**
    - **Validates: Requirements 1.1, 1.2, 1.3**

- [ ] 4. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. User Management

  - [ ] 5.1 Create user controller

    - Implement getAllUsers for admin
    - Implement getUserById
    - Implement updateUser for status changes
    - Implement deleteUser
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 5.2 Create user routes

    - GET /api/users (admin)
    - GET /api/users/:id (admin)
    - PUT /api/users/:id (admin)
    - DELETE /api/users/:id (admin)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 5.3 Write property tests for user management
    - **Property 3: User List Completeness**
    - **Property 4: User Status Update Consistency**
    - **Property 5: User Deletion Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [ ] 6. Seller Approval Workflow

  - [ ] 6.1 Create seller request controller functions

    - Implement submitSellerRequest
    - Implement getPendingSellers
    - Implement approveSeller
    - Implement rejectSeller
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 6.2 Create seller routes

    - POST /api/users/seller-request (authenticated)
    - GET /api/users/pending-sellers (admin)
    - PUT /api/users/:id/approve-seller (admin)
    - PUT /api/users/:id/reject-seller (admin)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 6.3 Write property tests for seller workflow
    - **Property 6: Seller Approval Workflow Consistency**
    - **Property 7: Pending Sellers Filter Accuracy**
    - **Validates: Requirements 3.2, 3.3, 3.4**

- [ ] 7. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Auction Management

  - [ ] 8.1 Create auction service

    - Implement createAuction with end time calculation
    - Implement getAuctions with filtering logic
    - Implement getAuctionById
    - Implement updateAuction
    - Implement deleteAuction
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 8.2 Create auction controller

    - Wire service functions to HTTP handlers
    - Add input validation
    - Handle errors appropriately

    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 8.3 Create auction routes

    - GET /api/auctions (public, with filters)
    - GET /api/auctions/:id (public)
    - POST /api/auctions (seller)
    - PUT /api/auctions/:id (owner/admin)
    - DELETE /api/auctions/:id (admin)
    - GET /api/auctions/user/:userId (authenticated)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 8.4 Write property tests for auction management

    - **Property 8: Auction End Time Calculation**
    - **Property 9: Auction Filter Correctness**
    - **Validates: Requirements 4.1, 4.2**

- [ ] 9. Bidding System

  - [ ] 9.1 Create bidding service

    - Implement placeBid with validation
    - Implement removeBid with price recalculation
    - Validate bid amount against current price
    - Check auction status before accepting bid
    - _Requirements: 5.1, 5.3, 5.4, 5.5_

  - [x] 9.2 Create bidding controller and routes

    - POST /api/auctions/:id/bid (authenticated, non-admin)
    - DELETE /api/auctions/:id/bid/:bidIndex (admin)
    - _Requirements: 5.1, 5.5_

  - [x] 9.3 Write property tests for bidding

    - **Property 10: Bid Validity and Price Update**
    - **Property 11: Bid Removal Price Recalculation**
    - **Validates: Requirements 5.1, 5.5**

- [x] 10. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [-] 11. Real-Time Communication

  - [x] 11.1 Create Socket.IO service

    - Set up socket connection handling
    - Implement room management for auctions
    - Create event emitters for bid updates
    - Create event emitters for auction lifecycle events
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 11.2 Integrate socket events with controllers

    - Emit bidUpdate on successful bid
    - Emit auctionCreated on new auction
    - Emit auctionUpdated on auction changes
    - Emit auctionRemoved on deletion
    - Emit userUpdated on status changes
    - Emit outbid notification to previous highest bidder
    - _Requirements: 5.2, 5.6, 7.2, 7.3, 7.4_

  - [x] 11.3 Write integration tests for socket events

    - Test bid update broadcasts
    - Test auction lifecycle events
    - Test user update events
    - _Requirements: 7.2, 7.3, 7.4_

- [ ] 12. Auction Scheduler

  - [ ] 12.1 Create scheduler service

    - Set up node-cron job to run every minute
    - Query for expired active auctions
    - Update auction status to ended
    - Determine and record winner
    - Emit auctionEnded events
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 12.2 Write property test for auction lifecycle
    - **Property 12: Auction Lifecycle Completion**
    - **Validates: Requirements 6.1, 6.2**

- [ ] 13. Admin Configuration

  - [x] 13.1 Create admin controller

    - Implement getSettings
    - Implement updateSettings
    - Implement updateCommissionRate
    - Implement category management (add/remove)
    - Implement announcement management
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 13.2 Create admin routes

    - GET /api/admin/settings (admin)
    - PUT /api/admin/settings (admin)
    - PUT /api/admin/commission-rate (admin)
    - GET /api/admin/categories (public)
    - POST /api/admin/categories (admin)
    - DELETE /api/admin/categories/:name (admin)
    - POST /api/admin/announcements (admin)
    - GET /api/admin/announcements (public)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 13.3 Write property test for settings persistence

    - **Property 13: Settings Persistence**
    - **Validates: Requirements 8.1, 8.2, 8.3**

- [ ] 14. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Error Handling and Validation

  - [x] 15.1 Create global error handler middleware

    - Handle Mongoose validation errors
    - Handle JWT errors
    - Handle custom application errors
    - Return consistent error response format
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 15.2 Add input validation with express-validator

    - Add validation for registration inputs
    - Add validation for auction creation inputs
    - Add validation for bid inputs
    - Sanitize inputs to prevent injection
    - _Requirements: 10.5_

  - [x] 15.3 Write property test for JSON round-trip

    - **Property 14: JSON Round-Trip**
    - **Validates: Requirements 9.4, 9.5**

- [ ] 16. Final Integration

  - [x] 16.1 Wire all routes to Express app

    - Mount auth routes at /api/auth
    - Mount user routes at /api/users
    - Mount auction routes at /api/auctions
    - Mount admin routes at /api/admin
    - _Requirements: All_

  - [x] 16.2 Initialize Socket.IO with Express server

    - Attach Socket.IO to HTTP server
    - Configure CORS for socket connections
    - Start scheduler service
    - _Requirements: 7.1_

  - [x] 16.3 Write end-to-end integration tests

    - Test complete user registration and login flow
    - Test complete auction creation and bidding flow
    - Test seller approval workflow
    - Test admin operations
    - _Requirements: All_

- [x] 17. Final Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.
