--[[
    ============================================================
    LSFIVE TABLET - CONFIGURATION
    ============================================================
    Version: 2.0.0
    Compatible: ESX, QBCore, Standalone
    Dependencies: ox_lib v3.32+, oxmysql v2.13+
    ============================================================
]]

Config = {}

--[[
    ============================================================
    FRAMEWORK CONFIGURATION
    ============================================================
    'auto'       = Automatic detection (recommended)
    'esx'        = Force ESX (es_extended)
    'qbcore'     = Force QBCore (qb-core)
    'standalone' = No framework
]]
Config.Framework = 'auto'

--[[
    ============================================================
    TABLET COMMANDS & KEYBINDS
    ============================================================
]]
Config.Command = 'tablet'                    -- Chat command to open tablet
Config.Keybind = 'F2'                        -- Keyboard keybind
Config.EnableKeybind = true                  -- Enable/disable keybind
Config.RegisterAsControlKey = false          -- Use control key instead of keyboard

--[[
    ============================================================
    TABLET PHYSICAL SETTINGS
    ============================================================
]]
Config.TabletModel = 'prop_cs_tablet'        -- Tablet prop model
Config.TabletAnimation = true                -- Show tablet animation when opening
Config.TabletAnimDict = 'amb@world_human_seat_wall_tablet@female@base'
Config.TabletAnimName = 'base'
Config.TabletBoneIndex = 28422               -- Left hand bone

-- Prop attachment offsets
Config.PropOffset = {
    x = 0.0, y = 0.0, z = 0.0,
    rx = 0.0, ry = 0.0, rz = 0.0
}

--[[
    ============================================================
    LANGUAGE SETTINGS
    ============================================================
]]
Config.DefaultLanguage = 'fr'                -- Default language: 'fr' or 'en'
Config.AllowLanguageChange = true            -- Allow players to change language

-- Supported languages (add more in locales/ folder)
Config.SupportedLanguages = {
    { code = 'fr', name = 'Francais' },
    { code = 'en', name = 'English' }
}

--[[
    ============================================================
    PHONE NUMBER FORMAT
    ============================================================
    %s = Formatted random number
    Examples:
    '555-%s'     -> '555-1234'
    '310-%s'     -> '310-5678'
    '(555) %s'   -> '(555) 1234'
]]
Config.PhoneFormat = '555-%s'
Config.PhoneNumberLength = 4                 -- Length of random part (4 = 1000-9999)

--[[
    ============================================================
    LSFIVE-PHONE INTEGRATION
    ============================================================
    Configure integration with lsfive-phone resource
]]
Config.PhoneIntegration = {
    enabled = true,                          -- Enable phone integration
    resourceName = 'lsfive-phone',           -- Phone resource name
    syncContacts = true,                     -- Sync contacts between tablet and phone
    syncMessages = true,                     -- Sync messages between tablet and phone
    syncCallHistory = true,                  -- Sync call history
    sharePhoneNumber = true,                 -- Use same phone number as phone
    crossNotifications = true,               -- Show notifications on both devices
}

-- Fallback: Use tablet data if phone not available
Config.UseExternalPhoneData = false          -- Use data from lsfive-phone tables
Config.FallbackToTabletData = true           -- If phone unavailable, use tablet tables

--[[
    ============================================================
    NOTIFICATIONS SYSTEM
    ============================================================
]]
Config.UseOxLibNotifications = true          -- Use ox_lib for notifications
Config.NotificationPosition = 'top-right'    -- Position: top-right, top-left, bottom-right, bottom-left
Config.NotificationDuration = 5000           -- Duration in milliseconds

-- Notification sounds (requires ox_lib)
Config.NotificationSounds = {
    enabled = true,
    info = { name = 'INFO', set = 'HUD_FRONTEND_DEFAULT_SOUNDSET' },
    success = { name = 'SHOOTING_RANGE_ROUND_OVER', set = 'HUD_AWARDS' },
    error = { name = 'ERROR', set = 'HUD_FRONTEND_DEFAULT_SOUNDSET' },
}

--[[
    ============================================================
    VOICE SYSTEM INTEGRATION
    ============================================================
    For phone/tablet calls
]]
Config.VoiceSystem = 'auto'                  -- 'auto', 'pma-voice', 'mumble-voip', 'none'
Config.EnableVoiceCalls = true               -- Enable voice calls feature
Config.VoiceCallChannel = 'tablet-call-%s'   -- Channel name pattern (%s = call ID)

