local vehicles = {}
local objects = {}
local deleteVehicle = DeleteVehicle

function SpawnVehicle(model, coords)
    lib.requestModel(model)
    local vehicle = CreateVehicle(model, coords.x, coords.y, coords.z, coords.w, false, false)

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

function SpawnObject(model, coords)
    lib.requestModel(model)
    local obj = CreateObject(model, coords.x, coords.y, coords.z, false, false, false)
    while not DoesEntityExist(obj) do
        Wait(100)
    end
    SetModelAsNoLongerNeeded(model)
    SetEntityAsMissionEntity(obj, true, true)
    SetEntityHeading(obj, coords.w)
    FreezeEntityPosition(obj, true)
    table.insert(objects, obj)
    return obj
end

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        for _, vehicle in pairs(vehicles) do
            if DoesEntityExist(vehicle) then
                DeleteEntity(vehicle)
            end
        end

        for _, obj in pairs(objects) do
            if DoesEntityExist(obj) then
                DeleteEntity(obj)
            end
        end
    end
end)

return {
    SpawnVehicle = SpawnVehicle,
    DeleteVehicle = DeleteVehicle
}
