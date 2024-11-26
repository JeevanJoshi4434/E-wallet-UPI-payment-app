const axios = require('axios');

class HttpRequest {
    // Method to make dynamic HTTP requests
    async makeRequest({ method, url, headers, body }) {
        try {
            // Make the request with axios
            const response = await axios({
                method: method,  // HTTP method (GET, POST, PUT, DELETE)
                url: url,        // The URL to send the request to
                headers: headers, // Headers for the request
                data: body        // Request body (for POST/PUT)
            });

            // Return the response data as JSON
            return response.data;
        } catch (error) {
            console.error('Error making request:', error);
            throw error;
        }
    }
}

// Exporting the HttpRequest class so it can be used elsewhere
module.exports = HttpRequest;
