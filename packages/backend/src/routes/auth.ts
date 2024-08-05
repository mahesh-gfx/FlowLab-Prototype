import express from "express";
import authService from "../services/authService";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { firstName, lastName, age, email, password } = req.body;
  try {
    const response = await authService.register(
      firstName,
      lastName,
      age,
      email,
      password
    );
    res.status(response?.status).send(response);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { status, token } = await authService.login(email, password);
    res.status(status).send({ token });
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
