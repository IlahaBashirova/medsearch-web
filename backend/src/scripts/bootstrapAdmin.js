const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { getMongoUri, validateMongoUri } = require("../config/env");
const User = require("../models/User");

dotenv.config();

const bootstrapAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Admin";
  const mongoValidation = validateMongoUri(getMongoUri());

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }

  if (!mongoValidation.ok) {
    throw new Error(mongoValidation.reason);
  }

  await connectDB();

  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    console.log("Admin user already exists");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    passwordHash,
    role: "ADMIN",
    status: "ACTIVE"
  });

  console.log(`Admin user created: ${email}`);
};

bootstrapAdmin()
  .catch((error) => {
    console.error("Failed to bootstrap admin:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
