import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { setupWebSocket } from "./src/socket";
import db from "./src/db";
import jwt from "jsonwebtoken";

// Ensure 'type' column exists in rides table
try {
  db.exec("ALTER TABLE rides ADD COLUMN type TEXT DEFAULT 'standard'");
} catch (e) {
  // Column already exists
}

// Ensure 'car_model' and 'phone' columns exist in users table
try { db.exec("ALTER TABLE users ADD COLUMN car_model TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN phone TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN lat REAL"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN lng REAL"); } catch (e) {}
// Ensure 'cancellation_reason' column exists in rides table
try {
  db.exec("ALTER TABLE rides ADD COLUMN cancellation_reason TEXT");
} catch (e) {
  // Column already exists
}
// Ensure 'scheduled_at' and 'driver_cancellation_reason' columns exist in rides table
try {
  db.exec("ALTER TABLE rides ADD COLUMN scheduled_at DATETIME");
  db.exec("ALTER TABLE rides ADD COLUMN driver_cancellation_reason TEXT");
} catch (e) {
  // Columns already exist
}

import cookieParser from "cookie-parser";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "cabgo-secret-key";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2025-02-24.acacia" as any,
});

async function startServer() {
  const app = express();
  const server = createServer(app);
  const ws = setupWebSocket(server);
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // API Routes
  app.post("/api/auth/signup", (req, res) => {
    const { name, email, password, role } = req.body;
    const id = Math.random().toString(36).substring(7);
    try {
      db.prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)")
        .run(id, name, email, password, role);
      const token = jwt.sign({ id, email, role }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ user: { id, name, email, role } });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  app.get("/api/auth/me", authenticate, (req: any, res) => {
    const user: any = db.prepare("SELECT id, name, email, role, profile_pic, rating, is_online, car_model, phone FROM users WHERE id = ?").get(req.user.id);
    res.json({ user });
  });

  app.post("/api/user/update", authenticate, (req: any, res) => {
    const { name, email, profile_pic, car_model, phone } = req.body;
    try {
      db.prepare("UPDATE users SET name = ?, email = ?, profile_pic = ?, car_model = ?, phone = ? WHERE id = ?")
        .run(name || '', email || '', profile_pic || '', car_model || '', phone || '', req.user.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/driver/status", authenticate, (req: any, res) => {
    if (req.user.role !== 'driver') return res.status(403).json({ error: "Unauthorized" });
    const { is_online } = req.body;
    db.prepare("UPDATE users SET is_online = ? WHERE id = ?").run(is_online ? 1 : 0, req.user.id);
    res.json({ success: true });
  });

  app.post("/api/driver/location", authenticate, (req: any, res) => {
    if (req.user.role !== 'driver') return res.status(403).json({ error: "Unauthorized" });
    const { lat, lng } = req.body;
    
    db.prepare("UPDATE users SET lat = ?, lng = ? WHERE id = ?").run(lat, lng, req.user.id);
    
    // Broadcast location to all users (in a real app, only to the rider of the active ride)
    ws.broadcast({ type: "DRIVER_LOCATION_UPDATE", driverId: req.user.id, lat, lng });
    res.json({ success: true });
  });

  app.get("/api/drivers/nearby", (req, res) => {
    try {
      const drivers = db.prepare("SELECT id, name, lat, lng, car_model as car, rating FROM users WHERE role = 'driver' AND is_online = 1 AND lat IS NOT NULL").all();
      res.json({ drivers });
    } catch (e: any) {
      console.error('Nearby drivers error:', e);
      res.status(500).json({ error: e.message, drivers: [] });
    }
  });

  app.get("/api/driver/info/:id", authenticate, (req, res) => {
    const { id } = req.params;
    const driver: any = db.prepare("SELECT name, car_model as car, rating, profile_pic as image FROM users WHERE id = ? AND role = 'driver'").get(id);
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    res.json(driver);
  });

  app.get("/api/driver/earnings", authenticate, (req: any, res) => {
    if (req.user.role !== 'driver') return res.status(403).json({ error: "Unauthorized" });
    
    const driverId = req.user.id;
    
    // Day earnings
    const dayEarnings: any = db.prepare(`
      SELECT SUM(fare) as total FROM rides 
      WHERE driver_id = ? AND status = 'completed' 
      AND date(created_at) = date('now')
    `).get(driverId);
    
    // Week earnings
    const weekEarnings: any = db.prepare(`
      SELECT SUM(fare) as total FROM rides 
      WHERE driver_id = ? AND status = 'completed' 
      AND date(created_at) >= date('now', '-7 days')
    `).get(driverId);
    
    // Month earnings
    const monthEarnings: any = db.prepare(`
      SELECT SUM(fare) as total FROM rides 
      WHERE driver_id = ? AND status = 'completed' 
      AND date(created_at) >= date('now', 'start of month')
    `).get(driverId);
    
    res.json({
      day: dayEarnings?.total || 0,
      week: weekEarnings?.total || 0,
      month: monthEarnings?.total || 0
    });
  });

  app.post("/api/promo/validate", authenticate, (req: any, res) => {
    const { code } = req.body;
    const promo: any = db.prepare("SELECT * FROM promo_codes WHERE code = ? AND is_active = 1").get(code);
    if (!promo) return res.status(404).json({ error: "Invalid or expired promo code" });
    res.json({ discount_percent: promo.discount_percent });
  });

  app.post("/api/rides/request", authenticate, (req: any, res) => {
    const { pickup_address, dropoff_address, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, fare, type, promo_code, scheduled_at } = req.body;
    const id = Math.random().toString(36).substring(7);
    db.prepare(`
      INSERT INTO rides (id, rider_id, pickup_address, dropoff_address, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, fare, type, promo_code, scheduled_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, pickup_address, dropoff_address, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, fare, type || 'standard', promo_code || null, scheduled_at || null);
    
    // Fetch rider rating
    const rider = db.prepare("SELECT rating FROM users WHERE id = ?").get(req.user.id) as { rating: number };

    // Only notify drivers if it's an immediate request (not scheduled for later)
    if (!scheduled_at) {
      // Notify only online drivers
      const onlineDrivers = db.prepare("SELECT id FROM users WHERE role = 'driver' AND is_online = 1").all() as { id: string }[];
      onlineDrivers.forEach(driver => {
        ws.sendToUser(driver.id, { 
          type: "NEW_RIDE_REQUEST", 
          ride: { 
            id, 
            pickup_address, 
            dropoff_address, 
            fare, 
            type: type || 'standard',
            rider_rating: rider?.rating || 4.8
          } 
        });
      });
    }
    
    res.json({ rideId: id });
  });

  app.post("/api/rides/cancel", authenticate, (req: any, res) => {
    const { rideId, reason } = req.body;
    const ride: any = db.prepare("SELECT * FROM rides WHERE id = ?").get(rideId);
    if (!ride || ride.rider_id !== req.user.id) return res.status(403).json({ error: "Unauthorized" });
    if (ride.status !== 'requested' && ride.status !== 'accepted') return res.status(400).json({ error: "Cannot cancel ride in progress" });

    db.prepare("UPDATE rides SET status = 'cancelled', cancellation_reason = ? WHERE id = ?").run(reason || null, rideId);
    ws.broadcast({ type: "RIDE_CANCELLED", rideId });
    res.json({ success: true });
  });

  app.post("/api/rides/accept", authenticate, (req: any, res) => {
    if (req.user.role !== 'driver') return res.status(403).json({ error: "Only drivers can accept rides" });
    const { rideId } = req.body;
    db.prepare("UPDATE rides SET driver_id = ?, status = 'accepted' WHERE id = ?").run(req.user.id, rideId);
    
    const ride: any = db.prepare("SELECT * FROM rides WHERE id = ?").get(rideId);
    ws.sendToUser(ride.rider_id, { type: "RIDE_ACCEPTED", driverId: req.user.id });
    
    res.json({ success: true });
  });

  app.post("/api/rides/arrive", authenticate, (req: any, res) => {
    if (req.user.role !== 'driver') return res.status(403).json({ error: "Only drivers can mark arrival" });
    const { rideId } = req.body;
    
    const ride: any = db.prepare("SELECT * FROM rides WHERE id = ?").get(rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });
    
    ws.sendToUser(ride.rider_id, { type: "DRIVER_ARRIVED", rideId });
    res.json({ success: true });
  });

  app.post("/api/rides/start", authenticate, (req: any, res) => {
    if (req.user.role !== 'driver') return res.status(403).json({ error: "Only drivers can start rides" });
    const { rideId } = req.body;
    db.prepare("UPDATE rides SET status = 'in_progress' WHERE id = ?").run(rideId);
    
    const ride: any = db.prepare("SELECT * FROM rides WHERE id = ?").get(rideId);
    ws.sendToUser(ride.rider_id, { type: "RIDE_STARTED", rideId });
    
    res.json({ success: true });
  });

  app.post("/api/rides/complete", authenticate, (req: any, res) => {
    if (req.user.role !== 'driver') return res.status(403).json({ error: "Only drivers can complete rides" });
    const { rideId } = req.body;
    db.prepare("UPDATE rides SET status = 'completed' WHERE id = ?").run(rideId);
    
    const ride: any = db.prepare("SELECT * FROM rides WHERE id = ?").get(rideId);
    ws.sendToUser(ride.rider_id, { type: "RIDE_COMPLETED", rideId });
    
    res.json({ success: true });
  });

  app.post("/api/rides/driver-cancel", authenticate, (req: any, res) => {
    if (req.user.role !== 'driver') return res.status(403).json({ error: "Only drivers can cancel rides" });
    const { rideId, reason } = req.body;
    
    const ride: any = db.prepare("SELECT * FROM rides WHERE id = ?").get(rideId);
    if (!ride || ride.driver_id !== req.user.id) return res.status(403).json({ error: "Unauthorized" });

    db.prepare("UPDATE rides SET status = 'cancelled', driver_cancellation_reason = ? WHERE id = ?").run(reason || null, rideId);
    ws.sendToUser(ride.rider_id, { type: "RIDE_CANCELLED_BY_DRIVER", rideId, reason });
    res.json({ success: true });
  });

  app.post("/api/drivers/favorite", authenticate, (req: any, res) => {
    const { driverId, isFavorite } = req.body;
    try {
      if (isFavorite) {
        db.prepare("INSERT OR IGNORE INTO favorite_drivers (rider_id, driver_id) VALUES (?, ?)").run(req.user.id, driverId);
      } else {
        db.prepare("DELETE FROM favorite_drivers WHERE rider_id = ? AND driver_id = ?").run(req.user.id, driverId);
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/drivers/favorites", authenticate, (req: any, res) => {
    const favorites = db.prepare(`
      SELECT u.id, u.name, u.rating, u.car_model, u.profile_pic
      FROM favorite_drivers f
      JOIN users u ON f.driver_id = u.id
      WHERE f.rider_id = ?
    `).all(req.user.id);
    res.json({ favorites });
  });

  app.post("/api/rides/rate", authenticate, (req: any, res) => {
    const { rideId, rating, review } = req.body;
    const ride: any = db.prepare("SELECT * FROM rides WHERE id = ?").get(rideId);
    if (!ride || ride.rider_id !== req.user.id) return res.status(403).json({ error: "Unauthorized" });

    const id = Math.random().toString(36).substring(7);
    db.prepare("INSERT INTO ratings (id, ride_id, driver_id, rider_id, rating, review) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, rideId, ride.driver_id, req.user.id, rating, review);
    
    // Update driver's average rating
    const avgRating: any = db.prepare("SELECT AVG(rating) as avg FROM ratings WHERE driver_id = ?").get(ride.driver_id);
    db.prepare("UPDATE users SET rating = ? WHERE id = ?").run(avgRating.avg, ride.driver_id);

    res.json({ success: true });
  });

  app.get("/api/rides/history", authenticate, (req: any, res) => {
    const { startDate, endDate, driverId, carModel, minPrice, maxPrice, sortBy, order } = req.query;
    let query = `
      SELECT 
        r.*, 
        u.name as driver_name, 
        u.rating as driver_avg_rating, 
        u.car_model, 
        u.phone as driver_phone,
        u.profile_pic as driver_image,
        rt.rating as user_rating,
        rt.review as user_review
      FROM rides r
      LEFT JOIN users u ON r.driver_id = u.id
      LEFT JOIN ratings rt ON r.id = rt.ride_id
      WHERE (r.rider_id = ? OR r.driver_id = ?)
    `;
    const params: any[] = [req.user.id, req.user.id];

    if (startDate) {
      query += ` AND date(r.created_at) >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND date(r.created_at) <= ?`;
      params.push(endDate);
    }
    if (driverId) {
      query += ` AND r.driver_id = ?`;
      params.push(driverId);
    }
    if (carModel) {
      query += ` AND u.car_model LIKE ?`;
      params.push(`%${carModel}%`);
    }
    if (minPrice) {
      query += ` AND r.fare >= ?`;
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      query += ` AND r.fare <= ?`;
      params.push(Number(maxPrice));
    }

    const validSortFields = ['created_at', 'fare', 'status', 'driver_name', 'car_model'];
    let sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    
    // Map sort fields to their actual column names if they are from joined tables
    if (sortField === 'driver_name') sortField = 'u.name';
    if (sortField === 'car_model') sortField = 'u.car_model';
    else if (sortField !== 'u.name' && sortField !== 'u.car_model') sortField = `r.${sortField}`;

    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const rides = db.prepare(query).all(...params);
    res.json({ rides });
  });

  app.get("/api/payments/methods", authenticate, (req: any, res) => {
    const methods = db.prepare("SELECT * FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC").all(req.user.id);
    res.json({ methods });
  });

  app.post("/api/payments/methods", authenticate, (req: any, res) => {
    const { type, last4, brand, is_default } = req.body;
    const id = Math.random().toString(36).substring(7);
    
    if (is_default) {
      db.prepare("UPDATE payment_methods SET is_default = 0 WHERE user_id = ?").run(req.user.id);
    }
    
    db.prepare("INSERT INTO payment_methods (id, user_id, type, last4, brand, is_default) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, req.user.id, type, last4, brand, is_default ? 1 : 0);
    
    res.json({ success: true, id });
  });

  app.delete("/api/payments/methods/:id", authenticate, (req: any, res) => {
    db.prepare("DELETE FROM payment_methods WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  app.get("/api/rides/surge", (req, res) => {
    const now = new Date();
    const hour = now.getHours();
    let multiplier = 1.0;

    // Rush hour surge
    if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) {
      multiplier = 1.5;
    } 
    // Late night surge
    else if (hour >= 23 || hour <= 4) {
      multiplier = 1.3;
    }

    // Demand-based surge simulation
    const onlineDrivers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'driver' AND is_online = 1").get() as { count: number };
    const activeRides = db.prepare("SELECT COUNT(*) as count FROM rides WHERE status IN ('requested', 'accepted', 'in_progress')").get() as { count: number };
    
    if (onlineDrivers.count > 0) {
      const demandRatio = activeRides.count / onlineDrivers.count;
      if (demandRatio > 2) multiplier += 0.5;
      else if (demandRatio > 1) multiplier += 0.2;
    } else {
      multiplier += 0.5; // High surge if no drivers online
    }

    res.json({ multiplier: Number(multiplier.toFixed(1)) });
  });

  app.get("/api/driver/info/:id", (req, res) => {
    const driver: any = db.prepare("SELECT name, rating, car_model as car, profile_pic as image FROM users WHERE id = ?").get(req.params.id);
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    res.json(driver);
  });

  app.post("/api/payments/create-intent", authenticate, async (req: any, res) => {
    const { amount, rideId } = req.body;
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        metadata: { rideId, userId: req.user.id }
      });
      
      db.prepare("INSERT INTO payments (id, ride_id, amount, stripe_payment_intent_id) VALUES (?, ?, ?, ?)")
        .run(Math.random().toString(36).substring(7), rideId, amount, paymentIntent.id);
        
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/payments/confirm", authenticate, (req: any, res) => {
    const { paymentIntentId } = req.body;
    db.prepare("UPDATE payments SET status = 'completed' WHERE stripe_payment_intent_id = ?").run(paymentIntentId);
    res.json({ success: true });
  });

  app.get("/api/rides/share/:id", (req, res) => {
    const { id } = req.params;
    const ride: any = db.prepare(`
      SELECT r.*, u.name as driver_name, u.car_model, u.rating as driver_rating, u.profile_pic as driver_image
      FROM rides r
      LEFT JOIN users u ON r.driver_id = u.id
      WHERE r.id = ?
    `).get(id);
    
    if (!ride) return res.status(404).json({ error: "Ride not found" });
    res.json(ride);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
