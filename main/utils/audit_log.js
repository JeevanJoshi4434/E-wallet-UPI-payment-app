const db = require("../db");

/**
 * Logs audit messages with error handling
 * @param {number} userId - ID of the user initiating the action
 * @param {string} action - Type of action (e.g., 'Payment')
 * @param {string} description - Description of the action
 */
async function AuditLog(userId, action, description){
    try {
        await db.none(
            `INSERT INTO "Audit_Logs" (userid, action, description, timestamp) VALUES ($1, $2, $3, NOW())`,
            [userId, action, description]
        );
        console.log('Audit log added successfully');
    } catch (error) {
        console.error('Failed to log audit:', error);
    }
}

module.exports = AuditLog;