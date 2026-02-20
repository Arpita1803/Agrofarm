import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getAllMsp, getMspByProduct, upsertMsp, getMspCatalog } from "../controllers/mspController.js";

const router = express.Router();

router.get("/", getAllMsp);
router.get("/catalog/all", getMspCatalog);
router.get("/:product", getMspByProduct);
router.post("/", authMiddleware, upsertMsp);

export default router;