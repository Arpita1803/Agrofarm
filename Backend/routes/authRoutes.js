import express from "express";
import { register, login } from "../controllers/authController.js";
import { changePassword } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { changePassword } = require("../controllers/authController");


router.post("/register", register);
router.post("/login", login);
router.post("/change-password", authMiddleware, changePassword);

export default router;
