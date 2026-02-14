const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async ({ name, email, password, role }) => {
  if (!name || !email || !password) throw new Error("Missing fields");

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new Error("Email already used");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: role || "USER"
  });

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, token };
};

exports.login = async ({ email, password }) => {
  if (!email || !password) throw new Error("Missing fields");

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("Invalid credentials");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, token };
};

exports.me = async (id) => {
  const user = await User.findById(id).select("name email role");
  if (!user) throw new Error("User not found");
  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
};
