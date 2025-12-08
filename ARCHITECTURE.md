# 🔄 BidMaster Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  http://localhost:5174                                           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Register     │  │ Login        │  │ Auctions     │          │
│  │ Page         │  │ Page         │  │ Dashboard    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                   │                  │
│         └─────────────────┴───────────────────┘                  │
│                           │                                      │
│                    React Frontend                                │
│                     (Port 5174)                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                  HTTP Requests (axios)
                  WebSocket (Socket.IO)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS BACKEND                               │
│                     (Port 5000)                                  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Routes                              │  │
│  │                                                             │  │
│  │  /api/auth/register  →  authController.register()         │  │
│  │  /api/auth/login     →  authController.login()            │  │
│  │  /api/auctions       →  auctionController.getAuctions()   │  │
│  │  /api/auctions/:id   →  auctionController.getById()       │  │
│  │  /api/auctions/:id/bid → auctionController.placeBid()     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Middleware                              │  │
│  │                                                             │  │
│  │  • CORS (allow frontend requests)                         │  │
│  │  • Auth (verify JWT tokens)                               │  │
│  │  • Validation (check input data)                          │  │
│  │  • Error Handler (catch & format errors)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Services                                │  │
│  │                                                             │  │
│  │  • auctionService (business logic)                        │  │
│  │  • socketService (real-time updates)                      │  │
│  │  • schedulerService (cron jobs)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Models (Mongoose)                       │  │
│  │                                                             │  │
│  │  • User.js (user schema & methods)                        │  │
│  │  • Auction.js (auction schema & methods)                  │  │
│  │  • Settings.js (platform settings)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                      │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                    Mongoose ODM
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB Database                            │
│              mongodb://localhost:27017/auction-platform          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ users        │  │ auctions     │  │ settings     │          │
│  │ collection   │  │ collection   │  │ collection   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  Stores all data permanently                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Registration Flow

```
User fills form → Frontend validates → Sends POST request
                                            ↓
                                    Backend receives
                                            ↓
                                    Validates data
                                            ↓
                                    Hashes password
                                            ↓
                                    Saves to MongoDB
                                            ↓
                                    Generates JWT token
                                            ↓
                                    Returns token + user data
                                            ↓
                                    Frontend stores token
                                            ↓
                                    Redirects to homepage
```

### Detailed Steps:

**1. Frontend (Register.jsx):**

```javascript
// User clicks "Create Account"
const result = await register(username, email, password, role)
```

**2. Auth Context (AuthContext.jsx):**

```javascript
// Calls API
const response = await authAPI.register({
  username,
  email,
  password,
  role,
})
```

**3. API Service (api.js):**

```javascript
// POST request with data
axios.post('/auth/register', userData)
```

**4. Backend Route (auth.js):**

```javascript
router.post('/auth/register', validate, authController.register)
```

**5. Controller (authController.js):**

```javascript
// Validate → Hash password → Create user → Generate token
const user = await User.create({ username, email, password, role })
const token = jwt.sign({ id: user._id }, JWT_SECRET)
```

**6. MongoDB:**

```javascript
// User document saved
{
  _id: ObjectId("..."),
  username: "john_doe",
  email: "john@example.com",
  password: "$2a$10$hashed...",  // Hashed, not plain text!
  role: "bidder",
  createdAt: "2025-12-07T..."
}
```

**7. Response to Frontend:**

```javascript
{
  success: true,
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: {
    id: "...",
    username: "john_doe",
    email: "john@example.com",
    role: "bidder"
  }
}
```

**8. Frontend Storage:**

```javascript
localStorage.setItem('token', token)
localStorage.setItem('user', JSON.stringify(user))
```

---

## Login Flow

```
User enters credentials → Frontend validates → POST /api/auth/login
                                                        ↓
                                                Backend finds user
                                                        ↓
                                                Compare passwords
                                                        ↓
                                                Generate new token
                                                        ↓
                                                Return token + user
                                                        ↓
                                                Frontend stores token
                                                        ↓
                                                Auto-attach to requests
```

