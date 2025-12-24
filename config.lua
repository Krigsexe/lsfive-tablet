Config = {}

--[[
    FRAMEWORK CONFIGURATION
    'auto' = Automatic detection (recommended)
    'esx' = Force ESX
    'qbcore' = Force QBCore
    'standalone' = No framework
]]
Config.Framework = 'auto'

--[[
    TABLET COMMANDS & KEYBINDS
]]
Config.Command = 'tablet'                    -- Chat command to open tablet
Config.Keybind = 'F2'                        -- Keyboard keybind (set to false to disable)
Config.EnableKeybind = true                  -- Enable/disable keybind

--[[
    TABLET SETTINGS
]]
Config.TabletModel = 'prop_cs_tablet'        -- Tablet prop model
Config.TabletAnimation = true                -- Show tablet animation when opening
Config.TabletAnimDict = 'amb@world_human_seat_wall_tablet@female@base' -- Animation dictionary
Config.TabletAnimName = 'base'               -- Animation name

--[[
    LANGUAGE SETTINGS
]]
Config.DefaultLanguage = 'fr'                -- Default language: 'fr' or 'en'
Config.AllowLanguageChange = true            -- Allow players to change language in settings

--[[
    PHONE NUMBER FORMAT
    %s = Formatted number
    Example: '555-%s' generates '555-1234'
]]
Config.PhoneFormat = '555-%s'
Config.PhoneNumberLength = 4                 -- Length of random part

--[[
    NOTIFICATIONS
]]
Config.UseOxLibNotifications = true          -- Use ox_lib for notifications
Config.NotificationPosition = 'top-right'    -- Notification position

--[[
    VOICE SYSTEM INTEGRATION
    For phone calls
]]
Config.VoiceSystem = 'auto'                  -- 'auto', 'pma-voice', 'mumble-voip', 'none'
Config.EnableVoiceCalls = true               -- Enable voice calls feature

--[[
    JOB GROUPS
    Define which jobs have access to job-specific apps
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
        'ranger'
    },
    -- Emergency Medical Services (MediTab Access)
    ems = {
        'ambulance',
        'ems',
        'sams',
        'lsfd',
        'fire',
        'doctor',
        'hospital'
    },
    -- Mechanics (MechaTab Access)
    mechanic = {
        'mechanic',
        'bennys',
        'lscustoms',
        'tuner',
        'cardealer'
    }
}

--[[
    APP VISIBILITY
    Define which apps are enabled by default
]]
Config.EnabledApps = {
    phone = true,
    messages = true,
    browser = true,
    settings = true,
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
    -- Job Apps (auto-enabled based on job)
    mdt = true,
    meditab = true,
    mechatab = true
}

--[[
    GARAGE SETTINGS
]]
Config.EnableGarageSpawn = true              -- Allow spawning vehicles from tablet
Config.GarageSpawnDistance = 10.0            -- Distance to spawn vehicle
Config.RequireGarageProximity = false        -- Require being near a garage to spawn

--[[
    DISPATCH SETTINGS
]]
Config.DispatchCooldown = 30                 -- Seconds between dispatch alerts
Config.MaxDispatchAlerts = 50                -- Max alerts to keep in history
Config.DispatchDepartments = {
    police = { label = 'Police', color = '#3B82F6' },
    ambulance = { label = 'EMS', color = '#EF4444' },
    fire = { label = 'Fire', color = '#F97316' },
    citizen = { label = 'Citizen', color = '#10B981' }
}

--[[
    BANK SETTINGS
]]
Config.EnableTransfers = true                -- Allow money transfers
Config.TransferFee = 0                       -- Fee percentage (0 = no fee)
Config.MinimumTransfer = 1                   -- Minimum transfer amount

--[[
    SOCIAL MEDIA SETTINGS
]]
Config.MaxPostLength = 500                   -- Max characters per post
Config.MaxPostsPerHour = 10                  -- Rate limiting
Config.EnableImagePosts = true               -- Allow image URLs in posts

--[[
    MAIL SETTINGS
]]
Config.EmailDomain = 'ls.mail'               -- Default email domain
Config.MaxMailsPerPlayer = 100               -- Max stored emails

--[[
    MDT SETTINGS (Law Enforcement)
]]
Config.MDT = {
    EnableLiveMap = true,                    -- Show live map with units
    EnableBOLO = true,                       -- Enable BOLO system
    EnableWarrants = true,                   -- Enable warrants system
    EnableCitations = true,                  -- Enable citation system
    RequireOnDuty = true                     -- Require on-duty status
}

--[[
    MEDITAB SETTINGS (EMS)
]]
Config.MediTab = {
    EnableMedicalRecords = true,             -- Enable medical records
    EnableBilling = true,                    -- Enable patient billing
    RequireOnDuty = true                     -- Require on-duty status
}

--[[
    MECHATAB SETTINGS (Mechanics)
]]
Config.MechaTab = {
    EnableInvoices = true,                   -- Enable invoice system
    EnableVehicleLookup = true,              -- Enable plate lookup
    RequireOnDuty = true                     -- Require on-duty status
}

--[[
    DATABASE SETTINGS
]]
Config.UseExternalPhoneData = false          -- Use data from lsfive-phone if available
Config.SyncWithPhone = true                  -- Sync contacts/messages with phone resource

--[[
    DEBUG MODE
]]
Config.Debug = false                         -- Enable debug prints

--[[
    EXPORTS AVAILABLE:

    Client:
        exports['lsfive-tablet']:openTablet()
        exports['lsfive-tablet']:closeTablet()
        exports['lsfive-tablet']:isTabletOpen()

    Server:
        exports['lsfive-tablet']:GetPlayerIdentifier(source)
        exports['lsfive-tablet']:GetPlayerJob(source)
        exports['lsfive-tablet']:SendNotification(source, title, message, type)
        exports['lsfive-tablet']:SendDispatchAlert(department, title, details, location, coords)
]]
