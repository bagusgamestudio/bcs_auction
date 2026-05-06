local inside = false
local preview = nil
local vehicles = {}

function IsInsidePreview()
    return inside
end

function SpawnVehicles()
    if not preview then
        return
    end
    for i = 1, #Shared.config.podiumPreviews, 1 do
        local coordsOffset = Shared.config.podiumPreviews[i].coords
        local coords = Shared.config.coords + coordsOffset

        local entity = Client.utils.SpawnVehicle(preview.model, coords)
        table.insert(vehicles, entity)

        lib.setVehicleProperties(entity, preview.props)
        SetVehicleNumberPlateText(entity, preview.plate)
        FreezeEntityPosition(entity, true)
    end
end

function DeleteVehicles()
    for i = 1, #vehicles, 1 do
        if vehicles[i] then
            DeleteEntity(vehicles[i])
        end
    end
    vehicles = {}
end

function ExitZone()
    DeleteVehicles()
    preview = nil
end

local function OpenAuction(min)
    if not preview then
        return
    end
    local auction = lib.callback.await('bcs_auction:server:GetAuctionById', false, preview.id)
    SendNUIMessage({
        action = 'showBid',
        data = {
            auction = auction,
            show = true,
            step = min and 1 or 2
        }
    })
    SetNuiFocus(true, true)
end

local keybindMin = lib.addKeybind({
    name = 'auction_min_bid',
    description = 'Open Min Bid',
    defaultKey = 'G',
    onPressed = function(self)
        if IsInsidePreview() then
            OpenAuction(true)
        end
    end,
})

local keybindCustom = lib.addKeybind({
    name = 'auction_custom_bid',
    description = 'Open Custom Bid',
    defaultKey = 'H',
    onPressed = function(self)
        if IsInsidePreview() then
            OpenAuction()
        end
    end,
})

local keybindView = lib.addKeybind({
    name = 'auction_view',
    description = 'Open Auction',
    defaultKey = 'J',
    onPressed = function(self)
        if IsInsidePreview() and preview then
            SetVisible(true, 'view/' .. preview.id)
            SetFrame(FrameState.Visible)
        end
    end,
})

function PreviewHelpText(show)
    if show and not preview then
        return
    end
    if show then
        SendNUIMessage({
            action = 'showHelp',
            data = {
                text = ('~%s~ To Place Minimum Bid | ~%s~ To Place Custom Bid | ~%s~ To View Auction'):format(
                    keybindMin.currentKey, keybindCustom.currentKey, keybindView.currentKey),
                show = true
            }
        })
    else
        SendNUIMessage({
            action = 'showHelp',
            data = {
                show = false
            }
        })
    end
end

RegisterNetEvent("bcs_auction:client:LoadPreview", function(data)
    if not data and preview then
        PreviewHelpText(false)

        if preview.category == AuctionCategory.Vehicle then
            DeleteVehicles()
        end

        if preview.category == AuctionCategory.Property then
            RenderPreview(false)
        end

        preview = nil
        return
    end

    preview = data
    PreviewHelpText(true)
    if preview.category == AuctionCategory.Vehicle then
        SpawnVehicles()
    end

    if preview.category == AuctionCategory.Property then
        RenderPreview(true, preview.url)
    end
end)

lib.zones.poly({
    points = Shared.config.previewPoly,
    thickness = 6,
    onEnter = function()
        inside = true
        TriggerServerEvent("bcs_auction:server:RequestPreview")
        PreviewHelpText(true)
    end,
    onExit = function()
        TriggerServerEvent("bcs_auction:server:LeavePreview")
        inside = false
        ExitZone()
        PreviewHelpText(false)
    end
})

for i = 1, #Shared.config.podiumPreviews, 1 do
    local coordsOffset = Shared.config.podiumPreviews[i].coords
    local size = Shared.config.podiumPreviews[i].size
    local coords = Shared.config.coords + coordsOffset
    exports.ox_target:addBoxZone({
        coords = coords,
        size = size,
        rotation = coords.w,
        debug = Shared.config.debug,
        options = {
            {
                name = 'auction_preview_' .. i,
                icon = 'fas fa-eye',
                label = 'Preview',
                canInteract = function(entity, distance, coords, name, bone)
                    return preview ~= nil
                end,
                onSelect = function(data)
                    if not preview then
                        return
                    end
                    SetVisible(true, 'view/' .. preview.id)
                    SetFrame(FrameState.Visible)
                    local player = lib.callback.await('bcs_auction:server:GetPlayer')
                    SendNUIMessage({
                        action = 'setPlayer',
                        data = player
                    })
                end
            }
        }
    })
end
