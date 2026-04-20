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
    while true do
        local hit, _, endCoords = lib.raycast.cam()
        if hit then
            DrawMarker(1, endCoords.x, endCoords.y, endCoords.z, 0.0, 0.0, 0.0, 0, 0.0, 0.0, 1.5, 1.5,
                ---@diagnostic disable-next-line
                1.5, 255, 100, 100, 255, false, true, 2, false, false, false, false)
        end
        if IsControlJustPressed(0, 38) then
            local coords = {
                x = Round(endCoords.x, 2),
                y = Round(endCoords.y, 2),
                z = Round(endCoords.z + 1, 2),
                w = Round(GetEntityHeading(cache.ped), 2)
            }
            return coords
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
