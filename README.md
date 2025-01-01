# WalletXpress

**WalletXpress** is an innovative e-wallet application designed to simplify digital transactions. It supports UPI-like payments, payouts, and wallet recharges with enhanced security and efficiency. By leveraging modern technologies like **Next.js**, **Node.js**, **Redis**, and **Docker**, WalletXpress offers a scalable, robust, and user-friendly platform.

---

## Features

- **Seamless Transactions**: Facilitates fast and secure financial operations without relying on external bank systems.
- **Fraud Detection**: Uses machine learning to detect and mitigate fraudulent transactions in real time.
- **"Raise Fund" Feature**: Allows users to collect funds within transaction thresholds.
- **Scalable Architecture**: Built with microservices for easy maintenance and high performance.
- **Modern Technology Stack**: Incorporates cutting-edge tools for development and deployment.

---

## Project Structure

- **app/**: Contains the frontend application built with Next.js.
- **main/**: The primary backend service developed with Node.js and Express.js.
- **payment/**: A dedicated payment microservice built using Node.js.
- **docker-compose.yml**: Manages the services and networking for the entire application stack.

---

## Prerequisites

- **Docker** and **Docker Compose** installed on your system.

---

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repository/walletxpress.git
   cd walletxpress
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Update the service URLs in the backend and frontend configuration files to match the container names defined in `docker-compose.yml`.

4. Access the application:
   - Frontend: `http://<container-name>:<frontend-port>`
   - Backend: `http://<container-name>:<backend-port>`

---

## Technologies Used

- **Frontend**: Next.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Caching**: Redis
- **Deployment**: Docker, AWS EC2
- **Payment Gateway**: RazorPay (For UPI, recharge wallet and Payouts only)

---

## Future Enhancements

- Real-time notification system.
- Mobile application support.
- Kafka integration for handling high transaction volumes.
