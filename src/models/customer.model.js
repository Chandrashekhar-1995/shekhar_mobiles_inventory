const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;

const customerSchema = new mongoose.Schema(
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
                    // Allow null or validate phone number format
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
                    return /^[6-9]\d{9}$/.test(value); // Validates Indian mobile number format
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
            default: "ShekharMobiles9@"

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
            default: null,
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
                values:["Customer", "Supplier"]
            },
            default:"Customer"
        },
        refreshToken: {
            type: String,
        },
        purchaseHistory: [
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
            type: String,
            enum: {
                values: ["Yes", "No"],
                message: '{VALUE} is not supported gender'
              }
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
            type: String,
            max:[500, 'Maximum 500 chareters allowed'],
        },
        documentNo: {
            type: String,
            max:[500, 'Maximum 500 chareters allowed'],
        },
    },
    {timestamps:true}
);


// Hash the password before saving
customerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
   });


customerSchema.methods.getJWT = function(){
    const user = this;
    return jwt.sign({ _id: user._id }, secretKey, { expiresIn: "1d" });
};



customerSchema.methods.validatePassword = async function (passwordInterByUser){
    const user = this;
    const hashPassword = user.password
    const isPasswordValid = await bcrypt.compare(passwordInterByUser, hashPassword);

    return isPasswordValid;
}

module.exports = mongoose.model("Customer", customerSchema);