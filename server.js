import express from "express";
import pg from "pg";

const app = express();

const db = new pg.Client({
  user: "postgres",
  password: "password",
  host: "localhost",
  database: "Event Management",
  port: 5432,
});

db.connect().then(() => console.log("DB connected"));
app.use(express.json());

// Global Current Date
const current_date = new Date().toISOString().slice(0, 10).toString();

// Create Event
app.post("/api/create-events", async (req, res) => {
  try {
    const { title, date, location, capacity } = req.body;

    if (!title || !date || !location || !capacity) {
      return res
        .status(404)
        .json({ message: "Please fill in all the required fields" });
    }

    if (date < current_date) {
      return res
        .status(400)
        .json({ message: "Event date must be a future date" });
    }

    const data = await db.query(
      "INSERT INTO events(title, event_date, location, capacity) VALUES($1,$2,$3,$4) RETURNING event_id",
      [title, date, location, capacity]
    );

    if (data.rows.length === 0) {
      return res.status(404).json({ message: "Event ID not found" });
    }

    res.status(200).json({ event_id: data.rows[0].event_id });
  } catch (error) {

    if (error.code === "23514" && error.constraint === "events_capacity_check") {
      return res
        .status(409)
        .json({ message: "Capacity must be less than 1000" });
    }

    console.log(error);

    res.status(500).json({ message: "Event creation failed: An unexpected error occurred. Please try again later" })
  }
});

// Create User
app.post("/api/create-user", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(404).json({ message: "All Fields required" });
    }

    await db.query("INSERT INTO users (name, email) VALUES($1,$2)", [
      name,
      email,
    ]);

    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "User creation failed: An unexpected error occurred. Please try again later" })
  }
});

// All Events + Registered Users
app.get("/api/event/:eventId", async (req, res) => {
  try {
    const event_id = req.params.eventId
    const data = await db.query("SELECT * FROM events WHERE event_id = $1", [event_id]);

    if(data.rows.length === 0){
      return res.status(404).json({ message: "Event not found" })
    }

    const event = data.rows;

    const users = await db.query("SELECT users.*, event_registrations.user_id FROM event_registrations INNER JOIN users on users.user_id = event_registrations.user_id WHERE event_id = $1", [event_id])

    if(users.rows.length === 0){
      return res.status(404).json({ event, message: "No user registered for this event" })
    }

    const registered_users = users.rows
    res.status(200).json({ event , registered_users});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to load event details: An unexpected error occurred. Please try again later" })
  }
});

// Register the user in the event
app.post("/api/register", async (req, res) => {
  try {
    const { user_id, event_id } = req.body;

    const total_registrations = await db.query(
      "SELECT COUNT(*) AS total_registrations FROM event_registrations WHERE event_id = $1",
      [event_id]
    );
    const response = await db.query(
      "SELECT capacity,event_date FROM events WHERE event_id=$1",
      [event_id]
    );

    if (total_registrations.rows.length === 0 || response.rows.length === 0) {
      return res.status(404).json({
        message:
          "We are unable to retrieve event details at this moment. Please try again later.",
      });
    }

    if (
      total_registrations.rows[0].total_registrations >
      response.rows[0].capacity
    ) {
      return res.json({
        message: "We are sorry, but this event is now fully booked",
      });
    }

    const ISO_FORMAT_EVENT_DATE = response.rows[0].event_date
      .toISOString()
      .slice(0, 10);

    if (ISO_FORMAT_EVENT_DATE < current_date) {
      return res.json({
        message: "Registration is only available for upcoming events",
      });
    }

    const data = await db.query(
      "INSERT INTO event_registrations (user_id, event_id) VALUES($1,$2) RETURNING *",
      [user_id, event_id]
    );

    if (data.rows.length === 0) {
      return res.status(400).json({ message: "User registeration failed" });
    }

    res
      .status(200)
      .json({ message: "You've successfully registered for the event!" });
  } catch (error) {

    if (error.code === "23505" && error.constraint === "unique_user_event") {
      return res
        .status(409)
        .json({ message: "You are already registered for this event" });
    }

    console.log(error);

    res.status(500).json({ message: "Registration failed: An unexpected error occurred. Please try again later" })
  }
});

// Cancel Registeration of a event
app.delete("/api/cancel-registeration", async (req, res) => {
  try {
    const { user_id, event_id } = req.body;

    if (!user_id || !event_id) {
      return res.status(404).json({ message: "Event ID or User ID not found" });
    }

    const data = await db.query(
      "DELETE FROM event_registrations WHERE user_id = $1 AND event_id = $2 RETURNING *",
      [user_id, event_id]
    );

    if (data.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "User ID or Event ID dont exist" });
    }

    res
      .status(200)
      .json({ message: "Your registration has been successfully cancelled" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Cancellation failed: An unexpected error occurred. Please try again later" })
  }
});

// Shows the upcoming events - Completed
app.get("/api/upcoming-events", async (req, res) => {
  try {
    const data = await db.query(
      "SELECT * FROM events ORDER BY event_date, location"
    );

    if (data.rows.length === 0) {
      return res.status(404).json({ message: "There are no upcoming events" });
    }

    const events = data.rows;
    const upcoming_events = events.filter(
      (event) => event.event_date.toISOString().slice(0, 10).toString() > current_date
    );
    console.log(upcoming_events);
    res.status(201).json({ upcoming_events });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to load upcoming events: An unexpected error occurred. Please try again later" })
  }
});

app.get("/api/events-stats/:eventId", async (req, res) => {
  try {
    const event_id = req.params.eventId;

    const data = await db.query(
      "SELECT COUNT(user_id) as total_registeration from event_registrations WHERE event_id = $1",
      [event_id]
    );

    if(data.rows.length === 0){
      return res.status(404).json({ message: 'No registrations found for this event' })
    }

    console.log(data.rows[0].total_registeration);

    const total_registeration = parseInt(data.rows[0].total_registeration);
    const response = await db.query(
      "SELECT capacity FROM events WHERE event_id = $1",
      [event_id]
    );

    if(response.rows.length === 0){
      return res.status(404).json({ message:  'Event not found' })
    }

    const capacity = response.rows[0].capacity;
    const remainig_capacity = capacity - total_registeration;
    console.log(remainig_capacity);

    const percentage_used = (
      (total_registeration / capacity) *
      100
    ).toFixed(2)
    console.log(percentage_used);

    res.status(200).json({ total_registeration, remainig_capacity, percentage_used: `${percentage_used}%` })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to load event statistics: An unexpected error occurred. Please try again later" })
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
