const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const db = require('./db/index');

const dotenv = require('dotenv').config(
    {
        path: '.env'
    }
);


const userRoute = require('./routes/User.route');

const app = express();

app.use(cors(
    {
        origin: ['http://localhost:3000'],
    }
));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/v1', userRoute);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}!`);
    console.log('Press Ctrl+C to quit.');
});