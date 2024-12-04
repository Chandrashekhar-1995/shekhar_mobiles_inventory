const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
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
        },
        avatar: {
            type: String,// cloudanery url
            // default:"http://res.cloudinary.com/chandrashekhar/image/upload/v1717332666/drlgqpgmr43vj8rqidxm.jpg"
        },
        mobileNumber: {
            type:Number,
            unique: true,
            required: [true, "Mobile Number is required"],
            trim: true,
            index:true
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
            get: (value) => value?.toISOString().split("T")[0], // Converts to YYYY-MM-DD format when reading
            set: (value) => new Date(value), // Ensures only the date is saved
        },
        marrigeAniversary: {
            type: Date,
            required: false,
            get: (value) => value?.toISOString().split("T")[0], 
            set: (value) => new Date(value),
        },
        bio: {
            type: String,
            max:[50, 'Maximum 500 chareters allowed'],
        },
        password: {
            type: String,
            required: [true, " Password is required"],
            default: "ShekharMobiles9@"

        },
        refreshToken: {
            type: String,
        },
        joiningDate:{
            type: Date,
            required: false,
            get: (value) => value?.toISOString().split("T")[0], 
            set: (value) => new Date(value),
        },
        referredBy:{
            type:String,
            max:[50, 'Maximum 50 chareters allowed'],
        },
        designation:{
            type:String,
            enum: {
                values: ['Relationship Manager','Admin','Marketing Executive', 'Manager', 'Accountant', 'Clerk', 'Peon', 'Office Boy', 'Receptionist', 'Trainee'],
                message: '{VALUE} is not supported Designation'
              },
              default:'Trainee',
        },
        department:{
            type:String,
            enum: {
                values: ['Sales', 'Marketing', 'Finance', 'Human Resource', 'Administration', 'Accounts'],
                message: '{VALUE} Department not found'
              }
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
                values: ['Aadhar Card', 'PAN Card', 'Driving License', 'Government ID','Voter Card' ],
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
        }
    },
    {timestamps:true}
);

module.exports = mongoose.model("User", userSchema);