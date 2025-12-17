import { createSubscription } from "./datasource/subscription.datasource.js";
import { findPackageByName } from "./datasource/subscriptionPackage.datasource.js";
import { findUserByEmail } from "./datasource/user.datasource.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const expiredAt = new Date();
expiredAt.setFullYear(expiredAt.getFullYear() + 100);

console.log(expiredAt.setFullYear);

const seedSubscription = async () => {
  const proPackage = await findPackageByName("pro");
  const user = await findUserByEmail("admin@gmail.com");

  try {
    await createSubscription({
      expiredAt: expiredAt,
      createdBy: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      isActive: true,
      limitCategory: proPackage.category,
      limitIncomes: proPackage.incomes,
      limitExpenses: proPackage.expenses,
      limitAccount: proPackage.account,
      expiredEmailCount: 0,
    });

    console.log("Succesfully");
    process.exit();
  } catch (e) {
    console.log("Caught an error", e);
    process.exit();
  }
};

connectDB().then(seedSubscription());
