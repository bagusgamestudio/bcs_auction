local live
local interval

local function NotifyArea(title, message, audioName, audioRef)
    TriggerZones("bcs_auction:client:NotifyArea", {
        title = title,
        message = message,
        duration = 5000,
        audioName = audioName or "GO",
        audioRef = audioRef or "HUD_MINI_GAME_SOUNDSET"
    })
end

local function EndLive()
    NotifyArea("Auction", "SOLD!", "GOLF_COMPLETE", "HUD_AWARDS")
    TriggerZones("bcs_auction:client:UpdateAuction", live.id, "live", nil)
    ClearInterval(interval)
    live = nil
    interval = nil
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
        deadline = os.time() + Server.config.bidTime
    }

    UpdateAuction({
        id = id,
        live = live
    })

    TriggerZones("bcs_auction:client:UpdateAuction", id, "live", live)

    NotifyArea("Auction", "Auction live started", "GO", "HUD_MINI_GAME_SOUNDSET")

    interval = SetInterval(function()
        if not live then return end

        local now = os.time()
        live.timeLeft = math.max(0, live.deadline - now)

        if now >= live.deadline then
            if live.state == "active" then
                live.state = "going_once"
                live.deadline = now + Server.config.goingOnceTime
                live.timeLeft = Server.config.goingOnceTime
                NotifyArea("Auction", "Going once!", "GO", "HUD_MINI_GAME_SOUNDSET")
            elseif live.state == "going_once" then
                live.state = "going_twice"
                live.deadline = now + Server.config.goingTwiceTime
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
        live.deadline = os.time() + Server.config.bidTime
        live.timeLeft = Server.config.bidTime

        TriggerZones("bcs_auction:client:UpdateAuction", live.id, "live", live)
    end
end)
