---@diagnostic disable-next-line
lib, cache = lib, cache
SetInterval, ClearInterval = SetInterval --[[@as function]], ClearInterval --[[@as function]]
Shared = {
    config = lib.load('config.shared'),
    utils = lib.load('modules.utils.shared')
}

if GetResourceState('es_extended') == 'started' then
    Shared.framework = 'esx'
elseif GetResourceState('qb-core') == 'started' then
    Shared.framework = 'qb'
end

if IsDuplicityVersion() then
    Server = {
        config = lib.load('config.server'),
        utils = lib.load('modules.utils.server')
    }
    OxMysql = exports.oxmysql
else
    Client = {
        config = lib.load('config.client'),
        utils = lib.load('modules.utils.client')
    }
end
