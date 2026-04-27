local inside = false
local stages = {}

function LoadStage(stage)
    local entity = Client.utils.SpawnVehicle(stage.model, stage.coords)
    stage.entity = entity

    lib.setVehicleProperties(entity, stage.props)
    SetVehicleNumberPlateText(entity, stage.plate)
    FreezeEntityPosition(entity, true)
    table.insert(stages, stage)
end

RegisterNetEvent("bcs_auction:client:LoadStage", LoadStage)

function UpdateStage(stage)
    for i = 1, #stages, 1 do
        if stages[i].id == stage.id then
            if DoesEntityExist(stages[i].entity) then
                Client.utils.DeleteVehicle(stages[i].entity)
            end
            table.remove(stages, i)
            Wait(100)
            LoadStage(stage)
            return
        end
    end
end

RegisterNetEvent("bcs_auction:client:UpdateStage", UpdateStage)

function DeleteStage(id)
    for i = 1, #stages do
        if stages[i].id == id then
            Client.utils.DeleteVehicle(stages[i].entity)
            table.remove(stages, i)
            return
        end
    end
end

RegisterNetEvent("bcs_auction:client:DeleteStage", DeleteStage)

local function UnLoadStages()
    for i = 1, #stages, 1 do
        local stage = stages[i]
        Client.utils.DeleteVehicle(stage.entity)
    end

    stages = {}
end

lib.zones.poly({
    points = Shared.config.stagePoly,
    onEnter = function()
        inside = true
        TriggerServerEvent('bcs_auction:server:LoadStages')
    end,
    onExit = function()
        inside = false
        UnLoadStages()
    end
})

exports.ox_target:addGlobalVehicle({
    {
        name = 'Auction',
        icon = 'fas fa-handshake',
        label = 'Auction',
        canInteract = function(entity, distance, coords, name, bone)
            if not inside then
                return false
            end

            for i = 1, #stages, 1 do
                if stages[i].entity == entity then
                    return true
                end
            end

            return false
        end
    },
})
