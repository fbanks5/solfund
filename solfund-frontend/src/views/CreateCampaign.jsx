import React from "react";
import { useState } from "react";
import { SystemProgram, Keypair } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import getProgram from "../utils/useProgram";
import { useWallet } from "@solana/wallet-adapter-react";

export default function CreateCampaign() {
  const { publicKey } = useWallet();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [goal, setGoal] = useState("");
  const [deadlineHours, setDeadlineHours] = useState("");

  const handleCreate = async () => {
    if (!publicKey) return alert("Please connect your wallet first.");

    const program = getProgram();
    const campaignKeypair = Keypair.generate();
    const lamports = parseFloat(goal) * 1_000_000_000;
    const deadline = Math.floor(Date.now() / 1000) + parseInt(deadlineHours) * 3600;

    try {
      await program.methods
        .createCampaign(name, desc, new BN(lamports), new BN(deadline))
        .accounts({
          campaign: campaignKeypair.publicKey,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([campaignKeypair])
        .rpc();

      alert("✅ Campaign created!");
      setName("");
      setDesc("");
      setGoal("");
      setDeadlineHours("");
    } catch (err) {
      console.error(err);
      alert("Failed to create campaign.");
    }
  };

  return (
    <div className="create-campaign" style={{ padding: "2rem", maxWidth: 500 }}>
      <h2>Create Campaign 🛠️</h2>
      <input
        type="text"
        placeholder="Campaign Title"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        rows={4}
      />
      <input
        type="number"
        placeholder="Goal in SOL"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />
      <input
        type="number"
        placeholder="Deadline (in hours)"
        value={deadlineHours}
        onChange={(e) => setDeadlineHours(e.target.value)}
      />
      <button onClick={handleCreate} style={{ marginTop: "1rem" }}>
        Create Campaign
      </button>
    </div>
  );
}