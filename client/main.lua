if Shared.framework then
    lib.load(('modules.bridge.%s.client'):format(Shared.framework))
end

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
    TriggerServerEvent('bcs_auction:server:CreateAuction', data)
    cb(true)
end)

RegisterNUICallback('getAuctions', function(data, cb)
    Wait(1000) -- test delay
    cb(lib.callback.await('bcs_auction:server:GetAuctions', false, data.auctionType, data.category, data.page, data
        .limit))
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
