local tables = {
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
        `finished_at` DATETIME DEFAULT NULL,

        `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (`id`)
    );
    ]],
    [[
    CREATE TABLE IF NOT EXISTS `auction_bids` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `auction_id` int(11) NOT NULL,
        `identifier` varchar(255) NOT NULL,
        `amount` int(11) NOT NULL,
        `time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        KEY `auction_id` (`auction_id`),
        FOREIGN KEY (`auction_id`) REFERENCES `auction`(`id`) ON DELETE CASCADE
    );
    ]]
}

OxMysql:transaction_async(tables)

function CreateAuction(identifier, data)
    local categoryData = {}

    if data.category == "vehicle" then
        categoryData = {
            vehiclePlate = data.vehiclePlate,
        }
    elseif data.category == "property" then
        categoryData = {
            homeId = data.homeId,
            imageUrl = data.imageUrl
        }
    elseif data.category == "item" then
        categoryData = {
            itemName = data.itemName,
            itemAmount = data.itemAmount
        }
    end

    local existing = OxMysql:scalar_async(
        "SELECT COUNT(*) FROM `auction` WHERE `identifier` = ? AND `finished_at` IS NULL", { identifier })

    if existing > 0 then
        return false, "You already have an active auction"
    end

    local startTime, endTime = nil, nil
    if data.start_time then
        startTime = Server.utils.FormatDate(data.start_time)
    end

    if data.end_time then
        endTime = Server.utils.FormatDate(data.end_time)
    end

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

exports("CreateAuction", CreateAuction)

function GetAuction(id)
    if not Auctions[id] then
        Auctions[id] = OxMysql:single_async("SELECT * FROM `auction` WHERE `id` = ?", { id })
        if Auctions[id] then
            Auctions[id].category_data = json.decode(Auctions[id].category_data)
            if Auctions[id].start_time then
                Auctions[id].start_time = Server.utils.FormatDate(Auctions[id].start_time / 1000)
            end
            if Auctions[id].end_time then
                Auctions[id].end_time = Server.utils.FormatDate(Auctions[id].end_time / 1000)
            end
            if Auctions[id].finished_at then
                Auctions[id].finished_at = Server.utils.FormatDate(Auctions[id].finished_at / 1000)
            end
            Auctions[id].bids = GetBids(id)
        end
    end

    return Auctions[id]
end

exports("GetAuction", GetAuction)

function GetAuctions(status, category, page, limit)
    local query = "SELECT `id` FROM `auction`"
    local conditions = {}
    local values = {}
    local countValues = {}

    if status == "past" then
        table.insert(conditions, "`finished_at` IS NOT NULL")
    elseif status == "coming_soon" then
        table.insert(conditions, "`finished_at` IS NULL")
        table.insert(conditions,
            "((`type` = 'ongoing' AND `start_time` > NOW()) OR (`type` = 'live' AND `start_time` IS NULL))")
    elseif status == "active" then
        table.insert(conditions, "`finished_at` IS NULL")
        table.insert(conditions,
            "((`type` = 'ongoing' AND `start_time` <= NOW() AND `end_time` >= NOW()) OR (`type` = 'live' AND `start_time` IS NOT NULL))")
    end

    if category and category ~= "all" then
        table.insert(conditions, "`category` = ?")
        table.insert(values, category)
        table.insert(countValues, category)
    end

    if #conditions > 0 then
        query = query .. " WHERE " .. table.concat(conditions, " AND ")
    end

    query = query .. " ORDER BY `created_at` DESC LIMIT ?, ?"
    table.insert(values, (page - 1) * limit)
    table.insert(values, limit)

    local result = OxMysql:query_async(query, values)

    for i = 1, #result do
        result[i] = GetAuction(result[i].id)
    end

    local countQuery = "SELECT COUNT(*) FROM `auction`"
    if #conditions > 0 then
        countQuery = countQuery .. " WHERE " .. table.concat(conditions, " AND ")
    end

    return {
        data = result,
        total = OxMysql:scalar_async(countQuery, countValues)
    }
end

exports("GetAuctions", GetAuctions)

function DeleteAuction(id)
    local auction = GetAuction(id)
    if not auction then
        return false, "Auction not found"
    end

    OxMysql:query_async("DELETE FROM `auction` WHERE `id` = ?", { id })
    Auctions[id] = nil

    return true, "Auction deleted"
