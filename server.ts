import express from "express";
import path from "path";
let createViteServer: any;
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || "";
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

let supabase: any = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client initialized successfully with URL:", supabaseUrl);
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
} else {
  console.log("Supabase environment variables are missing. Using in-memory fallback store.");
}

// In-Memory Backup/Fallback Stores
let fallbackAppointments: any[] = [];
let fallbackTestimonials: any[] = [];

// API: Get Database Connection Status & SQL Schema instructions
app.get("/api/db-status", (req, res) => {
  res.json({
    configured: isSupabaseConfigured,
    provider: isSupabaseConfigured ? "supabase" : "local_fallback",
    supabaseUrl: supabaseUrl ? supabaseUrl.replace(/(https?:\/\/)[^.]+(\.supabase\.co)/, "$1***$2") : null,
    sqlSetup: `
-- Execute this SQL in your Supabase SQL Editor to prepare your tables!

-- 1. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  designer_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow all users to read/insert/delete appointments (simplified for demo/scheduling applet)
CREATE POLICY "Allow public select" ON appointments FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON appointments FOR DELETE USING (true);

-- 2. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  designer_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  text TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Allow all users to read/insert testimonials
CREATE POLICY "Allow public select testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Allow public insert testimonials" ON testimonials FOR INSERT WITH CHECK (true);
    `
  });
});

// API: Get All Appointments
app.get("/api/appointments", async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase query warning (perhaps tables are not created yet?):", error.message);
        // Fallback to memory on table missing error
        return res.json(fallbackAppointments);
      }
      
      // Rename fields to camelCase for the frontend matching
      const formatted = (data || []).map((row: any) => ({
        id: row.id,
        clientName: row.client_name,
        clientPhone: row.client_phone,
        designerId: row.designer_id,
        serviceId: row.service_id,
        date: row.date,
        timeSlot: row.time_slot,
        notes: row.notes,
        status: row.status,
        createdAt: row.created_at
      }));

      return res.json(formatted);
    } catch (err: any) {
      console.error("Error reading from Supabase appointments table:", err);
      return res.json(fallbackAppointments);
    }
  }
  res.json(fallbackAppointments);
});

// API: Add New Appointment
app.post("/api/appointments", async (req, res) => {
  const appt = req.body;
  if (!appt.id || !appt.clientName || !appt.clientPhone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Update memory fallback list
  const existingIndex = fallbackAppointments.findIndex(item => item.id === appt.id);
  if (existingIndex > -1) {
    fallbackAppointments[existingIndex] = appt;
  } else {
    fallbackAppointments.unshift(appt);
  }

  if (supabase) {
    try {
      // Map to snakeCase
      const dbRow = {
        id: appt.id,
        client_name: appt.clientName,
        client_phone: appt.clientPhone,
        designer_id: appt.designerId,
        service_id: appt.serviceId,
        date: appt.date,
        time_slot: appt.timeSlot,
        notes: appt.notes || null,
        status: appt.status || 'confirmed',
        created_at: appt.createdAt || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("appointments")
        .insert([dbRow]);

      if (error) {
        console.warn("Could not insert to Supabase table:", error.message);
        return res.status(500).json({ error: error.message });
      } else {
        console.log("Successfully stored appointment in Supabase:", appt.id);
      }
    } catch (err) {
      console.error("Error storing to Supabase:", err);
    }
  }

  res.status(201).json(appt);
});

// API: Delete (Cancel) Appointment
app.delete("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;
  
  // Remove from local memory
  fallbackAppointments = fallbackAppointments.filter(item => item.id !== id);

  if (supabase) {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) {
        console.warn("Could not delete from Supabase table:", error.message);
      } else {
        console.log("Successfully cancelled appointment in Supabase:", id);
      }
    } catch (err) {
      console.error("Error cancelling in Supabase:", err);
    }
  }

  res.json({ success: true });
});

// API: Get Testimonials
app.get("/api/testimonials", async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase testimonials warning (perhaps tables not created?):", error.message);
        return res.json(fallbackTestimonials);
      }

      // Format camelCase
      const formatted = (data || []).map((row: any) => ({
        id: row.id,
        clientName: row.client_name,
        designerId: row.designer_id,
        serviceName: row.service_name,
        rating: row.rating,
        text: row.text,
        date: row.date
      }));

      return res.json(formatted);
    } catch (err) {
      console.error("Error reading testimonials from Supabase:", err);
      return res.json(fallbackTestimonials);
    }
  }
  res.json(fallbackTestimonials);
});

// API: Add Testimonial
app.post("/api/testimonials", async (req, res) => {
  const test = req.body;
  if (!test.id || !test.clientName || !test.text) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Save to memory
  const existingIndex = fallbackTestimonials.findIndex(item => item.id === test.id);
  if (existingIndex > -1) {
    fallbackTestimonials[existingIndex] = test;
  } else {
    fallbackTestimonials.unshift(test);
  }

  if (supabase) {
    try {
      const dbRow = {
        id: test.id,
        client_name: test.clientName,
        designer_id: test.designerId,
        service_name: test.serviceName,
        rating: test.rating,
        text: test.text,
        date: test.date
      };

      const { error } = await supabase
        .from("testimonials")
        .insert([dbRow]);

      if (error) {
        console.warn("Could not save testimonial to Supabase:", error.message);
        return res.status(500).json({ error: error.message });
      } else {
        console.log("Successfully stored testimonial in Supabase:", test.id);
      }
    } catch (err) {
      console.error("Error storing testimonial to Supabase:", err);
    }
  }

  res.status(201).json(test);
});

// Seed API: initialize server with current client cache on load (if database is empty)
app.post("/api/sync-cache", (req, res) => {
  const { appointments: clientAppts, testimonials: clientTests } = req.body;
  if (Array.isArray(clientAppts) && fallbackAppointments.length === 0) {
    fallbackAppointments = clientAppts;
  }
  if (Array.isArray(clientTests) && fallbackTestimonials.length === 0) {
    fallbackTestimonials = clientTests;
  }
  res.json({ success: true });
});

// Integrating Vite or Production serving
async function startServer() {  
if (process.env.NODE_ENV !== "production") {
  const { createServer } = await import("vite");

    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
