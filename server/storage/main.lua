local tableAution =
[[
    CREATE TABLE IF NOT EXISTS `auction` (
        `id` int(11) NOT NULL AUTO_INCREMENT,

        `identifier` varchar(255) NOT NULL,

        `type` ENUM('live', 'ongoing') NOT NULL,
        `category` ENUM('vehicle', 'property', 'item') NOT NULL,

        `category_data` JSON DEFAULT NULL,

        `starting_price` int(11) DEFAULT 0,
        `minimum_bid` int(11)  DEFAULT 0,
        `buyout_price` int(11)  DEFAULT 0,

        `start_time` DATETIME DEFAULT NULL,
        `end_time` DATETIME DEFAULT NULL,

        `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (`id`),
        UNIQUE KEY `identifier` (`identifier`)
    );
]]

OxMysql:query_async(tableAution)

function CreateAuction(identifier, data)
    local categoryData = {}

    if data.category == "vehicle" then
        categoryData = {
            brand = data.brand,
            model = data.model,
            plate = data.plate
        }
    elseif data.category == "property" then
        categoryData = {
            name = data.name,
            address = data.address
        }
    elseif data.category == "item" then
        categoryData = {
            name = data.name,
            amount = data.amount
        }
    end

    local existing = OxMysql:single_async("SELECT * FROM `auction` WHERE `identifier` = ?", { identifier })

    if existing then
        return false, "You already have an active auction"
    end

    local startTime = nil
    if data.start_date then
        startTime = Server.utils.FormatDate(data.start_date)
    end
    local endTime = Server.utils.FormatDate(data.end_date)

    local query =
    "INSERT INTO `auction` (`identifier`, `type`, `category`, `category_data`, `starting_price`, `minimum_bid`, `buyout_price`, `start_time`, `end_time`) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)"

    local values = {
        identifier,
        data.type,
        data.category,
        json.encode(categoryData),
        (data.starting_price or 0),
        (data.minimum_bid or 0),
        (data.buyout_price or 0),
        startTime,
        endTime
    }

    local id = OxMysql:insert_async(query, values)

    data.id = id
    data.identifier = identifier
    data.category_data = categoryData
    data.start_time = startTime
    data.end_time = endTime
    Auctions[id] = data


    return id > 0, "Auction created"
end

function GetAuction(id)
    if not Auctions[id] then
        Auctions[id] = OxMysql:single_async("SELECT * FROM `auction` WHERE `id` = ?", { id })
        if Auctions[id] then
            Auctions[id].category_data = json.decode(Auctions[id].category_data)
        end
    end

    return Auctions[id]
end

function GetAuctions(auctionType, category, page, limit)
    local result = OxMysql:query_async(
        "SELECT `id` FROM `auction` WHERE `type` = ? AND `category` = ? ORDER BY `created_at` DESC LIMIT ?, ?",
        { auctionType, category, (page - 1) * limit, limit })

    for i = 1, #result do
        result[i] = GetAuction(result[i].id)
    end


    return {
        data = result,
        total = OxMysql:scalar_async("SELECT COUNT(*) FROM `auction` WHERE `type` = ? AND `category` = ?",
            { auctionType, category })
    }
end

function DeleteAuction(id, identifier)
    local auction = GetAuction(id)
    if not auction then
        return false, "Auction not found"
    end

    OxMysql:query_async("DELETE FROM `auction` WHERE `id` = ?", { id })
    Auctions[id] = nil

    return true, "Auction deleted"
end

function UpdateAuction(data)
    local auction = GetAuction(data.id)
    if not auction then
        return false, "Auction not found"
    end

    local updates = {}
    local values = {}

    if data.type then
        table.insert(updates, "`type` = ?")
        table.insert(values, data.type)
    end

    if data.category then
        table.insert(updates, "`category` = ?")
        table.insert(values, data.category)
    end

    if data.category then
        local categoryData = {}
        if data.category == "vehicle" then
            categoryData = { brand = data.brand, model = data.model, plate = data.plate }
        elseif data.category == "property" then
            categoryData = { name = data.name, address = data.address }
        elseif data.category == "item" then
            categoryData = { name = data.name, amount = data.amount }
        end
        table.insert(updates, "`category_data` = ?")
        table.insert(values, json.encode(categoryData))
    end

    if data.starting_price then
        table.insert(updates, "`starting_price` = ?")
        table.insert(values, data.starting_price)
    end
    if data.minimum_bid then
        table.insert(updates, "`minimum_bid` = ?")
        table.insert(values, data.minimum_bid)
    end
    if data.buyout_price ~= nil then
        table.insert(updates, "`buyout_price` = ?")
        table.insert(values, data.buyout_price)
    end

    if #updates == 0 then
        return false, "No fields to update"
    end

    table.insert(values, data.id)

    local query = "UPDATE `auction` SET " .. table.concat(updates, ", ") .. " WHERE `id` = ?"
    OxMysql:query_async(query, values)

    Auctions[data.id] = nil

    return true, "Auction updated"
end

-- RegisterCommand('testaution', function()
--     local start = GetGameTimer()
--     print(json.encode(GetAuctions(AuctionType.Live, AuctionCategory.Vehicle, 1, 5), { indent = true }))
--     local elapsed = GetGameTimer() - start
--     print(elapsed .. " ms")
-- end, false)
