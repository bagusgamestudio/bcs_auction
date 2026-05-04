local dui = lib.dui:new({
    url = "nui://bcs_auction/web/dist/index.html#/dui",
    width = 1920,
    height = 1080
})
local configDUI = Shared.config.previewDUI
local render = false

while not dui.duiHandle do
    Wait(100)
end

local function GetQuadCoords(center, heading, width, height)
    local rad = math.rad(heading - 90.0)

    local right = vector3(math.sin(rad), -math.cos(rad), 0.0)
    local up = vector3(0.0, 0.0, 1.0)


    local bl = center - right * width - up * height
    local br = center + right * width - up * height
    local tr = center + right * width + up * height
    local tl = center - right * width + up * height

    return bl, br, tr, tl
end

function RenderPreview(active, url)
    if not configDUI.enabled then return end

    render = active
    if not active then
        return
    end

    local width = configDUI.width
    local height = configDUI.height

    local bl, br, tr, tl = GetQuadCoords(configDUI.coords.xyz, configDUI.coords.w, width, height)

    dui:sendMessage({
        action = "setBackground",
        data = url
    })

    while render and IsInsidePreview() do
        DrawSpritePoly(
            bl.x, bl.y, bl.z,
            br.x, br.y, br.z,
            tr.x, tr.y, tr.z,
            255, 255, 255, 255,
            dui.dictName, dui.txtName,
            0.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 0.0, 1.0
        )

        DrawSpritePoly(
            bl.x, bl.y, bl.z,
            tr.x, tr.y, tr.z,
            tl.x, tl.y, tl.z,
            255, 255, 255, 255,
            dui.dictName, dui.txtName,
            0.0, 1.0, 1.0,
            1.0, 0.0, 1.0,
            0.0, 0.0, 1.0
        )

        Wait(0)
    end
end

-- Wait(1000)
-- RenderPreview(true, "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?cs=srgb&dl=pexels-expect-best-323780.jpg&fm=jpg")