---

## Auction Bidding Flow (Real-time)

```
1. User opens auction page
         ↓
2. Frontend connects to Socket.IO
         ↓
3. Joins auction room: "auction_123"
         ↓
4. User places bid
         ↓
5. POST /api/auctions/123/bid with JWT token
         ↓
6. Backend validates:
   - Token valid?
   - User authenticated?
   - Bid higher than current?
   - Auction still active?
         ↓
7. Save bid to MongoDB
         ↓
8. Emit Socket.IO event "bidUpdate" to all in room
         ↓
9. All connected users see new bid instantly
         ↓
10. Update UI with new highest bid
```

---

## Database Collections Structure

### Users Collection

```javascript
db.users.insertOne({
  username: 'john_doe',
  email: 'john@example.com',
  password: '$2a$10$hashed_password...',
  role: 'bidder', // or "seller", "admin"
  sellerStatus: 'none', // or "pending", "approved", "rejected"
  isValidated: true,
  isAdmin: false,
  status: 'active', // or "suspended", "banned"

  // Profile info
  name: 'John Doe',
  phone: '+1234567890',
  address: '123 Main St',
  profilePhoto: 'https://...',

  // Activity tracking
  bids: [ObjectId('auction_id_1'), ObjectId('auction_id_2')],
  wonItems: [ObjectId('auction_id_3')],

  createdAt: ISODate('2025-12-07T10:00:00.000Z'),
  updatedAt: ISODate('2025-12-07T10:00:00.000Z'),
})
```

### Auctions Collection

```javascript
db.auctions.insertOne({
  title: 'Vintage Rolex Watch',
  description: 'Beautiful vintage Rolex...',
  category: 'Watches',

  // Pricing
  startingPrice: 10000,
  currentPrice: 12500,

  image: 'https://images.unsplash.com/...',

  // Timing
  endTime: ISODate('2025-12-08T10:00:00.000Z'),
  status: 'active', // or "ended", "cancelled"

  // Seller info
  seller: ObjectId('user_id'),
  sellerName: 'John Seller',

  // Winner info (when auction ends)
  winnerId: ObjectId('user_id'),
  winnerName: 'Jane Winner',

  // Bid history
  bids: [
    {
      _id: ObjectId('...'),
      bidderId: ObjectId('user_id'),
      bidderName: 'Jane Bidder',
      amount: 12500,
      timestamp: ISODate('2025-12-07T11:30:00.000Z'),
    },
    {
      _id: ObjectId('...'),
      bidderId: ObjectId('user_id_2'),
      bidderName: 'Bob Bidder',
      amount: 12000,
      timestamp: ISODate('2025-12-07T11:00:00.000Z'),
    },
  ],

  createdAt: ISODate('2025-12-07T10:00:00.000Z'),
  updatedAt: ISODate('2025-12-07T11:30:00.000Z'),
})
```

---

## Authentication Flow

### How JWT Token Works:

```
1. User logs in → Backend generates token
         ↓
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
   eyJpZCI6IjY3NTRhMjM0ZjU2NzgiLCJpYXQiOjE3MzM1Nzg0MDB9.
   SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
         ↓
2. Frontend stores in localStorage
         ↓
3. Every API request includes token in header:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
         ↓
4. Backend middleware verifies token:
   - Valid signature?
   - Not expired?
   - User exists?
         ↓
5. If valid, request proceeds
   If invalid, return 401 Unauthorized
```

### Token Contents (decoded):

```json
{
  "id": "6754a234f5678", // User ID
  "iat": 1733578400, // Issued at (timestamp)
  "exp": 1734183200 // Expires at (timestamp)
}
```

---

## Real-time Updates with Socket.IO

