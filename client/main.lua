if Shared.framework then
    lib.load(('modules.bridge.%s.client'):format(Shared.framework))
end
