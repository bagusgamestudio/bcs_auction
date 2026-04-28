local live
local interval

local function EndLive()
    TriggerZones("bcs_auction:client:UpdateAuction", live.id, "live", nil)
    TriggerZones("bcs_auction:client:NotifyArea",
        {
            title = "Auction",
            message = "Auction live ended",
            duration = 5000,
            audioName = "GO",
            audioRef = "HUD_MINI_GAME_SOUNDSET"
        }
    )

    ClearInterval(interval)
    live = nil
    interval = nil
end

local function CheckBid()
    if #live.bids == 0 then
        return
    end
    local lastBid = live.bids[#live.bids]
    if lastBid.time + Server.config.bidTime < os.time() then
        EndLive()
    else
        local timeLeft = lastBid.time + Server.config.bidTime - os.time()
        live.timeLeft = timeLeft
        print("Time left: " .. live.timeLeft .. "s")
        TriggerZones("bcs_auction:client:UpdateAuction", live.id, "live", live)
    end
end

RegisterNetEvent("bcs_auction:server:StartLive", function(id)
    if GetTotalPlayerInStages() == 0 then -- TODO change to 1
        return TriggerClientEvent("bcs_auction:client:Notify", source, "Auction",
            "There is no player in the auction", "error")
    end

    if live then
        return TriggerClientEvent("bcs_auction:client:Notify", source, "Auction",
            "Wait for the current live auction to end", "error")
    end

    live = {
        id = id,
        startTime = os.time(),
        bids = {}
    }

    UpdateAuction({
        id = id,
        live = live
    })

    TriggerZones("bcs_auction:client:UpdateAuction", id, "live", live)

    TriggerZones("bcs_auction:client:NotifyArea",
        {
            title = "Auction",
            message = "Auction live started",
            duration = 5000,
            audioName = "GO",
            audioRef = "HUD_MINI_GAME_SOUNDSET"
        }
    )

    interval = SetInterval(function()
        if #live.bids == 0 then
            local bidTime = (live.startTime + Server.config.bidTime) - os.time()
            live.timeLeft = bidTime
            TriggerZones("bcs_auction:client:UpdateAuction", live.id, "live", live)
            if bidTime <= 0 then
                return EndLive()
            end
        end

        CheckBid()
    end, 1000)
end)

RegisterNetEvent("bcs_auction:server:PlaceBid", function(id, amount)
    local source = source
    local player = Server.GetPlayer(source)
    if live and live.id == id then
        table.insert(live.bids, {
            identifier = player.identifier,
            id = source,
            amount = amount,
            time = os.time()
        })
    end
end)
