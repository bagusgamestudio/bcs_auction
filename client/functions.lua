---@param title string
---@param message string
---@param type string
function Notify(title, message, type)
    lib.notify({
        title = title,
        description = message,
        type = type
    })
end

---@param show boolean
---@param text? string
function HelpText(show, text)
    if show then
        lib.showTextUI(text)
    else
        lib.hideTextUI()
    end
end

RegisterNetEvent('bcs_auction:client:Notify', Notify)

function IsAdmin()
    return lib.callback.await('bcs_auction:server:IsAdmin', false)
end

function MarkerLocation()
    local entity = Client.utils.SpawnVehicle('sultan', GetEntityCoords(cache.ped))
    local heading = GetEntityHeading(entity)
    SetEntityAlpha(entity, 120, true)
    SetEntityCollision(entity, false, false)
    FreezeEntityPosition(entity, true)

    while true do
        DisableControlAction(0, 38, true)
        local hit, _, endCoords = lib.raycast.cam()
        if hit then
            ---@diagnostic disable-next-line
            SetEntityCoords(entity, endCoords.x, endCoords.y, endCoords.z)
            SetEntityHeading(entity, heading)
        end
        if IsDisabledControlJustPressed(0, 38) then
            local coords = {
                x = Round(endCoords.x, 2),
                y = Round(endCoords.y, 2),
                z = Round(endCoords.z + 1, 2),
                w = Round(heading, 2)
            }
            Client.utils.DeleteVehicle(entity)
            return coords
        end

        if IsControlPressed(0, 14) then
            heading += 1.0
            SetEntityHeading(entity, heading)
        elseif IsControlPressed(0, 15) then
            heading -= 1.0
            SetEntityHeading(entity, heading)
        end
    end
end

---@param value boolean
---@param page? string
function SetVisible(value, page)
    SendNUIMessage({
        action = 'setVisible',
        data = value
    })
    SetNuiFocus(value, value)
    if page then
        Wait(1)
        SetPage(page)
    end
    Wait(500)
end

---@param page string
function SetPage(page)
    SendNUIMessage({
        action = 'setPage',
        data = page
    })
    Wait(100)
end

---@param state FrameState
function SetFrame(state)
    SendNUIMessage({
        action = 'setFrameState',
        data = state
    })
end
