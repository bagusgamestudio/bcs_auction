return {
    ---@type boolean | number
    createAuctionFee = 100,      -- false or amount to charge players when they create an auction

    bidTime = 60,                -- time in seconds for each bid, resets when a new bid is placed
    goingOnceTime = 5,           -- time in seconds for going once
    goingTwiceTime = 5,          -- time in seconds for going twice

    onGoingCron = '*/5 * * * *', -- cron expression for when to check ongoing auctions

    groups = {
        "admin"
    },
}
