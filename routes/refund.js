import express from "express";
import {
  createRefund,
} from "../controllers/refund.js";

const router = express.Router();

router.post("/createRefund/:transaction_id", createRefund);

export default router;
