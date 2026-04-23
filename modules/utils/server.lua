function FormatDate(dateVal)
    if not dateVal then
        return nil
    end

    if type(dateVal) == "string" then
        local year, month, day, hour, min, sec = dateVal:match("(%d+)-(%d+)-(%d+)T(%d+):(%d+):(%d+)")
        if year then
            return string.format("%s-%s-%s %s:%s:%s", year, month, day, hour, min, sec)
        end
        return dateVal
    end

    return os.date("%Y-%m-%d %H:%M:%S", os.time(dateVal))
end

return {
    FormatDate = FormatDate
}
