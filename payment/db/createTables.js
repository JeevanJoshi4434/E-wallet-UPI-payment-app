// db/createTables.js
const db = require('./index');

async function createTables() {
  const query = `
      CREATE TABLE IF NOT EXISTS "User" (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name VARCHAR,
        number BIGINT UNIQUE NOT NULL,
        balance DECIMAL(10, 2) DEFAULT 0.00,
        connections BIGINT[],
        pin VARCHAR,
        payid VARCHAR,
        ip VARCHAR,
        lastLogin TIMESTAMP,
        verification BOOLEAN DEFAULT FALSE,
        contact_no VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Bank_Details" (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id BIGINT REFERENCES "User"(id),
        name VARCHAR,
        bank_name VARCHAR,
        account_number VARCHAR,
        ifsc_code VARCHAR
      );

      CREATE TABLE IF NOT EXISTS "Payout" (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id BIGINT REFERENCES "User"(id),
        amount DECIMAL(10, 2),
        bank_name VARCHAR,
        account_number VARCHAR,
        ifsc_code VARCHAR,
        name VARCHAR,
        status VARCHAR,
        txnid VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Partner" (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name VARCHAR NOT NULL,
        api_key VARCHAR NOT NULL,
        secret_key VARCHAR NOT NULL,
        contact_email VARCHAR,
        password VARCHAR NOT NULL,
        address VARCHAR,
        kyc BOOLEAN DEFAULT FALSE,
        kyc_details VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "External_Payment_Requests" (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        partner_id BIGINT REFERENCES "Partner"(id),
        user_id BIGINT REFERENCES "User"(id),
        payid VARCHAR,
        amount DECIMAL(10, 2),
        request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR,
        payment_id BIGINT
      );

      CREATE TABLE IF NOT EXISTS "External_Audit_Logs" (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        external_payment_id BIGINT,
        amount DECIMAL(10, 2),
        success BOOLEAN,
        transaction_time BIGINT
      );


      CREATE TABLE IF NOT EXISTS "Payment_History" (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "sId" BIGINT,
        "rId" BIGINT,
        txnid VARCHAR,
        amount DECIMAL(10, 2),
        success BOOLEAN,
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        pending BOOLEAN,
        note VARCHAR,
        senderBeforeAmount DECIMAL(10, 2),
        receiverBeforeAmount DECIMAL(10, 2),
        senderAfterAmount DECIMAL(10, 2),
        receiverAfterAmount DECIMAL(10, 2)
      );

      CREATE TABLE IF NOT EXISTS "Requested_Payment" (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "sId" BIGINT,
        "rId" BIGINT,
        amount DECIMAL(10, 2),
        initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        finalized_at TIMESTAMP,
        TTL BIGINT,
        success BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS "Notification" (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        type VARCHAR,
        message VARCHAR,
        amount DECIMAL(10, 2),
        pushed_at TIMESTAMP,
        "sId" BIGINT,
        "rId" BIGINT,
        bulk BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS "OTP" (
        userID BIGINT REFERENCES "User"(id),
        OTP VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Audit_Logs" (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        userid BIGINT REFERENCES "User"(id),
        action VARCHAR,
        description VARCHAR,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "External_Transaction" (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        sId BIGINT REFERENCES "User"(id),
        rId VARCHAR,
        beforeamount DECIMAL(10, 2),
        afteramount DECIMAL(10, 2),
        amount DECIMAL(10, 2),
        method VARCHAR,
        details VARCHAR,
        txnid VARCHAR,
        verified BOOLEAN DEFAULT FALSE,
        success BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Wallet_Recharge"(
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        "uId" BIGINT REFERENCES "User"(id),
        beforeamount DECIMAL(10, 2),
        afteramount DECIMAL(10, 2),
        amount DECIMAL(10, 2),
        details VARCHAR,
        receipt VARCHAR,
        verified BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
  `;

  try {
    await db.query(query);
    console.log("Tables created successfully.");
  } catch (err) {
    console.error("Error creating tables: ", err);
  }
}


module.exports = createTables;
