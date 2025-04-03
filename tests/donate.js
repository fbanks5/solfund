const anchor = require("@coral-xyz/anchor");
const { SystemProgram } = anchor.web3;
const assert = require("assert");

describe("Donate to Campaign", () => {
    const provider = anchor.AnchorProvider.env();  // Configure the client to use the local cluster.
    anchor.setProvider(provider);                                // Set the provider
    const program = anchor.workspace.SolanaKickstarter;          // Access the program

    // Shared campaign keypair for all tests
    const campaignKeypair = anchor.web3.Keypair.generate();

    it("Creates a new campaign to donate to", async () => {
        const deadline = new anchor.BN(Math.floor(Date.now() / 1000) + 60); // 60 seconds from now
        await program.methods
            // Create a new campaign
            .createCampaign("Fundraiser", "Help fund our open-source app", new anchor.BN(500000000), deadline) // 0.5 SOL in lamports
            .accounts({
                campaign: campaignKeypair.publicKey, // The public key of the campaign account
                authority: provider.wallet.publicKey, // The public key of the authority (the wallet)
                systemProgram: SystemProgram.programId, // The system program ID
            })
            .signers([campaignKeypair]) // Sign the transaction with the campaign keypair
            .rpc(); // Send the transaction

        const campaignAccount = await program.account.campaign.fetch(campaignKeypair.publicKey); // Fetch the campaign account
        // Assert that the campaign account was created with the expected values
        assert.strictEqual(campaignAccount.amountDonated.toNumber(), 0); // Check if the amount donated is correct
    });

    it("Donates 0.1 SOL to the campaign", async () => {
        const donationAmount = new anchor.BN(100000000); // 0.1 SOL in lamports
        // Create a new Keypair for the donor
        await program.methods
            .donate(donationAmount)
            .accounts({
                campaign: campaignKeypair.publicKey, // The public key of the campaign account
                donor: provider.wallet.publicKey, // The public key of the donor (the wallet)
                systemProgram: SystemProgram.programId, // The system program ID
            })
            .rpc(); // Send the transaction

        const updatedCampaign = await program.account.campaign.fetch(campaignKeypair.publicKey); // Fetch the updated campaign account
        assert.strictEqual(updatedCampaign.amountDonated.toNumber(), donationAmount.toNumber()); // Check if the amount donated is correct

        console.log("Donation successful! Updated amountDonated:", updatedCampaign.amountDonated.toNumber());
    })
})