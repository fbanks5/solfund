const anchor = require("@coral-xyz/anchor");
const { SystemProgram } = anchor.web3;
const assert = require("assert");

describe("Refund from Failed Campaign", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.SolanaKickstarter;

    const campaignKeypair = anchor.web3.Keypair.generate();

    it("Creates a campaign that will fail", async () => {
        const deadline = Math.floor(Date.now() / 1000) + 2;

        await program.methods
            .createCampaign("Refund Test", "Campaign to test refund", new anchor.BN(200000000), new anchor.BN(deadline))
            .accounts({
                campaign: campaignKeypair.publicKey,
                authority: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([campaignKeypair])
            .rpc();
    });

    it("Donates less than the goal", async () => {
        await program.methods
            .donate(new anchor.BN(50000000)) // 0.05 SOL
            .accounts({
                campaign: campaignKeypair.publicKey,
                donor: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
    });

    it("Waits for the deadline and refunds", async () => {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 3s

        await program.methods
            .refund(new anchor.BN(50000000))
            .accounts({
                campaign: campaignKeypair.publicKey,
                donor: provider.wallet.publicKey,
            })
            .rpc();

        const campaign = await program.account.campaign.fetch(campaignKeypair.publicKey);
        assert.strictEqual(campaign.amountDonated.toNumber(), 0);
    });
});