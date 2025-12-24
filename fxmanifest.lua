fx_version 'cerulean'
game 'gta5'

name 'lsfive-tablet'
author 'LSFive'
description 'Tablette universelle plug & play - Compatible ESX/QBCore/Standalone'
version '1.0.0'
repository 'https://github.com/Krigsexe/lsfive-tablet'

lua54 'yes'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua',
    'shared/*.lua'
}

client_scripts {
    'client/*.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/*.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/**/*.js',
    'html/**/*.css',
    'html/**/*.png',
    'html/**/*.jpg',
    'html/**/*.svg',
    'html/**/*.woff',
    'html/**/*.woff2',
    'html/**/*.ttf',
    'locales/*.json'
}

dependencies {
    'ox_lib',
    'oxmysql'
}

provides {
    'tablet'
}
