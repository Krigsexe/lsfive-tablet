
# LSFive Tablet - Fichiers de configuration et de script FiveM

Ce document contient l'intégralité du code nécessaire pour faire fonctionner la ressource LSFive Tablet sur un serveur FiveM. Copiez le contenu de chaque section dans le fichier correspondant.

---

## 1. `fxmanifest.lua`

*Ce fichier définit la ressource, ses dépendances et les fichiers qu'elle utilise.*

```lua
fx_version 'cerulean'
game 'gta5'

author 'Krigs & Gemini'
description 'LSFive - A modern FiveM tablet resource'
version '2.0.0'

ui_page 'html/index.html'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua'
}

client_scripts {
    'client/main.lua'
}

server_scripts {
    'server/main.lua'
}

files {
    'html/index.html',
    'html/**/*',
}

dependencies {
    'ox_lib',
    'oxmysql'
}

lua54 'yes'
```

---

## 2. `config.lua`

*Ce fichier permet de configurer facilement les paramètres principaux de la tablette.*

```lua
Config = {}

-- [[ GENERAL SETTINGS ]]
Config.Command = 'tablet' 
Config.Keybind = 'F1'
Config.Framework = 'esx' -- 'esx', 'qb-core', 'standalone'
Config.DefaultLanguage = 'fr'
Config.DefaultWallpaper = 'https://i.pinimg.com/originals/8c/f4/98/8cf498ef295f66b4f987405af2d810c3.jpg'
Config.UseOxLibNotifications = true
Config.PhoneNumberFormat = '555-####'
Config.Debug = false

-- [[ JOB-SPECIFIC SETTINGS ]]
-- Define job groups for live map functionality.
-- Users will only see others in the same group.
Config.JobGroups = {
    leo = {'lspd', 'lssd', 'sast', 'fib', 'gouv'},
    ems = {'sams', 'lsfd'},
    mech = {'mechanic', 'bennys'}
}
```

---

## 3. `database.sql`

*Ce script SQL crée toutes les tables nécessaires dans votre base de données pour que la tablette fonctionne.*

