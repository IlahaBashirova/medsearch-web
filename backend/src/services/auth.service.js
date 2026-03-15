const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { signToken } = require("./token.service");

exports.register = async ({ name, email, password, role }) => {
  if (!name || !email || !password)
    throw new AppError("Missing fields", 400);

  const normalizedEmail = email.toLowerCase().trim();

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists)
    throw new AppError("Email already used", 400);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: "USER"
  });

  const token = signToken(user);

  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, token };
};

exports.login = async ({ email, password }) => {
  if (!email || !password)
    throw new AppError("Missing fields", 400);

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user)
    throw new AppError("Invalid credentials", 401);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok)
    throw new AppError("Invalid credentials", 401);

  if (user.status !== "ACTIVE") {
    throw new AppError("Account is not active", 403);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);

  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, token };
};

exports.me = async (id) => {
  const user = await User.findById(id).select("name email role status phone lastLoginAt");
  if (!user)
    throw new AppError("User not found", 404);

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone,
    lastLoginAt: user.lastLoginAt
  };
};
