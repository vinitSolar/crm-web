export const EMAIL_VARIABLES = [
    // Customer Information
    { label: 'First Name', value: '[[FIRST_NAME]]', description: 'Customer first name' },
    { label: 'Last Name', value: '[[LAST_NAME]]', description: 'Customer last name' },
    { label: 'Full Name', value: '[[FULL_NAME]]', description: 'Customer full name' },
    { label: 'Customer ID', value: '[[CUSTOMER_ID]]', description: 'Customer identifier' },
    { label: 'Customer Number', value: '[[CUSTOMER_NUMBER]]', description: 'Customer account number' },
    { label: 'Contact Number', value: '[[CONTACT_NUMBER]]', description: 'Customer phone number' },

    // Project/Proposal
    { label: 'Project No', value: '[[PROJECT_NO]]', description: 'Project number' },
    { label: 'Proposal Link', value: '[[PROPOSAL_LINK]]', description: 'Link to proposal document' },
    { label: 'Pricing', value: '[[PRICING]]', description: 'Pricing details' },
    { label: 'Agreement Date', value: '[[AGREEMENT_DATE]]', description: 'Date of agreement' },

    // Verification
    { label: 'Verification Code', value: '[[VERIFICATION_CODE]]', description: 'Email verification code' },

    // Organization
    { label: 'Org Name', value: '[[ORG_NAME]]', description: 'Organization name' },

    // Sender/Receiver
    { label: 'Sender Name', value: '[[SENDER_NAME]]', description: 'Email sender name' },
    { label: 'Sender Email', value: '[[SENDER_EMAIL]]', description: 'Email sender address' },
    { label: 'Receiver Name', value: '[[RECEIVER_NAME]]', description: 'Email receiver name' },
    { label: 'Receiver Email', value: '[[RECEIVER_EMAIL]]', description: 'Email receiver address' },
] as const;
