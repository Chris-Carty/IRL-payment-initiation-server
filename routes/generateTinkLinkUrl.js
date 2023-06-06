import express from "express";
import {
  generateTinkLinkUrl,
} from "../controllers/generateTinkLinkUrl.js";

const router = express.Router();

router.post("/generate", generateTinkLinkUrl);

export default router;
