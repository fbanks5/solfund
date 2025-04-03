const anchor = require("@coral-xyz/anchor");
const { SystemProgram } = anchor.web3;
const assert = require("assert");

describe("Withdraw Campaign Funds", () => {
    const provider = anchor.AnchorProvider.env();  // Configure the client to use the local cluster.
    anchor.setProvider(provider);                                // Set the provider
    const program = anchor.workspace.SolanaKickstarter;          // Access the program

    const campaignKeypair = anchor.web3.Keypair.generate(); // Generate a new keypair for the campaign

    it("Creates  a campaign with a short deadline", async () => {
        const deadline = Math.floor(Date.now() / 1000) + 10; // Set a deadline 10 seconds from now

        await program.methods
            .createCampaign("Withdraw Test", "Campaign to test withdraw", new anchor.BN(100000000), new anchor.BN(deadline)) // 1 SOL in lamports
            .accounts({
                campaign: campaignKeypair.publicKey, // The public key of the campaign account
                authority: provider.wallet.publicKey, // The public key of the authority (the wallet)
                systemProgram: SystemProgram.programId, // The system program ID
            })
            .signers([campaignKeypair]) // Sign the transaction with the campaign keypair
            .rpc(); // Send the transaction
    })

    it("Donates to reach the goal", async () => {
        await program.methods
            .donate(new anchor.BN(100000000)) // 0.1 SOL in lamports
            .accounts({
                campaign: campaignKeypair.publicKey, // The public key of the campaign account
                donor: provider.wallet.publicKey, // The public key of the donor (the wallet)
                systemProgram: SystemProgram.programId, // The system program ID
            })
            .rpc(); // Send the transaction
    })

    it("Withdraws the funds", async () =>{
        await program.methods
            .withdraw()
            .accounts({
                campaign: campaignKeypair.publicKey, // The public key of the campaign account
                authority: provider.wallet.publicKey, // The public key of the authority (the wallet)
            })
            .rpc(); // Send the transaction

        const campaign = await program.account.campaign.fetch(campaignKeypair.publicKey); // Fetch the updated campaign account
        assert.strictEqual(campaign.amountDonated.toNumber(), 0); // Check if the amount donated is reset to 0
    })
})