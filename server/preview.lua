local preview = nil
local zones = {}

function GetTotalPlayerInStages()
    return #zones
end

function TriggerZones(event, ...)
    for i = 1, #zones do
        TriggerClientEvent(event, zones[i], ...)
    end
end

function StartPreview(id, category, data)
    if category == "vehicle" then
        local vehicle = GetVehicleByPlate(data.vehiclePlate)

        preview = {
            id = id,
            model = vehicle.model,
            plate = data.vehiclePlate,
            props = vehicle.props
        }

        TriggerZones("bcs_auction:client:LoadPreview", preview)
    end
end

function FinishPreview()
    preview = nil
    TriggerZones("bcs_auction:client:LoadPreview", nil)
end

RegisterNetEvent("bcs_auction:server:RequestPreview", function()
    local source = source

    table.insert(zones, source)

    if preview then
        TriggerClientEvent("bcs_auction:client:LoadPreview", source, preview)
    end
end)

RegisterNetEvent("bcs_auction:server:LeavePreview", function()
    local source = source

    for i = #zones, 1, -1 do
        if zones[i] == source then
            table.remove(zones, i)
            break
        end
    end
end)

AddEventHandler('playerDropped', function()
    for i = #zones, 1, -1 do
        if zones[i] == source then
            table.remove(zones, i)
            break
        end
    end
end)
