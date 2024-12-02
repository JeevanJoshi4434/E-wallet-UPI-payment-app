const axios = require("axios");

async function fetchReciever(payID) {
    try {
        // Await the axios call to ensure `response` is the resolved result
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVICE_MAIN}/api/v1/find_payid?payID=${payID}`);

        if (response.data.success) {
            return { data: response.data, success: true };
        } else {
            return { error: true, success: false, message: "Something went wrong", status: 500 };
        }
    } catch (error) {
        // Handle cases where response is undefined or error status doesn't exist
        if (error.response && error.response.status === 404) {
            return { error: true, success: false, message: "User not found", status: 404 };
        } else {
            return { error: true, success: false, message: "Something went wrong", status: 500 };
        }
    }
}

async function fetchNumber(number) {
    try {
        // Await the axios call to ensure `response` is the resolved result
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVICE_MAIN}/api/v1/find_number?number=${number}`);

        if (response.data.success) {
            return { data: response.data, success: true };
        } else {
            return { error: true, success: false, message: "Something went wrong", status: 500 };
        }
    } catch (error) {
        // Handle cases where response is undefined or error status doesn't exist
        if (error.response && error.response.status === 404) {
            return { error: true, success: false, message: "User not found", status: 404 };
        } else {
            return { error: true, success: false, message: "Something went wrong", status: 500 };
        }
    }
}

async function fetchUser(uID) {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVICE_MAIN}/api/v1/get_user?userID=${uID}`);
        if (response.data.success) {
            return { data: response.data, success: true };
        } else {
            return { error: true, success: false, message: "Something went wrong", status: 500 };
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { error: true, success: false, message: "User not found", status: 404 };
        } else {
            return { error: true, success: false, message: "Something went wrong", status: 500 };
        }
    }
}


async function fetchLoggedInUser(token) {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVICE_MAIN}/api/v1/information/logged_in_user`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (response.data.success) {
            return { data: response.data, success: true };
        } else {
            return { error: true, success: false, message: "Something went wrong", status: 500 };
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { error: true, success: false, message: "User not found", status: 404 };
        } else {
            return { error: true, success: false, message: error.response.data.message || "Something went wrong", status: error.response.status || 500 };
        }

    }
}

async function initiatePayment(sId, rId, amount, token, note) {
    try {
        if (!sId || !rId || !amount || !token) {
            return { error: true, success: false, message: "All fields are required", status: 400 };
        }

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVICE_PAYMENT}/api/v1/payment/initiate`,
            { sId, rId, amount, note},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.data.success) {
            return { txnid: response.data.txnid, message: response.data.message, success: true, error: false };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    } catch (error) {
        if (error.response && error.response.status) {
            return { error: true, success: false, message: error.response.data.message || "Something went wrong", status: error.response.status };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    }
}

async function verifyPayment(sId, pin, txnid, token) {
    try {
        if (!sId || !pin || !txnid || !token) {
            return { error: true, success: false, message: "All fields are required", status: 400 };
        }

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVICE_PAYMENT}/api/v1/payment/verify`,
            { sId, pin, txnid },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.data.success) {
            return { txnid: response.data.txnid, message: response.data.message, success: true };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    } catch (error) {
        if (error.response && error.response.status) {
            return { error: true, success: false, message: error.response.data.message || "Something went wrong", status: error.response.status };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    }
}

