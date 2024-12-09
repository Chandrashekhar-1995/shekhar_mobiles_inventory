# User Routes
    -  Register (name, email, mobileNumber, address, password,)
        - http://localhost:7777/api/v1/auth/register

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
        