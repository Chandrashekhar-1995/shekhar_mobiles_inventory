import { body } from "express-validator";

const userRegistrationValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 3 })
      .withMessage("username should be at least 3 char")
      .isLength({ max: 30 })
      .withMessage("username cannot exceed 30 char"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("mobileNumber")
      .trim()
      .notEmpty()
      .withMessage("mobile number is required")
      .isMobilePhone()
      .withMessage("not a valid mobile number"),
      body("address")
      .trim()
      .notEmpty()
      .withMessage("please enter village name")
      .isLength({ min: 4 })
      .withMessage("not a valid address")
      .isLength({ max: 200 })
      .withMessage("not a valid address"),
      body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("password should be at least 6 char")
      .isLength({ max: 50 })
      .withMessage("password cannot exceed 50 char"),
    //   .isStrongPassword()
    //   .withMessage("not a strong password")
  ];
};

const userLoginValidator = () => {
  return [
    body("identifier")
    .trim()
    .notEmpty()
    .withMessage("All fields is required"),
    body("password")
    .notEmpty()
    .withMessage("Password cannot be empty"),
  ];
};

export { userRegistrationValidator, userLoginValidator };
