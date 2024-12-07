const mongoose = require("mongoose");
const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Customer name is required"],
            lowercase: true,
            trim: true,
            index:true
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
        State:{
            type: String,
            default:"Uttar Pradesh",
        },
        pinCode:{
            type: Number,
            default:274207,
        },        
        email: {
            type: String,
            lowercase: true,
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
            get: (value) => value?.toISOString().split("T")[0], 
            set: (value) => new Date(value),
        },
        marrigeAniversary: {
            type: Date,
            required: false,
            get: (value) => value?.toISOString().split("T")[0], 
            set: (value) => new Date(value),
        },
        bio: {
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
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product", // Assumes you have a Product model
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                totalAmount: {
                    type: Number,
                    required: true,
                },
            },
        ],
        loyaltyPoints: {
            type: Number,
            default: 0,
        },
    },
    {timestamps:true}
);

module.exports = mongoose.model("Customer", customerSchema);