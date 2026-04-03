process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";

const request = require("supertest");
const { app } = require("../src/app");
const { connectTestDB, clearTestDB, disconnectTestDB } = require("./helpers/db");
const { createUser, createPharmacy, createReservation } = require("./helpers/factories");

describe("Backend API", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it("returns health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      message: "MedSearch API running"
    });
  });

  it("logs in a regular user", async () => {
    await createUser({
      email: "user@login.test",
      password: "Password123"
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "user@login.test",
      password: "Password123"
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
    expect(response.body.role).toBe("USER");
  });

  it("logs in an admin user", async () => {
    await createUser({
      name: "Admin User",
      email: "admin@login.test",
      password: "Password123",
      role: "ADMIN"
    });

    const response = await request(app).post("/api/admin/auth/login").send({
      email: "admin@login.test",
      password: "Password123"
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
    expect(response.body.role).toBe("ADMIN");
  });

  it("rejects protected admin route access without a token", async () => {
    const response = await request(app).get("/api/admin/dashboard");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
  });

  it("enforces reservation ownership for non-admin users", async () => {
    const owner = await createUser({
      email: "owner@test.local"
    });
    const otherUser = await createUser({
      email: "other@test.local"
    });

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "other@test.local",
      password: "Password123"
    });

    const reservation = await createReservation({
      userId: owner._id
    });

    const response = await request(app)
      .get(`/api/reservations/${reservation._id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Forbidden");
  });

  it("returns paginated pharmacy results", async () => {
    await Promise.all([
      createPharmacy({ name: "Alpha Pharmacy" }),
      createPharmacy({ name: "Beta Pharmacy" }),
      createPharmacy({ name: "Gamma Pharmacy" })
    ]);

    const response = await request(app).get("/api/pharmacies?page=2&limit=2");

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(2);
    expect(response.body.limit).toBe(2);
    expect(response.body.total).toBe(3);
    expect(response.body.data).toHaveLength(1);
  });

  it("returns validation errors for invalid input", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "",
      email: "not-an-email",
      password: "123"
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBeTruthy();
  });

  it("returns not found for unknown routes", async () => {
    const response = await request(app).get("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Route not found");
  });

  it("returns unauthorized for protected user route without a token", async () => {
    const user = await createUser({
      email: "me@test.local"
    });

    const response = await request(app).get(`/api/reservations/user/${user._id}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
  });
});
