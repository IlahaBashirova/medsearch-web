const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { signToken } = require("./token.service");

exports.login = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Missing fields", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Invalid credentials", 401);
  }

  if (user.role !== "ADMIN") {
    throw new AppError("Admin access required", 403);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Account is not active", 403);
  }

  user.lastLoginAt = new Date();
  await user.save();

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    token: signToken(user)
  };
};

exports.me = async (id) => {
  const user = await User.findById(id).select("name email role status lastLoginAt createdAt");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role !== "ADMIN") {
    throw new AppError("Admin access required", 403);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt
  };
};
