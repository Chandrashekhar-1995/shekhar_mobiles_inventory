const Account =  require("../models/account.model");

const updateAccountBalance = async (paymentMode, amount, type = "credit") => {
    const account = await Account.findOne({ type: paymentMode });
    if (type === "credit") {
        account.balance += amount;
    } else if (type === "debit") {
        account.balance -= amount;
    }
    await account.save();
};
