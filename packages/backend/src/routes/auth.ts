import express from "express";
import authService from "../services/authService";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const user = await authService.register(
      firstName,
      lastName,
      email,
      password
    );
    res.status(201).send(user);
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { token } = await authService.login(email, password);
    res.send({ token });
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
