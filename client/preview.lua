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

RegisterNetEvent("bcs_auction:client:LoadPreview", function(data)
    preview = data
    if not data then
        return DeleteVehicles()
    end
    SpawnVehicles()
end)

lib.zones.poly({
    points = Shared.config.previewPoly,
    onEnter = function()
        inside = true
        TriggerServerEvent("bcs_auction:server:RequestPreview")
    end,
    onExit = function()
        TriggerServerEvent("bcs_auction:server:LeavePreview")
        inside = false
        ExitZone()
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
