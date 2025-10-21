import express from "express";
import { getUserProfile } from "../controllers/userController.js";
import { checkJwt } from "../middleware/checkJwt.js";

const router = express.Router();

router.get("/profile", checkJwt, getUserProfile);

export default router;
