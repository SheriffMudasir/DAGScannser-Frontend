// app/page.tsx

"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contractAddress, contractABI } from "@/constants/blockchain"; 

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [analysisFee, setAnalysisFee] = useState<string>("0");
  const [addressToAnalyze, setAddressToAnalyze] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<{
    address: string;
    score: number;
    status: string;
  } | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setWalletAddress(accounts[0].address);
          }


          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length > 0) {
              setWalletAddress(accounts[0]);
            } else {

              setWalletAddress(null);
              setContract(null); 
            }
          });


        } catch (err) {
            console.error("Error initializing wallet connection:", err);
        }
      }
    };
    init();
    return () => {
        if (window.ethereum?.removeListener) {
            window.ethereum.removeListener('accountsChanged', () => {});
        }
    }
  }, []);

  useEffect(() => {
    if (walletAddress) {
      initializeContract();
    }
  }, [walletAddress]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
      } catch (err) {
        setError("Failed to connect wallet.");
        console.error(err);
      }
    } else {
      setError("Please install MetaMask!");
    }
  };

  const initializeContract = async () => {
    if (typeof window.ethereum === "undefined") return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      setContract(contractInstance);

      const fee = await contractInstance.analysisFee();
      setAnalysisFee(ethers.formatEther(fee));
    } catch (err) {
      setError("Failed to initialize smart contract. Make sure you are on the correct BlockDAG testnet.");
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    if (!addressToAnalyze) {
      setError("Please enter a contract address.");
      return;
    }
    if (!contract) {
      setError("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setTxHash(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: addressToAnalyze }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to get analysis from the backend.");
      }

      const data = await response.json();
      setAnalysisResult(data);
      console.log(`Submitting transaction with fee: ${analysisFee} ETH`);
      const feeInWei = ethers.parseEther(analysisFee);
      const tx = await contract.storeResultAndPay(
        data.address,
        data.score,
        data.status,
        { value: feeInWei }
      );

      await tx.wait();
      setTxHash(tx.hash);

    } catch (err: any) {
      if (err.code === 'ACTION_REJECTED') {
          setError("Transaction rejected by user.");
      } else {
          setError(err.message || "An unexpected error occurred.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto p-6 max-w-4xl">
        <header className="flex justify-between items-center mb-12 py-6 border-b-2 border-gradient-to-r from-blue-500 to-purple-600">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DAGScanner
          </h1>
        </div>
        {walletAddress ? (
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Connected: </span>
            <span className="font-mono text-sm">{`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}</span>
          </div>
        ) : (
          <Button 
            onClick={connectWallet}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-full shadow-lg transition-all duration-200"
          >
            Connect Wallet
          </Button>
        )}
      </header>

      <main>
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-xl font-bold flex items-center space-x-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Analyze Smart Contract</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-3">
              <Label htmlFor="contract-address" className="text-sm font-semibold text-gray-700">
                Contract Address
              </Label>
              <Input
                id="contract-address"
                type="text"
                placeholder="Enter contract address (0x...)"
                value={addressToAnalyze}
                onChange={(e) => setAddressToAnalyze(e.target.value)}
                disabled={isLoading}
                className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3 text-sm font-mono transition-colors"
              />
            </div>
            <Button 
              onClick={handleAnalyze} 
              disabled={isLoading || !walletAddress} 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `🔍 Analyze & Record on BlockDAG (${analysisFee} BDAG)`
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {analysisResult && (
          <Card className="mt-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold flex items-center space-x-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Analysis Result</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">Contract Address:</p>
                  <p className="font-mono text-sm bg-white p-2 rounded border break-all">{analysisResult.address}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">Trust Score:</p>
                  <p className="text-2xl font-bold text-blue-600">{analysisResult.score}/100</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-700 mb-2">Security Status:</p>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${analysisResult.status.toLowerCase().includes('secure') ? 'bg-green-500' : analysisResult.status.toLowerCase().includes('warning') ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <p className="text-lg font-semibold text-gray-800">{analysisResult.status}</p>
                </div>
              </div>
              {txHash && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-700 mb-2">Transaction Receipt:</p>
                  <a
                    href={`https://primordial.bdagscan.com/tx/${txHash}`} // Placeholder for actual BlockDAG explorer
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-800 font-mono text-sm bg-white p-2 rounded border transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    <span className="break-all">{txHash}</span>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
      </div>
    </div>
  );
}