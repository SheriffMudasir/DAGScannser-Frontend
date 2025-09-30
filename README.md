# DAGScanner Frontend

[![Vercel Deploy](https://vercel.com/button)](https://dagscanner.vercel.app/)

A sleek, decentralized application for analyzing smart contract security on the BlockDAG network. DAGScanner provides an intuitive interface for users to get an off-chain, AI-powered trust score for any smart contract and then record that analysis immutably on the blockchain.

**[➡️ View the Live Demo](https://dag-scannser-frontend.vercel.app/)**
**[➡️ Read our Vision: "Beyond the MVP"](https://docs.google.com/document/d/1KvFObOpZiZde7qlObxm5a13-5aYYmPjWlN1w99dmHng/edit?usp=sharing)**
**[➡️ View the Pitch Deck](https://drive.google.com/file/d/1GNh8bq4LU3anI8o18Tb6tcDRY_SrKzg0/view?usp=sharing)**

---

## ✨ Core Features

- **Seamless Wallet Integration:** Connect instantly and securely with MetaMask.
- **Off-Chain Oracle Analysis:** Leverages a powerful Python backend to perform ML-driven security analysis without bogging down the frontend.
- **User-Centric & Decentralized Transactions:** Users pay for their own on-chain transactions, enhancing security by keeping private keys out of the backend and empowering user control.
- **Immutable On-Chain Records:** Analysis results are stored permanently on the BlockDAG network by calling a custom smart contract.
- **Real-time Feedback:** A polished UI with clear loading, success, and error states provides a smooth user experience.
- **Responsive & Modern Design:** Built with Tailwind CSS and shadcn/ui for a beautiful, fully responsive experience on any device.

---

## 🔧 Tech Stack & Architecture

This project is the frontend component of the DAGScanner ecosystem. It is a modern Next.js application designed to interact with a backend oracle and a smart contract.

### Technologies Used

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
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

---

# DAGScanner Smart Contract

The `DAGScanner` smart contract is the on-chain trust layer for the DAGScanner project. It functions as a decentralized, immutable registry for smart contract security scores on the BlockDAG network.

## Core Concept: A Digital Notary Public

The contract acts as a highly trusted, automated notary public that lives on the blockchain.

- **Immutable Record-Keeping:** It receives an analysis result (trust score and status), verifies a fee has been paid, and permanently records the analysis with an on-chain timestamp.
- **Publicly Verifiable:** All stored analyses are kept in a public ledger, organized by the contract address that was analyzed. This data can be read by any user or application for free.
- **Secure and Self-Sustaining:** It enforces a payment mechanism for its service and provides secure, owner-only functions for administration and fee collection.

While the backend ML model provides the _intelligence_, this smart contract provides the **permanent, verifiable proof**.

---

## Technical Details

- **Network:** BlockDAG Testnet (Primordial)
- **Contract Address:** `0x1b227DF9c8D34CaB880774737FBf426E66Ba98Ed`
- **ABI:** The contract ABI is required for interaction. It can be found in the project repository (`dag_scanner_abi.json`) or generated from the source code.

---

## How It Works: Key Workflows

### User Workflow: Storing an Analysis

This is the primary flow, executed when a user wants to record an analysis on-chain.

1.  **Initiate Transaction:** The user's wallet calls the `storeResultAndPay()` function with the analysis data (`_contractAddress`, `_score`, `_status`).
2.  **Send Fee:** The user must send the required `analysisFee` (e.g., 0.1 BDAG) along with the transaction. The `payable` function modifier allows the contract to receive these funds.
3.  **Validate Payment:** The contract's first action is to `require(msg.value >= analysisFee)`. If the payment is insufficient, the transaction fails immediately, protecting both the user and the system.
4.  **Record Data:** Upon successful validation, the contract creates a `Result` struct and saves it to the public `results` mapping, permanently storing it on the blockchain.
5.  **Emit Event:** The contract emits a `ResultStored` event, creating a formal, searchable log that external services can monitor.

### Admin Workflow: Managing the Contract

These actions can only be performed by the contract `owner`.

1.  **Initiate Call:** The owner's wallet calls an administrative function like `withdraw()` or `setAnalysisFee()`.
2.  **Verify Identity:** The `onlyOwner` modifier automatically runs a check: `require(msg.sender == owner)`. If the caller is not the owner, the transaction is rejected.
3.  **Execute Action:**
    - **`withdraw()`**: The contract transfers the entire balance of collected fees to the owner's wallet.
    - **`setAnalysisFee(newFee)`**: The contract updates the public `analysisFee` variable to a new value.

---

## Contract Interface (Functions)

#### Write Functions

- `storeResultAndPay(address _contractAddress, uint256 _score, string memory _status)`
  - **Description:** The main function for users to store an analysis result.
  - **Access:** `public`, `payable`

#### Admin Functions (Owner Only)

- `withdraw()`
  - **Description:** Withdraws the full balance of accumulated fees from the contract.
  - **Access:** `external`, `onlyOwner`
- `setAnalysisFee(uint256 _newFee)`
  - **Description:** Updates the `analysisFee` required to store a result.
  - **Access:** `external`, `onlyOwner`

#### Read Functions (Free to Call)

- `getResult(address _contractAddress)`
  - **Description:** Returns the `score`, `status`, and `timestamp` for a given address.
  - **Access:** `public`, `view`
- `analysisFee()`
  - **Description:** Returns the current analysis fee in WEI.
  - **Access:** `public`, `view`
- `owner()`
  - **Description:** Returns the address of the contract owner.
  - **Access:** `public`, `view`

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
