import request from "supertest";
import app from "../app.js";

describe("POST /auth/login", () => {
  it("logs in with valid credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "interview@example.com",
        password: "StrongPassword123!",
      });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      id: "1",
      email: "interview@example.com",
    });
  });

  it("rejects an incorrect password", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "interview@example.com",
        password: "WrongPassword123!",
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Invalid email or password",
    });
  });

  it("rejects missing credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "email must be a string",
    });
  });
});
