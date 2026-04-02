const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { getMongoUri, validateMongoUri } = require("../config/env");
const User = require("../models/User");
const Pharmacy = require("../models/Pharmacy");
const Medicine = require("../models/Medicine");
const Reminder = require("../models/Reminder");
const SupportConversation = require("../models/SupportConversation");
const Setting = require("../models/Setting");
const Reservation = require("../models/Reservation");

dotenv.config();

const upsertUser = async ({ name, email, role, phone }) => {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    existingUser.name = name;
    existingUser.role = role;
    existingUser.phone = phone;
    existingUser.status = "ACTIVE";
    await existingUser.save();
    return existingUser;
  }

  const passwordHash = await bcrypt.hash("SeedUser123!", 10);

  return User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role,
    phone,
    status: "ACTIVE"
  });
};

const upsertPharmacy = async ({ name, ownerId, address, phone, email, mapLink, openingHours }) => {
  const pharmacy = await Pharmacy.findOneAndUpdate(
    { name },
    {
      name,
      ownerId,
      address,
      phone,
      email,
      mapLink,
      openingHours,
      status: "ACTIVE",
      notes: "Seeded sample pharmacy data"
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return pharmacy;
};

const upsertMedicine = async (payload) =>
  Medicine.findOneAndUpdate(
    { name: payload.name, pharmacyId: payload.pharmacyId },
    payload,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

const upsertReminder = async (payload) =>
  Reminder.findOneAndUpdate(
    {
      userId: payload.userId,
      title: payload.title,
      scheduledAt: payload.scheduledAt
    },
    payload,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

const upsertConversation = async (payload) =>
  SupportConversation.findOneAndUpdate(
    { userId: payload.userId, subject: payload.subject },
    payload,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

const upsertReservation = async (payload) =>
  Reservation.findOneAndUpdate(
    {
      userId: payload.userId,
      pharmacyId: payload.pharmacyId,
      medicineId: payload.medicineId,
      status: payload.status
    },
    payload,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

const seedAdminData = async () => {
  const mongoValidation = validateMongoUri(getMongoUri());

  if (!mongoValidation.ok) {
    throw new Error(mongoValidation.reason);
  }

  await connectDB();

  const [adminUser, customerOne, customerTwo, pharmacyOwner] = await Promise.all([
    upsertUser({
      name: process.env.ADMIN_NAME?.trim() || "MedSearch Admin",
      email: process.env.ADMIN_EMAIL?.trim() || "admin@medsearch.local",
      role: "ADMIN",
      phone: "+1 555 100 1000"
    }),
    upsertUser({
      name: "Aylin Mammadova",
      email: "aylin.user@medsearch.local",
      role: "USER",
      phone: "+994 50 555 11 22"
    }),
    upsertUser({
      name: "Rashad Aliyev",
      email: "rashad.user@medsearch.local",
      role: "USER",
      phone: "+994 55 777 88 99"
    }),
    upsertUser({
      name: "Leyla Pharmacy Owner",
      email: "leyla.owner@medsearch.local",
      role: "PHARMACY_OWNER",
      phone: "+994 12 333 44 55"
    })
  ]);

  const [cityCare, healthPlus] = await Promise.all([
    upsertPharmacy({
      name: "CityCare Pharmacy",
      ownerId: pharmacyOwner._id,
      address: "28 May Street 14, Baku",
      phone: "+994 12 404 10 10",
      email: "citycare@medsearch.local",
      mapLink: "https://maps.example.com/citycare",
      openingHours: "08:00 - 22:00"
    }),
    upsertPharmacy({
      name: "HealthPlus Pharmacy",
      ownerId: pharmacyOwner._id,
      address: "Nizami Street 88, Baku",
      phone: "+994 12 505 20 20",
      email: "healthplus@medsearch.local",
      mapLink: "https://maps.example.com/healthplus",
      openingHours: "24/7"
    })
  ]);

  const [amoxicillin, ibuprofen, vitaminD] = await Promise.all([
    upsertMedicine({
      name: "Amoxicillin 500mg",
      category: "Antibiotic",
      description: "Broad-spectrum antibiotic capsules for bacterial infections.",
      manufacturer: "Pfizer",
      dosageForm: "Capsule",
      strength: "500mg",
      price: 12.5,
      stock: 45,
      pharmacyId: cityCare._id,
      requiresPrescription: true,
      isActive: true
    }),
    upsertMedicine({
      name: "Ibuprofen 200mg",
      category: "Pain Relief",
      description: "NSAID tablets for fever and mild pain management.",
      manufacturer: "Abbott",
      dosageForm: "Tablet",
      strength: "200mg",
      price: 6.2,
      stock: 120,
      pharmacyId: healthPlus._id,
      requiresPrescription: false,
      isActive: true
    }),
    upsertMedicine({
      name: "Vitamin D3 Drops",
      category: "Supplements",
      description: "Daily vitamin D support in drop form.",
      manufacturer: "Bayer",
      dosageForm: "Drops",
      strength: "400 IU",
      price: 9.9,
      stock: 60,
      pharmacyId: cityCare._id,
      requiresPrescription: false,
      isActive: true
    })
  ]);

  await Promise.all([
    upsertReminder({
      userId: customerOne._id,
      medicineId: amoxicillin._id,
      title: "Morning antibiotic dose",
      dose: "1 capsule after breakfast",
      scheduledAt: new Date("2026-03-16T08:00:00.000Z"),
      channel: "PUSH",
      isEnabled: true,
      lastSentAt: null
    }),
    upsertReminder({
      userId: customerTwo._id,
      medicineId: vitaminD._id,
      title: "Daily vitamin reminder",
      dose: "5 drops after lunch",
      scheduledAt: new Date("2026-03-16T12:30:00.000Z"),
      channel: "IN_APP",
      isEnabled: true,
      lastSentAt: new Date("2026-03-15T12:30:00.000Z")
    })
  ]);

  await Promise.all([
    upsertConversation({
      userId: customerOne._id,
      subject: "Prescription verification for Amoxicillin",
      status: "PENDING",
      priority: "HIGH",
      lastMessageAt: new Date("2026-03-15T09:20:00.000Z"),
      messages: [
        {
          senderRole: "USER",
          senderId: customerOne._id,
          message: "I uploaded my prescription but my order is still pending.",
          createdAt: new Date("2026-03-15T09:05:00.000Z")
        },
        {
          senderRole: "ADMIN",
          senderId: adminUser._id,
          message: "We are reviewing it now and will confirm with the pharmacy shortly.",
          createdAt: new Date("2026-03-15T09:20:00.000Z")
        }
      ]
    }),
    upsertConversation({
      userId: customerTwo._id,
      subject: "Delivery delay for ibuprofen reservation",
      status: "OPEN",
      priority: "MEDIUM",
      lastMessageAt: new Date("2026-03-15T10:15:00.000Z"),
      messages: [
        {
          senderRole: "USER",
          senderId: customerTwo._id,
          message: "The pharmacy accepted my reservation but I have not received the pickup code.",
          createdAt: new Date("2026-03-15T10:00:00.000Z")
        },
        {
          senderRole: "ADMIN",
          senderId: adminUser._id,
          message: "Thanks for the heads-up. We have escalated this to the pharmacy team.",
          createdAt: new Date("2026-03-15T10:15:00.000Z")
        }
      ]
    })
  ]);

  const existingSettings = await Setting.findOne();

  if (existingSettings) {
    existingSettings.general = {
      platformName: "MedSearch Admin",
      supportEmail: "support@medsearch.local",
      supportPhone: "+994 12 999 00 11",
      timezone: "Asia/Baku",
      maintenanceMode: false
    };
    existingSettings.notifications = {
      emailEnabled: true,
      pushEnabled: true,
      reservationAlerts: true,
      reminderAlerts: true
    };
    existingSettings.email = {
      fromName: "MedSearch Support",
      fromAddress: "no-reply@medsearch.local",
      replyTo: "support@medsearch.local",
      provider: "smtp"
    };
    existingSettings.security = {
      sessionTtlHours: 168,
      passwordMinLength: 8,
      require2faForAdmins: false,
      allowNewAdminRegistration: false
    };
    await existingSettings.save();
  } else {
    await Setting.create({
      general: {
        platformName: "MedSearch Admin",
        supportEmail: "support@medsearch.local",
        supportPhone: "+994 12 999 00 11",
        timezone: "Asia/Baku",
        maintenanceMode: false
      },
      notifications: {
        emailEnabled: true,
        pushEnabled: true,
        reservationAlerts: true,
        reminderAlerts: true
      },
      email: {
        fromName: "MedSearch Support",
        fromAddress: "no-reply@medsearch.local",
        replyTo: "support@medsearch.local",
        provider: "smtp"
      },
      security: {
        sessionTtlHours: 168,
        passwordMinLength: 8,
        require2faForAdmins: false,
        allowNewAdminRegistration: false
      }
    });
  }

  await Promise.all([
    upsertReservation({
      userId: customerOne._id,
      pharmacyId: cityCare._id,
      medicineId: amoxicillin._id,
      pharmacyName: cityCare.name,
      medicineName: amoxicillin.name,
      quantity: 1,
      price: 12.5,
      address: cityCare.address,
      phone: cityCare.phone,
      status: "PENDING"
    }),
    upsertReservation({
      userId: customerTwo._id,
      pharmacyId: healthPlus._id,
      medicineId: ibuprofen._id,
      pharmacyName: healthPlus.name,
      medicineName: ibuprofen.name,
      quantity: 2,
      price: 12.4,
      address: healthPlus.address,
      phone: healthPlus.phone,
      status: "ACTIVE"
    }),
    upsertReservation({
      userId: customerTwo._id,
      pharmacyId: cityCare._id,
      medicineId: vitaminD._id,
      pharmacyName: cityCare.name,
      medicineName: vitaminD.name,
      quantity: 1,
      price: 9.9,
      address: cityCare.address,
      phone: cityCare.phone,
      status: "COMPLETED"
    })
  ]);

  console.log("Admin panel seed data is ready");
};

seedAdminData()
  .catch((error) => {
    console.error("Failed to seed admin panel data:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
