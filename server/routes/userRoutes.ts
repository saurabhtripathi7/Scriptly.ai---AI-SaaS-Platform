import express from "express";
import { auth } from "../middlewares/auth";
import { getCredits, getDashboardOverview, getCreationById, deleteCreation, togglePublishCreation, toggleLikeCreation, getPublishedCreations } from "../controllers/userController";

const router = express.Router();

router.get("/credits", auth, getCredits);
router.get("/get-dashboard-overview", auth, getDashboardOverview);
router.get("/get-creation/:id", auth, getCreationById);
router.delete("/delete-creation/:id", auth, deleteCreation);
router.post("/toggle-publish-creation/:id", auth, togglePublishCreation);
router.post("/toggle-like-creation", auth, toggleLikeCreation);
router.get("/get-published-creations", auth, getPublishedCreations);

export default router;

