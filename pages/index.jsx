import abi from "../utils/BuyMeSomeChips.json";
import { ethers } from "ethers";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x2345c0dFa8bD8D5c76659274bBfC4781798FDCB6";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const buyBagOfChips = async (bagType) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeSomeChips = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let amount = "";
        if (bagType == "small") {
          amount = "0.001";
        } else if (bagType == "regular") {
          amount = "0.002";
        } else if (bagType == "big ass large") {
          amount = "0.005";
        }
        console.log(`${bagType} bag of chips heading your way..`);
        const bagTxn = await buyMeSomeChips.buyChips(
          name ? name : "A secret admirer",
          message ? message : "Enjoy your chips!",
          { value: ethers.utils.parseEther(amount) }
        );

        await bagTxn.wait();

        console.log("mined ", bagTxn.hash);

        console.log("bag of chips purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeSomeChips = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeSomeChips.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeSomeChips;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
        },
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeSomeChips = new ethers.Contract(contractAddress, contractABI, signer);

      buyMeSomeChips.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeSomeChips) {
        buyMeSomeChips.off("NewMemo", onNewMemo);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Buy Van a bag of chips</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="tipping site" />
      </Head>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.left}>
          <div>
            <a
              href="https://alchemy.com/?a=roadtoweb3weektwo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={`/Alchemy-logo.png`} alt="Alchemy Logo" width={135} />
            </a>
          </div>
        </div>
        <div className={styles.right}>
          {currentAccount ? (
            <>
              <p style={{ marginLeft: 8, marginRight: 8, color: "grey" }}>|</p>
              <p>address</p>
            </>
          ) : (
            <a className={styles.mainButton} onClick={connectWallet}>
              Connect Wallet
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.container}>
        <h1 className={styles.h1}>Buy Van a bag of chips!</h1>

        <div className={styles.contentContainer}></div>

        <main>
          {currentAccount ? (
            <>
              <form>
                <div>
                  <label>Name</label>
                  <br />

                  <input
                    className={styles.textInput}
                    type="text"
                    placeholder="A secret admirer"
                    onChange={onNameChange}
                  />
                </div>
                <br />
                <div>
                  <label>Send Van a message</label>
                  <br />

                  <textarea
                    rows={3}
                    placeholder="Enjoy your chips!"
                    className={styles.textInput}
                    onChange={onMessageChange}
                    required
                  ></textarea>
                </div>
                 <a
                  className={styles.mainButton}
                  onClick={() => buyBagOfChips("small")}
                >
                  Buy Van a small bag of chips for 0.001ETH
                </a>
                <a
                  className={styles.mainButton}
                  onClick={() => buyBagOfChips("regular")}
                >
                  Buy Van a regular bag of chips for 0.002ETH
                </a>
                <a
                  className={styles.mainButton}
                  onClick={() => buyBagOfChips("big ass large")}
                >
                  Buy Van a big ass large bag of chips for 0.005ETH
                </a>
              </form>

        <hr className={styles.smallDivider} />
              
            </>
          ) : (
            <a className={styles.mainButton} onClick={connectWallet}>
              Connect Wallet
            </a>
          )}
        </main>

          <div className={styles.memoGrid}>
            {currentAccount && <h1>Memos received</h1>}
            {currentAccount &&
              memos.map((memo, idx) => {
                return (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid grey",
                      borderRadius: "16px",
                      padding: "5px",
                      margin: "5px",
                    }}
                  >
                    <p style={{ fontWeight: "bold" }}>{memo.message}</p>
                    <p>
                      From: {memo.name} at {memo.timestamp.toString()}
                    </p>
                  </div>
                );
              })}
          </div>
      </div>
      
      <footer className={styles.footer}>
        <a
          href="https://alchemy.com/?a=roadtoweb3weektwo"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by @thatguyintech for Alchemy's Road to Web3 lesson two!
        </a>
      </footer>
    </div>
  );
}
