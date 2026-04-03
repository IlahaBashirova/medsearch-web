const bcrypt = require("bcryptjs");
const User = require("../../src/models/User");
const Pharmacy = require("../../src/models/Pharmacy");
const Reservation = require("../../src/models/Reservation");

const createUser = async ({
  name = "Test User",
  email = "user@example.com",
  password = "Password123",
  role = "USER",
  status = "ACTIVE"
} = {}) => {
  const passwordHash = await bcrypt.hash(password, 10);

  return User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    status
  });
};

const createPharmacy = async ({
  name = "Test Pharmacy",
  address = "Main Street 1",
  phone = "+994123456789"
} = {}) =>
  Pharmacy.create({
    name,
    address,
    phone,
    status: "ACTIVE"
  });

const createReservation = async ({
  userId,
  pharmacyId = null,
  medicineId = null,
  pharmacyName = "Test Pharmacy",
  medicineName = "Test Medicine",
  quantity = 1,
  price = 10,
  address = "Main Street 1",
  phone = "+994123456789",
  status = "ACTIVE"
} = {}) =>
  Reservation.create({
    userId,
    pharmacyId,
    medicineId,
    pharmacyName,
    medicineName,
    quantity,
    price,
    address,
    phone,
    status
  });

module.exports = {
  createUser,
  createPharmacy,
  createReservation
};
