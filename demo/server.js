const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.COMPANY_EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  return transporter;
}

const COMPANY_EMAIL = process.env.COMPANY_EMAIL || "company@example.com";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post("/api/feedback", async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }
  try {
    await getTransporter().sendMail({
      from: COMPANY_EMAIL,
      to: COMPANY_EMAIL,
      replyTo: email,
      subject: `New Feedback from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    });
    res.json({ message: "Thank you! Your feedback was sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not send email. Check server config." });
  }
});

app.post("/api/appointment", async (req, res) => {
  const { name, email, phone, date, car, notes } = req.body || {};
  if (!name || !email || !date) {
    return res.status(400).json({ error: "Name, email and date are required." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }
  try {
    await getTransporter().sendMail({
      from: COMPANY_EMAIL,
      to: COMPANY_EMAIL,
      replyTo: email,
      subject: `Appointment Request from ${name}`,
      text:
        `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "-"}\n` +
        `Date: ${date}\nCar of Interest: ${car || "-"}\n\nNotes:\n${notes || "-"}`
    });
    res.json({ message: "Appointment requested! We will contact you by email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not send email. Check server config." });
  }
});

app.listen(PORT, () => {
  console.log(`AutoDrive server running at http://localhost:${PORT}`);
});
