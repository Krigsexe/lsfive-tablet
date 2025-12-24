--[[
    LSFIVE TABLET - CLIENT
    Gestion NUI, animations, et interactions côté client
]]

-- State variables
local isTabletOpen = false
local tabletProp = nil
local PlayerData = {}
local cachedData = {}

--[[
    INITIALIZATION
]]
CreateThread(function()
    -- Wait for framework to load
    Wait(1000)

    local framework = LSFiveTablet.DetectFramework()
    local fw = LSFiveTablet.GetFramework()

    if framework == 'esx' then
        RegisterNetEvent('esx:playerLoaded', function(xPlayer)
            PlayerData = xPlayer
            InitializeTablet()
        end)

        RegisterNetEvent('esx:setJob', function(job)
            PlayerData.job = job
            UpdateNUIPlayerData()
        end)

        -- Check if player is already loaded
        if fw and fw.IsPlayerLoaded and fw.IsPlayerLoaded() then
            PlayerData = fw.GetPlayerData()
            InitializeTablet()
        end

    elseif framework == 'qbcore' then
        RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
            PlayerData = fw.Functions.GetPlayerData()
            InitializeTablet()
        end)

        RegisterNetEvent('QBCore:Client:OnJobUpdate', function(job)
            PlayerData.job = job
            UpdateNUIPlayerData()
        end)

        -- Check if player is already loaded
        if fw and LocalPlayer.state.isLoggedIn then
            PlayerData = fw.Functions.GetPlayerData()
            InitializeTablet()
        end

    else
        -- Standalone
        Wait(2000)
        InitializeTablet()
    end
end)

function InitializeTablet()
    LSFiveTablet.Debug('Initializing tablet...')

    -- Fetch initial data from server
    TriggerServerEvent('lsfive-tablet:server:requestInitialData')

    -- Register keybind
    if Config.EnableKeybind and Config.Keybind then
        RegisterKeyMapping(Config.Command, 'Open Tablet', 'keyboard', Config.Keybind)
    end
end

function UpdateNUIPlayerData()
    local job = GetPlayerJob()
    local jobGroup = LSFiveTablet.GetJobGroup(job)

    SendNUIMessage({
        type = 'updatePlayerData',
        data = {
            job = job,
            jobGroup = jobGroup,
            identifier = GetPlayerIdentifier()
        }
    })
end

--[[
    PLAYER DATA HELPERS
]]
function GetPlayerJob()
    local framework = LSFiveTablet.DetectFramework()

    if framework == 'esx' then
        return PlayerData.job and PlayerData.job.name or 'unemployed'
    elseif framework == 'qbcore' then
        return PlayerData.job and PlayerData.job.name or 'unemployed'
    else
        return 'civilian'
    end
end

function GetPlayerIdentifier()
    local framework = LSFiveTablet.DetectFramework()

    if framework == 'esx' then
        return PlayerData.identifier
    elseif framework == 'qbcore' then
        return PlayerData.citizenid
    else
        return GetPlayerServerId(PlayerId())
    end
end

function IsPlayerOnDuty()
    local framework = LSFiveTablet.DetectFramework()

    if framework == 'esx' then
        return PlayerData.job and PlayerData.job.onDuty ~= false
    elseif framework == 'qbcore' then
        return PlayerData.job and PlayerData.job.onduty
    else
        return true
    end
end

--[[
    TABLET OPEN/CLOSE
]]
function OpenTablet()
    if isTabletOpen then return end

    isTabletOpen = true

    -- Create tablet prop
    if Config.TabletAnimation then
        CreateTabletProp()
        PlayTabletAnimation()
    end

    -- Fetch fresh data
    TriggerServerEvent('lsfive-tablet:server:requestInitialData')

    -- Update player data
    local job = GetPlayerJob()
    local jobGroup = LSFiveTablet.GetJobGroup(job)

    -- Open NUI
    SetNuiFocus(true, true)
    SendNUIMessage({
        type = 'setVisible',
        visible = true,
        playerData = {
            job = job,
            jobGroup = jobGroup,
            identifier = GetPlayerIdentifier(),
            onDuty = IsPlayerOnDuty()
        }
    })

    LSFiveTablet.Debug('Tablet opened')
