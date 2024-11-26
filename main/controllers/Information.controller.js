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


exports.getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id; // Current user's ID
        const { page = 0, limit = 4 } = req.query; // Page number, default to 0 if not provided
        const pageSize = limit; // Number of records per page

        // Calculate the offset for pagination
        const offset = page * pageSize;

        // Query to get the payment history with pagination and conditional name selection
        const paymentHistory = await db.any(
            `
            SELECT ph.*, 
                CASE 
                    WHEN ph."sId" = $1 THEN u2.name 
                    ELSE u1.name 
                END AS name
            FROM "Payment_History" ph
            LEFT JOIN "User" u1 ON ph."sId" = u1.id
            LEFT JOIN "User" u2 ON ph."rId" = u2.id
            WHERE ph."sId" = $1 OR ph."rId" = $1
            ORDER BY ph."paid_at" DESC 
            LIMIT $2 OFFSET $3
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
