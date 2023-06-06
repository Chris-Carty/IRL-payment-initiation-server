import express from "express";
import {
  getPaymentStatus,
} from "../controllers/polling.js";

const router = express.Router();

router.get("/getStatus/:transaction_id", getPaymentStatus);

export default router;