end

function CloseTablet()
    if not isTabletOpen then return end

    isTabletOpen = false

    -- Remove tablet prop
    if Config.TabletAnimation then
        RemoveTabletProp()
        ClearPedTasks(PlayerPedId())
    end

    -- Close NUI
    SetNuiFocus(false, false)
    SendNUIMessage({
        type = 'setVisible',
        visible = false
    })

    LSFiveTablet.Debug('Tablet closed')
end

function ToggleTablet()
    if isTabletOpen then
        CloseTablet()
    else
        OpenTablet()
    end
end

--[[
    TABLET PROP & ANIMATION
]]
function CreateTabletProp()
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)

    -- Request model
    local model = joaat(Config.TabletModel)
    RequestModel(model)

    local timeout = 0
    while not HasModelLoaded(model) and timeout < 100 do
        Wait(10)
        timeout = timeout + 1
    end

    if HasModelLoaded(model) then
        tabletProp = CreateObject(model, coords.x, coords.y, coords.z, true, true, true)
        local boneIndex = GetPedBoneIndex(ped, 28422) -- Left hand

        AttachEntityToEntity(tabletProp, ped, boneIndex, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, true, true, false, true, 1, true)
        SetModelAsNoLongerNeeded(model)
    end
end

function RemoveTabletProp()
    if tabletProp and DoesEntityExist(tabletProp) then
        DeleteEntity(tabletProp)
        tabletProp = nil
    end
end

function PlayTabletAnimation()
    local ped = PlayerPedId()

    RequestAnimDict(Config.TabletAnimDict)
    local timeout = 0
    while not HasAnimDictLoaded(Config.TabletAnimDict) and timeout < 100 do
        Wait(10)
        timeout = timeout + 1
    end

    if HasAnimDictLoaded(Config.TabletAnimDict) then
        TaskPlayAnim(ped, Config.TabletAnimDict, Config.TabletAnimName, 3.0, 3.0, -1, 49, 0, false, false, false)
    end
end

--[[
    COMMANDS & KEYBINDS
]]
RegisterCommand(Config.Command, function()
    ToggleTablet()
end, false)

--[[
    NUI CALLBACKS
]]

-- Close tablet
RegisterNUICallback('closeTablet', function(_, cb)
    CloseTablet()
    cb('ok')
end)

-- Get player data
RegisterNUICallback('getPlayerData', function(_, cb)
    cb({
        job = GetPlayerJob(),
        jobGroup = LSFiveTablet.GetJobGroup(GetPlayerJob()),
        identifier = GetPlayerIdentifier(),
        onDuty = IsPlayerOnDuty()
    })
end)

-- Fetch contacts
RegisterNUICallback('getContacts', function(_, cb)
    LSFiveTablet.Debug('Fetching contacts...')
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:getContacts')
    RegisterNetEvent('lsfive-tablet:client:receiveContacts', function(contacts)
        p:resolve(contacts)
    end)

    local contacts = Citizen.Await(p)
    cb(contacts or {})
end)

-- Add contact
RegisterNUICallback('addContact', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:addContact', data)
    cb('ok')
end)

-- Delete contact
RegisterNUICallback('deleteContact', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:deleteContact', data.id)
    cb('ok')
end)

-- Fetch conversations
RegisterNUICallback('getConversations', function(_, cb)
    LSFiveTablet.Debug('Fetching conversations...')
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:getConversations')
    RegisterNetEvent('lsfive-tablet:client:receiveConversations', function(conversations)
        p:resolve(conversations)
    end)

    local conversations = Citizen.Await(p)
    cb(conversations or {})
end)

-- Send message
RegisterNUICallback('sendMessage', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:sendMessage', data)
    cb('ok')
end)

