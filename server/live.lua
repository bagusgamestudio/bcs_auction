local lives = {}

RegisterNetEvent("bcs_auction:server:StartLive", function(id)
    if lives[id] then
        return TriggerClientEvent("bcs_auction:client:Notify", source, "Auction", "This auction is already live", "error")
    end

    lives[id] = {
        startTime = os.time()
    }

    UpdateAuction({
        id = id,
        live = lives[id]
    })

    TriggerZones("bcs_auction:client:UpdateAuction", id, "live", lives[id])
end)
