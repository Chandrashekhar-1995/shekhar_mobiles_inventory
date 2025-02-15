const Account = require("../models/account.model");
const ApiError = require("../utils/ApiError");


const processPayments = async (payments, totalAmount, customer) => {
    let receivedAmount = 0;
    const paymentDetails = [];

    for (const payment of payments) {
        const account = await Account.findById(payment.accountId);
        if (!account) {
            throw new ApiError(404, `Account with ID ${payment.accountId} not found.`);
        }

        // Update account balance (credit)
        account.balance += payment.amount;
        await account.save();

        // Track received amount
        receivedAmount += payment.amount;

        // Add payment details
        paymentDetails.push({
            accountId: payment.accountId,
            amount: payment.amount,
            method: account.name,
        });

    }

    // Update customer's balance if a valid customer is found
    if (customer) {
        const balanceDifference = totalAmount - receivedAmount;
        customer.balance = (customer.balance || 0) + balanceDifference;
        await customer.save();
    }


    return { receivedAmount, paymentDetails };
};



module.exports = processPayments;