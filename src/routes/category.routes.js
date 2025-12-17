import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category/category.controller.js";

// Middleware imports
import { authMiddleware } from "../middlewares/auth/auth.middleware.js";
import { checkCategoryLimit } from "../middlewares/checkCategoryLimit.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";

// DTO imports
import { createCategoryDto, updateCategoryDto } from "../dto/category.dto.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create category (with limit check)
router.post(
  "/",
  checkCategoryLimit,
  validate(createCategoryDto),
  createCategory
);

// Get all categories
router.get("/", getCategories);

// Get category by ID
router.get("/:id", getCategoryById);

// Update category by ID
router.put("/:id", validate(updateCategoryDto), updateCategory);

// Delete category by ID
router.delete("/:id", deleteCategory);

export default router;
