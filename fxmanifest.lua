fx_version 'cerulean'
game 'gta5'
lua54 'yes'

version      '1.0.0'

shared_script {
    '@ox_lib/init.lua',
    'types.lua',
}

client_scripts {
    'init.lua',
    'client/*.lua',
    'modules/integration/client.lua',
}

server_scripts {
    'init.lua',
    'server/**/*.lua',
    'modules/integration/server.lua',
}

files {
    'web/dist/index.html',
    'web/dist/**/*',
    'config/*.lua',
    'modules/**/**/*.lua',
    'stream/kx_buliding_podium.ytyp'
}

data_file 'DLC_ITYP_REQUEST' 'kx_buliding_podium.ytyp'

ui_page 'web/dist/index.html'
-- ui_page 'http://localhost:5173/'

escrow_ignore {
    'config/*.lua',
}
dependencies {
    '/assetpacks',
    'ox_lib',
    'oxmysql'
}
