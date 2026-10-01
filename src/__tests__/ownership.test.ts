import request from "supertest";
import app from "../app.js";

describe("URL ownership", () => {
  let userAToken: string;
  let userBToken: string;
  let shortCode: string;

  beforeAll(async () => {
    const userA = await request(app)
      .post("/auth/login")
      .send({
        email: "interview@example.com",
        password: "StrongPassword123!",
      });

    expect(userA.status).toBe(200);
    userAToken = userA.body.accessToken;

    const userBEmail = `ownership-${Date.now()}@example.com`;

    const userB = await request(app)
      .post("/auth/register")
      .send({
        email: userBEmail,
        password: "StrongPassword123!",
      });

    expect(userB.status).toBe(201);

    const userBLogin = await request(app)
      .post("/auth/login")
      .send({
        email: userBEmail,
        password: "StrongPassword123!",
      });

    expect(userBLogin.status).toBe(200);
    userBToken = userBLogin.body.accessToken;

    const created = await request(app)
      .post("/urls")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({
        originalUrl: "https://example.com/ownership-test",
      });

    expect(created.status).toBe(201);
    shortCode = created.body.shortCode;
  });

  it("does not expose another user's URL in their URL list", async () => {
    const response = await request(app)
      .get("/urls")
      .set("Authorization", `Bearer ${userBToken}`);

    expect(response.status).toBe(200);

    const ownedByUserA = response.body.urls.some(
      (url: { shortCode: string }) => url.shortCode === shortCode,
    );

    expect(ownedByUserA).toBe(false);
  });

  it("prevents another user from updating the URL", async () => {
    const response = await request(app)
      .put(`/urls/${shortCode}`)
      .set("Authorization", `Bearer ${userBToken}`)
      .send({
        originalUrl: "https://example.com/hijacked",
      });

    expect(response.status).toBe(404);
  });

  it("prevents another user from deleting the URL", async () => {
    const response = await request(app)
      .delete(`/urls/${shortCode}`)
      .set("Authorization", `Bearer ${userBToken}`);

    expect(response.status).toBe(404);
  });
});
