import request from "supertest";
import app from "../app.js";

describe("Centralized error handling", () => {
  it("returns a generic 500 response for an unknown route handler error", async () => {
    const response = await request(app)
      .get("/__test__/unexpected-error")
      .set("Accept", "application/json");

    expect(response.status).toBe(404);
  });

  it("returns JSON for an invalid JSON request body", async () => {
    const response = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: expect.any(String),
      }),
    );

    expect(JSON.stringify(response.body)).not.toContain("SyntaxError");
  });
});
