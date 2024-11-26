// db/updateTables.js
const db = require('./index');

const updateTables = async () => {
  try {
    await db.none(`
      -- Example: Updating 'balance' field in 'User' table to DECIMAL(10, 2)
      ALTER TABLE "User" 
      ALTER COLUMN balance TYPE DECIMAL(10, 2) USING balance::DECIMAL(10, 2);

      -- Example: Updating 'amount' field in 'External_Payment_Requests' table
      ALTER TABLE "External_Payment_Requests" 
      ALTER COLUMN amount TYPE DECIMAL(10, 2) USING amount::DECIMAL(10, 2);

      -- Repeat similar ALTER statements for other fields in other tables
      ALTER TABLE "External_Audit_Logs" 
      ALTER COLUMN amount TYPE DECIMAL(10, 2) USING amount::DECIMAL(10, 2);

      ALTER TABLE "Payment_History" 
      ALTER COLUMN amount TYPE DECIMAL(10, 2) USING amount::DECIMAL(10, 2);

      ALTER TABLE "Requested_Payment" 
      ALTER COLUMN amount TYPE DECIMAL(10, 2) USING amount::DECIMAL(10, 2);

      ALTER TABLE "Notification" 
      ALTER COLUMN amount TYPE DECIMAL(10, 2) USING amount::DECIMAL(10, 2);

      -- You can also update the 'created_at' and 'updated_at' fields if necessary
      -- For example, setting a default value or altering the type if needed
    `);

    console.log("Tables updated successfully");
  } catch (error) {
    console.error("Error updating tables:", error);
  }
};

updateTables();
