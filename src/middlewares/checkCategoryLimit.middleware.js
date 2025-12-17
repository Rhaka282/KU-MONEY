import * as subscriptionDatasource from "../datasource/subscription.datasource.js";
import * as categoryDatasource from "../datasource/category.datasource.js";

/**
 * Middleware to check if user has reached category limit
 * Must be used after authMiddleware
 */
export const checkCategoryLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get active subscription
    const subscription =
      await subscriptionDatasource.findActiveSubscriptionByUserId(userId);

    if (!subscription) {
      return next();
    }

    // Get limit from subscription
    const categoryLimit = subscription.limitCategory;

    // Check if limit is unlimited (0 means unlimited)
    if (categoryLimit === 0) {
      return next();
    }

    // Count current categories
    const currentCategoryCount =
      await categoryDatasource.countCategoriesByUserId(userId);

    // Check if user has reached the limit
    if (currentCategoryCount >= categoryLimit) {
      return res.status(403).json({
        message: `Category limit reached`,
        code: "CATEGORY_LIMIT_REACHED",
        limit: categoryLimit,
        current: currentCategoryCount,
      });
    }

    next();
  } catch (error) {
    console.error("Check Category Limit Error:", error);
    res.status(500).json({
      message: "Error checking category limit",
      code: "INTERNAL_ERROR",
      error: error.message,
    });
  }
};
