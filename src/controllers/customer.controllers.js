import ExcelJS from "exceljs";
import xlsx from "xlsx";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { Customer } from "../models/customer.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findUserOrCustomer } from "../utils/dbHelpers.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Create customer by user / admin
const createCustomer = asyncHandler(async (req, res, next) => {

    const { 
        name, mobileNumber, contactNumber, address, city, state, pinCode, country, email, avatar, gender, panNo, gstin, gstType, tradeName, dateOfBirth, marrigeAniversary, bio, remark, designation, accountType, openingBalance, creditAllowed, creditLimit, refferedBy, documentType, documentNo,
    } = req.body;

        // Validate required fields
        if (!name?.trim() || !mobileNumber || !address?.trim()) {
            throw new ApiError(400, "All fields are required: name, mobileNumber, and address.");
        }

        if(email !== undefined){
          const existingUser = await findUserOrCustomer(email)
            if (existingUser) {
              throw new ApiError(400, "Email or mobile number already exists.")
            };
        };

        const existingUser = await findUserOrCustomer(mobileNumber);
        
        if (existingUser) {
            throw new ApiError(400, "Email or mobile number already exists.")
          };

        // Generate password: first 3 letters of name (lowercase) + last 4 digits of mobile number
        const generatePassword = (name, mobileNumber) => {
          const namePart = name.trim().slice(0, 3).toLowerCase();
          const mobilePart = mobileNumber.trim().slice(-4);
          return `${namePart}${mobilePart}`;
        };
        
        const mobileStr = mobileNumber.toString()
        const plainPassword = generatePassword(name, mobileStr);
        console.log("Generated password:", plainPassword); // For debugging

        // Create new user
        const customer = new Customer({
            name, 
            mobileNumber, 
            password: plainPassword,
            contactNumber, 
            address, 
            city, 
            state, 
            pinCode, 
            country, 
            email, 
            avatar, 
            gender, 
            panNo, 
            gstin, 
            gstType, 
            tradeName, 
            dateOfBirth, 
            marrigeAniversary, 
            bio, 
            remark, 
            designation, 
            accountType, 
            balance:openingBalance, 
            creditAllowed, 
            creditLimit, 
            refferedBy, 
            documentType, 
            documentNo,
        });

        await customer.save();

        // Fetch the newly created user excluding the password
        const createdCustomer = await Customer.findById(customer._id).select("-password");

        // Respond with success
        res.status(201).json(
            new ApiResponse(201, createdCustomer, "Customer created successfully.")
        );
});

// fetch all customer
const fetchAllCustomer = asyncHandler( async (req, res, next) =>{
    try {
        const allCustomer = await Customer.find();
        res.status(201).json(new ApiResponse(200, allCustomer, "All brand fetched successfully."));

    } catch (error) {
        next(error);
    }
});


// Fetch customer by id
const fetchCustomerByID = asyncHandler( async (req, res, next) => {
  const {id} = req.params;
  try {
    const customer = await Customer.findById(id);
    res.status(200).json(new ApiResponse(200, customer, "Customers Fetched"));
    
  } catch (error) {
    next(error)
  }
});

// Search Customers by Name or Mobile number
const searchCustomers = asyncHandler(async (req, res, next) => {
    try {
      const { search } = req.query;
  
      if (!search) {
        throw new ApiError(400, "Search Query is required." );
      }
  
      // Case-insensitive search for matching names
      const customers = await Customer.find({
        $or: [{ name: { $regex: search, $options: "i" }, }, { mobileNumber:{ $regex: search, $options: "i" } }],
        
      }).limit(20);
  
      res.status(200).json(new ApiResponse(200, customers, "Customers Fetched"));
    } catch (err) {
      next(err);;
    }
  });


  // Update customer by id
const updateCustomer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;
  // Find the customer to update
  const customer = await Customer.findById(id);
  if (!customer) {
      throw new ApiError(404, "Customer not found");
  }

  // Handle mobile number/email uniqueness checks
  if (updateData.mobileNumber && updateData.mobileNumber !== customer.mobileNumber) {
      const existingWithMobile = await Customer.findOne({ mobileNumber: updateData.mobileNumber });
      if (existingWithMobile) {
          throw new ApiError(400, "Mobile number already in use by another customer");
      }
  }

  if (updateData.email && updateData.email !== customer.email) {
      const existingWithEmail = await Customer.findOne({ email: updateData.email });
      if (existingWithEmail) {
          throw new ApiError(400, "Email already in use by another customer");
      }
  }

  // Perform the update
  const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
  ).select("-password -refreshToken");

  if (!updatedCustomer) {
      throw new ApiError(500, "Failed to update customer");
  }

  res.status(200).json(
      new ApiResponse(200, updatedCustomer, "Customer updated successfully")
  );
});

// Delete customer by id
const deleteCustomer = asyncHandler( async (req, res, next) => {
  const { id } = req.params;
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(id);

    if (!deletedCustomer) {
        throw new ApiError(404, "Customer not found");
    }

    res.status(200).json(
      new ApiResponse(200, null, "Customer deleted successfully")
  );
  } catch (error) {
      next(error)
  }
});

