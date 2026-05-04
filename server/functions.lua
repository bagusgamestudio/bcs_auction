function IsAdmin(source)
    for i = 1, #Server.config.groups, 1 do
        if Server.IsGroup(source, Server.config.groups[i]) then
            return true
        end
    end

    return false
end
