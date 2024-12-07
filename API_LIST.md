# User Routes
    -  Register a user (name, email, mobileNumber, address, password,)
        - http://localhost:7777/api/v1/user/register

    -  Create User by admin
        - http://localhost:7777/api/v1/user/create
            appept {"name", "email", "mobileNumber", "address", "avatar", "city", "state", "pinCode", "gender", "dateOfBirth", "marrigeAniversary", "bio", "joiningDate", "refferedBy", "designation", "dapartment", "emergencyContactPerson", "emergencyContactNumber", "bloodGroup", "identityDocument", "documentNumber", "communication", "salesCommission", "remark"  ///////  ==  validatoe intery == gender = (male, female, others), designation = ('Relationship Manager','Admin','Marketing Executive', 'Manager', 'Accountant', 'Clerk', 'Peon', 'Office Boy', 'Receptionist', 'Trainee'), department = ('Sales', 'Marketing', 'Finance', 'Human Resource', 'Administration', 'Accounts'), communication = ('sms', 'email'), salesCommission = ('yes', 'no'), }

    -  Login User ("identifier", "password")
        - http://localhost:7777/api/v1/user/login

    -  Logout
        - http://localhost:7777/api/v1/user/logout


# Profile Routes

    -  get profile
        - http://localhost:7777/api/v1/profile

    -  find user by email or mobile number {"identifier": "csp8052@gmail.com"}
        - http://localhost:7777/api/v1/user

    -  update login user profile 
        - http://localhost:7777/api/v1/user/update

    -  update user by admine 
        - http://localhost:7777/api/v1/admin/update/user
        