fx_version 'cerulean'
game 'gta5'
lua54 'yes'

version      '1.1.0'

shared_script {
    '@ox_lib/init.lua',
    'types.lua',
}

client_scripts {
    'init.lua',
    'client/*.lua',
}

server_scripts {
    'init.lua',
    'server/**/*.lua',
}

files {
    'web/dist/index.html',
    'web/dist/**/*',
    'config/*.lua',
    'modules/**/**/*.lua',
}

ui_page 'web/dist/index.html'

escrow_ignore {
    'config/*.lua',
}
