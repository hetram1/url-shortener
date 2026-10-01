import request from "supertest";
import app from "../app.js";

describe("URL validation", () => {
  let accessToken: string;

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

  it("rejects an invalid original URL", async () => {
    const response = await request(app)
      .post("/urls")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        originalUrl: "not-a-url",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid request body");
  });

  it("rejects an invalid custom alias", async () => {
    const response = await request(app)
      .post("/urls")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        originalUrl: "https://example.com",
        customAlias: "bad@alias",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid request body");
  });

  it("rejects a missing original URL", async () => {
    const response = await request(app)
      .post("/urls")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid request body");
  });

  it("rejects an expiration date in the past", async () => {
    const response = await request(app)
      .post("/urls")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        originalUrl: "https://example.com",
        expiresAt: "2020-01-01T00:00:00.000Z",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Expiration date must be in the future",
    );
  });

  it("rejects a duplicate custom alias", async () => {
    const alias = `dup-${Date.now().toString().slice(-8)}`;

    const first = await request(app)
      .post("/urls")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        originalUrl: "https://example.com/first",
        customAlias: alias,
      });

    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/urls")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        originalUrl: "https://example.com/second",
        customAlias: alias,
      });

    expect(second.status).toBe(400);
    expect(second.body).toEqual({
      error: "Custom alias is already in use",
    });

    await request(app)
      .delete(`/urls/${alias}`)
      .set("Authorization", `Bearer ${accessToken}`);
  });
});