```
┌──────────────┐         WebSocket          ┌──────────────┐
│   Browser 1  │◄───────────────────────────►│              │
│  (Bidder A)  │                              │              │
└──────────────┘                              │              │
                                              │   Backend    │
┌──────────────┐         WebSocket          │   Socket.IO  │
│   Browser 2  │◄───────────────────────────►│    Server    │
│  (Bidder B)  │                              │              │
└──────────────┘                              │              │
                                              │              │
┌──────────────┐         WebSocket          │              │
│   Browser 3  │◄───────────────────────────►│              │
│   (Seller)   │                              └──────────────┘
└──────────────┘
```

### Events:

- `connection` - User connects
- `joinAuction` - User joins specific auction room
- `bidUpdate` - New bid placed (broadcasted to room)
- `auctionEnded` - Auction time expired
- `outbid` - User was outbid by someone
- `disconnect` - User leaves

---

## Data Storage in MongoDB

### How Data is Saved:

**1. Insert new document:**

```javascript
// Backend code
const user = await User.create({
  username: "john_doe",
  email: "john@example.com",
  password: hashedPassword
})

// MongoDB stores:
{
  _id: ObjectId("6754a234f5678abc123def45"),
  username: "john_doe",
  email: "john@example.com",
  password: "$2a$10$hashed...",
  createdAt: ISODate("2025-12-07T10:00:00Z"),
  updatedAt: ISODate("2025-12-07T10:00:00Z")
}
```

**2. Find documents:**

```javascript
// Find user by email
const user = await User.findOne({ email: 'john@example.com' })

// Find all active auctions
const auctions = await Auction.find({ status: 'active' })

// Find by ID
const auction = await Auction.findById('auction_id_here')
```

**3. Update documents:**

```javascript
// Update user profile
await User.findByIdAndUpdate(userId, {
  name: 'John Doe Updated',
  phone: '+1987654321',
})

// Add bid to auction
auction.bids.push({
  bidderId: userId,
  bidderName: 'John',
  amount: 15000,
  timestamp: new Date(),
})
await auction.save()
```

**4. Delete documents:**

```javascript
// Delete auction
await Auction.findByIdAndDelete(auctionId)

// Delete user
await User.findByIdAndDelete(userId)
```

---

## Environment Variables Explained

### Backend `.env`:

```env
# Where is your MongoDB?
MONGODB_URI=mongodb://localhost:27017/auction-platform
             ^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^
             MongoDB server         Database name

# Secret key to sign JWT tokens (keep this secret!)
JWT_SECRET=your-super-secret-key-min-32-chars

# How long until token expires?
JWT_EXPIRE=7d

# What port should backend run on?
PORT=5000

# Development or production?
NODE_ENV=development

# Where is frontend? (for CORS)
FRONTEND_URL=http://localhost:5174
```

### Frontend `.env` (optional):

```env
# Where is backend API?
VITE_API_URL=http://localhost:5000/api
```

---

## Security Features

1. **Password Hashing**: Passwords stored as bcrypt hashes, never plain text
2. **JWT Authentication**: Stateless, secure token-based auth
3. **CORS Protection**: Only frontend URL can access API
4. **Input Validation**: All inputs validated before processing
5. **Role-Based Access**: Admin, seller, bidder permissions
6. **Rate Limiting**: Prevent abuse (can be added)
7. **SQL Injection Protection**: Mongoose handles escaping

---

## Summary

**Frontend** (React + Vite):

- User interface
- Makes HTTP requests
- Connects via WebSocket
- Stores JWT token

**Backend** (Node.js + Express):

- REST API endpoints
- Business logic
- Authentication
- Real-time with Socket.IO
- Cron jobs for automation

**Database** (MongoDB):

- Stores all data permanently
- Users, auctions, bids
- NoSQL document structure
- Accessed via Mongoose

**Flow**: User → Frontend → Backend → Database → Backend → Frontend → User

Everything works together to create a complete auction platform! 🚀
