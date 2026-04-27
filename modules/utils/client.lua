local vehicles = {}
local deleteVehicle = DeleteVehicle

function SpawnVehicle(model, coords)
    lib.requestModel(model)
    local vehicle = CreateVehicle(model, coords.x, coords.y, coords.z, 0.0, false, false)

    table.insert(vehicles, vehicle)

    return vehicle
end

function DeleteVehicle(entity)
    if DoesEntityExist(entity) then
        SetEntityAsMissionEntity(entity, true, true)
        deleteVehicle(entity)
    end

    for i = #vehicles, 1, -1 do
        if vehicles[i] == entity then
            table.remove(vehicles, i)
        end
    end
end

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        for _, vehicle in pairs(vehicles) do
            if DoesEntityExist(vehicle) then
                DeleteEntity(vehicle)
            end
        end
    end
end)

return {
    SpawnVehicle = SpawnVehicle,
    DeleteVehicle = DeleteVehicle
}