--[[
    ============================================================
    JOB GROUPS
    ============================================================
    Define which jobs have access to job-specific apps
    Add your server's job names here
]]
Config.JobGroups = {
    -- Law Enforcement (MDT Access)
    leo = {
        'police',
        'lspd',
        'lssd',
        'sahp',
        'sast',
        'fib',
        'doj',
        'gouv',
        'bcso',
        'ranger',
        'marshal',
        'sheriff'
    },
    -- Emergency Medical Services (MediTab Access)
    ems = {
        'ambulance',
        'ems',
        'sams',
        'lsfd',
        'fire',
        'doctor',
        'hospital',
        'medic',
        'paramedic'
    },
    -- Mechanics (MechaTab Access)
    mechanic = {
        'mechanic',
        'bennys',
        'lscustoms',
        'tuner',
        'cardealer',
        'pdm',
        'autoexotics'
    },
    -- Government (Full Access)
    government = {
        'gouv',
        'government',
        'mayor',
        'judge',
        'lawyer'
    }
}

--[[
    ============================================================
    APP VISIBILITY
    ============================================================
    Enable/disable apps globally
]]
Config.EnabledApps = {
    -- Core Apps
    phone = true,
    messages = true,
    browser = true,
    settings = true,

    -- Utility Apps
    bank = true,
    garage = true,
    dispatch = true,
    weather = true,
    mail = true,
    social = true,
    music = true,
    camera = true,
    marketplace = true,
    businesses = true,

    -- Job-Specific Apps (auto-enabled based on job)
    mdt = true,              -- Law Enforcement
    meditab = true,          -- EMS
    mechatab = true,         -- Mechanics
}

-- Apps that cannot be uninstalled
Config.SystemApps = {
    'phone',
    'messages',
    'settings',
    'browser'
}

--[[
    ============================================================
    GARAGE SETTINGS
    ============================================================
]]
Config.EnableGarageSpawn = true              -- Allow spawning vehicles from tablet
Config.GarageSpawnDistance = 10.0            -- Distance to spawn vehicle from player
Config.RequireGarageProximity = false        -- Require being near a garage to spawn
Config.GarageProximityDistance = 50.0        -- Distance to garage if required

-- Vehicle spawn locations (fallback if no garage system)
Config.DefaultSpawnLocations = {
    { x = 215.0, y = -810.0, z = 30.0, h = 90.0 },  -- Legion Square
}

--[[
    ============================================================
    DISPATCH SETTINGS
    ============================================================
]]
Config.DispatchCooldown = 30                 -- Seconds between dispatch alerts
Config.MaxDispatchAlerts = 50                -- Max alerts to keep in history
Config.DispatchAutoExpire = 3600             -- Auto-delete alerts after X seconds (0 = never)

Config.DispatchDepartments = {
    police = { label = 'Police', color = '#3B82F6', icon = 'shield' },
    ambulance = { label = 'EMS', color = '#EF4444', icon = 'heart-pulse' },
    fire = { label = 'Fire', color = '#F97316', icon = 'flame' },
    citizen = { label = 'Citizen', color = '#10B981', icon = 'user' }
}

-- Dispatch sound (requires ox_lib)
Config.DispatchSound = {
    enabled = true,
    name = 'TIMER_STOP',
    set = 'HUD_MINI_GAME_SOUNDSET'
}

--[[
    ============================================================
    BANK SETTINGS
    ============================================================
]]
Config.EnableTransfers = true                -- Allow money transfers
Config.TransferFee = 0                       -- Fee percentage (0 = no fee, 5 = 5%)
Config.MinimumTransfer = 1                   -- Minimum transfer amount
Config.MaximumTransfer = 1000000             -- Maximum transfer amount (0 = unlimited)
Config.TransactionHistoryLimit = 50          -- Max transactions to display

--[[
    ============================================================
    SOCIAL MEDIA SETTINGS
    ============================================================
]]
Config.MaxPostLength = 500                   -- Max characters per post
Config.MaxPostsPerHour = 10                  -- Rate limiting per player
Config.EnableImagePosts = true               -- Allow image URLs in posts
Config.ImageHostWhitelist = {                -- Allowed image domains
    'imgur.com',
    'i.imgur.com',
    'cdn.discordapp.com',
    'media.discordapp.net',
    'i.ibb.co',
    'prnt.sc'
}