async function Pay(sId, rId, amount, txnid, token) {
    try {
        if (!sId || !rId || !amount || !txnid || !token) {
            return { error: true, success: false, message: "All fields are required", status: 400 };
        }

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVICE_PAYMENT}/api/v1/payment/pay`,
            { sId, rId, amount, txnid },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.data.success) {
            return { txnid: response.data.txnid, success: true, message: response.data.message, transaction: response.data.transaction };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    } catch (error) {
        if (error.response && error.response.status) {
            return { error: true, success: false, message: error.response.data.message, status: error.response.status };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    }
}


async function getBalance(token) {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVICE_MAIN}/api/v1/get/balance`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        if (response.data.success) {
            return { balance: response.data.balance, message: response.data.message, success: true };
        } else {
            return { error: true, success: false, message: "Something went wrong", status: 500 };
        }
    } catch (error) {
        if (error.response && error.response.status) {
            return { error: true, success: false, message: error.response.data.message || "Something went wrong", status: error.response.status || 500 };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    }
}
async function fetchConnections(token) {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVICE_MAIN}/api/v1/get/connections`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        if (response.data.success) {
            return {connections:response.data.connections, message: response.data.message, success: true };
        } else {
            return { error: true, success: false, message: "Something went wrong", status: 500 };
        }
    } catch (error) {
        if (error.response && error.response.status) {
            return { error: true, success: false, message: error.response.data.message || "Something went wrong", status: error.response.status || 500 };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    }
}


async function getConnections(token) {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVICE_MAIN}/api/v1/get/connections`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        if (response.data.success) {
            return { connections: response.data.connections, message: response.data.message, success: true };
        } else {
            return { error: true, success: false, message: "Something went wrong", status: 500 };
        }
    } catch (error) {
        if (error.response && error.response.status) {
            return { error: true, success: false, message: error.response.data.message || "Something went wrong", status: error.response.status || 500 };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    }
}

async function getPaymentHistory(token) {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVICE_MAIN}/api/v1/get/payment_history`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        if (response.data.success) {
            return { history: response.data.payments, message: response.data.message, success: true };
        } else {
            return { error: true, success: false, message: "Something went wrong", status: 500 };
        }
    } catch (error) {
        if (error.response && error.response.status) {
            return { error: true, success: false, message: error.response.data.message || "Something went wrong", status: error.response.status || 500 };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    }
}


async function addConnection(token, connectionId) {
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVICE_MAIN}/api/v1/add_user`,
            { connectionId },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        if (response.data.success) {
            return { message: response.data.message, success: true };
        } else {
            return { error: true, success: false, message: response.data.message ||  "Something went wrong", status: 500 };
        }
    } catch (error) {
        if (error.response && error.response.status) {
            return { error: true, success: false, message: error.response.data.message || "Something went wrong", status: error.response.status || 500 };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    }
}

async function initiateUPIPayment(name, upiId, amount, token) {
    try {
        if (!upiId || !amount || !token) {
            return { error: true, success: false, message: "All fields are required", status: 400 };
        }

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVICE_PAYMENT}/api/v1/pay/initiate_upi`,
            { upiId, amount, name},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.data.success) {
            return { txnid: response.data.txnid, message: response.data.message, success: true, error: false };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    } catch (error) {
        if (error.response && error.response.status) {
            return { error: true, success: false, message: error.response.data.message || "Something went wrong", status: error.response.status };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    }
}

async function verifyUPIPayment(pin, txnid, token) {
    try {
        if (!pin || !txnid || !token) {
            return { error: true, success: false, message: "All fields are required", status: 400 };
        }

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVICE_PAYMENT}/api/v1/pay/verify_pin`,
            { pin, txnid },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        );
        if (response.data.success) {
            return { txnid: response.data.txnid, message: response.data.message || "verification successful", success: true };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    } catch (error) {
        if (error.response && error.response.status) {
            return { error: true, success: false, message: error.response.data.message || "Something went wrong", status: error.response.status };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    }
}

async function PayWithUPI(txnid, token) {
    try {
        if (!txnid || !token) {
            return { error: true, success: false, message: "All fields are required", status: 400 };
        }

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVICE_PAYMENT}/api/v1/upi/pay`,
            {txnid },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.data.success) {
            return { txnid: response.data.txnid, success: true, message: response.data.message || "Payment successful", transaction: response.data.transaction};
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    } catch (error) {
        if (error.response && error.response.status) {
            return { error: true, success: false, message: error.response.data.message, status: error.response.status };
        }
        return { error: true, success: false, message: "Something went wrong", status: 500 };
    }
}




 
export { fetchUser, initiateUPIPayment, verifyUPIPayment, PayWithUPI, fetchNumber,fetchConnections, addConnection, getConnections, getPaymentHistory, getBalance, fetchReciever, Pay, initiatePayment, verifyPayment, fetchLoggedInUser };
