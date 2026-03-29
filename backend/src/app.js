const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes"); 
const pharmacyRoutes = require("./routes/pharmacy.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const reservationRoutes = require("./routes/reservation.routes");
const adminAuthRoutes = require("./routes/adminAuth.routes");
const adminDashboardRoutes = require("./routes/adminDashboard.routes");
const adminUsersRoutes = require("./routes/adminUsers.routes");
const adminPharmaciesRoutes = require("./routes/adminPharmacies.routes");
const medicineRoutes = require("./routes/medicine.routes");
const adminReservationsRoutes = require("./routes/adminReservations.routes");
const adminRemindersRoutes = require("./routes/adminReminders.routes");
const supportRoutes = require("./routes/support.routes");
const notificationRoutes = require("./routes/notification.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const settingsRoutes = require("./routes/settings.routes");


dotenv.config();

const errorHandler = require("./middleware/errorHandler");
const createApp = () => {
  const app = express();
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((item) => item.trim())
    : "*";

  app.use(cors({ origin: corsOrigin }));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "MedSearch API running" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/pharmacies", pharmacyRoutes);
  app.use("/api/reservations", reservationRoutes);
  app.use("/api/admin/auth", adminAuthRoutes);
  app.use("/api/admin/dashboard", adminDashboardRoutes);
  app.use("/api/admin/users", adminUsersRoutes);
  app.use("/api/admin/pharmacies", adminPharmaciesRoutes);
  app.use("/api/admin/medicines", medicineRoutes);
  app.use("/api/admin/reservations", adminReservationsRoutes);
  app.use("/api/admin/reminders", adminRemindersRoutes);
  app.use("/api/support", supportRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/admin/analytics", analyticsRoutes);
  app.use("/api/admin/settings", settingsRoutes);

  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  app.use(errorHandler);

  return app;
};

const app = createApp();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  await connectDB();

  return app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
}

module.exports = { app, createApp, startServer };
