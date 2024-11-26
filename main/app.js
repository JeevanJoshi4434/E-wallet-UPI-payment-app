const express = require('express');
const cluster = require('cluster');
const os = require('os');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv').config({ path: '.env' });

const db = require('./db/index');
const userRoute = require('./routes/User.route');
const InformationRoute = require('./routes/Information.route');

// Check if the current process is the master
if (cluster.isPrimary) {
    // Get the number of CPU cores
    const numCPUs = os.cpus().length;

    console.log(`Primary process PID: ${process.pid}`);
    console.log(`Forking ${numCPUs} instances for each CPU core`);

    // Fork a worker for each CPU core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // If a worker exits, log and fork a new worker
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} exited with code ${code} and signal ${signal}`);
        console.log('Starting a new worker...');
        cluster.fork();
    });

} else {
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
}
