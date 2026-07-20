const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const COMPANY_EMAIL = process.env.COMPANY_EMAIL || "adonayldk23@gmail.com";
const RESERVATIONS_FILE = path.join(__dirname, "reservations.json");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isFuture(date, time) {
  const when = new Date(`${date}T${time}`);
  return !isNaN(when) && when > new Date();
}

function emailConfigured() {
  return Boolean(process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD !== "your_app_password_here");
}

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: COMPANY_EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  return transporter;
}

function saveReservation(data) {
  let list = [];
  try {
    if (fs.existsSync(RESERVATIONS_FILE)) {
      list = JSON.parse(fs.readFileSync(RESERVATIONS_FILE, "utf8"));
    }
  } catch (_) {}
  list.push({ ...data, receivedAt: new Date().toISOString() });
  fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(list, null, 2));
}

async function sendReservationEmail(data) {
  await getTransporter().sendMail({
    from: COMPANY_EMAIL,
    to: COMPANY_EMAIL,
    replyTo: data.email,
    subject: `New Table Reservation from ${data.name}`,
    text:
      `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "-"}\n` +
      `Date: ${data.date}\nTime: ${data.time}\nGuests: ${data.guests}\n\nNotes:\n${data.notes || "-"}`
  });
}

async function sendCustomerConfirmation(data) {
  await getTransporter().sendMail({
    from: COMPANY_EMAIL,
    to: data.email,
    subject: "Your Table Reservation is Confirmed",
    text:
      `Hello ${data.name},\n\n` +
      `Thank you for reserving a table with us! Here are the details you submitted:\n\n` +
      `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "-"}\n` +
      `Date: ${data.date}\nTime: ${data.time}\nGuests: ${data.guests}\n` +
      `Notes: ${data.notes || "-"}\n\n` +
      `We look forward to seeing you!\n\nTableReserve Team`
  });
}

app.post("/api/reserve", async (req, res) => {
  const { name, email, phone, date, time, guests, notes } = req.body || {};
  if (!name || !email || !date || !time || !guests) {
    return res.status(400).json({ error: "Name, email, date, time and guests are required." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }
  if (!isFuture(date, time)) {
    return res.status(400).json({ error: "Please choose a future date and time." });
  }

  const data = { name, email, phone, date, time, guests, notes };

  try {
    saveReservation(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not save reservation. Try again." });
  }

  if (!emailConfigured()) {
    return res.json({
      message: "Table reserved! (Email notifications are not set up yet — reservation saved locally.)"
    });
  }

  try {
    await sendReservationEmail(data);
    await sendCustomerConfirmation(data);
    res.json({ message: "Table reserved! A confirmation email has been sent to you." });
  } catch (err) {
    console.error(err);
    res.json({
      message: "Table reserved and saved! (Email could not be sent — check EMAIL_PASSWORD in .env.)"
    });
  }
});

app.listen(PORT, () => {
  console.log(`TableReserve server running at http://localhost:${PORT}`);
  if (!emailConfigured()) {
    console.log("WARNING: EMAIL_PASSWORD not set in .env — reservations will be saved locally only.");
  }
});
