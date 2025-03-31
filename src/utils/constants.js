
export const UserRolesEnum = {
    RELATIONSHIP_MANAGER:"relationship_manager",
    MARKETING_EXECUTIVE:"marketing_executive",
    MANAGER:"manager", 
    ACCOUNTANT:"accountant",
    CLERK:"clerk", 
    PEON:"peon", 
    OFFICE_BOY:"office_boy", 
    RECEPTIONIST:"receptionist",
    TRAINEE:"trainee",
  };
  
export const AvailableUserRoles = Object.values(UserRolesEnum);

export const DepartmentEnum = {
    RELATIONSHIP_MANAGER:"sales", 
    MARKETING:"marketing", 
    FINANCE:"finance", 
    HUMAN_RESOURCE:"human_resource", 
    ADMINISTRATION:"administration", 
    ACCOUNTS:"accounts",
  };
  
export const AvailableDepartment = Object.values(DepartmentEnum);
  

export const GenderEnum = {
    MALE: "male",
    FEMALE: "female",
    OTHERS: "others",
  };
  
export const AvailableGender = Object.values(GenderEnum);
  
export const IdentityDocumentEnum = {
    AADHAR_CARD: "aadhar_card", 
    PAN_CARD:"pan_card", 
    DRIVING_LICENSE:"driving_license", 
    GOVERNMENT_ID:"government_id",
    VOTER_CARD:"voter_card",
  };
  
export const AvailableIdentityDocument = Object.values(IdentityDocumentEnum);

export const AccountTypeEnum = {
  AADHAR_CARD: "cash",
  QR_CODE:"qr_code", 
  RAZORPAY:"razorpay", 
  BANK:"bank",
};

export const AvailableAccountType = Object.values(AccountTypeEnum);

export const AccountStatusEnum = {
  ACTIVE: "active", 
  IN_ACTIVE:"in_active",
};

export const AvailableAccountStatus = Object.values(AccountStatusEnum);

export const TransactionTypeEnum = {
  ACTIVE: "active", 
  IN_ACTIVE:"in_active",
};

export const AvailableTransactionType = Object.values(TransactionTypeEnum);


export const InvoiceTypeEnum = {
  NON_GST: "non_gst", 
  GST:"gst", 
  BILL_OF_SUPPLY:"bill_of_supply",
};

export const AvailableInvoiceType = Object.values(InvoiceTypeEnum);

export const MobileTypeEnum = {
  NEW: "new", 
  SECOND_HAND:"second_hand", 
  REPAIR:"repair",
};

export const AvailableMobileType = Object.values(MobileTypeEnum);


export const UnitEnum = {
  UNT: "unt", 
  PCS:"pcs", 
  NOS:"nos", 
  MTR:"mtr", 
  BOX:"box",
};

export const AvailableUnit = Object.values(UnitEnum);

export const RepairingEnum = {
  MOBILE: "mobile", 
  LCD:"lcd", 
  PC_LAPTOP:"pc_laptop", 
  OTHERS:"others",
};

export const AvailableRepairing = Object.values(RepairingEnum);


export const RepairingStatusEnum = {
  IN_PROGRESS: "in_progress", 
  REPAIR_DONE:"repaire_done", 
  DELIVERED:"delivered", 
  RETURN:"return",
};

export const AvailableRepairingStatus = Object.values(RepairingStatusEnum);