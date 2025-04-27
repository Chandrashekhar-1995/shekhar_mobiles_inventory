import { Repair } from "../models/repair.model.js";
import { Customer } from "../models/customer.model.js";
import { Account } from "../models/account.model.js";
import { processRepairing } from "../middlewares/repair.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


// Generate Repair invoice number
const generateRepairInvoiceNumber = async () => {
    const lastRepairInvoice = await Repair.findOne().sort({ createdAt: -1 });
    const lastNumber = lastRepairInvoice ? parseInt(lastRepairInvoice.repairInvoiceNumber.split("-")[1]) : 0;
    return `REP-${(lastNumber + 1).toString().padStart(4, "0")}`;
};

// Endpoint to fetch the last Repair invoice
const fetchLastRepairInvoice = asyncHandler( async (req, res, next) =>{
    try {
        const lastRepair = await Repair.findOne().sort({ createdAt: -1 });

        if (lastRepair) {
            res.status(200).json(
                new ApiResponse(201, lastRepair, "Last Repair fetched successfully.")
            )
          } else {
            throw new ApiError(404, "No invoices found")
          }
    } catch (error) {
        next(error);
    }
});


// Create Repair Invoice
const createRepair = asyncHandler(async (req, res, next) => {
    try {
        const {
            invoiceType,
            repairNumber, 
            bookingDate,
            expectDeliveryDate,
            expectDeliveryTime,
            placeOfSupply,
            billTo,
            customerId,
            discountAmount,
            advanceAmount,
            paymentMode,
            paymentDate,
            privateNote,
            customerNote,
            deliveryTerm,
            deliveryDate,
            bookBy,
            repairing,
            transactionId,
            receivedAmount,
        } = req.body;

        if (!repairing || repairing.length === 0) {
            throw new ApiError(400, "Repair details are required.");
        }
        
        
        const finalCustomerId = billTo === "Cash" ? process.env.CASH_CUSTOMER_ID : customerId;
        const customer = await Customer.findById(finalCustomerId);
        if (!customer) {
            throw new ApiError(404, "Customer not found.");
        }

        let expectDelivery= [];
        if(expectDeliveryDate || expectDeliveryTime){
            expectDelivery.push({data:expectDeliveryDate}, {time:expectDeliveryTime})
        }

        const account = await Account.findOne({ accountName: paymentMode });
        if (!account) {
            throw new ApiError(404, `${paymentMode} Account not found, please create account first.`);
        }

        // Create the Repair invoice
        const newRepair = new Repair({
            invoiceType,
            repairNumber: repairNumber ? repairNumber : await generateRepairInvoiceNumber(),
            bookingDate,
            expectDelivery,
            placeOfSupply,
            billTo : billTo.toLowerCase(),
            customer: finalCustomerId,
            customerName:customer.customerName,
            mobileNumber:customer.mobileNumber,
            address:customer.address,
            discountAmount,
            advanceAmount,
            paymentAccount: account._id,
            paymentDate,
            privateNote,
            customerNote,
            deliveryTerm,
            deliveryDate,
            bookBy: bookBy ? bookBy : req.user._id,
            repairing,
        });

        // Process repairing items and get total amount
        const { repairDetails, totalAmount } = await processRepairing(repairing, newRepair._id);

        newRepair.repairing = repairDetails;
        newRepair.totalAmount = totalAmount;
        newRepair.totalPayableAmount = totalAmount - (discountAmount || 0);
        newRepair.receivedAmount = receivedAmount || advanceAmount;
        newRepair.dueAmount = newRepair.totalPayableAmount - (receivedAmount || advanceAmount);
        newRepair.status = newRepair.dueAmount === 0
            ? "paid"
            : (receivedAmount || advanceAmount) > 0
                ? "partially_paid"
                : "unpaid";

        // Save the invoice
        await newRepair.save();

        // Update account balance (credit)
        account.balance = Number(account.balance) + Number(receivedAmount || advanceAmount);
        account.transactions.push({
            type: "credit",
            amount: receivedAmount || advanceAmount,
            description: "Repair invoice payment",
            date: paymentDate,
            referenceId: "",
            transactionId: transactionId,
            invoiceId: newRepair._id,
            paymentMode: paymentMode.toLowerCase(),
        });
        await account.save();

        // Update customer's repair history
        customer.repairHistory = customer.repairHistory || [];
        customer.repairHistory.push({
            invoiceId: newRepair._id,
            date: newRepair.bookingDate,
            totalAmount: newRepair.totalPayableAmount,
        });
        customer.balance = (customer.balance || 0) + newRepair.dueAmount;
        await customer.save();

        // Update user's repair history
        req.user.repairHistory = req.user.repairHistory || [];
        req.user.repairHistory.push({
            invoiceId: newRepair._id,
            date: newRepair.bookingDate,
            totalAmount: newRepair.totalPayableAmount,
        });
        await req.user.save();

        res.status(201).json(new ApiResponse(201, { newRepair }, "Repair invoice created successfully."));
    } catch (error) {
        next(error);
    }
});


