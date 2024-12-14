 const Invoice = require("../models/invoice.model");
 const Account = require("../models/account.model");
 const Customer = require("../models/customer.model");
 
 exports.createInvoice = async (req, res) => {
   try {
     const { customerId, items, payments } = req.body;
 
     // Validate customer existence
     const customer = await Customer.findById(customerId);
     if (!customer) {
       return res.status(404).json({ error: "Customer not found" });
     }
 
     // Calculate total and due amounts
     let totalAmount = 0;
     items.forEach((item) => {
       item.total = item.quantity * item.unitPrice;
       totalAmount += item.total;
     });
 
     let paidAmount = 0;
 
     // Handle payments and update account balances
     const paymentDetails = [];
     for (const payment of payments || []) {
       const account = await Account.findById(payment.accountId);
       if (!account) {
         return res.status(404).json({ error: `Account ${payment.accountId} not found` });
       }
 
       // Debit the account for the payment
       account.updateBalance("Debit", payment.amount);
       await account.save();
 
       // Add payment detail
       paymentDetails.push({
         accountId: payment.accountId,
         amount: payment.amount,
       });
 
       paidAmount += payment.amount;
     }
 
     const dueAmount = totalAmount - paidAmount;
     const status = dueAmount === 0 ? "Paid" : paidAmount > 0 ? "Partially Paid" : "Unpaid";
 
     // Create the invoice
     const invoice = new Invoice({
       customerId,
       items,
       totalAmount,
       paidAmount,
       dueAmount,
       status,
       paymentDetails,
     });
 
     await invoice.save();
     return res.status(201).json({ message: "Invoice created successfully", invoice });
   } catch (error) {
     console.error(error);
     return res.status(500).json({ error: "Internal server error" });
   }
 };
 