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
            vehiclePlate = data.vehiclePlate,
            coords = data.coords
        }
    elseif data.category == "property" then
        categoryData = {
            homeId = data.homeId
        }
    elseif data.category == "item" then
        categoryData = {
            itemName = data.itemName,
            itemAmount = data.itemAmount
        }
    end

    local existing = OxMysql:single_async("SELECT * FROM `auction` WHERE `identifier` = ?", { identifier })

    if existing then
        return false, "You already have an active auction"
    end

    local startTime = nil
    if data.start_time then
        startTime = Server.utils.FormatDate(data.start_time)
    end
    local endTime = Server.utils.FormatDate(data.end_time)

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

    CreateStage(id, data.category, data.category_data)

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

function DeleteAuction(id)
    local auction = GetAuction(id)
    if not auction then
        return false, "Auction not found"
    end

    OxMysql:query_async("DELETE FROM `auction` WHERE `id` = ?", { id })
    Auctions[id] = nil

    DeleteStage(id)

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
                coords = data.coords
            }
        elseif data.category == "property" then
            categoryData = {
                homeId = data.homeId
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

    Auctions[data.id].live = data.live

    if #updates > 0 then
        UpdateStage(auction.id, auction.category, auction.category_data)

        table.insert(values, data.id)

        local query = "UPDATE `auction` SET " .. table.concat(updates, ", ") .. " WHERE `id` = ?"
        OxMysql:update_async(query, values)
    end

    return true, "Auction updated"
end

function GetStagesAution()
    local result = OxMysql:query_async("SELECT `id`, `category_data` FROM `auction` WHERE `category` = 'vehicle'")
    for i = 1, #result do
        result[i].category_data = json.decode(result[i].category_data)
    end
    return result
end

-- RegisterCommand('testaution', function()
--     local start = GetGameTimer()
--     print(json.encode(GetAuctions(AuctionType.Live, AuctionCategory.Vehicle, 1, 5), { indent = true }))
--     local elapsed = GetGameTimer() - start
--     print(elapsed .. " ms")
-- end, false)
