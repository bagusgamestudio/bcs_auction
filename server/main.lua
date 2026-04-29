if Shared.framework then
    lib.load(('modules.bridge.%s.server'):format(Shared.framework))
end

Auctions = {}

RegisterNetEvent('bcs_auction:server:CreateAuction', function(data)
    local source = source
    local player = Server.GetPlayer(source)
    if not player then
        return
    end

    local created, message = CreateAuction(player.identifier, data)

    TriggerClientEvent('bcs_auction:client:Notify', source, 'Auction', message, created and 'success' or 'error')
end)

lib.callback.register('bcs_auction:server:GetAuctions', function(source, auctionType, category, page, limit)
    return GetAuctions(auctionType or AuctionType.Live, category or AuctionCategory.Vehicle, page or 1, limit or 5)
end)

lib.callback.register('bcs_auction:server:GetAuctionById', function(source, id)
    return GetAuction(id)
end)

lib.callback.register('bcs_auction:server:DeleteAuction', function(source, id)
    local player = Server.GetPlayer(source)
    if not player then
        return false
    end

    local deleted, message = DeleteAuction(id)
    TriggerClientEvent('bcs_auction:client:Notify', source, 'Auction', message, deleted and 'success' or 'error')
    return deleted
end)

RegisterNetEvent('bcs_auction:server:UpdateAuction', function(data)
    local source = source
    local player = Server.GetPlayer(source)
    if not player then
        return
    end

    local updated, message = UpdateAuction(data)
    TriggerClientEvent('bcs_auction:client:Notify', source, 'Auction', message, updated and 'success' or 'error')
end)

lib.callback.register('bcs_auction:server:GetPlayer', function(source)
    local player = Server.GetPlayer(source)
    if not player then
        return { identifier = "", isAdmin = false }
    end

    return {
        identifier = player.identifier,
        isAdmin = true -- TODO: Add admin check
    }
end)

function CompleteOnGoingAuction(auctionId)
    local auction = GetAuction(auctionId)
    if not auction then
        return false, ("Auction %s not found"):format(auctionId)
    end

    if auction.bids and #auction.bids > 0 then
        local highestBid = auction.bids[#auction.bids]
        local success = GiveAuction(highestBid.identifier, auction)
        if success then
            DeleteAuction(auctionId)
            return true, ("Auction %s completed, winner: %s"):format(auctionId, highestBid.identifier)
        end
        return false, ("Failed to give auction to %s"):format(highestBid.identifier)
    else
        DeleteAuction(auctionId)
        return true, ("Auction %s expired with no bids"):format(auctionId)
    end
end

lib.cron.new(Server.config.onGoingCron, function()
    local expiredAuctions = GetExpiredAuctions()
    print(("[%s] Found %s expired auctions"):format(os.date(), #expiredAuctions))
    for i = 1, #expiredAuctions do
        local _, message = CompleteOnGoingAuction(expiredAuctions[i].id)
        print(message)
    end
end, {})
