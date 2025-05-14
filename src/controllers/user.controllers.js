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
import { User } from "../models/user.model.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create user by admin
const createUser = asyncHandler(async (req, res, next) => {

    const { 
        name, email, avatar, mobileNumber, address, city, state, pinCode, country, gender, dateOfBirth, marrigeAniversary, bio, joiningDate, refferedBy, designation, department, panNo, emergencyContactPerson, emergencyContactNumber, bloodGroup, identityDocument, documentNumber, communication, salesCommission, remark 
    } = req.body; 

        // Validate required fields
        if (!name?.trim() || !mobileNumber || !address?.trim()) {
            throw new ApiError(400, "All fields are required: name, mobileNumber, and address.");
        }

        if(email !== undefined){
          const existingUser = await findUserOrCustomer(email)
            if (existingUser) {
              throw new ApiError(400, "Email  already registered.")
            };
        };

        const existingUser = await findUserOrCustomer(mobileNumber);
        
        if (existingUser) {
            throw new ApiError(400, "Mobile number already registered.")
          };

        // Generate password: first 3 letters of name (lowercase) + last 4 digits of mobile number
        const generatePassword = (name, mobileNumber) => {
          const namePart = name.trim().slice(0, 3).toLowerCase();
          const mobilePart = mobileNumber.trim().slice(-4);
          return `${namePart}${mobilePart}`;
        };
        
        const mobileStr = mobileNumber.toString()
        const plainPassword = generatePassword(name, mobileStr);

        // Create new user
        const user = new User({
            name, 
            mobileNumber, 
            password: plainPassword,
            address, 
            city, 
            state, 
            pinCode, 
            country,
            email, 
            avatar, 
            gender, 
            panNo,
            dateOfBirth, 
            marrigeAniversary, 
            bio, 
            remark, 
            designation: designation ? designation : "trainee", 
            refferedBy,
            joiningDate,
            department: department ? department : "sales",
            emergencyContactPerson,
            emergencyContactNumber,
            bloodGroup,
            identityDocument,
            documentNumber,
            communication,
            salesCommission,
        });

        await user.save();

        // Fetch the newly created user excluding the password
        const createdUser = await User.findById(user._id).select("-password");

        // Respond with success
        res.status(201).json(
            new ApiResponse(201, createdUser, "User created successfully.")
        );
});

// fetch all user
const fetchAllUser = asyncHandler( async (req, res, next) =>{
    const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
    try {
        const users = await User.find()
        .select("-password -refreshToken")
        .skip(skip)
        // .limit(limit);
        const total = await User.countDocuments();

        if(users){
            res.status(201).json(new ApiResponse(200, {users, total, page, limit}, "All users fetched successfully."));
        } else {
            throw new ApiError(404, "No user found")
        }

    } catch (error) {
        next(error);
    }
});


// Fetch user by id
const fetchUserByID = asyncHandler( async (req, res, next) => {
  const {id} = req.params;
  try {
    const user = await User.findById(id)
    .select("-password -refreshToken")
    res.status(200).json(new ApiResponse(200, user, "User Fetched"));
    
  } catch (error) {
    next(error)
  }
});

// Search User by Name or Mobile number
const searchUser = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    
    if (!search) {
        throw new ApiError(400, "Search Query is required.");
    }
    try {
      const users = await User.find({
        $or: [{ name: { $regex: search, $options: "i" }, }, { mobileNumber:{ $regex: search, $options: "i" } }],
        
        })
        .select("-password -refreshToken")
        .skip(skip)
        // .limit(limit);
        const total = await User.countDocuments();
  
      if(users){
        res.status(201).json(new ApiResponse(200, {users, total, page, limit}, "All users fetched successfully."));
    } else {
        throw new ApiError(404, "No user found")
    }

    } catch (err) {
      next(err);;
    }
  });


  // Update user by id
const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;
  // Find the customer to update
  const user = await User.findById(id);
  if (!user) {
      throw new ApiError(404, "User not found");
  }

  // Handle mobile number/email uniqueness checks
  if (updateData.mobileNumber && updateData.mobileNumber !== user.mobileNumber) {
      const existingWithMobile = await User.findOne({ mobileNumber: updateData.mobileNumber });
      if (existingWithMobile) {
          throw new ApiError(400, "Mobile number already in use by another user");
      }
  }

  if (updateData.email && updateData.email !== user.email) {
      const existingWithEmail = await User.findOne({ email: updateData.email });
      if (existingWithEmail) {
          throw new ApiError(400, "Email already in use by another user");
      }
  }


  // Perform the update
  const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
  ).select("-password -refreshToken");

  if (!updatedUser) {
      throw new ApiError(500, "Failed to update customer");
  }

  res.status(200).json(
      new ApiResponse(200, updatedUser, "User updated successfully")
  );
});

// Delete User by id
const deleteUser = asyncHandler( async (req, res, next) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(
      new ApiResponse(200, null, "User deleted successfully")
  );
  } catch (error) {
      next(error)
  }
});

// download bulk upload template for customer
const bulkUploadUserTemplate = asyncHandler( async (req, res, next) =>{
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
const bulkUploadUser = asyncHandler( async (req, res, next) =>{
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
            const users = [];
            const skippedUsers = [];
            for (const row of data) {
                const user = {};
                for (const [templateHeader, dbField] of Object.entries(headerMapping)) {
                    if (row[templateHeader] !== undefined && row[templateHeader] !== "") {
                        user[dbField] = row[templateHeader]; 
                    }
                }

                const missingFields = requiredFields.filter((field) => !user[field]);
                if (missingFields.length > 0) {
                skippedUsers.push({ row, reason: `Missing fields: ${missingFields.join(", ")}` });
                    continue;
                }

                const existingUsers = await Customer.findOne({
                    $or: [{ name: user.name.trim().toLowerCase() }, { mobileNumber: user.mobileNumber } ]
                });
                if(existingUsers){
                    skippedUsers.push({row, reason: "User already exists"});
                    continue;
                };

                users.push({
                    ...user,
                })
            }

            // Insert all valid customers into the database
            const insertedUsers = await User.insertMany(users);
            // Delete the uploaded file
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting file:", err);
            });

            res.status(201).json(
                new ApiResponse(201, { insertedUsers, skippedUsers }, "Users uploaded successfully.")
            );
  } catch (error) {
    // Delete the file in case of an error
    if (req.file && req.file.path) fs.unlinkSync(req.file.path);
      next(error)
  }
});
  



export {
    createUser, 
    fetchAllUser, 
    fetchUserByID, 
    searchUser, 
    updateUser, 
    deleteUser,
    bulkUploadUserTemplate,
    bulkUploadUser
}
