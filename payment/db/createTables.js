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
      payid VARCHAR UNIQUE,
      ip VARCHAR,
      lastlogin TIMESTAMP,
      verification BOOLEAN DEFAULT FALSE,
      contact_no VARCHAR,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Partner" (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name VARCHAR NOT NULL,
      api_key VARCHAR NOT NULL,
      secret_key VARCHAR NOT NULL,
      contact_email VARCHAR,
      password VARCHAR NOT NULL,
      address JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "External_Payment_Requests" (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      partner_id BIGINT REFERENCES "Partner"(id),
      user_id BIGINT REFERENCES "User"(id),  -- Ensure that "id" column in User is unique
      payid VARCHAR REFERENCES "User"(payid), -- PayID should reference a unique column in User table
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
      "senderBeforeAmount" DECIMAL(10, 2),
      "receiverBeforeAmount" DECIMAL(10, 2),
      "senderAfterAmount" DECIMAL(10, 2),
      "receiverAfterAmount" DECIMAL(10, 2)
    );

    CREATE TABLE IF NOT EXISTS "Requested_Payment" (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "sId" BIGINT,
      "rId" BIGINT,
      amount DECIMAL(10, 2),
      initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      finalized_at TIMESTAMP,
      ttl BIGINT,
      success BOOLEAN
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
      action VARCHAR,
      action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id BIGINT REFERENCES "User"(id),
      details JSONB
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