-- Fetch call history
RegisterNUICallback('getCallHistory', function(_, cb)
    LSFiveTablet.Debug('Fetching call history...')
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:getCallHistory')
    RegisterNetEvent('lsfive-tablet:client:receiveCallHistory', function(history)
        p:resolve(history)
    end)

    local history = Citizen.Await(p)
    cb(history or {})
end)

-- Make call
RegisterNUICallback('makeCall', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:makeCall', data.phoneNumber)
    cb('ok')
end)

-- End call
RegisterNUICallback('endCall', function(_, cb)
    TriggerServerEvent('lsfive-tablet:server:endCall')
    cb('ok')
end)

-- Get bank account
RegisterNUICallback('getBankAccount', function(_, cb)
    LSFiveTablet.Debug('Fetching bank account...')
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:getBankAccount')
    RegisterNetEvent('lsfive-tablet:client:receiveBankAccount', function(account)
        p:resolve(account)
    end)

    local account = Citizen.Await(p)
    cb(account or { balance = 0, transactions = {} })
end)

-- Transfer money
RegisterNUICallback('transferMoney', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:transferMoney', data)
    cb('ok')
end)

-- Get vehicles
RegisterNUICallback('getVehicles', function(_, cb)
    LSFiveTablet.Debug('Fetching vehicles...')
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:getVehicles')
    RegisterNetEvent('lsfive-tablet:client:receiveVehicles', function(vehicles)
        p:resolve(vehicles)
    end)

    local vehicles = Citizen.Await(p)
    cb(vehicles or {})
end)

-- Request vehicle spawn
RegisterNUICallback('requestVehicle', function(data, cb)
    if not Config.EnableGarageSpawn then
        cb({ success = false, message = 'Vehicle spawn disabled' })
        return
    end

    TriggerServerEvent('lsfive-tablet:server:requestVehicle', data.id)
    cb({ success = true })
end)

-- Get dispatch alerts
RegisterNUICallback('getDispatchAlerts', function(_, cb)
    LSFiveTablet.Debug('Fetching dispatch alerts...')
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:getDispatchAlerts')
    RegisterNetEvent('lsfive-tablet:client:receiveDispatchAlerts', function(alerts)
        p:resolve(alerts)
    end)

    local alerts = Citizen.Await(p)
    cb(alerts or {})
end)

-- Create dispatch alert
RegisterNUICallback('createDispatchAlert', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:createDispatchAlert', data)
    cb('ok')
end)

-- Get music library
RegisterNUICallback('getSongs', function(_, cb)
    LSFiveTablet.Debug('Fetching songs...')
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:getSongs')
    RegisterNetEvent('lsfive-tablet:client:receiveSongs', function(songs)
        p:resolve(songs)
    end)

    local songs = Citizen.Await(p)
    cb(songs or {})
end)

-- Add song
RegisterNUICallback('addSong', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:addSong', data)
    cb('ok')
end)

-- Delete song
RegisterNUICallback('deleteSong', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:deleteSong', data.id)
    cb('ok')
end)

-- Get mails
RegisterNUICallback('getMails', function(_, cb)
    LSFiveTablet.Debug('Fetching mails...')
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:getMails')
    RegisterNetEvent('lsfive-tablet:client:receiveMails', function(mails)
        p:resolve(mails)
    end)

    local mails = Citizen.Await(p)
    cb(mails or {})
end)

-- Send mail
RegisterNUICallback('sendMail', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:sendMail', data)
    cb('ok')
end)

-- Delete mail
RegisterNUICallback('deleteMail', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:deleteMail', data.id)
    cb('ok')
end)

-- Get social posts
RegisterNUICallback('getSocialPosts', function(_, cb)
    LSFiveTablet.Debug('Fetching social posts...')
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:getSocialPosts')
    RegisterNetEvent('lsfive-tablet:client:receiveSocialPosts', function(posts)
        p:resolve(posts)
    end)

    local posts = Citizen.Await(p)
    cb(posts or {})
end)

-- Create social post
RegisterNUICallback('createSocialPost', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:createSocialPost', data)
    cb('ok')
end)

-- Like/unlike post
RegisterNUICallback('toggleLikePost', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:toggleLikePost', data.id)
    cb('ok')
end)

