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

    local created = CreateAuction(player.identifier, data)

    TriggerClientEvent('bcs_auction:client:Notify', source, 'Auction',
        created and 'Auction created' or 'Failed to create auction',
        created and 'success' or 'error'
    )
end)

lib.callback.register('bcs_auction:server:GetAuctions', function(source, auctionType, category, page, limit)
    return GetAuctions(auctionType or AuctionType.Live, category or AuctionCategory.Vehicle, page or 1, limit or 5)
end)
