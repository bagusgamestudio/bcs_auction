if Shared.framework then
    lib.load(('modules.bridge.%s.client'):format(Shared.framework))
end

SpawnObject(Shared.config.podiumModel, Shared.config.coords)

lib.points.new({
    coords = Shared.config.coords,
    distance = 5,
    onEnter = function()
        HelpText(true, 'Press [E] to open the menu')
    end,
    onExit = function()
        HelpText(false)
    end,
    nearby = function()
        if IsControlJustPressed(0, 38) then
            SetVisible(true, '')
            SetFrame(FrameState.Visible)
            local player = lib.callback.await('bcs_auction:server:GetPlayer')
            SendNUIMessage({
                action = 'setPlayer',
                data = player
            })
        end
    end
})

RegisterNUICallback('closeFrame', function(data, cb)
    SetFrame(FrameState.Hidden)
    Wait(500)
    SetVisible(false)
    cb(true)
end)

RegisterNUICallback('createAuction', function(data, cb)
    cb(lib.callback.await('bcs_auction:server:CreateAuction', false, data))
end)

RegisterNUICallback('getAuctions', function(data, cb)
    Wait(1000) -- test delay
    local auctions = lib.callback.await('bcs_auction:server:GetAuctions', false, data.status, data.category,
        data.page, data.limit)

    for i = 1, #auctions.data do
        auctions.data[i] = GetCategoryData(auctions.data[i])
    end

    cb(auctions)
end)

RegisterNUICallback('getAuctionById', function(data, cb)
    cb(lib.callback.await('bcs_auction:server:GetAuctionById', false, data.id))
end)

RegisterNUICallback('deleteAuction', function(data, cb)
    cb(lib.callback.await('bcs_auction:server:DeleteAuction', false, data.id))
end)

RegisterNUICallback('updateAuction', function(data, cb)
    TriggerServerEvent('bcs_auction:server:UpdateAuction', data)
    cb(true)
end)

RegisterNUICallback('getVehicles', function(data, cb)
    cb(GetVehicles())
end)

RegisterNUICallback('getProperties', function(data, cb)
    cb(GetProperties())
end)

RegisterNUICallback('getItems', function(data, cb)
    cb(GetItems())
end)

RegisterNUICallback('startLive', function(data, cb)
    TriggerServerEvent('bcs_auction:server:StartLive', data)
    cb(true)
end)

RegisterNUICallback('placeBid', function(data, cb)
    TriggerServerEvent('bcs_auction:server:PlaceBid', data.id, data.amount)
    cb(true)
    if data.close then
        SetFrame(FrameState.Hidden)
        Wait(500)
        SetVisible(false)
    end
end)

RegisterNUICallback('buyout', function(data, cb)
    TriggerServerEvent('bcs_auction:server:Buyout', data.id)
    cb(true)
end)

RegisterNetEvent("bcs_auction:client:UpdateAuction", function(id, key, value)
    SendNUIMessage({
        action = 'updateAuction',
        data = {
            id = id,
            key = key,
            value = value
        }
    })
end)

RegisterNetEvent("bcs_auction:client:NotifyArea", function(data)
    if not IsInsidePreview() then
        return
    end

    NotifyMissionStyle(data.title, data.message, data.duration, data.audioName, data.audioRef)
end)
