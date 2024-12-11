const db = require("../db");


exports.fetchLoggedInUser = async (req, res) => {
    try {
        const user = req.user;
        const userDetail = await db.oneOrNone('SELECT * FROM "User" WHERE id = $1', [user.id]);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        res.status(200).json({ user: userDetail, message: 'User fetched successfully', success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}

exports.fetchUser = async (req, res) => {
    try {
        const { userID } = req.query;
        const user = await db.oneOrNone('SELECT * FROM "User" WHERE id = $1', [userID]);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        res.status(200).json({ user, message: 'User fetched successfully', success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }  
}

exports.fetchBalance = async (req, res) => {
    try {
        const user = req.user;
        const userDetail = await db.oneOrNone('SELECT * FROM "User" WHERE id = $1', [user.id]);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        res.status(200).json({ balance: userDetail.balance, message: 'User fetched successfully', success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}


exports.getConnections = async (req, res) => {
    try {
        const user = req.user;

        // Fetch the user details including connections
        const userDetail = await db.oneOrNone('SELECT * FROM "User" WHERE id = $1', [user.id]);

        if (!userDetail) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        // If connections is not an array or is empty, return an empty array
        if (!Array.isArray(userDetail.connections) || userDetail.connections.length === 0) {
            return res.status(200).json({ connections: [], message: 'No connections found', success: true });
        }
        let connectionArray = [];
        userDetail.connections.forEach(element => {
            connectionArray.push(parseInt(element));
        });
        // Fetch details of each connected user by matching their IDs
        const connectionsDetails = await db.any(
            'SELECT id, name, payid, number FROM "User" WHERE id = ANY($1)',
            [connectionArray]
        );

        res.status(200).json({ connections: connectionsDetails, message: 'Connections fetched successfully', success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};

exports.getSinglePaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id; // Current user's ID
        const { Id } = req.query; // Query parameter for the other user's ID

        // Validate input
        if (!Id) {
            return res.status(400).json({ message: "Id parameter is required", success: false });
        }

        // Query to get the combined payment history of the two users
        const paymentHistory = await db.any(
            `
            SELECT * FROM (
                SELECT 
                    ph.id, 
                    ph."sId"::text AS "sId",  -- Cast bigint to text
                    ph."rId"::text AS "rId",  -- Cast bigint to text
                    ph.amount, 
                    NULL AS method,           -- Method doesn't exist in Payment_History
                    NULL AS details,          -- Details doesn't exist in Payment_History
                    ph.txnid, 
                    ph.success, 
                    ph.note,
                    ph."paid_at",
                    CASE 
                        WHEN ph."sId"::text = $1 THEN u2.name  -- Sender is the current user
                        ELSE u1.name                           -- Receiver is the current user
                    END AS name,
                    'Payment_History' AS source
                FROM "Payment_History" ph
                LEFT JOIN "User" u1 ON ph."sId" = u1.id::bigint  -- Ensure consistent type
                LEFT JOIN "User" u2 ON ph."rId" = u2.id::bigint  -- Ensure consistent type
                WHERE 
                    (
                        (ph."sId"::text = $1 AND ph."rId"::text = $2) OR
                        (ph."sId"::text = $2 AND ph."rId"::text = $1)
                    )
            ) AS history
            ORDER BY history."paid_at" ASC -- Order by payment date ASC
            `,
            [userId, Id]
        );

        // Respond with the payment history
        res.status(200).json({ 
            paymentHistory, 
            message: "Payment history fetched successfully", 
            success: true 
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ 
            message: "Internal server error", 
            success: false 
        });
    }
};

exports.getBankDetails = async (req, res) => {
    try {
        const bank = await db.any('SELECT * FROM "Bank_Details" WHERE user_id = $1', [req.user.id]);
        
        // Check if bank details are found
        if (!bank || bank.length === 0) {
            return res.status(404).json({ message: 'No bank details found', success: false });
        }

        res.status(200).json({ bankDetails: bank, message: 'Bank details fetched successfully', success: true });
    } catch (err) {
        console.error('Error fetching bank details:', err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}

exports.getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id; // Current user's ID
        const { page = 0, limit = 4 } = req.query; // Page number, default to 0 if not provided
        const pageSize = parseInt(limit); // Number of records per page

        // Calculate the offset for pagination
        const offset = page * pageSize;

        // Query to get the combined payment history with pagination

        const paymentHistory = await db.any(
            `
            SELECT * FROM (
                SELECT 
                    ph.id, 
                    ph."sId"::text AS "sId",  -- Cast bigint to text
                    ph."rId"::text AS "rId",  -- Cast bigint to text
                    ph.amount, 
                    NULL AS method,  -- Method doesn't exist in Payment_History
                    NULL AS details, -- Details doesn't exist in Payment_History
                    ph.txnid, 
                    ph.success,
                    ph."paid_at",
                    CASE 
                    WHEN ph."sId"::text = $1 THEN u2.name  -- Cast for consistent comparison
                    ELSE u1.name 
                    END AS name,
                    ph.note, 
                    'Payment_History' AS source
                    FROM "Payment_History" ph
                LEFT JOIN "User" u1 ON ph."sId" = u1.id::bigint  -- Ensure consistent type
                LEFT JOIN "User" u2 ON ph."rId" = u2.id::bigint  -- Ensure consistent type
                WHERE (ph."sId"::text = $1 OR ph."rId"::text = $1)
                  AND ph.success = TRUE -- Include only rows where success is TRUE
          
                UNION ALL
          
                SELECT 
                    et.id, 
                    et."sid"::text AS "sId",  -- Cast bigint to text
                    et."rid" AS "rId",        -- Already character varying
                    et.amount, 
                    et.method, 
                    et.details, 
                    et.txnid, 
                    et.success,
                    et."timestamp" AS "paid_at", 
                    NULL AS name, -- No name mapping for External_Transaction
                    NULL::text AS note,
                    'External_Transaction' AS source
                FROM "External_Transaction" et
                WHERE (et."sid"::text = $1 )
                  AND et.verified = TRUE
          
                UNION ALL
          
                SELECT 
                    wr.id, 
                    wr."uId"::text AS "rId",  -- Treat uId as sId
                    NULL AS "sId",  -- Treat uId as sId
                    wr.amount, 
                    'recharge'::text AS method,           -- Method field not applicable
                    wr.details, 
                    NULL AS txnid,            -- No transaction ID
                    wr.verified AS success, 
                    wr.timestamp AS "paid_at",
                    'Recharge'::text AS name,             -- No name mapping for Wallet_Recharge
                    NULL::text AS note,
                    'Wallet_Recharge' AS source
                FROM "Wallet_Recharge" wr
                WHERE wr."uId"::text = $1 
                  AND wr.verified = TRUE -- Include only verified recharges
            ) combined
            WHERE combined."rId" IS NOT NULL OR combined."sId" IS NOT NULL -- Exclude rows without sender or receiver ID
            ORDER BY combined."paid_at" DESC
            LIMIT $2 OFFSET $3;
            `,
            [userId, pageSize, offset]
        );
        res.status(200).json({
            payments: paymentHistory,
            page,
            pageSize,
            message: 'Payment history fetched successfully',
            success: true,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};

// exports.getPaymentHistory = async (req, res) => {
//     try {
//         const userId = req.user.id; // Current user's ID
//         const { page = 0, limit = 4 } = req.query; // Page number, default to 0 if not provided
//         const pageSize = limit; // Number of records per page

//         // Calculate the offset for pagination
//         const offset = page * pageSize;

//         // Query to get the payment history with pagination and conditional name selection
//         const paymentHistory = await db.any(
//             `
//             SELECT ph.*, 
//                 CASE 
//                     WHEN ph."sId" = $1 THEN u2.name 
//                     ELSE u1.name 
//                 END AS name
//             FROM "Payment_History" ph
//             LEFT JOIN "User" u1 ON ph."sId" = u1.id
//             LEFT JOIN "User" u2 ON ph."rId" = u2.id
//             WHERE ph."sId" = $1 OR ph."rId" = $1
//             ORDER BY ph."paid_at" DESC 
//             LIMIT $2 OFFSET $3
//             `,
//             [userId, pageSize, offset]
//         );

//         const ExternalPaymentHistory = await db.any(
//             `
//             SELECT ph.*, 
//                 CASE 
//                     WHEN ph."sId" = $1 THEN u2.name 
//                     ELSE u1.name 
//                 END AS name
//             FROM "External_Transaction" ph
//             LEFT JOIN "User" u1 ON ph."sId" = u1.id
//             LEFT JOIN "User" u2 ON ph."rId" = u2.id
//             WHERE ph."sId" = $1 OR ph."rId" = $1
//             ORDER BY ph."paid_at" DESC 
//             LIMIT $2 OFFSET $3
//             `,
//             [userId, pageSize, offset]
//         );

//         res.status(200).json({
//             payments: paymentHistory,
//             external: ExternalPaymentHistory,
//             page,
//             pageSize,
//             message: 'Payment history fetched successfully',
//             success: true,
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Internal server error', success: false });
//     }
// };


exports.getRecentPaidUsers = async (req, res) => {
    try {
        const userId = req.user.id; // Current user's ID

        // SQL Query to get the recent 5 paid users with specific details
        const recentPaidUsers = await db.any(
            `
            SELECT 
                u.name, 
                u.number, 
                ph.payid, 
                ph.paid_at 
            FROM 
                "User" u
            INNER JOIN 
                "Payment_History" ph 
            ON 
                u.id = ph.rId
            WHERE 
                ph.sId = $1
            ORDER BY 
                ph.paid_at DESC
            LIMIT 5
            `,
            [userId]
        );

        res.status(200).json({
            users: recentPaidUsers,
            message: 'Recent paid users fetched successfully',
            success: true,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};
