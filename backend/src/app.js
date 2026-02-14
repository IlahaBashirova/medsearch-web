const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes"); 
const pharmacyRoutes = require("./routes/pharmacy.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");


dotenv.config();

const app = express();

app.use(cors());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

connectDB();

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "MedSearch API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/pharmacies", pharmacyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
