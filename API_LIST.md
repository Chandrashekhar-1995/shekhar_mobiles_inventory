# User Routes
    -  Register a customer (name, email, mobileNumber, address, password,)
        - http://localhost:7777/api/v1/auth/register

    -  Rejister Admin
        - http://localhost:7777/api/v1//auth/ManojChandraAjay@hgtfrgerj/jhds/jhgecfhgd/hjgef/vgd/hgfvedhv/ghdsv/gvsdgvedf/562134wefgr763478cvdsfcjkbhs/register-admin

    -  Create User by admin
        - http://localhost:7777/api/v1/auth/user/create
            appept {"name", "email", "mobileNumber", "address", "avatar", "city", "state", "pinCode", "gender", "dateOfBirth", "marrigeAniversary", "bio", "joiningDate", "refferedBy", "designation", "dapartment", "emergencyContactPerson", "emergencyContactNumber", "bloodGroup", "identityDocument", "documentNumber", "communication", "salesCommission", "remark"  ///////  ==  validatoe intery == gender = (male, female, others), designation = ('Relationship Manager','Admin','Marketing Executive', 'Manager', 'Accountant', 'Clerk', 'Peon', 'Office Boy', 'Receptionist', 'Trainee'), department = ('Sales', 'Marketing', 'Finance', 'Human Resource', 'Administration', 'Accounts'), communication = ('sms', 'email'), salesCommission = ('yes', 'no'), }

    -  Login User ("identifier", "password")
        - http://localhost:7777/api/v1/auth/login

    -  Logout
        - http://localhost:7777/api/v1/auth/logout


# Profile Routes

    -  get profile (.get)
        - http://localhost:7777/api/v1/profile

    -  find user by email or mobile number {"identifier": "csp8052@gmail.com"} (.get)
        - http://localhost:7777/api/v1/user/search

    -  update login user profile (.patch)
        - http://localhost:7777/api/v1/user/update

    -  update user by admine (.patch)
        - http://localhost:7777/api/v1/admin/update/user

    -  user password change
        - http://localhost:7777/api/v1/password/change

    -  reset password
        - http://localhost:7777/api/v1/password/reset

    -  get all customer by Administration 
        - http://localhost:7777/api/v1/customer/feed

    -  get all user by Administration 
        - http://localhost:7777/api/v1/user/feed


    -  patch admin change department
        - http://localhost:7777/api/v1/admin/update-designation


    -  bulk customer template download (get)
        - http://localhost:7777/api/v1/customer/bulk-upload/template

    -  bulk Customer upload (post)
        - http://localhost:7777/api/v1/customer/bulk-upload

# Category Routes

    -  create category (post)
        - http://localhost:7777/api/v1/category/create
    
    -  add sub category (patch)
        - http://localhost:7777/api/v1/category/led/add-subcategory


# Brand Routes
    -  create brand (post)
        - http://localhost:7777/api/v1/brand/create


# Product Routes
    -  create product (post)
        - http://localhost:7777/api/v1/product/create

    -  bulk product template download (get)
        - http://localhost:7777/api/v1/product/template

    -  bulk product upload (post)
        - http://localhost:7777/api/v1/product/bulk-upload


# Account Routes
    -  create account (post)
        - http://localhost:7777/api/v1/account/create



# Invoice Routes
    -  create account (post)
        - http://localhost:7777/api/v1/invoice/create 