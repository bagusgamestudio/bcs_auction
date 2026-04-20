local esx = exports['es_extended']:getSharedObject()

---@diagnostic disable-next-line: duplicate-set-field
function Server.GetPlayer(source)
    local player = esx.GetPlayerFromId(source)

    return {
        identifier = player.identifier,
        HasMoney = function(account, amount)
            return player.getAccount(account).money >= amount
        end,
        RemoveMoney = function(account, amount)
            player.removeAccountMoney(account, amount)
        end,
        AddMoney = function(account, amount)
            player.addAccountMoney(account, amount)
        end
    }
end

---@diagnostic disable-next-line: duplicate-set-field
function Server.IsGroup(source, group)
    local player = esx.GetPlayerFromId(source)

    if type(group) == 'string' then
        group = { group }
    end

    for i = 1, #group do
        if player.getGroup() == group[i] then
            return true
        end
    end

    return false
end