-- Get businesses
RegisterNUICallback('getBusinesses', function(_, cb)
    LSFiveTablet.Debug('Fetching businesses...')
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:getBusinesses')
    RegisterNetEvent('lsfive-tablet:client:receiveBusinesses', function(businesses)
        p:resolve(businesses)
    end)

    local businesses = Citizen.Await(p)
    cb(businesses or {})
end)

-- Set GPS waypoint
RegisterNUICallback('setGPS', function(data, cb)
    if data.x and data.y then
        SetNewWaypoint(data.x, data.y)
        LSFiveTablet.Notify(nil, 'GPS', 'Waypoint set', 'success')
    end
    cb('ok')
end)

-- MDT: Search citizens
RegisterNUICallback('mdtSearchCitizens', function(data, cb)
    LSFiveTablet.Debug('MDT: Searching citizens...')
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:mdtSearchCitizens', data.query)
    RegisterNetEvent('lsfive-tablet:client:receiveMdtCitizens', function(citizens)
        p:resolve(citizens)
    end)

    local citizens = Citizen.Await(p)
    cb(citizens or {})
end)

-- MDT: Get on-duty units
RegisterNUICallback('getOnDutyUnits', function(_, cb)
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:getOnDutyUnits')
    RegisterNetEvent('lsfive-tablet:client:receiveOnDutyUnits', function(units)
        p:resolve(units)
    end)

    local units = Citizen.Await(p)
    cb(units or {})
end)

-- MDT: Create incident
RegisterNUICallback('mdtCreateIncident', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:mdtCreateIncident', data)
    cb('ok')
end)

-- MDT: Toggle duty
RegisterNUICallback('toggleDuty', function(_, cb)
    local framework = LSFiveTablet.DetectFramework()

    if framework == 'esx' then
        -- ESX duty toggle varies by resource
        TriggerEvent('esx_policejob:toggleDuty')
        TriggerEvent('esx_ambulancejob:toggleDuty')
    elseif framework == 'qbcore' then
        TriggerServerEvent('QBCore:ToggleDuty')
    end

    -- Notify server for tracking
    TriggerServerEvent('lsfive-tablet:server:toggleDuty')
    cb('ok')
end)

-- MediTab: Search medical records
RegisterNUICallback('mediSearchRecords', function(data, cb)
    LSFiveTablet.Debug('MediTab: Searching records...')
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:mediSearchRecords', data.query)
    RegisterNetEvent('lsfive-tablet:client:receiveMedicalRecords', function(records)
        p:resolve(records)
    end)

    local records = Citizen.Await(p)
    cb(records or {})
end)

-- MediTab: Create medical record
RegisterNUICallback('mediCreateRecord', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:mediCreateRecord', data)
    cb('ok')
end)

-- MechaTab: Search vehicle
RegisterNUICallback('mechaSearchVehicle', function(data, cb)
    LSFiveTablet.Debug('MechaTab: Searching vehicle...')
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:mechaSearchVehicle', data.plate)
    RegisterNetEvent('lsfive-tablet:client:receiveMechaVehicle', function(vehicle)
        p:resolve(vehicle)
    end)

    local vehicle = Citizen.Await(p)
    cb(vehicle)
end)

-- MechaTab: Create invoice
RegisterNUICallback('mechaCreateInvoice', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:mechaCreateInvoice', data)
    cb('ok')
end)

-- MechaTab: Get invoices
RegisterNUICallback('mechaGetInvoices', function(_, cb)
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:mechaGetInvoices')
    RegisterNetEvent('lsfive-tablet:client:receiveMechaInvoices', function(invoices)
        p:resolve(invoices)
    end)

    local invoices = Citizen.Await(p)
    cb(invoices or {})
end)

-- Save settings
RegisterNUICallback('saveSettings', function(data, cb)
    TriggerServerEvent('lsfive-tablet:server:saveSettings', data)
    cb('ok')
end)

