import express from "express";
import { sendShortlistMail } from "../controllers/mail.js";

const router = express.Router();

router.post(
    "/shortlist",
    sendShortlistMail
);

export default router;