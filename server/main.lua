if Shared.framework then
    lib.load(('modules.bridge.%s.server'):format(Shared.framework))
end

Auctions = {}

lib.callback.register('bcs_auction:server:CreateAuction', function(source, data)
    local player = Server.GetPlayer(source)
    if not player then
        return
    end

    local fee = Server.config.createAuctionFee

    if type(fee) == "number" and fee > 0 then
        if not player.HasMoney("bank", fee) then
            return false, ("You need $%s to create an auction"):format(fee)
        end
    end

    if data.category == AuctionCategory.Item then
        if not HasItem(player.source, data.itemName, data.itemAmount) then
            return false, "You don't have enough of that item"
        end
    end

    local created, message = CreateAuction(player.identifier, data)

    if created then
        if data.category == AuctionCategory.Item then
            RemoveItem(player.source, data.itemName, data.itemAmount)
        end

        if type(fee) == "number" and fee > 0 then
            player.RemoveMoney("bank", fee)
        end
    end

    return created, message
end)

lib.callback.register('bcs_auction:server:GetAuctions', function(source, status, category, page, limit)
    return GetAuctions(status or "active", category or AuctionCategory.Vehicle, page or 1, limit or 5)
end)

lib.callback.register('bcs_auction:server:GetAuctionById', function(source, id)
    return GetAuction(id)
end)

lib.callback.register('bcs_auction:server:DeleteAuction', function(source, id)
    local player = Server.GetPlayer(source)
    if not player then
        return false
    end
    local auction = GetAuction(id)
    if not auction then
        return false, ("Auction %s not found"):format(id)
    end

    if auction.identifier ~= player.identifier or not IsAdmin(source) then
        return false, "You don't have permission to delete this auction"
    end

    local item, amount

    if auction.category == AuctionCategory.Item then
        item = auction.category_data.itemName
        amount = auction.category_data.itemAmount
    end

    local deleted, message = DeleteAuction(id)

    if deleted then
        if item then
            GiveItem(player.source, item, amount)
        end

        if player.identifier ~= auction.identifier then
            SendMessage(player.identifier, auction.identifier, "Your auction has been deleted")
        end
        print(("Auction %s deleted by %s"):format(id, player.identifier))
    end
    return deleted, message
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
        isAdmin = IsAdmin(source)
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
            FinishAuction(auctionId)
            return true, ("Auction %s completed, winner: %s"):format(auctionId, highestBid.identifier)
        end
        return false, ("Failed to give auction to %s"):format(highestBid.identifier)
    else
        FinishAuction(auctionId)
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

RegisterNetEvent('bcs_auction:server:Buyout', function(id)
    local source = source
    local player = Server.GetPlayer(source)
    if not player then return end

    local auction = GetAuction(id)
    if not auction then
        return TriggerClientEvent('bcs_auction:client:Notify', source, 'Auction', 'Auction not found', 'error')
    end

    if auction.finished_at then
        return TriggerClientEvent('bcs_auction:client:Notify', source, 'Auction', 'Auction already finished', 'error')
    end

    if auction.buyout_price <= 0 then
        return TriggerClientEvent('bcs_auction:client:Notify', source, 'Auction', 'Buyout not available', 'error')
    end

    if not player.HasMoney("bank", auction.buyout_price) then
        return TriggerClientEvent('bcs_auction:client:Notify', source, 'Auction', 'Insufficient funds', 'error')
    end

    player.RemoveMoney("bank", auction.buyout_price)

    if auction.type == "live" then
        if auction.live and auction.live.id == id then
            EndLive(true)
        else
            return TriggerClientEvent('bcs_auction:client:Notify', source, 'Auction', 'This auction is not live', 'error')
        end
    end

    local success = GiveAuction(player.identifier, auction)

    if success then
        FinishAuction(id)

        if auction.type == "live" then
            NotifyArea("Auction", ("BUYOUT! Winner: %s ($%s)"):format(player.identifier, auction.buyout_price),
                "Mission_Pass_Notify", "DLC_HEISTS_GENERAL_FRONTEND_SOUNDS")
        end
        TriggerClientEvent('bcs_auction:client:Notify', source, 'Auction', 'Buyout successful!', 'success')
    else
        player.AddMoney("bank", auction.buyout_price)
        TriggerClientEvent('bcs_auction:client:Notify', source, 'Auction', 'Failed to give auction item', 'error')
    end
end)
