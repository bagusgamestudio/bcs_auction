if GetResourceState('ox_inventory') == 'started' then
    if not Inventory then
        Inventory = exports.ox_inventory
        Items = Inventory:Items()
        ImageInventory = 'nui://ox_inventory/web/images/%s.png'
    end
end

---@return Option[]
function GetItems()
    local options = {}

    if GetResourceState('ox_inventory') == 'started' then
        local playerItems = Inventory:GetPlayerItems()

        for k, v in pairs(playerItems) do
            table.insert(options, {
                value = v.name,
                label = v.label
            })
        end
    end

    return options
end

---@return Option[]
function GetProperties()
    local options = {}

    if GetResourceState('bcs_housing') == 'started' then
        local ownedHomes = exports['bcs_housing']:GetOwnedHomes()
        for i = 1, #ownedHomes, 1 do
            local home = ownedHomes[i]
            table.insert(options, {
                value = home.identifier,
                label = ('%s - %s'):format(home.identifier, home.properties.name)
            })
        end
    end

    return options
end

---@return Option[]
function GetVehicles()
    local options = {}
    local vehicles = lib.callback.await('bcs_auction:server:integration:GetVehicles')

    for i = 1, #vehicles, 1 do
        local vehicle = vehicles[i]
        local name = GetLabelText(GetDisplayNameFromVehicleModel(tonumber(vehicle.model) --[[@as number]]))
        table.insert(options, {
            value = vehicle.plate,
            label = ('%s - [%s]'):format(name, vehicle.plate)
        })
    end

    return options
end

function GetCategoryData(data)
    if data.category == 'item' then
        data.category_data.itemLabel = Items[data.category_data.itemName]?.label or data.category_data.itemName
        if ImageInventory then
            data.category_data.imageUrl = ImageInventory:format(data.category_data.itemName)
        end
    elseif data.category == 'property' then
        if GetResourceState('bcs_housing') == 'started' then
            local ownedHome = exports['bcs_housing']:GetHome(data.category_data.homeId)
            if ownedHome then
                data.category_data.homeName = ownedHome.properties.name
            end
        end
    elseif data.category == 'vehicle' then
        if not data.category_data.imageUrl or data.category_data.imageUrl == '' then
            data.category_data.vehicleName = GetDisplayNameFromVehicleModel(data.category_data.vehicleModel)
            data.category_data.imageUrl = ("https://docs.fivem.net/vehicles/%s.webp"):format(data.category_data
                .vehicleName
                :lower())
        end
    end

    return data
end
