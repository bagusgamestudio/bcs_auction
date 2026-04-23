---@diagnostic disable-next-line
lib, cache = lib, cache

Shared = {
    config = lib.load('config.shared')
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
    lib.load('modules.utils.server')
    OxMysql = exports.oxmysql
else
    Client = {
        config = lib.load('config.client')
    }
    lib.load('modules.utils.client')
end

lib.load('modules.utils.shared')
