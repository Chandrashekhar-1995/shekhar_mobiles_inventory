import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";


const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            lowercase: true,
            max:[100, 'Maximum 100 chareters allowed'],
            trim: true,
            index:true
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            required: [true, "Email is required"],
            trim: true,
            validate: {
                validator: function (value) {
                    // Use a regex to validate email format
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                },
                message: (props) => `${props.value} is not a valid email address!`,
            },
        },
        avatar: {
            type: String,// cloudanery url
            // default:"http://res.cloudinary.com/chandrashekhar/image/upload/v1717332666/drlgqpgmr43vj8rqidxm.jpg"
        },
        mobileNumber: {
            type:String,
            unique: true,
            required: [true, "Mobile Number is required"],
            trim: true,
            validate: {
                validator: function (value) {
                    return /^[6-9]\d{9}$/.test(value); // Validates Indian mobile number format
                },
                message: (props) => `${props.value} is not a valid mobile number!`,
            },
        },
        password: {
            type: String,
            required: [true, " Password is required"],
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            max:[200, 'Only 200 chareters allowed'],
            trim: true
        },
        city:{
            type: String,
            max:[100, 'Maximum 100 chareters allowed'],
            default:"Kushinagar",
        },
        state:{
            type: String,
            max:[100, 'Maximum 100 chareters allowed'],
            default:"Uttar Pradesh",
        },
        pinCode:{
            type: Number,
            default:274207,
        },
        country:{
            type: String,
            max:[100, 'Maximum 100 chareters allowed'],
            default:"India",
        },
        gender:{
            type:String,
            enum: {
                values: ['male', 'female', 'others'],
                message: '{VALUE} is not supported gender'
              }
        },
        dateOfBirth: {
            type: Date,
            required: false,
        },
        marrigeAniversary: {
            type: Date,
        },
        bio: {
            type: String,
            max:[500, 'Maximum 500 chareters allowed'],
        },
        joiningDate:{
            type: Date,
        },
        referredBy:{
            type:String,
            max:[50, 'Maximum 50 chareters allowed'],
        }, 
        refreshToken: {
            type: String,
        },
        designation:{
            type:String,
            enum: {
                values: ["relationship_manager","admin","marketing_executive", "manager", "accountant", "clerk", "peon", "office_boy", "receptionist", "trainee"],
                message: '{VALUE} is not supported Designation'
              },
              default:'trainee',
        },
        department:{
            type:String,
            enum: {
                values: ["sales", "marketing", "finance", "human_resource", "administration", "accounts"],
                message: '{VALUE} Department not found'
              }
        },
        panNo:{
            type:String,
        },
        emergencyContactPerson:{
            type:String,
            max:[100, 'Maximum 100 chareters allowed'],
        },
        emergencyContactNumber:{
            type:Number,
        },
        bloodGroup:{
            type:String,
            max:[20, 'Maximum 20 chareters allowed'],
        },
        identityDocument:{
            type:String,
            enum: {
                values: ["aadhar_card", "pan_card", "driving_license", "government_id","voter_card" ],
                message: '{VALUE} is not a valid Document'
              }
        },
        documentNumber:{
            type:String,
            max:[100, 'Maximum 100 chareters allowed'],
        },
        communication:{
            type:String,
            enum: {
                values: ['sms', 'email' ],
                message: '{VALUE} not Supported'
              }
        },
        saleHistory: [
                    {
                        invoiceId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Invoice", // Assumes you have a Product model
                        },
                        date: {
                            type: Date,
                            default: Date.now,
                        },
                        totalAmount: {
                            type: Number,
                            required: true,
                        },
                    },
                ],
        bookRepairHistory: [
            {
                repairId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Repair", 
                    },
                date: {
                    type: Date,
                    default: Date.now,
                    },
                totalAmount: {
                    type: Number,
                    required: true,
                    },
            },
            ],
        underRepair: [
            {
                repairId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Repair",
                    },
                date: {
                    type: Date,
                    default: Date.now,
                    },
                totalAmount: {
                    type: Number,
                    required: true,
                    },
            },
            ],
        repairHistory: [
            {
                invoiceId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Invoice",
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
                totalAmount: {
                    type: Number,
                    required: true,
                },
            },
        ],
        salesCommission:{
            type:String,
            enum: {
                values: ['yes', 'no' ],
                message: '{VALUE} not Supported'
              }
        },
        remark:{
            type:String,
            max:[200, 'Maximum 200 chareters allowed'],
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
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});


userSchema.methods.validatePassword = async function (passwordInterByUser){
    const user = this;
    const hashPassword = user.password
    const isPasswordValid = await bcrypt.compare(passwordInterByUser, hashPassword);

    return isPasswordValid;
}

userSchema.methods.generateAccessToken = function () {
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

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
};


userSchema.methods.generateTemporaryToken = function () {
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

export const User = mongoose.model("User", userSchema);