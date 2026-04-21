local tableAution =
[[
    CREATE TABLE IF NOT EXISTS `auction` (
        `id` int(11) NOT NULL AUTO_INCREMENT,

        `identifier` varchar(255) NOT NULL,

        `type` ENUM('live', 'ongoing') NOT NULL,
        `category` ENUM('vehicle', 'property', 'item') NOT NULL,

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
    local query =
    "INSERT INTO `auction` (`identifier`, `type`, `category`, `starting_price`, `minimum_bid`, `buyout_price`) VALUES(?, ?, ?, ?, ?, ?)"

    local values = {
        identifier,
        data.type,
        data.category,
        (data.starting_price or 0),
        (data.minimum_bid or 0),
        (data.buyout_price or 0)
    }

    local id = OxMysql:insert_async(query, values)

    Auctions[id] = data

    return id > 0
end

function GetAuction(id)
    if not Auctions[id] then
        Auctions[id] = OxMysql:single_async("SELECT * FROM `auction` WHERE `id` = ?", { id })
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

-- RegisterCommand('testaution', function()
--     local start = GetGameTimer()
--     print(json.encode(GetAuctions(AuctionType.Live, AuctionCategory.Vehicle, 1, 5), { indent = true }))
--     local elapsed = GetGameTimer() - start
--     print(elapsed .. " ms")
-- end, false)