```sql
CREATE TABLE IF NOT EXISTS `phone_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `identifier` varchar(60) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT 'me@ls.mail',
  `job` varchar(50) DEFAULT 'unemployed',
  `onduty` tinyint(1) DEFAULT 0,
  `wallpaper` text DEFAULT NULL,
  `language` varchar(5) DEFAULT 'fr',
  `installed_apps` text DEFAULT '["phone","messages","settings","browser","bank","marketplace","camera","garage","dispatch","businesses","social","music","mail","weather","mdt","meditab","mechatab"]',
  `dock_order` text DEFAULT '["phone","browser","messages","settings"]',
  `settings` text DEFAULT '{"theme":"dark","airplaneMode":false}',
  PRIMARY KEY (`id`),
  UNIQUE KEY `identifier` (`identifier`),
  UNIQUE KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `phone_contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT, `owner_identifier` varchar(60) NOT NULL, `name` varchar(255) NOT NULL, `phone_number` varchar(20) NOT NULL, `avatar_url` text,
  PRIMARY KEY (`id`), KEY `owner_identifier` (`owner_identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS `phone_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT, `sender_number` varchar(20) NOT NULL, `receiver_number` varchar(20) NOT NULL, `content` text NOT NULL, `timestamp` timestamp NOT NULL DEFAULT current_timestamp(), `is_read` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`), KEY `sender_number` (`sender_number`), KEY `receiver_number` (`receiver_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS `phone_calls` (
  `id` int(11) NOT NULL AUTO_INCREMENT, `caller_number` varchar(20) NOT NULL, `receiver_number` varchar(20) NOT NULL, `direction` enum('incoming','outgoing','missed') NOT NULL, `timestamp` timestamp NOT NULL DEFAULT current_timestamp(), `is_new` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`), KEY `caller_number` (`caller_number`), KEY `receiver_number` (`receiver_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS `phone_songs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT, `owner_identifier` VARCHAR(60) NOT NULL, `title` VARCHAR(255) NOT NULL, `artist` VARCHAR(255) NOT NULL, `url` TEXT NOT NULL,
  PRIMARY KEY (`id`), INDEX `owner_identifier` (`owner_identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS `phone_mails` (
  `id` INT(11) NOT NULL AUTO_INCREMENT, `owner_identifier` VARCHAR(60) NOT NULL, `sender` VARCHAR(255) NOT NULL, `subject` VARCHAR(255) NOT NULL, `body` TEXT NOT NULL, `is_read` TINYINT(1) NOT NULL DEFAULT 0, `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`), INDEX `owner_identifier` (`owner_identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS `phone_social_posts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT, `author_identifier` VARCHAR(60) NOT NULL, `image_url` TEXT NOT NULL, `caption` TEXT, `likes` INT(11) NOT NULL DEFAULT 0, `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS `phone_dispatch_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT, `department` varchar(50) NOT NULL, `title` varchar(255) NOT NULL, `details` text NOT NULL, `location` varchar(255) NOT NULL, `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MDT TABLES
CREATE TABLE `mdt_incidents` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`title` VARCHAR(255) NOT NULL,
	`officers_involved` TEXT NOT NULL,
	`civilians_involved` TEXT NOT NULL,
	`timestamp` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`)
) ENGINE=InnoDB;
CREATE TABLE `mdt_reports` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`incident_id` INT(11) NOT NULL,
	`author` VARCHAR(255) NULL DEFAULT NULL,
	`content` TEXT NULL DEFAULT NULL,
	`timestamp` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`),
	INDEX `incident_id` (`incident_id`),
	CONSTRAINT `mdt_reports_ibfk_1` FOREIGN KEY (`incident_id`) REFERENCES `mdt_incidents` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- MEDITAB TABLES
CREATE TABLE `medical_records` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`patient_identifier` VARCHAR(50) NOT NULL,
	`doctor` VARCHAR(255) NOT NULL,
	`diagnosis` TEXT NOT NULL,
	`treatment` TEXT NOT NULL,
	`notes` TEXT NULL DEFAULT NULL,
	`timestamp` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`),
	INDEX `patient_identifier` (`patient_identifier`)
) ENGINE=InnoDB;

-- MECHATAB TABLES
CREATE TABLE `mechanic_invoices` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`mechanic` VARCHAR(255) NOT NULL,
	`customer_name` VARCHAR(255) NOT NULL,
	`vehicle_plate` VARCHAR(10) NOT NULL,
	`services` TEXT NOT NULL COMMENT 'JSON array of services',
	`total` INT(11) NOT NULL,
	`is_paid` TINYINT(1) NOT NULL DEFAULT '0',
	`timestamp` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- UPDATE USERS TABLE FOR ESX
ALTER TABLE `users` ADD COLUMN `phone_number` VARCHAR(50) NULL DEFAULT NULL;
```

---

## 4. `client/main.lua`

*Ce script gère toute la logique côté client, comme l'ouverture/fermeture de la tablette et la communication avec l'interface NUI.*

```lua
local isPhoneVisible = false
local onDuty = false

-- Function to set phone visibility and send data
local function setPhoneVisible(visible)
    if isPhoneVisible == visible then return end
    isPhoneVisible = visible
    SetNuiFocus(visible, visible)
    SendNUIMessage({ type = "setVisible", payload = visible })
end

-- Keybind and Command
RegisterKeyMapping(Config.Command, 'Ouvrir la tablette', 'keyboard', Config.Keybind)
RegisterCommand(Config.Command, function() setPhoneVisible(not isPhoneVisible) end, false)
RegisterNUICallback('close', function(_, cb) setPhoneVisible(false); cb({}) end)

-- Data and Event Handling
RegisterNetEvent('phone:client:loadData', function(data)
    if not isPhoneVisible then return end
    SendNUIMessage({ type = "loadData", payload = data })
    onDuty = data.userData.onduty
end)

RegisterNetEvent('phone:client:incomingCall', function(data)
    SendNUIMessage({ type = "incomingCall", payload = data })
    setPhoneVisible(true)
end)

RegisterNetEvent('phone:client:updateUnits', function(units)
    if isPhoneVisible then
        SendNUIMessage({ type = "updateUnits", payload = { units = units } })
    end
end)

-- Live Map Position Updates
CreateThread(function()
    while true do
        Wait(10000) -- Update every 10 seconds
        if onDuty and isPhoneVisible then
            local coords = GetEntityCoords(PlayerPedId())
            TriggerServerEvent('phone:server:updatePosition', { x = coords.x, y = coords.y, z = coords.z })
        end
    end
end)

-- Generic NUI handler to pass events to the server
local nuiEventsToServer = {
    'phone:server:requestData',
    'call:accept', 'call:decline', 'call:end', 'call:start',
    'phone:updateSettings', 'updateWallpaper', 'updateLanguage', 'updateInstalledApps', 'updateDockOrder', 'phone:backupData',
    'bank:transfer', 'garage:requestVehicle', 'dispatch:createAlert',
    'mail:send', 'mail:delete', 'updateSongs', 'updateWallpapers',
    'social:createPost', 'social:likePost',
    'phone:clearMissedCalls', 'phone:clearUnreadMessages',
    -- Job App NUI Events
    'phone:setDuty',
    'mdt:searchCitizens', 'mdt:createIncident',
    'meditab:searchRecords', 'meditab:createRecord',
    'mechatab:searchVehicle', 'mechatab:createInvoice'
}

for _, eventName in ipairs(nuiEventsToServer) do
    RegisterNUICallback(eventName, function(data, cb)
        TriggerServerEvent('phone:nui:' .. eventName, data, function(result)
            cb(result or {})
        end)
    end)
end

-- Waypoint setter
RegisterNUICallback('business:setWaypoint', function(data, cb)
    if data and data.location then
        SetNewWaypoint(data.location.x, data.location.y)
    end
    cb({})
end)
```

---

## 5. `server/main.lua`

*Ce script gère toute la logique côté serveur, y compris les interactions avec la base de données et l'intégration avec votre framework.*

```lua
local onDutyUnits = {} -- identifier -> { name, job, identifier, pos }

-- ============================================================================
-- FRAMEWORK INTEGRATION (Must be configured)
-- ============================================================================
local function GetPlayerFromSource(source)
    if Config.Framework == 'esx' then
        return exports.esx:GetPlayerFromId(source)
    elseif Config.Framework == 'qb-core' then
        return exports['qb-core']:GetPlayer(source)
    else 
        -- Standalone, you might need to implement your own player management
        return {
            source = source,
            identifier = 'steam:' .. GetPlayerIdentifier(source, 0):gsub('steam:', ''),
            job = { name = 'unemployed' },
            getName = function() return GetPlayerName(source) end
        }
    end
end

-- On player load, ensure they have a phone user entry
AddEventHandler('esx:playerLoaded', function(source)
    local xPlayer = GetPlayerFromSource(source)
    if not xPlayer then return end

    local user = exports.oxmysql:fetchSync('SELECT * FROM phone_users WHERE identifier = ?', { xPlayer.identifier })
    
    if not user then
        local phoneNumber = exports.esx:GetRandomPhoneNumber()
        exports.oxmysql:executeSync('INSERT INTO phone_users (identifier, phone_number, job, wallpaper, language) VALUES (?, ?, ?, ?, ?)', {
            xPlayer.identifier, phoneNumber, xPlayer.job.name, Config.DefaultWallpaper, Config.DefaultLanguage
        })
        xPlayer.set('phone_number', phoneNumber)
    else
        xPlayer.set('phone_number', user.phone_number)
        if xPlayer.job.name ~= user.job then
             exports.oxmysql:execute('UPDATE phone_users SET job = ? WHERE identifier = ?', { xPlayer.job.name, xPlayer.identifier })
        end
    end
end)

-- ============================================================================
-- LIVE MAP & DUTY
-- ============================================================================
local function getJobGroup(jobName)
    for group, jobs in pairs(Config.JobGroups) do
        for _, job in ipairs(jobs) do
            if job == jobName then return group end
        end
    end
    return nil
end

local function broadcastUnitUpdates()
    local groupedUnits = {}
    for id, unit in pairs(onDutyUnits) do
        local group = getJobGroup(unit.job)
        if group then
            if not groupedUnits[group] then groupedUnits[group] = {} end
            table.insert(groupedUnits[group], unit)
        end
    end

    for _, player in ipairs(GetPlayers()) do
        local xPlayer = GetPlayerFromSource(tonumber(player))
        if xPlayer and onDutyUnits[xPlayer.identifier] then
            local group = getJobGroup(xPlayer.job.name)
            if group and groupedUnits[group] then
                TriggerClientEvent('phone:client:updateUnits', xPlayer.source, groupedUnits[group])
            end
        end
    end
end

RegisterServerEvent('phone:server:updatePosition')
AddEventHandler('phone:server:updatePosition', function(pos)
    local xPlayer = GetPlayerFromSource(source)
    if not xPlayer or not onDutyUnits[xPlayer.identifier] then return end
    onDutyUnits[xPlayer.identifier].pos = pos
end)

CreateThread(function()
    while true do
        Wait(5000)
        if next(onDutyUnits) then
            broadcastUnitUpdates()
        end
    end
end)

-- ============================================================================
-- NUI EVENT HANDLERS
-- ============================================================================
local function RegisterNuiHandler(eventName, handler)
    RegisterNetEvent('phone:nui:' .. eventName, function(data, cb)
        local xPlayer = GetPlayerFromSource(source)
        if not xPlayer then return cb({}) end
        handler(xPlayer, data, cb)
    end)
end

RegisterNuiHandler('phone:server:requestData', function(xPlayer, data, cb)
    local userData = exports.oxmysql:fetchSync('SELECT * FROM phone_users WHERE identifier = ?', {xPlayer.identifier})[1]
    -- TODO: Fetch other data like contacts, messages, etc. for a full implementation.
    local response = {
        userData = userData,
        contacts = {}, calls = {}, messages = {}, vehicles = {}, bank = {},
        businesses = {}, mails = {}, songs = {}, alerts = {}, social_posts = {},
        mdt_incidents = {}, medical_records = {}, mechanic_invoices = {}
    }
    TriggerClientEvent('phone:client:loadData', xPlayer.source, response)
    cb({})
end)

-- Layout & Settings
RegisterNuiHandler('updateInstalledApps', function(xPlayer, data, cb) exports.oxmysql:execute('UPDATE phone_users SET installed_apps = ? WHERE identifier = ?', { data.apps, xPlayer.identifier }); cb({}) end)
RegisterNuiHandler('updateDockOrder', function(xPlayer, data, cb) exports.oxmysql:execute('UPDATE phone_users SET dock_order = ? WHERE identifier = ?', { data.dock_order, xPlayer.identifier }); cb({}) end)
RegisterNuiHandler('phone:updateSettings', function(xPlayer, data, cb) exports.oxmysql:execute('UPDATE phone_users SET settings = ? WHERE identifier = ?', { data.settings, xPlayer.identifier }); cb({}) end)
RegisterNuiHandler('updateWallpaper', function(xPlayer, data, cb) exports.oxmysql:execute('UPDATE phone_users SET wallpaper = ? WHERE identifier = ?', { data.wallpaperUrl, xPlayer.identifier }); cb({}) end)
RegisterNuiHandler('updateLanguage', function(xPlayer, data, cb) exports.oxmysql:execute('UPDATE phone_users SET language = ? WHERE identifier = ?', { data.lang, xPlayer.identifier }); cb({}) end)

-- Duty Status
RegisterNuiHandler('phone:setDuty', function(xPlayer, data, cb)
    local status = data.status
    exports.oxmysql:execute('UPDATE phone_users SET onduty = ? WHERE identifier = ?', { status and 1 or 0, xPlayer.identifier })
    if status then
        onDutyUnits[xPlayer.identifier] = { name = xPlayer.getName(), job = xPlayer.job.name, identifier = xPlayer.identifier, pos = GetEntityCoords(GetPlayerPed(xPlayer.source)) }
    else
        onDutyUnits[xPlayer.identifier] = nil
    end
    broadcastUnitUpdates()
    cb({})
end)

-- MDT Handlers
RegisterNuiHandler('mdt:searchCitizens', function(xPlayer, data, cb)
    local query = '%' .. (data.query or '') .. '%'
    local result = exports.oxmysql:fetchSync('SELECT firstname as name, dateofbirth, sex as gender, phone_number FROM users WHERE firstname LIKE ? OR lastname LIKE ? OR phone_number LIKE ?', { query, query, query })
    for i, citizen in ipairs(result) do result[i].image_url = 'https://via.placeholder.com/100' end
    cb(result)
end)
RegisterNuiHandler('mdt:createIncident', function(xPlayer, data, cb) exports.oxmysql:execute('INSERT INTO mdt_incidents (title, officers_involved, civilians_involved) VALUES (?, ?, ?)', { data.title, data.officers, data.civilians }); cb({}) end)

-- MediTab Handlers
RegisterNuiHandler('meditab:searchRecords', function(xPlayer, data, cb) cb(exports.oxmysql:fetchSync('SELECT * FROM medical_records WHERE patient_identifier = ?', { data.query })) end)
RegisterNuiHandler('meditab:createRecord', function(xPlayer, data, cb) exports.oxmysql:execute('INSERT INTO medical_records (patient_identifier, doctor, diagnosis, treatment, notes) VALUES (?, ?, ?, ?, ?)', { data.patient_identifier, xPlayer.getName(), data.diagnosis, data.treatment, data.notes }); cb({}) end)

-- MechaTab Handlers
RegisterNuiHandler('mechatab:searchVehicle', function(xPlayer, data, cb)
    local result = exports.oxmysql:fetchSync('SELECT p.plate, p.vehicle, o.firstname as owner FROM owned_vehicles p LEFT JOIN users o ON p.owner = o.identifier WHERE p.plate = ?', { data.plate })
    if result and result[1] then
        local vehicle = result[1]
        local vehicleModel = json.decode(vehicle.vehicle)
        cb({ plate = vehicle.plate, name = vehicleModel.model, owner = vehicle.owner, imageUrl = 'https://via.placeholder.com/400x200' })
    else
        cb(nil)
    end
end)
RegisterNuiHandler('mechatab:createInvoice', function(xPlayer, data, cb) exports.oxmysql:execute('INSERT INTO mechanic_invoices (mechanic, customer_name, vehicle_plate, services, total) VALUES (?, ?, ?, ?, ?)', { xPlayer.getName(), data.customer_name, data.vehicle_plate, data.services, data.total }); cb({}) end)

print("[LSFive] Tablet Server Script Loaded")
```
