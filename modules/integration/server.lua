function GetVehicleByPlate(plate)
    if Shared.framework == 'esx' then
        local data = OxMysql:single_async(
            "SELECT json_extract(`vehicle`, '$.model') as model, `vehicle` as props FROM `owned_vehicles` WHERE `plate` = ?",
            { plate })

        return {
            model = tonumber(data.model),
            props = json.decode(data.props)
        }
    elseif Shared.framework == 'qb' then
        local data = OxMysql:single_async(
            "SELECT `hash` as model, `mods` as props FROM `player_vehicles` WHERE `plate` = ?",
            { plate })
        return {
            model = tonumber(data.model),
            props = json.decode(data.props)
        }
    end
end

function GiveItem(source, item, amount)
    if GetResourceState('ox_inventory') == 'started' then
        return exports.ox_inventory:AddItem(source, item, amount)
    end

    return false
end

function RemoveItem(source, item, amount)
    if GetResourceState('ox_inventory') == 'started' then
        return exports.ox_inventory:RemoveItem(source, item, amount)
    end

    return false
end

function HasItem(source, item, amount)
    if GetResourceState('ox_inventory') == 'started' then
        local count = exports.ox_inventory:Search(source, "count", item)
        return count >= amount
    end

    return false
end

function GiveAuction(identifier, data)
    if data.category == 'vehicle' then
        if Shared.framework == 'esx' then
            local affectedRows = OxMysql:update_async(
                "UPDATE `owned_vehicles` SET `owner` = ? WHERE `plate` = ?",
                { identifier, data.category_data.vehiclePlate })

            return affectedRows > 0
        end

        if Shared.framework == 'qb' then
            local affectedRows = OxMysql:update_async(
                "UPDATE `player_vehicles` SET `citizenid` = ? WHERE `plate` = ?",
                { identifier, data.category_data.vehiclePlate })

            return affectedRows > 0
        end
    end

    if data.category == 'property' then
        if GetResourceState('bcs_housing') == 'started' then
            local player = Server.GetPlayerByIdentifier(identifier)
            exports.bcs_housing:RevokeOwnership(data.category_data.homeId)
            Wait(1000)
            exports.bcs_housing:GiveHouse(data.category_data.homeId, player.source)

            return true
        end
    end

    if data.category == 'item' then
        if GetResourceState('ox_inventory') == 'started' then
            local player = Server.GetPlayerByIdentifier(identifier)
            return GiveItem(player.source, data.category_data.itemName, data.category_data.itemAmount)
        end
    end

    return false
end

lib.callback.register('bcs_auction:server:integration:GetVehicles', function(source)
    local player = Server.GetPlayer(source)
    local vehicles = {}
print(Shared.framework)
    if Shared.framework == 'esx' then
        vehicles = OxMysql:query_async(
            "SELECT `plate`, json_extract(`vehicle`, '$.model') as model FROM `owned_vehicles` WHERE `owner` = ?",
            { player.identifier })
    elseif Shared.framework == 'qb' then
        vehicles = OxMysql:query_async(
            "SELECT `plate`, `hash` as model FROM `player_vehicles` WHERE `citizenid` = ?",
            { player.identifier })
            print(json.encode(vehicles))
    end

    return vehicles
end)

function SendMessage(from, to, message)
    if GetResourceState("lb-phone") == "started" then
        local phoneNumberFrom = exports["lb-phone"]:GetEquippedPhoneNumber(from)
        local phoneNumberTo = exports["lb-phone"]:GetEquippedPhoneNumber(to)

        exports["lb-phone"]:SendMessage(phoneNumberFrom, phoneNumberTo, message)
    end
end
