# Event Management API

A comprehensive REST API for managing events and user registrations built with Node.js, Express, and PostgreSQL. This system enables event organizers to create events, manage user registrations, track capacity utilization, and enforce business rules to prevent overbooking and duplicate registrations.

## 🚀 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Runtime**: ES6+ with ES Modules
- **Hosting**: Render (Production Database)
- **Development Tools**: Postman/Thunder Client for API testing

## ✨ Features

- **Event Management**: Create and manage events with capacity limits (max 1000 attendees)
- **User Registration System**: Register users and manage event attendance
- **Real-time Statistics**: Track registration counts and capacity utilization
- **Business Logic Enforcement**: 
  - Prevents duplicate registrations per user/event
  - Blocks registration for past events
  - Enforces capacity limits to prevent overbooking
- **Data Validation**: Comprehensive input validation and error handling
- **Robust Database Design**: Foreign key constraints and unique indexes
- **RESTful API Design**: Clean, intuitive endpoints following REST conventions

## 📋 Prerequisites

- **Node.js** (v14.0.0 or higher)  
- **npm** (v6.0.0 or higher)
- **Git** for version control

*No PostgreSQL installation required - using production database!*

## 🚀 Quick Start (3 Steps Only!)

### 1. Clone & Navigate
```bash
git clone https://github.com/mitengala51/Event-Management-API.git
cd Event-Management-API
```

### 2. Install Dependencies  
```bash
npm install
```

### 3. Run the Server
```bash
npm start
```

**That's it!** 🎉 The API will be running at `http://localhost:3000` with a production database already configured.

## 🚀 Running the Backend

### Local Development

1. **Start the server**:
   ```bash
   node server.js
   ```

2. **Verify the connection**:
   You should see these messages in your console:
   ```
   DB connected
   Server running on port 3000
   ```

### Testing the API

#### Using Postman

1. Import the following endpoints into Postman
2. **For Local Development**: Set the base URL to `http://localhost:3000`
3. **For Production Testing**: Set the base URL to `https://event-management-api-1-9a9f.onrender.com`
4. Use the request examples provided in the API Documentation section below

**💡 Tip**: When testing the production URL, be patient with the first request as it may take 50+ seconds to respond due to the free tier spin-up delay.

## 📚 API Documentation

### Base URLs

**Local Development:**
```
http://localhost:3000
```

**Production (Deployed):**
```
https://event-management-api-1-9a9f.onrender.com
```

⚠️ **Important Note**: The production API is hosted on Render's free tier. **Your free instance will spin down with inactivity, which can delay requests by 50 seconds or more** on the first request after inactivity. Subsequent requests will be fast.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/create-events` | Create a new event |
| POST | `/api/create-user` | Create a new user |
| POST | `/api/register` | Register user for an event |
| GET | `/api/event/:eventId` | Get event details with registered users |
| GET | `/api/upcoming-events` | List all upcoming events |
| GET | `/api/events-stats/:eventId` | Get event registration statistics |
| DELETE | `/api/cancel-registeration` | Cancel user registration |

### Request/Response Examples

#### Create Event
```bash
POST /api/create-events
Content-Type: application/json

{
  "title": "Tech Conference 2024",
  "date": "2024-12-15",
  "location": "Mumbai Convention Center",
  "capacity": 500
}

# Response
{
  "event_id": 1
}
```

#### Register for Event
```bash
POST /api/register
Content-Type: application/json

{
  "user_id": 1,
  "event_id": 1
}

# Response
{
  "message": "You've successfully registered for the event!"
}
```

#### Get Event Statistics
```bash
GET /api/events-stats/1

# Response
{
  "total_registeration": 150,
  "remainig_capacity": 350,
  "percentage_used": "30.00%"
}
```

## 🗂️ Project Structure

```
Event-Management-API/
├── server.js              # Main application file with all routes and logic
├── package.json           # Dependencies and npm scripts
└── README.md             # Project documentation
```

