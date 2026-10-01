import request from "supertest";
import app from "../app.js";

describe("URL lifecycle", () => {
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
  });

  it("creates a short URL", async () => {
    const response = await request(app)
      .post("/urls")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        originalUrl: "https://example.com/lifecycle-test",
      });

    expect(response.status).toBe(201);
    expect(response.body.shortCode).toEqual(expect.any(String));
    expect(response.body.originalUrl).toBe(
      "https://example.com/lifecycle-test",
    );

    shortCode = response.body.shortCode;
  });

  it("redirects and records a click", async () => {
    const response = await request(app)
      .get(`/${shortCode}`)
      .set("User-Agent", "Lifecycle-Test")
      .set("Referer", "https://google.com");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(
      "https://example.com/lifecycle-test",
    );
  });

  it("returns click analytics", async () => {
    const response = await request(app)
      .get(`/urls/${shortCode}/analytics`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("clickCount");
    expect(Number(response.body.clickCount)).toBeGreaterThanOrEqual(1);
  });

  it("updates the destination", async () => {
    const response = await request(app)
      .put(`/urls/${shortCode}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        originalUrl: "https://example.com/lifecycle-updated",
      });

    expect(response.status).toBe(200);
    expect(response.body.originalUrl).toBe(
      "https://example.com/lifecycle-updated",
    );
  });

  it("redirects to the updated destination", async () => {
    const response = await request(app).get(`/${shortCode}`);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(
      "https://example.com/lifecycle-updated",
    );
  });

  it("deletes the short URL", async () => {
    const response = await request(app)
      .delete(`/urls/${shortCode}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(204);
  });

  it("returns 404 after deletion", async () => {
    const response = await request(app).get(`/${shortCode}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Short URL not found",
    });
  });
});