// Endpoint to fetch invoices
const fetchAllRepairInvoice = asyncHandler( async (req, res, next) =>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {        
        const invoices = await Repair.find().skip(skip).limit(limit);
        const total = await Repair.countDocuments();
        if (invoices) {
            res.status(200).json(
                new ApiResponse(201, { invoices, total, page, limit }, "Repair fetched successfully.")
            )
          } else {
            res.status(404).json({ message: 'No Repair invoices found' });
          }
    } catch (error) {
        next(error);
    }
});

// Endpoint to fetch Repair by id
const fetchRepairInvoiceByID = asyncHandler( async (req, res, next) =>{
    try {        
        const invoice = await Repair.findById(req.params.id);
        if (invoice) {
            res.status(200).json(
                new ApiResponse(201, { invoice }, "Repair fetched successfully.")
            )
          } else {
            res.status(404).json({ message: 'No Repairs found' });
          }
    } catch (error) {
        next(error);
    }
});

// search Repair
const searchRepairInvoice = asyncHandler( async (req, res, next) =>{
    try {
        const { search } = req.query;
        if (!search) {
                throw new ApiError(400, "Search Query is required." );
              }
        
        // Case-insensitive search for matching names
        const invoices = await Repair.find({
            $or: [
                { repairInvoiceNumber: { $regex: search, $options: "i" }, }, 
                {bookingDate: { $regex: search, $options: "i" }, }, 
                { customerName:{ $regex: search, $options: "i" } },
                { mobileNumber:{ $regex: search, $options: "i" } }
            ],
              
            }).limit(20);

        if (invoices.length < 0) {
            throw new ApiError(400, "No Repair found" );
          }

        res.status(200).json(new ApiResponse(200, invoices, "Repairs Fetched"));

    } catch (error) {
        next(error);
    }
});


// update Repair by id
const updateRepairInvoice = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;
        const updateData = req.body;

        const invoice = await Repair.findById(id);
          if (!invoice) {
              throw new ApiError(404, "Repair not found.");
          }
        
        const updatedRepairInvoice = await Repair.findByIdAndUpdate(
              id,
              { $set: updateData },
              { new: true, runValidators: true }
          )
        
        if (!updatedRepairInvoice) {
              throw new ApiError(500, "Failed to update repair");
          }
        
        res.status(200).json(
              new ApiResponse(200, updatedRepairInvoice, "Repair invoice updated successfully")
          );
        
    } catch (error) {
        next(error);
    }
});


// delete Repair
const deleteRepairInvoice = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;

        const deletedRepairInvoice = await Repair.findByIdAndDelete(id);

        if (!deletedRepairInvoice) {
                throw new ApiError(404, "Repair invoice not found, please select a correct repair");
            }
        
        res.status(200).json(
            new ApiResponse(200, null, "Repair invoice deleted.")
          );
    } catch (error) {
        next(error);
    }
});


export { 
    fetchLastRepairInvoice,
    createRepair, 
    fetchAllRepairInvoice, 
    fetchRepairInvoiceByID, 
    searchRepairInvoice, 
    updateRepairInvoice, 
    deleteRepairInvoice
};