const User = require('../models/user.model');
const Customer = require('../models/customer.model');

const findUserOrCustomer = async (identifier) => {
  let user = await User.findOne({
    $or: [{ email: identifier }, { mobileNumber: identifier }],
  });

  if (!user) {
    user = await Customer.findOne({
      $or: [{ email: identifier }, { mobileNumber: identifier }],
    });
  }

  return user; // Returns the found user or customer, or null if not found.
};


const findCustomer = async (identifier) =>{
  let customer = await Customer.findOne({
    $or: [{ mobileNumber: identifier }, { name: identifier } ],
  });
  return customer;
};

module.exports = findUserOrCustomer, findCustomer;