// download bulk upload template for customer
const bulkUploadTemplate = asyncHandler( async (req, res, next) =>{
      try {
        const headers = [
            { field: "name", label: "Name *", required: true },
            { field: "mobileNumber", label: "Mobile Number *", required: true },
            { field: "contactNumber", label: "Other Contact No.", required: false },
            { field: "address", label: "Village *", required: true },
            { field: "city", label: "City", required: false },
            { field: "state", label: "State", required: false },
            { field: "pinCode", label: "Pin Code", required: false },
            { field: "country", label: "Country", required: false },
            { field: "email", label: "Email", required: false },
            { field: "gender", label: "Gender", required: false },
            // { field: "dateOfBirth", label: "Birthday", required: false },
            // { field: "marrigeAniversary", label: "Aniversary", required: false },
            { field: "panNo", label: "Pan No", required: false,},
            { field: "gstin", label: "GST IN", required: false },
            { field: "gstType", label: "GST Type", required: false },
            { field: "tradeName", label: "Trade Name", required: false },
            { field: "designation", label: "Designation", required: false, dropdown: ["Customer", "Supplier"] },
        ];
    
        const workbook = new ExcelJS.Workbook();
        const templateSheet = workbook.addWorksheet("Template");
        const instructionSheet = workbook.addWorksheet("Instructions");

        // Add headers to the template sheet
        const headerRow = templateSheet.addRow
        (headers.map((header) =>header.label));
        headerRow.eachCell((cell, colNumber)=>{
            const header = headers[colNumber -1];
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: header.required ? "FFA500" : "D3D3D3" },
            };
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };

            templateSheet.getColumn(colNumber).width = Math.max(15, header.label.length + 5);
        });

        templateSheet.getRow(headerRow.number).height = 40;

        // Add instructions to the second sheet
        instructionSheet.addRow(["Field Name", "Required/Optional", "Description/Example"]);
        headers.forEach((header) => {
            instructionSheet.addRow([
                header.label,
                header.required ? "Required" : "Optional",
                header.dropdown ? `Allowed values: ${header.dropdown.join(", ")}` : "Free text",
            ]);
        });
        instructionSheet.getRow(1).eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "CCCCCC" },
            };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            instructionSheet.getColumn(colNumber).width = Math.max(15, cell.model.value.length + 5);
        });
        instructionSheet.getRow(1).height = 40;

        const filePath = path.join(__dirname, "../../public/files/customer-template.xlsx");
        await workbook.xlsx.writeFile(filePath);
    
        res.download(filePath, "customer-template.xlsx", (err) => {
                    if (err) next(err);
                    fs.unlinkSync(filePath);
                });
            }  catch (error) {
      next(error)
  }
});

// download bulk upload template for customer
const bulkUploadCustomer = asyncHandler( async (req, res, next) =>{
  try {
        if (!req.file) {
        throw new ApiError(400, "No file uploaded. Please upload an Excel or CSV file.");
            };

         // Parse the uploaded file
         const workbook = xlsx.readFile(req.file.path);
         const sheetName = workbook.SheetNames[0];
         const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const headerMapping = {
          "Name *": "name",
          "Mobile Number *": "mobileNumber",
          "Other Contact No.":"contactNumber",
          "Village *":"address",
          "City":"city",
          "State":"state",
          "Pin Code":"pinCode",
          "Country":"country",
          "Email":"email",
          "Gender":"gender",
          "Birthday":"dateOfBirth",
          "Aniversary":"marrigeAniversary",
          "Pan No":"panNo",
          "GST IN":"gstin",
          "GST Type":"gstType",
          "Trade Name":"tradeName",
          "Designation":"designation"
        };

            const requiredFields = ["name", "mobileNumber", "address"];
            const customers = [];
            const skippedCustomers = [];
            for (const row of data) {
                const customer = {};
                for (const [templateHeader, dbField] of Object.entries(headerMapping)) {
                    if (row[templateHeader] !== undefined && row[templateHeader] !== "") {
                        customer[dbField] = row[templateHeader]; 
                    }
                }

                const missingFields = requiredFields.filter((field) => !customer[field]);
                if (missingFields.length > 0) {
                skippedCustomers.push({ row, reason: `Missing fields: ${missingFields.join(", ")}` });
                    continue;
                }

                const existingCustomer = await Customer.findOne({
                    $or: [{ name: customer.name.trim().toLowerCase() }, { mobileNumber: customer.mobileNumber } ]
                });
                if(existingCustomer){
                    skippedCustomers.push({row, reason: "Customer already exists"});
                    continue;
                };

                customers.push({
                    ...customer,
                })
            }

            // Insert all valid customers into the database
            const insertedCustomers = await Customer.insertMany(customers);
            // Delete the uploaded file
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting file:", err);
            });

            res.status(201).json(
                new ApiResponse(201, { insertedCustomers, skippedCustomers }, "Customers uploaded successfully.")
            );
  } catch (error) {
    // Delete the file in case of an error
    if (req.file && req.file.path) fs.unlinkSync(req.file.path);
      next(error)
  }
});
  
  export { 
    createCustomer,
    fetchAllCustomer,
    fetchCustomerByID,
    searchCustomers,
    updateCustomer,
    deleteCustomer,
    bulkUploadTemplate,
    bulkUploadCustomer,
   }; 