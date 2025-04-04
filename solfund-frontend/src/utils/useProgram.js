import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import idl from "../idl/solana_kickstarter.json";

const programID = new PublicKey("3GBKtPWTn7SZTyUnve7C6KEzCHZY8VV38LXJbYVMj7Vh"); // Replace with your actual ID

const getProvider = () => {
  const network = "http://127.0.0.1:8899"; // or "https://api.devnet.solana.com"
  const connection = new Connection(network, "processed");

  const provider = new AnchorProvider(
    connection,
    window.solana, // Phantom injected wallet
    { preflightCommitment: "processed" }
  );

  return provider;
};

const getProgram = () => {
  const provider = getProvider();
  return new Program(idl, programID, provider);
};

export default getProgram;
