import express from "express";
import {auth} from "../middlewares/auth"
import { generateDescription, generateScript, generateTitles, generateThumbnail} from "../controllers/aiController";

const aiRouter = express.Router();
aiRouter.post("/generate-titles", auth, generateTitles);
aiRouter.post("/generate-description", auth, generateDescription);
aiRouter.post("/generate-script", auth, generateScript);
aiRouter.post("/generate-thumbnail", auth, generateThumbnail);

export default aiRouter;