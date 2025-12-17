import * as subscriptionDatasource from "../datasource/subscription.datasource.js";
import * as accountDatasource from "../datasource/account.datasource.js";

/**
 * Middleware to check if user has reached account limit
 * Must be used after authMiddleware
 */
export const checkAccountLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get active subscription
    const subscription =
      await subscriptionDatasource.findActiveSubscriptionByUserId(userId);

    if (!subscription) {
      return next();
    }

    // Get limit from subscription
    const accountLimit = subscription.limitAccount;

    // Check if limit is unlimited (0 means unlimited)
    if (accountLimit === 0) {
      return next();
    }

    // Count current accounts
    const currentAccountCount = await accountDatasource.countAccountsByUserId(
      userId
    );

    // Check if user has reached the limit
    if (currentAccountCount >= accountLimit) {
      return res.status(403).json({
        message: `Account limit reached`,
        code: "ACCOUNT_LIMIT_REACHED",
        limit: accountLimit,
        current: currentAccountCount,
      });
    }

    next();
  } catch (error) {
    console.error("Check Account Limit Error:", error);
    res.status(500).json({
      message: "Error checking account limit",
      code: "INTERNAL_ERROR",
      error: error.message,
    });
  }
};
