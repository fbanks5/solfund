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
        campaign.deadline = deadline; // Set the campaign deadline

        Ok(())
    }

    /// Function to donate to a campaign
    pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
        // Check if the amount is greater than zero
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.donor.key(), // Donor's public key
            &ctx.accounts.campaign.key(), // Campaign's public key
            amount, // Amount to donate
        );
        // Invoke the system program to transfer the funds
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.donor.to_account_info(),
                ctx.accounts.campaign.to_account_info(),
            ],
        )?;
        // Update the amount donated in the campaign account
        let campaign = &mut ctx.accounts.campaign;
        campaign.amount_donated += amount; // Increment the amount donated

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;

        // Check if the campaign has reached its goal
        require_keys_eq!(campaign.author, ctx.accounts.authority.key(), CustomError::Unauthorized);
        require!(campaign.amount_donated >= campaign.goal_amount, CustomError::GoalNotMet);

        // Check if the campaign has reached its deadline
        **ctx.accounts.campaign.to_account_info().try_borrow_mut_lamports()? -= campaign.amount_donated;
        // Transfer the funds to the authority
        **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += campaign.amount_donated;

        // Reset the campaign amount donated to zero
        campaign.amount_donated = 0;

        Ok(())
    }

    pub fn refund(ctx: Context<Refund>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let clock = Clock::get()?;

        // Check if the campaign has not reached its goal
        require!(clock.unix_timestamp > campaign.deadline, CustomError::DeadlineNotPassed);
        require!(campaign.amount_donated < campaign.goal_amount, CustomError::GoalWasMet);

        // Check if the refund amount is less than or equal to the amount donated
        **ctx.accounts.campaign.to_account_info().try_borrow_mut_lamports()? -= amount;
        // Transfer the funds to the donor
        **ctx.accounts.donor.to_account_info().try_borrow_mut_lamports()? += amount;

        campaign.amount_donated -= amount; // Decrement the amount donated

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
#[derive(Accounts)]
/// Context for donating to a campaign
pub struct Donate<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>, // Campaign account to store campaign data

    #[account(mut)]
    pub donor: Signer<'info>,           // Donor who is donating to the campaign

    pub system_program: Program<'info, System>, // System program to handle account creation
}

/// Context for withdrawing funds from a campaign
#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>, // Campaign account to store campaign data

    #[account(mut)]
    pub authority: Signer<'info>,           // Authority who created the campaign
}

/// Context for refunding a donor
#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>, // Campaign account to store campaign data

    #[account(mut)]
    pub donor: Signer<'info>,           // Donor who is requesting a refund
}

#[account]
/// Struct to represent a campaign
pub struct Campaign {
    pub author: Pubkey,  // Public key of the author
    pub name: String,    // Campaign name
    pub description: String,  // Campaign description
    pub goal_amount: u64,     // Goal amount for the campaign
    pub amount_donated: u64,  // Amount donated to the campaign
    pub deadline: i64, // Unix timestamp for the campaign deadline
}

impl Campaign {
    // Define the maximum size of the Campaign account to allocate storage
    pub const MAX_SIZE: usize =
    32 + // author (Pubkey)
    4 + 100 + // name (String - max 100 bytes)
    4 + 500 + // description (String - max 500 bytes)
    8 + // goal_amount (u64)
    8 + // amount_donated (u64)
    8; // deadline (i64)

}

#[error_code]
pub enum CustomError {
    #[msg("Only the campaign creator can withdraw.")]
    Unauthorized,
    #[msg("The goal was not met.")]
    GoalNotMet,
    #[msg("Deadline has not passed.")]
    DeadlineNotPassed,
    #[msg("Goal was met - cannot refund.")]
    GoalWasMet,
}