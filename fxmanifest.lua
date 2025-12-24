--[[
    ============================================================
    LSFIVE TABLET - Universal FiveM Tablet Resource
    ============================================================
    Version: 2.0.0
    Author: LSFive / Krigsexe
    Repository: https://github.com/Krigsexe/lsfive-tablet

    Compatible with:
    - ESX (es_extended)
    - QBCore (qb-core)
    - Standalone (no framework)

    Dependencies (CommunityOx - December 2025):
    - ox_lib v3.32+ (archived April 2025, still functional)
    - oxmysql v2.13+
    ============================================================
]]

fx_version 'cerulean'
game 'gta5'

name 'lsfive-tablet'
author 'LSFive / Krigsexe'
description 'Universal plug & play tablet - Compatible ESX/QBCore/Standalone'
version '2.0.0'
repository 'https://github.com/Krigsexe/lsfive-tablet'

-- Lua 5.4 for improved performance
lua54 'yes'

-- Use HTTPS for NUI (FiveM standard)
use_experimental_fxv2_oal 'yes'

-- Shared scripts (loaded first)
shared_scripts {
    '@ox_lib/init.lua',
    'config.lua',
    'shared/*.lua'
}

-- Client scripts
client_scripts {
    'client/*.lua'
}

-- Server scripts
server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/*.lua'
}

-- NUI configuration
ui_page 'html/index.html'

-- Files accessible by NUI
files {
    'html/index.html',
    'html/**/*.js',
    'html/**/*.css',
    'html/**/*.png',
    'html/**/*.jpg',
    'html/**/*.jpeg',
    'html/**/*.gif',
    'html/**/*.svg',
    'html/**/*.webp',
    'html/**/*.woff',
    'html/**/*.woff2',
    'html/**/*.ttf',
    'html/**/*.eot',
    'locales/*.json'
}

-- Required dependencies
dependencies {
    'ox_lib',       -- v3.32+ (CommunityOx)
    'oxmysql'       -- v2.13+ (CommunityOx)
}

-- Optional dependencies (auto-detected)
-- 'es_extended'   -- ESX Framework
-- 'qb-core'       -- QBCore Framework
-- 'pma-voice'     -- Voice calls
-- 'mumble-voip'   -- Voice calls (alternative)
-- 'lsfive-phone'  -- Phone integration

-- Resource provides
provides {
    'tablet',
    'lsfive-tablet'
}

-- Escrow configuration (if needed)
-- escrow_ignore {
--     'config.lua',
--     'locales/*.json'
-- }

--[[
    ============================================================
    CLIENT EXPORTS
    ============================================================
    exports['lsfive-tablet']:openTablet()       -- Open the tablet
    exports['lsfive-tablet']:closeTablet()      -- Close the tablet
    exports['lsfive-tablet']:toggleTablet()     -- Toggle tablet visibility
    exports['lsfive-tablet']:isTabletOpen()     -- Check if tablet is open

    ============================================================
    SERVER EXPORTS
    ============================================================
    exports['lsfive-tablet']:GetPlayerIdentifier(source)
    exports['lsfive-tablet']:GetPlayerJob(source)
    exports['lsfive-tablet']:GetPlayerPhoneNumber(source)
    exports['lsfive-tablet']:SendNotification(source, title, message, type)
    exports['lsfive-tablet']:SendDispatchAlert(department, title, details, location, coords)
    exports['lsfive-tablet']:GetPlayerData(source)
    exports['lsfive-tablet']:SyncWithPhone(source)

    ============================================================
    INTER-RESOURCE EVENTS
    ============================================================
    -- Receive from lsfive-phone:
    TriggerEvent('lsfive-tablet:syncContacts', contacts)
    TriggerEvent('lsfive-tablet:syncMessages', messages)
    TriggerEvent('lsfive-tablet:newNotification', data)

    -- Send to lsfive-phone:
    TriggerEvent('lsfive-phone:syncContacts', contacts)
    TriggerEvent('lsfive-phone:syncMessages', messages)
    TriggerEvent('lsfive-phone:newNotification', data)
]]
