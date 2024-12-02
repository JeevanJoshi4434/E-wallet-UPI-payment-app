const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

if (process.env.NODE_ENV != "PRODUCTION") {
    const dotenv = require('dotenv').config(
        {
            path: '.env'
        }
    );
}

const db = require('./db/index');
const userRoute = require('./routes/User.route');
const InformationRoute = require('./routes/Information.route');

// If not the primary process, start the Express app

const app = express();

app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/v1', userRoute);
app.use('/api/v1', InformationRoute);

app.get('/', (req, res) => {
    res.send('Main service is live!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
});
