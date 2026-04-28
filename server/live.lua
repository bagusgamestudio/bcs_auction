local live, interval

local function NotifyArea(title, message, audioName, audioRef, duration)
    TriggerZones("bcs_auction:client:NotifyArea", {
        title = title,
        message = message,
        duration = duration,
        audioName = audioName or "GO",
        audioRef = audioRef or "HUD_MINI_GAME_SOUNDSET"
    })
end

local function EndLive()
    NotifyArea("Auction", "SOLD!", "GOLF_COMPLETE", "HUD_AWARDS", 5000)
    TriggerZones("bcs_auction:client:UpdateAuction", live.id, "live", nil)

    if live.bids and #live.bids > 0 then
        local winner = live.bids[#live.bids]
        local id = live.id
        CreateThread(function()
            Wait(5000)
            local success = GiveAuction(winner.identifier, GetAuction(id))
            if success then
                DeleteAuction(id)
            end
            NotifyArea("Auction", ("WINNER: %s ($%s)"):format(winner.id, winner.amount), "GOLF_COMPLETE",
                "HUD_AWARDS")
        end)
    end

    UpdateAuction({
        id = live.id,
        live = nil
    })

    live = nil
    if interval then
        ClearInterval(interval)
        interval = nil
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
        bids = {},
        state = "active",
        timeLeft = Server.config.bidTime
    }

    UpdateAuction({
        id = id,
        live = live
    })

    TriggerZones("bcs_auction:client:UpdateAuction", id, "live", live)
    NotifyArea("Auction", "Auction live started", "GO", "HUD_MINI_GAME_SOUNDSET")

    interval = SetInterval(function()
        if not live then
            if interval then
                ClearInterval(interval)
                interval = nil
            end
            return
        end

        live.timeLeft = live.timeLeft - 1

        if live.timeLeft <= 0 then
            if live.state == "active" then
                live.state = "going_once"
                live.timeLeft = Server.config.goingOnceTime
                NotifyArea("Auction", "Going once!", "GO", "HUD_MINI_GAME_SOUNDSET")
            elseif live.state == "going_once" then
                live.state = "going_twice"
                live.timeLeft = Server.config.goingTwiceTime
                NotifyArea("Auction", "Going twice!", "GO", "HUD_MINI_GAME_SOUNDSET")
            elseif live.state == "going_twice" then
                return EndLive()
            end
        end

        TriggerZones("bcs_auction:client:UpdateAuction", live.id, "live", live)
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

        live.state = "active"
        live.timeLeft = Server.config.bidTime

        UpdateAuction({
            id = live.id,
            live = live
        })

        TriggerZones("bcs_auction:client:UpdateAuction", live.id, "live", live)
    end
end)