## ⚙️ Environment Configuration

### Database Configuration

**✅ Pre-configured Production Database**

The application uses a production PostgreSQL database hosted on Render. No environment variables or additional configuration needed!

```javascript
// Already configured in server.js
const db = new pg.Client({
  connectionString: "postgresql://event_management_yg5p_user:SWDO4boWRgZaWauJXEPvl44b0cz3n2IO@dpg-d25268ili9vc73erj380-a.oregon-postgres.render.com/event_management_yg5p",
  ssl: {
    rejectUnauthorized: false
  }
});
```

### For Development/Customization

If you want to use your own database, you can modify the connection in `server.js`:

```javascript
const db = new pg.Client({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "Event Management",
  port: process.env.DB_PORT || 5432,
});
```

## 🚢 Deployment

### Live Production API

**✅ Already Deployed!** 

The API is live and accessible at:
```
https://event-management-api-1-9a9f.onrender.com
```

**⚠️ Free Tier Limitation**: The production API is hosted on Render's free tier. **Your free instance will spin down with inactivity, which can delay requests by 50 seconds or more** on the first request after periods of inactivity. Subsequent requests will be fast and responsive.

### Deploy Your Own Instance

#### Deploy to Render

1. **Fork this repository**
2. **Connect to Render**:
   - Create a Render account
   - Connect your GitHub repository
   - Choose "Web Service" deployment

3. **Configure Build Settings**:
   ```
   Build Command: npm install
   Start Command: node server.js
   ```

4. **Environment Variables**: None required (database already configured)

5. **Deploy**: Render will automatically deploy your instance

#### Deploy to Heroku

1. **Create `package.json` start script** (already included):
   ```json
   {
     "scripts": {
       "start": "node server.js"
     }
   }
   ```

2. **Deploy**:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

## 🧪 Testing

### Manual Testing Workflow

1. **Create a user**:
   ```bash
   POST /api/create-user
   {"name": "Test User", "email": "test@example.com"}
   ```

2. **Create an event**:
   ```bash
   POST /api/create-events
   {"title": "Test Event", "date": "2024-12-31", "location": "Test Location", "capacity": 100}
   ```

3. **Register for the event**:
   ```bash
   POST /api/register
   {"user_id": 1, "event_id": 1}
   ```

4. **Check event statistics**:
   ```bash
   GET /api/events-stats/1
   ```

5. **View upcoming events**:
   ```bash
   GET /api/upcoming-events
   ```

### Expected Responses

- Successful operations return `200` status with success messages
- Validation errors return `400` status with descriptive error messages
- Business rule violations return `409` status (conflicts)
- Missing resources return `404` status

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection Failed
```
Error: connect ECONNREFUSED
```
**Solution**: 
- The app uses a production database, so this shouldn't occur
- If it does, check your internet connection
- Verify the production database is accessible

#### Server Timeout/Slow Response
```
Request taking 50+ seconds on production
```
**Solution**: 
- **Expected behavior** on Render's free tier
- The instance spins down after inactivity
- First request after inactivity takes 50+ seconds to wake up
- Subsequent requests will be fast
- For faster response times, consider upgrading to a paid tier

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**:
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
```

#### Table Does Not Exist
```
Error: relation "events" does not exist
```
**Solution**: This shouldn't occur as the production database is pre-configured. If it happens, contact the repository maintainer.

#### Event Date Validation Error
```
{"message": "Event date must be a future date"}
```
**Solution**: Ensure the event date is in the future and in YYYY-MM-DD format.

#### Capacity Exceeded
```
{"message": "Capacity must be less than 1000"}
```
**Solution**: Set event capacity to 1000 or less.

### Debug Mode

Add console logging for debugging:
```javascript
console.log('Request body:', req.body);
console.log('Database result:', data.rows);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, questions, or bug reports:
- Open an issue in the GitHub repository
- Contact the development team

---

**Built with ❤️ using Node.js, Express, and PostgreSQL**
