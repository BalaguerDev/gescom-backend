import express from "express";
import { getUserProfile, updateUserConfig } from "../controllers/userController.js";
import { checkJwt } from "../middleware/checkJwt.js";

const router = express.Router();

router.get("/profile", checkJwt, getUserProfile); 
router.put("/profile", checkJwt, updateUserConfig); 

export default router;
