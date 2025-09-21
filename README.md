# DAGScanner Frontend

[![Vercel Deploy](https://vercel.com/button)](https://dagscanner.vercel.app/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A sleek, decentralized application for analyzing smart contract security on the BlockDAG network. DAGScanner provides an intuitive interface for users to get an off-chain, AI-powered trust score for any smart contract and then record that analysis immutably on the blockchain.

**[➡️ View the Live Demo](https://dagscanner-frontend.vercel.app/)** _(Note: The live demo is connected to a test backend and the BlockDAG testnet.)_

---

## ✨ Core Features

- **Seamless Wallet Integration:** Connect instantly and securely with MetaMask or any other EIP-1193 compatible wallet.
- **Off-Chain Oracle Analysis:** Leverages a powerful Python backend to perform ML-driven security analysis without bogging down the frontend.
- **User-Centric & Decentralized Transactions:** Users pay for their own on-chain transactions, enhancing security by keeping private keys out of the backend and empowering user control.
- **Immutable On-Chain Records:** Analysis results are stored permanently on the BlockDAG network by calling a custom smart contract.
- **Real-time Feedback:** A polished UI with clear loading, success, and error states provides a smooth user experience.
- **Responsive & Modern Design:** Built with Tailwind CSS and shadcn/ui for a beautiful, fully responsive experience on any device.

---

## 🔧 Tech Stack & Architecture

This project is the frontend component of the DAGScanner ecosystem. It is a modern Next.js application designed to interact with a backend oracle and a smart contract.

### Technologies Used

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Blockchain Interaction:** [ethers.js v6](https://docs.ethers.org/v6/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Deployment:** [Vercel](https://vercel.com/)

### System Architecture

The application follows a secure and scalable "off-chain oracle, on-chain settlement" pattern.

1.  **Connect Wallet:** The user connects their wallet to the frontend.
2.  **Request Analysis:** The frontend sends the target smart contract address to a Next.js API Route (`/api/analyze`).
3.  **Proxy to Backend:** The API Route securely proxies the request to the Python/Django backend oracle, using a server-side environment variable.
4.  **Receive Result:** The backend performs its ML analysis and returns a trust score and status to the frontend.
5.  **Initiate Transaction:** The frontend uses the analysis result to construct a transaction. It prompts the user via MetaMask to call the `storeResultAndPay` function on the smart contract, sending the required `analysisFee`.
6.  **Confirm & Display:** Once the user approves and the transaction is mined, the frontend displays the result and a link to the transaction on the BlockDAG explorer.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- **Node.js:** v18.17 or later.
- **Package Manager:** `npm`, `yarn`, or `pnpm`.
- **MetaMask:** A browser extension for interacting with the blockchain.
- **Backend Server:** A running instance of the [DAGScanner Backend](https://github.com/SheriffMudasir/DAGScannser-Backend).

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/dagscanner-frontend.git
    cd dagscanner-frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a local environment file by copying the example file.

    ```bash
    cp .env.example .env.local
    ```

    Now, open `.env.local` and set the `BACKEND_API_URL` to point to your _local running backend server_.

    ```.env
    # .env.local
    # URL for the local Python/Django backend API endpoint
    BACKEND_API_URL="http://127.0.0.1:8000/api/analyze/"
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 🌐 Deployment

This application is optimized for deployment on [Vercel](https://vercel.com/).

To deploy your own instance, simply import your forked repository into Vercel. The only configuration required is to set the **Environment Variable** in the Vercel project settings:

- **Name:** `BACKEND_API_URL`
- **Value:** `https://your-live-backend-url.com/api/analyze/`

Vercel will automatically detect the Next.js framework, build the project, and deploy it.

> **Note:** Remember to update your backend's CORS settings to allow requests from your new Vercel deployment URL.

---

## 📂 Project Structure

A brief overview of the key directories in this project.

```
/
├── app/
│   ├── api/analyze/route.ts  # Serverless route that proxies to the backend
│   ├── page.tsx              # The main page component for the application
│   └── layout.tsx            # The root layout
├── components/
│   └── ui/                   # UI components from shadcn/ui
├── constants/
│   └── blockchain.ts         # Centralized contract address and ABI
├── public/
│   └── ...                   # Static assets like images and fonts
└── .env.example              # Example environment file
```

---
