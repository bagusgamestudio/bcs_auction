function GetVehicleByPlate(plate)
    if Shared.framework == 'esx' then
        local data = OxMysql:single_async(
            "SELECT json_extract(`vehicle`, '$.model') as model, `vehicle` as props FROM `owned_vehicles` WHERE `plate` = ?",
            { plate })

        return {
            model = tonumber(data.model),
            props = json.decode(data.props)
        }
    end
end

lib.callback.register('bcs_auction:server:integration:GetVehicles', function(source)
    local player = Server.GetPlayer(source)
    local vehicles = {}

    if Shared.framework == 'esx' then
        vehicles = OxMysql:query_async(
            "SELECT `plate`, json_extract(`vehicle`, '$.model') as model FROM `owned_vehicles` WHERE `owner` = ?",
            { player.identifier })
    end

    return vehicles
end)
