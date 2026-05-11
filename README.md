# bcs_auction

A feature-rich **auction house** script for FiveM servers, supporting live and ongoing auctions for **vehicles**, **properties**, and **items**. Built for ESX and QBCore frameworks with a fully custom NUI interface.

---

## Features

- 🔨 **Live Auctions** — Real-time bidding with going-once / going-twice countdown system
- 📋 **Ongoing Auctions** — Schedule auctions with start/end time, resolved automatically via cron
- 🚗 **Vehicle Auctions** — Transfer vehicle ownership between players with auction, spawns the vehicles beside the podiums
- 🏠 **Property Auctions** — Auction properties compatible with `bcs_housing`, show preview image at the back of the podium and spawns the house at the auction house when the property is being auctioned
- 📦 **Item Auctions** — Auction items compatible with `ox_inventory`
- 💸 **Buyout Price** — Optional instant buyout for any auction
- 💰 **Auction Creation Fee** — Configurable fee charged when creating an auction
- 📱 **Phone Notification** — Sends `lb-phone` message to seller when auction is deleted
- 🔒 **Admin Controls** — Admin group can delete any auction
- 🎯 **Podium Preview** — 3D preview models shown at the auction venue
- 🖥️ **DUI Board** — In-world display board showing live auction info. Shows image at the back of the podium for properties, Preview image for vehicles, shows nothing for items.

---

## Dependencies

| Dependency | Required | Description |
|---|---|---|
| [ox_lib](https://github.com/overextended/ox_lib) | ✅ Required | Core library (callbacks, cron, zones, notifications) |
| [oxmysql](https://github.com/overextended/oxmysql) | ✅ Required | Database async queries |
| [ox_inventory](https://github.com/overextended/ox_inventory) | ⚠️ Optional | Required for item auction category |
| [bcs_housing](https://baguscodestudio.com/products/5090952) | ⚠️ Optional | Required for property auction category |
| `lb-phone` | ⚠️ Optional | Phone notification when an auction is deleted |

---

## Installation

### 1. Download & Place Resource

Download `bcs_auction` and place it inside your `resources` folder. Recommended path:
```
resources/[bcs]/bcs_auction
```

### 2. Add to `server.cfg`

Make sure the dependencies are started **before** `bcs_auction`:

```cfg
ensure ox_lib
ensure oxmysql
ensure bcs_auction
```

> If using `ox_inventory` or `bcs_housing`, ensure those resources are also started before `bcs_auction`.

### 3. Database

The script **automatically creates** the required database tables on startup via `oxmysql` transactions. No manual SQL import is needed.

Tables created:
- `auction` — stores all auction records
- `auction_bids` — stores all bid records (foreign key to `auction`)

### 4. Configure the Script

Edit the config files inside `config/`:

**`config/shared.lua`** — Shared settings (coords, fees, podium)
```lua
return {
    coords = vec4(-324.0379, -1020.6269, 29.3851, 339.1947), -- auction house location
    podiumModel = "kx_prop_podium1",

    createAuctionFee = 100, -- fee to create an auction (set to false to disable)

    -- podium preview positions
    podiumPreviews = { ... },
    -- zone coords for area notifications
    previewPoly = { ... },
    -- in-world DUI display board
    previewDUI = {
        enabled = true,
        coords = vec4(...),
        width = 2.3,
        height = 1.15,
    }
}
```

**`config/server.lua`** — Server-side timing & admin groups
```lua
return {
    bidTime = 60,               -- seconds per bid window (resets on new bid)
    goingOnceTime = 5,          -- going once countdown
    goingTwiceTime = 5,         -- going twice countdown

    onGoingCron = '*/5 * * * *', -- how often to check for expired ongoing auctions

    groups = {
        "admin"                 -- groups allowed to delete any auction
    },
}
```

### 5. Framework Detection

The script auto-detects your framework (`esx` or `qb`) from `Shared.framework`. No manual configuration needed if you are using a standard ESX or QBCore setup.

---

## Compatibility

### ox_inventory — [GitHub](https://github.com/overextended/ox_inventory)

`ox_inventory` is used for **item auction** support. When a player lists an item for auction, the item is removed from their inventory. Upon winning the auction, the item is added to the winner's inventory.

The script checks if `ox_inventory` is running before performing any item operations:

```lua
if GetResourceState('ox_inventory') == 'started' then
    exports.ox_inventory:AddItem(source, item, amount)
end
```

> ⚠️ If `ox_inventory` is **not** running, item auctions will not function. The **vehicle** and **property** categories are unaffected.

**Required exports used:**
| Export | Usage |
|---|---|
| `ox_inventory:AddItem` | Give item to auction winner / item recovery |
| `ox_inventory:RemoveItem` | Remove item from seller when listing |
| `ox_inventory:Search` | Check if seller has enough of the item |

---

### bcs_housing — [Store Page](https://baguscodestudio.com/products/5090952)

`bcs_housing` is used for **property auction** support. When a property auction is won, the current owner is revoked and the winner is assigned as the new owner.

The script checks if `bcs_housing` is running before performing any property operations:

```lua
if GetResourceState('bcs_housing') == 'started' then
    exports.bcs_housing:RevokeOwnership(homeId)
    exports.bcs_housing:GiveHouse(homeId, playerSource)
end
```

> ⚠️ If `bcs_housing` is **not** running, property auctions will not function. The **vehicle** and **item** categories are unaffected.

**Required exports used:**
| Export | Usage |
|---|---|
| `bcs_housing:RevokeOwnership` | Removes existing owner from the property |
| `bcs_housing:GiveHouse` | Assigns the property to the auction winner |

---

## Events (For Developers)

These events are available for external resources to hook into:

### `bcs_auction:server:OnLiveStart`

Triggered on the **server** when a live auction begins. Use this to integrate with other resources (e.g., announcement systems, Discord webhooks, logging).

```lua
AddEventHandler("bcs_auction:server:OnLiveStart", function(id)
    print(("Live auction started! Auction ID: %s"):format(id))
    -- Add your custom logic here
end)
```

**Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `id` | `number` | The ID of the auction that just went live |

---

### `bcs_auction:client:OnLiveStart`

Triggered on **all clients** when a live auction begins. Use this to play sounds, show HUD elements, or trigger client-side effects in other resources.

```lua
RegisterNetEvent('bcs_auction:client:OnLiveStart', function(id)
    print(("Live auction started client-side! Auction ID: %s"):format(id))
    -- Add your custom client-side logic here
end)
```

**Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `id` | `number` | The ID of the auction that just went live |

---

## Exports

The following server-side exports are available for use in other resources:

```lua
-- Create a new auction
exports.bcs_auction:CreateAuction(identifier, data)

-- Get a single auction by ID
exports.bcs_auction:GetAuction(id)

-- Get a paginated list of auctions
exports.bcs_auction:GetAuctions(status, category, page, limit)

-- Update auction data
exports.bcs_auction:UpdateAuction(data)

-- Delete an auction
exports.bcs_auction:DeleteAuction(id)

-- Mark an unsold item auction as recovered
exports.bcs_auction:RecoverAuction(id)
```

---

## Support

For issues or feature requests, please only create issues in the github since this is a free script.

## Visit Us
- 🌐 Store: [baguscodestudio.com](https://baguscodestudio.com)
- Discord: [Baguscodestudio](https://discord.gg/92JZmrMMez)