-- Get settings
RegisterNUICallback('getSettings', function(_, cb)
    local p = promise.new()

    TriggerServerEvent('lsfive-tablet:server:getSettings')
    RegisterNetEvent('lsfive-tablet:client:receiveSettings', function(settings)
        p:resolve(settings)
    end)

    local settings = Citizen.Await(p)
    cb(settings or {})
end)

-- Take photo (camera app)
RegisterNUICallback('takePhoto', function(_, cb)
    -- Close tablet temporarily
    SetNuiFocus(false, false)

    -- Wait a moment
    Wait(500)

    -- Take screenshot (uses screenshot-basic if available)
    if GetResourceState('screenshot-basic') == 'started' then
        exports['screenshot-basic']:requestScreenshotUpload(
            'https://api.imgur.com/3/image',
            'image',
            {
                headers = {
                    ['Authorization'] = 'Client-ID YOUR_IMGUR_CLIENT_ID'
                }
            },
            function(data)
                local resp = json.decode(data)
                if resp and resp.data and resp.data.link then
                    cb({ success = true, url = resp.data.link })
                else
                    cb({ success = false, message = 'Upload failed' })
                end

                -- Reopen tablet
                Wait(500)
                SetNuiFocus(true, true)
            end
        )
    else
        cb({ success = false, message = 'screenshot-basic not available' })
        SetNuiFocus(true, true)
    end
end)

--[[
    SERVER EVENT HANDLERS
]]

-- Receive initial data
RegisterNetEvent('lsfive-tablet:client:receiveInitialData', function(data)
    LSFiveTablet.Debug('Received initial data')
    cachedData = data

    SendNUIMessage({
        type = 'initialData',
        data = data
    })
end)

-- Receive new message
RegisterNetEvent('lsfive-tablet:client:newMessage', function(message)
    SendNUIMessage({
        type = 'newMessage',
        data = message
    })

    -- Notify if tablet is closed
    if not isTabletOpen then
        LSFiveTablet.Notify(nil, 'New Message', 'From: ' .. (message.senderName or message.phoneNumber), 'info')
    end
end)

-- Receive incoming call
RegisterNetEvent('lsfive-tablet:client:incomingCall', function(caller)
    SendNUIMessage({
        type = 'incomingCall',
        data = caller
    })

    -- Open tablet if closed
    if not isTabletOpen then
        OpenTablet()
    end
end)

-- Receive new dispatch alert
RegisterNetEvent('lsfive-tablet:client:newDispatchAlert', function(alert)
    SendNUIMessage({
        type = 'newDispatchAlert',
        data = alert
    })

    -- Notify
    LSFiveTablet.Notify(nil, 'Dispatch', alert.title, 'info')
end)

-- Receive notification
RegisterNetEvent('lsfive-tablet:client:notify', function(title, message, type)
    LSFiveTablet.Notify(nil, title, message, type)
end)

-- Vehicle spawned
RegisterNetEvent('lsfive-tablet:client:vehicleSpawned', function(success, message)
    if success then
        LSFiveTablet.Notify(nil, 'Garage', message or 'Vehicle spawned', 'success')
    else
        LSFiveTablet.Notify(nil, 'Garage', message or 'Failed to spawn vehicle', 'error')
    end
end)

-- Bank transfer result
RegisterNetEvent('lsfive-tablet:client:transferResult', function(success, message)
    SendNUIMessage({
        type = 'transferResult',
        data = { success = success, message = message }
    })

    if success then
        LSFiveTablet.Notify(nil, 'Bank', message or 'Transfer successful', 'success')
    else
        LSFiveTablet.Notify(nil, 'Bank', message or 'Transfer failed', 'error')
    end
end)

--[[
    EXPORTS
]]
exports('openTablet', OpenTablet)
exports('closeTablet', CloseTablet)
exports('isTabletOpen', function() return isTabletOpen end)
exports('toggleTablet', ToggleTablet)

--[[
    CLEANUP ON RESOURCE STOP
]]
AddEventHandler('onResourceStop', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        if isTabletOpen then
            CloseTablet()
        end
        RemoveTabletProp()
    end
end)
