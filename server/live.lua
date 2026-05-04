local live, interval
local bids = {}
function NotifyArea(title, message, audioName, audioRef, duration)
    TriggerZones("bcs_auction:client:NotifyArea", {
        title = title,
        message = message,
        duration = duration,
        audioName = audioName or "GO",
        audioRef = audioRef or "HUD_MINI_GAME_SOUNDSET"
    })
end

function EndLive(isBuyout)
    NotifyArea("Auction", "SOLD!", "GO", "HUD_MINI_GAME_SOUNDSET", 5000)

    TriggerZones("bcs_auction:client:UpdateAuction", live.id, "live", nil)

    if not isBuyout and bids and #bids > 0 then
        local winner = bids[#bids]
        local id = live.id
        CreateThread(function()
            Wait(5000)
            local player = Server.GetPlayerByIdentifier(winner.identifier)
            if not player then
                return
            end

            if player.HasMoney("bank", winner.amount) then
                local success = GiveAuction(winner.identifier, GetAuction(id))
                if success then
                    player.RemoveMoney("bank", winner.amount)
                    FinishAuction(id)
                end
                NotifyArea("Auction", ("WINNER: %s ($%s)"):format(winner.identifier, winner.amount),
                    "Mission_Pass_Notify", "DLC_HEISTS_GENERAL_FRONTEND_SOUNDS")
            else
                NotifyArea("Auction", ("Winner %s doesn't have enough money, auction failed"):format(winner.identifier),
                    "ERROR", "HUD_FRONTEND_DEFAULT_SOUNDSET")
            end
        end)
    elseif not isBuyout then
        FinishAuction(live.id)
    end

    UpdateAuction({
        id = live.id,
        live = nil,
        bids = nil
    })

    live = nil
    if interval then
        ClearInterval(interval)
        interval = nil
    end

    FinishPreview()
end

RegisterNetEvent("bcs_auction:server:StartLive", function(id)
    if live then
        return TriggerClientEvent("bcs_auction:client:Notify", source, "Auction",
            "Wait for the current live auction to end", "error")
    end

    local aution = GetAuction(id)

    StartPreview(id, "vehicle", aution.category_data)

    live = {
        id = id,
        state = "active",
        timeLeft = Server.config.bidTime
    }

    bids = {}

    UpdateAuction({
        id = id,
        live = live,
        bids = bids,
        start_time = Server.utils.FormatDate(os.time())
    })

    TriggerZones("bcs_auction:client:UpdateAuction", id, "live", live)
    TriggerZones("bcs_auction:client:UpdateAuction", id, "bids", bids)

    NotifyArea("Auction", "Auction live started", "GO", "HUD_MINI_GAME_SOUNDSET")

    interval = SetInterval(function()
        if not live then
            if interval then
                ClearInterval(interval)
                interval = nil
                FinishPreview()
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
    local player = Server.GetPlayer(source)

    if not player then
        return
    end

    if not player.HasMoney("bank", amount) then
        return TriggerClientEvent("bcs_auction:client:Notify", source, "Auction", "You don't have enough money", "error")
    end

    local auction = GetAuction(id)
    local bid = {
        identifier = player.identifier,
        amount = amount,
        time = Server.utils.FormatDate(os.time()),
        name = player.name
    }

    SaveBid(id, player.identifier, amount)

    if auction and auction.type == "live" and live and live.id == id then
        table.insert(bids, bid)

        live.state = "active"
        live.timeLeft = Server.config.bidTime

        UpdateAuction({
            id = live.id,
            live = live,
            bids = bids
        })

        TriggerZones("bcs_auction:client:UpdateAuction", live.id, "live", live)
        TriggerZones("bcs_auction:client:UpdateAuction", live.id, "bids", bids)

        NotifyArea("Auction", ("New bid: $%s"):format(amount), "Mission_Pass_Notify",
            "DLC_HEISTS_GENERAL_FRONTEND_SOUNDS")
    else
        local auctionBids = auction.bids or {}
        table.insert(auctionBids, bid)

        UpdateAuction({
            id = id,
            bids = auctionBids
        })

        TriggerZones("bcs_auction:client:UpdateAuction", id, "bids", auctionBids)
    end
end)
