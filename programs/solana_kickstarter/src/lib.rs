use anchor_lang::prelude::*; // Import necessary crates

declare_id!("66z7efS9JvmjYyon843ThRmZZgYuC64Z1boUzMCSUPF6"); // Replace with your program ID

#[program]
pub mod solana_kickstarter { // Main program module
    use super::*;

    /// Function to create a new campaign
    pub fn create_campaign(
        ctx: Context<CreateCampaign>, // Context to hold the accounts
        name: String,                 // Campaign name
        description: String,          // Campaign description
        goal_amount: u64,             // Goal amount for the campaign
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign; // Initialize the campaign account

        campaign.author = *ctx.accounts.authority.key; // Get the public key of the authority
        campaign.name = name;                          // Set the campaign name
        campaign.description = description;            // Set the campaign description
        campaign.goal_amount = goal_amount;            // Set the goal amount
        campaign.amount_donated = 0;                   // Initialize the amount donated to zero

        Ok(())
    }
}

#[derive(Accounts)]
/// Context for creating a new campaign
pub struct CreateCampaign<'info> {
    #[account(init, payer = authority, space = 8 + Campaign::MAX_SIZE)] // Initialize a new account
    pub campaign: Account<'info, Campaign>, // Campaign account to store campaign data

    #[account(mut)]
    pub authority: Signer<'info>,           // Authority who creates the campaign

    pub system_program: Program<'info, System>,     // System program to handle account creation
}

#[account]
/// Struct to represent a campaign
pub struct Campaign {
    pub author: Pubkey,  // Public key of the author
    pub name: String,    // Campaign name
    pub description: String,  // Campaign description
    pub goal_amount: u64,     // Goal amount for the campaign
    pub amount_donated: u64,  // Amount donated to the campaign
}

impl Campaign {
    // Define the maximum size of the Campaign account to allocate storage
    pub const MAX_SIZE: usize =
    32 + // author (Pubkey)
    4 + 100 + // name (String - max 100 bytes)
    4 + 500 + // description (String - max 500 bytes)
    8 + // goal_amount (u64)
    8; // amount_donated (u64)
}