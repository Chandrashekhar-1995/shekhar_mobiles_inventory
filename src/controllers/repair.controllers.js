import { Repair } from "../models/repair.model.js";
import { Customer } from "../models/customer.model.js";
import { Account } from "../models/account.model.js";
import { processRepairing } from "../middlewares/repair.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";


// Generate Repair invoice number
const generateRepairNumber = async () => {
    const lastRepairInvoice = await Repair.findOne().sort({ createdAt: -1 });
    const lastNumber = lastRepairInvoice ? parseInt(lastRepairInvoice.repairInvoiceNumber.split("-")[1]) : 0;
    return `REP-${(lastNumber + 1).toString().padStart(4, "0")}`;
};

// Endpoint to fetch the last Repair invoice
const fetchLastRepair = asyncHandler( async (req, res, next) =>{
    try {
        const lastRepair = await Repair.findOne().sort({ createdAt: -1 });

        if (lastRepair) {
            res.status(200).json(
                new ApiResponse(201, lastRepair, "Last Repair fetched successfully.")
            )
          } else {
            throw new ApiError(404, "No repair found")
          }
    } catch (error) {
        next(error);
    }
});


// Create Repair
const createRepair = asyncHandler(async (req, res, next) => {
    try {
        const {
            repairNumber,
            bookingDate,
            expectDeliveryDate,
            billTo,
            customerId,
            repairing,
            discountAmount,
            advanceAmount,
            paymentMode,
            paymentDate,
            privateNote,
            customerNote,
            bookBy,
            deliveryTerm,
            transactionId,
        } = req.body;

        if (!repairing || repairing.length === 0) {
            throw new ApiError(400, "Repairing items are required.");
        }

        const finalBillTo = billTo.toLowerCase();
        const finalCustomerId = finalBillTo === "cash" ? process.env.CASH_CUSTOMER_ID : customerId;

        const customer = await Customer.findById(finalCustomerId);
        if (!customer) throw new ApiError(404, "Customer not found.");

        const account = await Account.findOne({ accountName: paymentMode });
        if (!account) throw new ApiError(404, `${paymentMode} account not found.`);

        const { repairDetails, totalAmount } = await processRepairing(repairing);

        const totalPayable = totalAmount - (discountAmount || 0);
        const receivedAmount = advanceAmount || 0;
        const dueAmount = totalPayable - receivedAmount;

        const bookedByUserId = bookBy ?? req.user._id;
        const bookedByUser = await User.findById(bookedByUserId)

        const newRepair = new Repair({
            repairNumber: repairNumber || await generateRepairNumber(),
            bookingDate,
            expectDeliveryDate,
            billTo: finalBillTo,
            customer: customer._id,
            repairing: repairDetails,
            discountAmount,
            advanceAmount,
            totalAmount,
            totalPayableAmount: totalPayable,
            paymentAccount: account._id,
            paymentDate,
            privateNote,
            customerNote,
            deliveryTerm,
            bookBy: bookedByUserId,
            paymentStatus: dueAmount === 0 ? "paid" : receivedAmount > 0 ? "partially_paid" : "unpaid",
            dueAmount,
        });

        await newRepair.save();

        // Update Account
        if(receivedAmount > 0 ){
            account.balance += parseFloat(receivedAmount);
            account.transactions.push({
                type: "credit",
                amount: receivedAmount,
                description: "Repair Invoice Payment",
                date: paymentDate,
                transactionId,
                invoiceId: newRepair._id,
                paymentMode: paymentMode.toLowerCase(),
            });
            await account.save();
        }

        // Update Customer
        customer.balance = (customer.balance || 0) + dueAmount;
        customer.repairHistory = customer.repairHistory || [];
        customer.repairHistory.push({
            repairId: newRepair._id,
            date: newRepair.bookingDate,
            totalAmount: totalPayable,
        });
        await customer.save();

        // Update user's repair book history
        bookedByUser.bookRepairHistory.push({
            repairId: newRepair._id,
            date: newRepair.bookingDate,
            totalAmount: newRepair.totalPayableAmount,
        });
        await bookedByUser.save();

        res.status(201).json(new ApiResponse(201, { repair: newRepair }, "Repair booked successfully."));

    } catch (error) {
        next(error);
    }
});


// Endpoint to fetch invoices
const fetchAllRepair = asyncHandler( async (req, res, next) =>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    try {        
        const repairs = await Repair.find()
        .populate({ path: "bookBy", select: "name" })
        .populate({ path: "customer", select: "name address mobileNumber" })
        .populate({ path: "repairing.fault", select: "fault" })
        .populate({ path: "deliverBy", select: "name" })
        .populate({ path: "repairing.repairUnder", select: "name" })
        .populate({ path: "repairing.repairBy", select: "name" })
        .skip(skip)
        .limit(limit);
        const total = await Repair.countDocuments();
        if (repairs) {
            res.status(200).json(
                new ApiResponse(200, { repairs, total, page, limit }, "Repair fetched successfully.")
            )
          } else {
            throw new ApiError(404, "No Repair found" );
          }
    } catch (error) {
        next(error);
    }
});


