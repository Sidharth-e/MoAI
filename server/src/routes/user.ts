import express, { Request, Response } from "express";
import { User } from "../models/user";
import { AuthenticatedRequest } from "../interface/authenticateMiddleware.interface";

const router = express.Router();

// Get user by ID from req.user._id (from auth token)
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id; // populated by authentication middleware
    if (!userId) {
      return res.status(400).send({ message: "User ID not provided" });
    }
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: "No user found" });
    res.status(200).send({ user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get user by email
router.get("/email/:email", async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ message: "User not found" });
    res.status(200).send({ user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get user by Azure oid
router.get("/oid/:oid", async (req: Request, res: Response) => {
  try {
    const { oid } = req.params;
    const user = await User.findOne({ oid });
    if (!user) return res.status(404).send({ message: "User not found" });
    res.status(200).send({ user });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get all users (for admin)
router.get("/all", async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.status(200).send({ users });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default router;