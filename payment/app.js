const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db/index');
const dotenv = require('dotenv').config(
    {
    path: '.env'
}
);


const paymentRoute = require('./routes/Payment.route');
const upiRoute = require('./routes/UPI.route');
const createTables = require('./db/createTables');

const app = express();
createTables();
app.use(cors(
    {
        origin: "*",
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }
));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/v1', paymentRoute);
app.use('/api/v1', upiRoute);
app.get('/', (req, res) => {
    res.send('Payment service is live!');
});
app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}!`);
    console.log('Press Ctrl+C to quit.');
});