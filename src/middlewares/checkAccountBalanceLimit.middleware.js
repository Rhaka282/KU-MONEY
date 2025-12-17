import * as subscriptionDatasource from "../datasource/subscription.datasource.js";
import * as accountDatasource from "../datasource/account.datasource.js";

/**
 * Middleware to check if total balance of all accounts exceeds subscription limit
 * Must be used after authMiddleware
 * Checks total balance against subscriptionPackage.incomes limit
 */
export const checkAccountBalanceLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { balance } = req.body; // Balance yang akan ditambahkan/diupdate

    // Get active subscription
    const subscription =
      await subscriptionDatasource.findActiveSubscriptionByUserId(userId);

    if (!subscription) {
      return next();
    }

    // Get limit from subscription (limitIncomes)
    const balanceLimit = subscription.limitIncomes;

    // Check if limit is unlimited (0 means unlimited)
    if (balanceLimit === 0) {
      return next();
    }

    // Get all accounts to calculate current total balance
    const accounts = await accountDatasource.findAccountsByUserId(userId);

    // Calculate current total balance (sum semua balance account)
    const currentTotalBalance = accounts.reduce(
      (sum, account) => sum + (account.balance || 0),
      0
    );

    // Jika create account baru
    if (!req.params.id) {
      const newBalance = balance || 0;
      const newTotalBalance = currentTotalBalance + newBalance;

      // Check if new total balance exceeds limit
      if (newTotalBalance > balanceLimit) {
        return res.status(403).json({
          message: `Total balance limit reached`,
          code: "ACCOUNT_BALANCE_LIMIT_REACHED",
          limit: balanceLimit,
          currentTotalBalance: currentTotalBalance,
          newBalance: newBalance,
          newTotalBalance: newTotalBalance,
          remaining: balanceLimit - currentTotalBalance,
        });
      }
    } else {
      // Jika update account yang sudah ada
      // Hanya cek jika balance diubah
      if (balance !== undefined) {
        const existingAccount =
          await accountDatasource.findAccountByIdAndUserId(
            req.params.id,
            userId
          );

        if (!existingAccount) {
          // Account tidak ditemukan, biarkan controller handle error
          return next();
        }

        const oldBalance = existingAccount.balance || 0;
        const newBalance = balance || 0;

        // Jika balance tidak berubah, skip check
        if (oldBalance === newBalance) {
          return next();
        }

        // Calculate new total balance
        // Total saat ini - balance lama + balance baru
        const newTotalBalance = currentTotalBalance - oldBalance + newBalance;

        // Check if new total balance exceeds limit
        if (newTotalBalance > balanceLimit) {
          return res.status(403).json({
            message: `Total balance limit reached`,
            code: "ACCOUNT_BALANCE_LIMIT_REACHED",
            limit: balanceLimit,
            currentTotalBalance: currentTotalBalance,
            oldBalance: oldBalance,
            newBalance: newBalance,
            newTotalBalance: newTotalBalance,
            remaining: balanceLimit - currentTotalBalance,
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error("Check Account Balance Limit Error:", error);
    res.status(500).json({
      message: "Error checking account balance limit",
      code: "INTERNAL_ERROR",
      error: error.message,
    });
  }
};
