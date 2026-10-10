
import express from "express";
import { getTreeLiveData } from "../controllers/treeController.js";

const router = express.Router();

router.get(
  "/:zoneId/trees/:treeCode/latest",
  getTreeLiveData
);

export default router;
