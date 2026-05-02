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

---@param value boolean
---@param page? string
function SetVisible(value, page)
    if page then
        SetPage(page)
        Wait(1)
    end
    SendNUIMessage({
        action = 'setVisible',
        data = value
    })
    SetNuiFocus(value, value)
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

function NotifyMissionStyle(title, description, duration, audioName, audioRef)
    local scaleform = RequestScaleformMovie("MP_BIG_MESSAGE_FREEMODE")
    while not HasScaleformMovieLoaded(scaleform) do Wait(0) end

    BeginScaleformMovieMethod(scaleform, "SHOW_SHARD_WASTED_MP_MESSAGE")
    PushScaleformMovieMethodParameterString(title)
    PushScaleformMovieMethodParameterString(description)
    EndScaleformMovieMethod()

    local timer = GetGameTimer()
    if audioName then
        PlaySoundFrontend(-1, audioName, audioRef, true)
    end
    while GetGameTimer() - timer < (duration or 5000) do
        DrawScaleformMovieFullscreen(scaleform, 255, 255, 255, 255, 0)
        Wait(0)
    end
end
