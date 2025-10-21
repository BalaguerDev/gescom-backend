import express from "express";
import { checkJwt } from "../config/auth0.js";
import { getUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", checkJwt, getUserProfile);

export default router