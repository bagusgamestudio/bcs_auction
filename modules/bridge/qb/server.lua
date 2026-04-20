local qb = exports['qb-core']:GetCoreObject()

---@diagnostic disable-next-line: duplicate-set-field
function Server.GetPlayer(source)
    local player = qb.Functions.GetPlayer(source)

    return {
        identifier = player.PlayerData.citizenid,
        HasMoney = function(account, amount)
            if account == 'money' then
                account = 'cash'
            end
            return player.PlayerData.money[account] >= amount
        end,
        RemoveMoney = function(account, amount)
            player.Functions.RemoveMoney(account, amount)
        end,
        AddMoney = function(account, amount)
            player.Functions.AddMoney(account, amount)
        end
    }
end

---@diagnostic disable-next-line: duplicate-set-field
function Server.IsGroup(source, group)
    if type(group) == 'string' then
        group = { group }
    end

    for i = 1, #group, 1 do
        return qb.Functions.HasPermission(source, group[i])
    end
end
