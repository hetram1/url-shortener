import request from "supertest";
import app from "../app.js";

describe("Protected URL endpoints", () => {
  it("rejects URL creation without authentication", async () => {
    const response = await request(app)
      .post("/urls")
      .send({
        originalUrl: "https://example.com",
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Authentication required",
    });
  });

  it("rejects URL listing without authentication", async () => {
    const response = await request(app).get("/urls");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Authentication required",
    });
  });

  it("rejects URL updates without authentication", async () => {
    const response = await request(app)
      .put("/urls/test123")
      .send({
        originalUrl: "https://example.com",
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Authentication required",
    });
  });

  it("rejects URL deletion without authentication", async () => {
    const response = await request(app).delete("/urls/test123");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Authentication required",
    });
  });
});