// Last 90 days ka Repair Booking data
const fetchLast90DaysRepairBookingData = asyncHandler( async (req, res, next) =>{
    try {
        const last90DaysData = await Repair.getDailyRepairBookingData(90);
        if (last90DaysData.length > 0) {
            res.status(200).json(
                new ApiResponse(200, last90DaysData, "Last 90 days repair booking data fetched successfully.")
            )
          } else {
            throw new ApiError(404, "No Repair found" );
          }
    } catch (error) {
        next(error);
    }
});

// Last 30 days ka Repair Booking data
const fetchLast30DaysRepairBookingData = asyncHandler( async (req, res, next) =>{
    try {
        const last30DaysData = await Repair.getDailyRepairBookingData(30);
        if (last30DaysData.length > 0) {
            res.status(200).json(
                new ApiResponse(200, last30DaysData, "Last 30 days repair booking data fetched successfully.")
            )
          } else {
            throw new ApiError(404, "No Repair found" );
          }
    } catch (error) {
        next(error);
    }
});


// Today ka Repair Booking summary
const fetchTodayRepairBookingSummary = asyncHandler( async (req, res, next) =>{
    try {
        const [todaySummary] = await Repair.getTodayRepairBookingSummary();

        if (todaySummary.length > 0) {
            res.status(200).json(
                new ApiResponse(200, todaySummary, "Today's repair booking summary fetched successfully.")
            )
          } else {
            throw new ApiError(404, "No Repair found for today" );
          }
    } catch (error) {
        next(error);
    }
});

// Endpoint to fetch Repair by id
const fetchRepairByID = asyncHandler( async (req, res, next) =>{
    try {        
        const invoice = await Repair.findById(req.params.id)
        .populate({ path: "bookBy", select: "name" })
        .populate({ path: "customer", select: "name" })
        .populate({ path: "deliverBy", select: "name address mobileNumber" })
        .populate({ path: "repairing.fault", select: "fault" })
        .populate({ path: "repairing.repairUnder", select: "name" })
        .populate({ path: "repairing.repairBy", select: "name" })
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
const searchRepair = asyncHandler( async (req, res, next) =>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!search) {
        throw new ApiError(400, "Search Query is required." );
    }
    
    try {
        // Case-insensitive search for matching names
        const repairs = await Repair.find({
            $or: [
                { repairNumber: { $regex: search, $options: "i" }, }, 
                {bookingDate: { $regex: search, $options: "i" }, }, 
                { customerName:{ $regex: search, $options: "i" } },
                { mobileNumber:{ $regex: search, $options: "i" } }
            ],
              
            })
            .populate({ path: "bookBy", select: "name" })
            .populate({ path: "customer", select: "name" })
            .populate({ path: "repairing.fault", select: "fault" })
            .populate({ path: "deliverBy", select: "name address mobileNumber" })
            .populate({ path: "repairing.repairUnder", select: "name" })
            .populate({ path: "repairing.repairBy", select: "name" })
            .skip(skip)
            .limit(limit);
            const total = await Repair.countDocuments();

        if (invoices.length < 0) {
            throw new ApiError(400, "No Repair found" );
          }

        res.status(200).json(new ApiResponse(200, { repairs, total, page, limit }, "Repairs Fetched"));

    } catch (error) {
        next(error);
    }
});


// update Repair by id
const updateRepair = asyncHandler( async (req, res, next) =>{
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

// update Repair item by id
const updateRepairItem = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params; // main repair invoice ID
        const { itemIndex, ...updatedFields } = req.body;

        const invoice = await Repair.findById(id);
        if (!invoice) {
            throw new ApiError(404, "Repair invoice not found");
        }

        if (!Array.isArray(invoice.repairing) || itemIndex < 0 || itemIndex >= invoice.repairing.length) {
            throw new ApiError(400, "Invalid item index");
        }

        Object.assign(invoice.repairing[itemIndex], updatedFields);
        await invoice.save();

        res.status(200).json(
            new ApiResponse(200, invoice, "Repairing item updated successfully")
        );
    } catch (error) {
        next(error);
    }
});


// delete Repair
const deleteRepair = asyncHandler( async (req, res, next) =>{
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
    fetchLastRepair,
    createRepair, 
    fetchAllRepair, 
    fetchLast90DaysRepairBookingData,
    fetchLast30DaysRepairBookingData,
    fetchTodayRepairBookingSummary,
    fetchRepairByID, 
    searchRepair, 
    updateRepair,
    updateRepairItem, 
    deleteRepair,
};