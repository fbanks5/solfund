const anchor = require("@coral-xyz/anchor");
const { SystemProgram } = anchor.web3;  // Import SystemProgram from anchor.web3
const assert = require("assert");       // Import assert for testing

describe("solana_kickstarter", () => {  // The test case name
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.SolanaKickstarter;

    it("Creates a new campaign!", async () => { // Arrange
        // Add your test here.
        const campaignKeypair = anchor.web3.Keypair.generate();

        await program.methods
            .createCampaign("My Campaign", "Help me build cool stuff", new anchor.BN(1000000000)) // 1 SOL in lamports
            .accounts({
                campaign: campaignKeypair.publicKey, // The public key of the campaign account
                authority: provider.wallet.publicKey, // The public key of the authority (the wallet)
                systemProgram: SystemProgram.programId // The system program ID
            })
            .signers([campaignKeypair]) // Sign the transaction with the campaign keypair
            .rpc(); // Send the transaction

        // Fetch the campaign account
        const campaignAccount = await program.account.campaign.fetch(campaignKeypair.publicKey);

        // Assert that the campaign account was created with the expected values
        assert.ok(campaignAccount.author.equals(provider.wallet.publicKey)); // Check if the authority is correct
        assert.strictEqual(campaignAccount.name, "My Campaign"); // Check if the name is correct
        assert.strictEqual(campaignAccount.description, "Help me build cool stuff"); // Check if the description is correct
        assert.strictEqual(campaignAccount.goalAmount.toNumber(), 1000000000); // Check if the goal amount is correct
        assert.strictEqual(campaignAccount.amountDonated.toNumber(), 0); // Check if the amount donated is correct

        console.log("Campaign created and verified!");

        // const program = anchor.workspace.solanaKickstarter;
        // const tx = await program.methods.initialize().rpc();
        // console.log("Your transaction signature", tx);
    });
});
