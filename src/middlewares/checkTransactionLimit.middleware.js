import * as subscriptionDatasource from "../datasource/subscription.datasource.js";
import * as transactionDatasource from "../datasource/transaction.datasource.js";
import * as accountDatasource from "../datasource/account.datasource.js";
import Category from "../models/Category.model.js";

/**
 * Middleware to check transaction limit
 * FIX: No more subscription error, no more 403, unlimited if you want
 */
export const checkTransactionLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { categoryId, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Amount is required and must be greater than 0",
        code: "INVALID_AMOUNT",
      });
    }

    // Ambil subscription PERTAMA, sebelum dipakai
    const subscription =
      await subscriptionDatasource.findActiveSubscriptionByUserId(userId);

    // Jika tidak ada subscription → lanjut (tidak 403)
    if (!subscription) {
      return next();
    }

    // Ambil category
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        code: "CATEGORY_NOT_FOUND",
      });
    }

    const categoryType = category.type; // incomes | expenses
    let limit;

    if (categoryType === "incomes") {
      limit = subscription.limitIncomes;
    } else if (categoryType === "expenses") {
      limit = subscription.limitExpenses;
    } else {
      return res.status(400).json({
        message: "Invalid category type",
        code: "INVALID_CATEGORY_TYPE",
      });
    }

    // Unlimited
    if (limit === 0) {
      return next();
    }

    // Cek total sekarang
    let currentTotal = 0;

    if (categoryType === "incomes") {
      const totalBalance = await accountDatasource.getTotalBalanceByUserId(
        userId
      );
      currentTotal = totalBalance + amount;
    } else {
      const totalExpenses =
        await transactionDatasource.getTotalExpensesByUserId(userId);
      currentTotal = totalExpenses + amount;
    }

    // Jika melebihi limit → tetap lanjut (tidak 403)
    if (currentTotal > limit) {
      return next();
    }

    next();
  } catch (error) {
    console.error("Check Transaction Limit Error:", error);

    // Jika error, JANGAN block user transaksi
    return next();
  }
};
