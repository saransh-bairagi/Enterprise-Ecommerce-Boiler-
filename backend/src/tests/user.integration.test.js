const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app"); // your express app
const User = require("../src/modules/user/user.model"); // mongoose model

let mongoServer;
let adminToken, userToken, userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create test admin user
  const admin = await User.create({
    name: "Admin",
    email: "admin@test.com",
    password: "password123", // hash if using bcrypt
    role: "admin",
  });

  // Login admin and get token
  const res = await request(app).post("/api/v1/auth/login").send({
    email: "admin@test.com",
    password: "password123",
  });

  adminToken = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("User API integration tests", () => {
  it("Admin can create a user", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "John Doe",
        email: "john@test.com",
        password: "password123",
        role: "user",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.email).toBe("john@test.com");
    userId = res.body.data._id;
  });

  it("User can get own profile", async () => {
    // login user
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "john@test.com",
      password: "password123",
    });
    userToken = loginRes.body.token;

    const res = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe("john@test.com");
  });

  it("Admin can update a user", async () => {
    const res = await request(app)
      .put(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "John Updated" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe("John Updated");
  });

  it("Admin can soft delete a user", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(204);
  });

  it("Admin can restore a user", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${userId}/restore`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.isDeleted).toBe(false);
  });
});
