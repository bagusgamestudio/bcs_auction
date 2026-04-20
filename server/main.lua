if Shared.framework then
    lib.load(('modules.bridge.%s.server'):format(Shared.framework))
end
