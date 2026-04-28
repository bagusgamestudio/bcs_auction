local stages = {}
local zones = {}

function GetTotalPlayerInStages()
    return #zones
end

function TriggerZones(event, ...)
    for i = 1, #zones do
        TriggerClientEvent(event, zones[i], ...)
    end
end

function CreateStage(id, category, data)
    if category == "vehicle" then
        local coords = data.coords
        coords = vec4(coords.x, coords.y, coords.z, coords.w)
        local vehicle = GetVehicleByPlate(data.vehiclePlate)
        table.insert(stages,
            { id = id, model = vehicle.model, coords = coords, plate = data.vehiclePlate, props = vehicle.props })
    end
end

function LoadStages()
    local stagesData = GetStagesAution()
    for i = 1, #stagesData do
        CreateStage(stagesData[i].id, "vehicle", stagesData[i].category_data)
    end
end

function UpdateStage(id, category, data)
    if category == "vehicle" then
        local coords = data.coords
        coords = vec4(coords.x, coords.y, coords.z, coords.w)

        for i = 1, #stages do
            if stages[i].id == id then
                stages[i].coords = coords
                stages[i].plate = data.vehiclePlate
                local vehicle = GetVehicleByPlate(data.vehiclePlate)
                stages[i].props = vehicle.props
                stages[i].model = vehicle.model
                TriggerZones("bcs_auction:client:UpdateStage", stages[i])
                break
            end
        end
    end
end

function DeleteStage(id)
    for i = 1, #stages do
        if stages[i].id == id then
            table.remove(stages, i)
            TriggerZones("bcs_auction:client:DeleteStage", id)
            break
        end
    end
end

RegisterNetEvent("bcs_auction:server:LoadStages", function()
    local source = source

    if #stages == 0 then
        LoadStages()
    end

    table.insert(zones, source)

    for i = 1, #stages, 1 do
        local stage = stages[i]
        TriggerClientEvent("bcs_auction:client:LoadStage", source, stage)
        Wait(100)
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