end

exports("DeleteAuction", DeleteAuction)

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
        Auctions[data.id].type = data.type
    end

    if data.category then
        table.insert(updates, "`category` = ?")
        table.insert(values, data.category)
        Auctions[data.id].category = data.category
    end

    local categoryData = {}

    if data.category then
        if data.category == "vehicle" then
            categoryData = {
                vehiclePlate = data.vehiclePlate,
            }
        elseif data.category == "property" then
            categoryData = {
                homeId = data.homeId,
                imageUrl = data.imageUrl
            }
        elseif data.category == "item" then
            categoryData = {
                itemName = data.itemName,
                itemAmount = data.itemAmount
            }
        end

        table.insert(updates, "`category_data` = ?")
        table.insert(values, json.encode(categoryData))
        Auctions[data.id].category_data = categoryData
    end

    if data.starting_price then
        table.insert(updates, "`starting_price` = ?")
        table.insert(values, data.starting_price)
        Auctions[data.id].starting_price = data.starting_price
    end
    if data.minimum_bid then
        table.insert(updates, "`minimum_bid` = ?")
        table.insert(values, data.minimum_bid)
        Auctions[data.id].minimum_bid = data.minimum_bid
    end
    if data.buyout_price ~= nil then
        table.insert(updates, "`buyout_price` = ?")
        table.insert(values, data.buyout_price)
        Auctions[data.id].buyout_price = data.buyout_price
    end

    if data.start_time ~= nil then
        local startTime = data.start_time and Server.utils.FormatDate(data.start_time) or nil
        table.insert(updates, "`start_time` = ?")
        table.insert(values, startTime)
        Auctions[data.id].start_time = startTime
    end

    if data.end_time ~= nil then
        local endTime = data.end_time and Server.utils.FormatDate(data.end_time) or nil
        table.insert(updates, "`end_time` = ?")
        table.insert(values, endTime)
        Auctions[data.id].end_time = endTime
    end

    Auctions[data.id].live = data.live
    Auctions[data.id].bids = data.bids

    if #updates > 0 then
        table.insert(values, data.id)

        local query = "UPDATE `auction` SET " .. table.concat(updates, ", ") .. " WHERE `id` = ?"
        OxMysql:update_async(query, values)
    end

    return true, "Auction updated"
end

exports("UpdateAuction", UpdateAuction)

function GetExpiredAuctions()
    local ids = OxMysql:query_async(
        "SELECT `id` FROM `auction` WHERE `type` = 'ongoing' AND `end_time` < NOW() AND `finished_at` IS NULL")
    local result = {}
    for i = 1, #ids do
        result[i] = GetAuction(ids[i].id)
    end
    return result
end

function FinishAuction(id)
    OxMysql:update_async("UPDATE `auction` SET `finished_at` = NOW(), `end_time` = NOW() WHERE `id` = ?", { id })
    Auctions[id].finished_at = Server.utils.FormatDate(os.time())
    TriggerZones("bcs_auction:client:UpdateAuction", id, "finished_at", Auctions[id].finished_at)
    Auctions[id].live = nil
    Auctions[id].bids = nil
end

function SaveBid(auctionId, identifier, amount)
    local time = Server.utils.FormatDate(os.time())
    local query = "INSERT INTO `auction_bids` (`auction_id`, `identifier`, `amount`, `time`) VALUES(?, ?, ?, ?)"
    local id = OxMysql:insert_async(query, { auctionId, identifier, amount, time })
    return id > 0
end

function GetBids(auctionId)
    local result = OxMysql:query_async(
        "SELECT `identifier`, `amount`, `time` FROM `auction_bids` WHERE `auction_id` = ? ORDER BY `amount` ASC",
        { auctionId })
    for i = 1, #result do
        if result[i].time then
            result[i].time = Server.utils.FormatDate(result[i].time / 1000)
        end
    end
    return result
end

-- RegisterCommand('testaution', function()
--     local start = GetGameTimer()
--     print(json.encode(GetAuctions(AuctionType.Live, AuctionCategory.Vehicle, 1, 5), { indent = true }))
--     local elapsed = GetGameTimer() - start
--     print(elapsed .. " ms")
-- end, false)
