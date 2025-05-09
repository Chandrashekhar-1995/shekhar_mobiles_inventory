import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";


const customerSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Customer name is required"],
            lowercase: true,
            trim: true,
            index:true
        },
        contactNumber:{
            type: String,
            validate: {
                validator: function (value) {
                    return value === null || /^[0-9]{10}$/.test(value);
                },
                message: '{VALUE} is not a valid mobile number!',
            },
            default: null,
        },
        mobileNumber: {
            type: String,
            required: [true, "Mobile number is required"],
            unique: true,
            validate: {
                validator: function (value) {
                    return /^[6-9]\d{9}$/.test(value);
                },
                message: (props) => `${props.value} is not a valid mobile number!`,
            },
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true
        },
        password: {
            type: String,
            required: [true, " Password is required"],
        },
        city:{
            type: String,
            default:"Kushinagar",
        },
        state:{
            type: String,
            default:"Uttar Pradesh",
        },
        pinCode:{
            type: Number,
            default:274207,
        },
        country:{
            type: String,
            default:"India",
        },        
        email: {
            type: String,
            validate: {
                validator: function (value) {
                    // Allow null or validate email format
                    return value === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                },
                message: '{VALUE} is not a valid email address!',
            },
        },
        avatar: {
            type: String,// cloudanery url
            // default:"http://res.cloudinary.com/chandrashekhar/image/upload/v1717332666/drlgqpgmr43vj8rqidxm.jpg"
        },
        gender:{
            type:String,
            enum: {
                values: ["male", "female", "others"],
                message: '{VALUE} is not supported gender'
              }
        },
        panNo:{
            type:String,
        },
        gstin:{
            type:String,
        },
        gstType:{
            type:String,
        },
        tradeName:{
            type:String,
        },
        dateOfBirth: {
            type: Date,
            required: false,
            get: (value) => {
                if (!value) return null;
                const date = new Date(value);
                const day = String(date.getUTCDate()).padStart(2, "0");
                const month = String(date.getUTCMonth() + 1).padStart(2, "0");
                const year = date.getUTCFullYear();
                return `${day}/${month}/${year}`;
            },
        },
        marrigeAniversary: {
            type: Date,
            required: false,
            get: (value) => {
                if (!value) return null;
                const date = new Date(value);
                const day = String(date.getUTCDate()).padStart(2, "0");
                const month = String(date.getUTCMonth() + 1).padStart(2, "0");
                const year = date.getUTCFullYear();
                return `${day}/${month}/${year}`;
            },
        },
        bio: {
            type: String,
            max:[500, 'Maximum 500 chareters allowed'],
        },
        remark: {
            type: String,
            max:[500, 'Maximum 500 chareters allowed'],
        },
        designation:{
            type: String,
            enum:{
                values:["customer", "supplier"]
            },
            default:"customer"
        },
        refreshToken: {
            type: String,
        },
        purchaseHistory: [
            {
                invoiceId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Invoice",
                },

            },
        ],
        repairHistory: [{
            repairId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Repair",
            },
        }],
        accountType:{
            type:String,
            enum: {
                values: ["Debit", "Credit"],
                message: '{VALUE} is not supported type'
              }
        },
        balance: {
            type: Number,
            default: 0,
          },
        creditAllowed:{
            type: Boolean,
            defalt: false,
        },
        creditLimit:{
            type: Number,
        },
        loyaltyPoints: {
            type: Number,
            default: 0,
        },
        refferedBy:{
            type: String,
        },
        documentType: {
            type:String,
            enum: {
                values: ["aadhar_card", "pan_card", "driving_license", "government_id","voter_card" ],
                message: '{VALUE} is not a valid Document'
              }
        },
        documentNo: {
            type: String,
            max:[100, 'Maximum 100 chareters allowed'],
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
          },
          refreshToken: {
            type: String,
          },
          forgotPasswordToken: {
            type: String,
          },
          forgotPasswordExpiry: {
            type: Date,
          },
          emailVerificationToken: {
            type: String,
          },
          emailVerificationExpiry: {
            type: Date,
          },
    },
    {timestamps:true}
);

// Hash the password before saving
customerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});


customerSchema.methods.validatePassword = async function (passwordInterByUser){
    const user = this;
    console.log("Validating password...");
    console.log("Input password:", passwordInterByUser);
    console.log("Stored hash:", this.password);
    const hashPassword = user.password
    const isPasswordValid = await bcrypt.compare(passwordInterByUser, hashPassword);
    console.log("Password valid:", isPasswordValid);

    return isPasswordValid;
}

customerSchema.methods.generateAccessToken = function () {
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        mobileNumber: this.mobileNumber,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    );
  };

customerSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
};

customerSchema.methods.generateTemporaryToken = function () {
    // This token should be client facing
    // for example: for email verification unHashedToken should go into the user's mail
    const unHashedToken = crypto.randomBytes(20).toString("hex");
  
    // This should stay in the DB to compare at the time of verification
    const hashedToken = crypto
      .createHash("sha256")
      .update(unHashedToken)
      .digest("hex");
    // This is the expiry time for the token (20 minutes)
    const tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes;
  
    return { unHashedToken, hashedToken, tokenExpiry };
  };
        
export const Customer = mongoose.model("Customer", customerSchema);