--[[
    ============================================================
    MAIL SETTINGS
    ============================================================
]]
Config.EmailDomain = 'ls.mail'               -- Default email domain
Config.MaxMailsPerPlayer = 100               -- Max stored emails per player
Config.MaxMailBodyLength = 2000              -- Max email body length

--[[
    ============================================================
    MDT SETTINGS (Law Enforcement)
    ============================================================
]]
Config.MDT = {
    EnableLiveMap = true,                    -- Show live map with unit positions
    EnableBOLO = true,                       -- Enable BOLO (Be On Lookout) system
    EnableWarrants = true,                   -- Enable warrants system
    EnableCitations = true,                  -- Enable citation/ticket system
    EnableIncidents = true,                  -- Enable incident reports
    RequireOnDuty = true,                    -- Require on-duty status for access
    MapUpdateInterval = 5000,                -- Live map update interval (ms)
    MaxSearchResults = 20,                   -- Max citizen search results
}

--[[
    ============================================================
    MEDITAB SETTINGS (EMS)
    ============================================================
]]
Config.MediTab = {
    EnableMedicalRecords = true,             -- Enable medical records
    EnableBilling = true,                    -- Enable patient billing
    EnablePrescriptions = false,             -- Enable prescription system
    RequireOnDuty = true,                    -- Require on-duty status for access
    MaxRecordsPerPatient = 50,               -- Max medical records per patient
}

--[[
    ============================================================
    MECHATAB SETTINGS (Mechanics)
    ============================================================
]]
Config.MechaTab = {
    EnableInvoices = true,                   -- Enable invoice system
    EnableVehicleLookup = true,              -- Enable plate/VIN lookup
    EnableRepairHistory = false,             -- Enable repair history
    RequireOnDuty = true,                    -- Require on-duty status for access
    MaxInvoicesHistory = 100,                -- Max invoices to keep
}

--[[
    ============================================================
    CAMERA APP SETTINGS
    ============================================================
]]
Config.Camera = {
    Enabled = true,
    ScreenshotResource = 'screenshot-basic', -- Screenshot resource name
    UploadURL = 'https://api.imgur.com/3/image',
    UploadHeaders = {
        ['Authorization'] = 'Client-ID YOUR_IMGUR_CLIENT_ID'
    },
    MaxPhotosStored = 50,                    -- Max photos per player
}

--[[
    ============================================================
    MUSIC APP SETTINGS
    ============================================================
]]
Config.Music = {
    Enabled = true,
    MaxSongsPerPlayer = 100,                 -- Max songs in library
    AllowYouTube = true,                     -- Allow YouTube URLs
    AllowSoundCloud = false,                 -- Allow SoundCloud URLs
    DefaultVolume = 50,                      -- Default volume (0-100)
}

--[[
    ============================================================
    BROWSER APP SETTINGS
    ============================================================
]]
Config.Browser = {
    Enabled = true,
    Homepage = 'https://www.google.com',
    AllowExternalLinks = true,
    BlockedDomains = {                       -- Domains to block
        'pornhub.com',
        'xvideos.com',
        -- Add more as needed
    }
}

--[[
    ============================================================
    DEBUG MODE
    ============================================================
]]
Config.Debug = false                         -- Enable debug prints in console

--[[
    ============================================================
    EXPORTS REFERENCE
    ============================================================

    CLIENT EXPORTS:
    ---------------
    exports['lsfive-tablet']:openTablet()
    exports['lsfive-tablet']:closeTablet()
    exports['lsfive-tablet']:toggleTablet()
    exports['lsfive-tablet']:isTabletOpen()

    SERVER EXPORTS:
    ---------------
    exports['lsfive-tablet']:GetPlayerIdentifier(source)
    exports['lsfive-tablet']:GetPlayerJob(source)
    exports['lsfive-tablet']:GetPlayerPhoneNumber(source)
    exports['lsfive-tablet']:GetPlayerName(source)
    exports['lsfive-tablet']:GetPlayerBankBalance(source)
    exports['lsfive-tablet']:SendNotification(source, title, message, type)
    exports['lsfive-tablet']:SendDispatchAlert(department, title, details, location, coords)
    exports['lsfive-tablet']:SyncWithPhone(source)
    exports['lsfive-tablet']:GetPlayerData(source)

    EVENTS (for inter-resource communication):
    -----------------------------------------
    -- From tablet to phone:
    TriggerServerEvent('lsfive-phone:syncData', source, data)

    -- From phone to tablet:
    TriggerServerEvent('lsfive-tablet:syncData', source, data)
]]
