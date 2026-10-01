import { Router } from "express";
import { registerUser } from "../services/authService.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string") {
      return res.status(400).json({
        error: "email must be a string",
      });
    }

    if (typeof password !== "string") {
      return res.status(400).json({
        error: "password must be a string",
      });
    }

    const user = await registerUser({
      email,
      password,
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (
        error.message === "Email is required" ||
        error.message === "Email must be valid" ||
        error.message === "Password must be at least 8 characters" ||
        error.message === "Email is already registered"
      )
    ) {
      return res.status(400).json({
        error: error.message,
      });
    }

    console.error("Failed to register user:", error);

    return res.status(500).json({
      error: "Failed to register user",
    });
  }
});

export default router;
