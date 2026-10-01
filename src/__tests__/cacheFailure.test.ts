import request from "supertest";
import app from "../app.js";
import { redisClient } from "../config/redis.js";

describe("URL resolution when Redis is unavailable", () => {
  let accessToken: string;
  let shortCode: string;

  beforeAll(async () => {
    const login = await request(app)
      .post("/auth/login")
      .send({
        email: "interview@example.com",
        password: "StrongPassword123!",
      });

    expect(login.status).toBe(200);
    accessToken = login.body.accessToken;

    const response = await request(app)
      .post("/urls")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        originalUrl: "https://example.com/cache-failure-test",
      });

    expect(response.status).toBe(201);
    shortCode = response.body.shortCode;
  });

  afterAll(async () => {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  });

  it("still resolves a URL when Redis is unavailable", async () => {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }

    const response = await request(app)
      .get(`/${shortCode}`)
      .set("User-Agent", "cache-failure-test")
      .set("Referer", "https://example.com");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(
      "https://example.com/cache-failure-test",
    );
  });
});
