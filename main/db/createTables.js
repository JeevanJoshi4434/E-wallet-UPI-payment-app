// db/createTables.js
const db = require('./index');

const createTables = async () => {
  try {
    await db.none(`
      CREATE TABLE IF NOT EXISTS "User" (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(100),
        number BIGINT UNIQUE NOT NULL,
        balance DECIMAL(10, 2) DEFAULT 0.00, -- Changed to DECIMAL
        connections BIGINT[],
        pin VARCHAR(10),
        payID VARCHAR(100),
        IP VARCHAR(100),
        lastLogin TIMESTAMP,
        verification BOOLEAN DEFAULT FALSE,
        contact_no VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Partner" (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        api_key VARCHAR(255) NOT NULL,
        secret_key VARCHAR(255) NOT NULL,
        contact_email VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        address JSONB, -- JSONB to store complex address fields
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "External_Payment_Requests" (
        id BIGSERIAL PRIMARY KEY,
        partner_id BIGINT REFERENCES "Partner"(id),
        user_id BIGINT REFERENCES "User"(id),
        payID VARCHAR(100) REFERENCES "User"(payID),
        amount DECIMAL(10, 2), -- Changed to DECIMAL
        request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50),
        payment_id BIGINT
      );

      CREATE TABLE IF NOT EXISTS "External_Audit_Logs" (
        id BIGSERIAL PRIMARY KEY,
        external_payment_id BIGINT,
        amount DECIMAL(10, 2), -- Changed to DECIMAL
        success BOOLEAN,
        transaction_time BIGINT
      );

      CREATE TABLE IF NOT EXISTS "Payment_History" (
        id BIGSERIAL PRIMARY KEY,
        sld BIGINT REFERENCES "User"(id),
        rld BIGINT REFERENCES "User"(id),
        amount DECIMAL(10, 2), -- Changed to DECIMAL
        success BOOLEAN,
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Requested_Payment" (
        id BIGSERIAL PRIMARY KEY,
        sld BIGINT REFERENCES "User"(id),
        rld BIGINT REFERENCES "User"(id),
        amount DECIMAL(10, 2), -- Changed to DECIMAL
        initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        finalized_at TIMESTAMP,
        success BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS "Notification" (
        id BIGSERIAL PRIMARY KEY,
        type VARCHAR(50),
        message VARCHAR(255),
        amount DECIMAL(10, 2), -- Changed to DECIMAL
        pushed_at TIMESTAMP,
        sid BIGINT REFERENCES "User"(id),
        rid BIGINT REFERENCES "User"(id),
        bulk BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS "OTP" (
        userID BIGINT REFERENCES "User"(id),
        OTP VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Audit_Logs" (
        id BIGSERIAL PRIMARY KEY,
        userId BIGINT REFERENCES "User"(id),
        action VARCHAR(100),
        description VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

createTables();
