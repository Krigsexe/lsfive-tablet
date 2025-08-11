# LSFive Tablet - Guide d'Installation Complet

## 1. Introduction
LSFive Tablet est une ressource de tablette moderne et performante pour FiveM, conçue pour être utilisée en véhicule. Développée avec React et TypeScript, elle offre une interface fluide et riche en fonctionnalités, idéale pour les services d'urgence et autres métiers.

### Fonctionnalités
- **Interface Inspirée d'iOS :** Grande, claire et optimisée pour un usage sur tablette.
- **Applications de Base :** Téléphone, Messages, Navigateur, App Store, Réglages (thèmes, fonds d'écran, etc.).
- **Applications Utilitaires :** Banque, Garage, Météo, Mail, Musique, Social, Annuaire des entreprises.
- **Applications Métiers (MDW/MDT) :**
  - **MDT (Police) :** Recherche de citoyens, rapports d'incidents, carte en direct des unités.
  - **MediTab (EMS) :** Gestion des dossiers médicaux.
  - **MechaTab (Mécanos) :** Recherche de véhicules et système de facturation.
- **Système de Prise de Service :** Permet aux joueurs de se mettre en service et de voir leurs collègues sur une carte.

## 2. Prérequis
Cette ressource nécessite les dépendances suivantes pour fonctionner correctement :
- **[ox_lib](https://github.com/overextended/ox_lib)** (Requis pour les notifications et certaines fonctions utilitaires)
- **[oxmysql](https://github.com/overextended/oxmysql)** (Requis pour toutes les interactions avec la base de données)

Assurez-vous d'installer et de démarrer ces ressources **avant** `lsfive-phone`.

## 3. Installation
Suivez ces étapes pour une installation "plug-and-play".

### Étape 1 : Structure des Fichiers
1. Dans votre dossier `resources`, créez un nouveau dossier nommé `lsfive-phone`.
2. À l'intérieur de `lsfive-phone`, créez les dossiers et fichiers suivants :
   ```
   /lsfive-phone
   |-- client/
   |   |-- main.lua
   |-- server/
   |   |-- main.lua
   |-- html/   <-- IMPORTANT
   |-- config.lua
   |-- database.sql
   |-- fxmanifest.lua
   ```
3. **Copiez tous les fichiers de l'interface utilisateur** fournis (tous les fichiers `.tsx`, `.ts`, `.json`, `.html` et les dossiers `components`, `locales`) directement dans le dossier `lsfive-phone/html/`.

### Étape 2 : Remplir les Fichiers de Configuration et Scripts
Copiez le contenu ci-dessous dans les fichiers correspondants que vous venez de créer.

#### `fxmanifest.lua`
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

#### `config.lua`
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

#### `database.sql`
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

-- UPDATE USERS TABLE FOR ESX (Optionnel mais recommandé)
-- ALTER TABLE `users` ADD COLUMN `phone_number` VARCHAR(50) NULL DEFAULT NULL;
```

#### `client/main.lua`
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

#### `server/main.lua`
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
### Étape 3 : Démarrage du Serveur
1. **Importez le fichier `database.sql`** dans la base de données de votre serveur.
2. **Ajustez `config.lua`**, en particulier `Config.Framework` pour correspondre à votre serveur ('esx', 'qb-core', ou 'standalone').
3. **Ajoutez `ensure lsfive-phone`** à votre fichier `server.cfg`. Assurez-vous qu'il est démarré **APRÈS** ses dépendances (`ox_lib`, `oxmysql`) et votre framework.
   ```cfg
   ensure ox_lib
   ensure oxmysql
   ensure es_extended # ou qb-core
   ensure lsfive-phone
   ```

## 4. Intégration au Framework (Avancé)
Pour que des fonctionnalités comme les virements bancaires ou la sortie de véhicules fonctionnent, vous devez implémenter la logique spécifique à votre framework dans `server/main.lua`.

Les fonctions clés à modifier sont :
- `GetPlayerFromSource(source)` : Doit retourner l'objet joueur de votre framework.
- Les gestionnaires d'événements NUI (ex: `RegisterNuiHandler('bank:transfer', ...)`). C'est ici que vous appellerez les fonctions de votre framework pour retirer de l'argent, ajouter des véhicules, etc. Des exemples de base sont fournis, mais ils devront être adaptés à votre configuration.
```

  </content>
  </change>
  <change>
    <file>lsfive-phone/fxmanifest.lua</file>
    <description>Creating the manifest file for the FiveM resource.</description>
    <content><![CDATA[fx_version 'cerulean'
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
]]></content>
  </change>
  <change>
    <file>lsfive-phone/config.lua</file>
    <description>Creating the configuration file for the FiveM resource.</description>
    <content><![CDATA[Config = {}

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
]]></content>
  </change>
  <change>
    <file>lsfive-phone/database.sql</file>
    <description>Creating the SQL schema for the resource's database tables.</description>
    <content><![CDATA[CREATE TABLE IF NOT EXISTS `phone_users` (
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
]]></content>
  </change>
  <change>
    <file>lsfive-phone/client/main.lua</file>
    <description>Creating the client-side Lua script for handling UI events and player interaction.</description>
    <content><![CDATA[local isPhoneVisible = false
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
]]></content>
  </change>
  <change>
    <file>lsfive-phone/server/main.lua</file>
    <description>Creating the server-side Lua script for handling database interactions and framework integration.</description>
    <content><![CDATA[local onDutyUnits = {} -- identifier -> { name, job, identifier, pos }

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
]]></content>
  </change>
  <change>
    <file>lsfive-phone/metadata.json</file>
    <description>Creating metadata file to declare necessary permissions.</description>
    <content><![CDATA[{
  "name": "LSFive - Krigs Tabs",
  "description": "Tablette FiveM",
  "requestFramePermissions": [
    "camera"
  ],
  "prompt": ""
}
]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/index.html</file>
    <description>Creating the main HTML file for the NUI interface.</description>
    <content><![CDATA[
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Phone</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<script type="importmap">
{
  "imports": {
    "react/": "https://esm.sh/react@^19.1.1/",
    "react": "https://esm.sh/react@^19.1.1",
    "react-dom/": "https://esm.sh/react-dom@^19.1.1/",
    "lucide-react": "https://esm.sh/lucide-react@^0.536.0",
    "react-youtube": "https://esm.sh/react-youtube@^10.1.0"
  }
}
</script>
<style>
    :root {
      --bg-primary: #000000;
      --bg-secondary: #1c1c1e;
      --bg-tertiary: #2c2c2e;
      --bg-quaternary: #3a3a3c;
      
      --text-primary: #ffffff;
      --text-secondary: #8e8e93;
      --text-tertiary: #636366;
      
      --accent-blue: #0a84ff;
      --accent-green: #30d158;
      --accent-red: #ff453a;
      
      --surface-glass: rgba(58, 58, 60, 0.7);
      --surface-raised: #1c1c1e;
      --border-color: #3a3a3c;
    }

    html[data-theme='light'] {
      --bg-primary: #f2f2f7;
      --bg-secondary: #ffffff;
      --bg-tertiary: #e5e5ea;
      --bg-quaternary: #d1d1d6;
      
      --text-primary: #000000;
      --text-secondary: #3c3c4399; /* 60% opacity */
      --text-tertiary: #3c3c434d; /* 30% opacity */
      
      --surface-glass: rgba(242, 242, 247, 0.8);
      --surface-raised: #ffffff;
      --border-color: #d1d1d6;
    }

    @keyframes app-view-fade-in {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes subtle-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.9; }
    }
    @keyframes jiggle {
        0% { transform: rotate(-1deg); }
        50% { transform: rotate(1deg); }
        100% { transform: rotate(-1deg); }
    }
    .jiggle {
        animation: jiggle 0.2s infinite ease-in-out;
    }
</style>
</head>
<body class="bg-transparent" style="font-family: 'Inter', sans-serif;">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
</body>
</html>]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/index.tsx</file>
    <description>Creating the entry point for the React application.</description>
    <content><![CDATA[
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LocaleProvider } from './i18n';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </React.StrictMode>
);]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/App.tsx</file>
    <description>Creating the main App component, handling state management and NUI communication.</description>
    <content><![CDATA[

import React, { useState, useEffect, useMemo } from 'react';
import { AppType, type Contact, type AppInfo, type CallRecord, type Conversation, type UserData, type Song, type Wallpaper, type Vehicle, type BankAccount, type Business, type Mail as MailType, DispatchAlert, SocialPost, PhoneSettings, CallDirection, MdtCitizen, MdtIncident, MedicalRecord, MechanicInvoice, OnDutyUnit, MusicState, Folder, type BrowserTab } from './types';
import PhoneShell from './components/PhoneShell';
import HomeScreen from './components/HomeScreen';
import MessagesApp from './components/apps/MessagesApp';
import PhoneApp from './components/apps/PhoneApp';
import SettingsApp from './components/apps/SettingsApp';
import MarketplaceApp from './components/apps/MarketplaceApp';
import InCallUI from './components/InCallUI';
import IncomingCall from './components/IncomingCall';
import { ALL_APPS, DEFAULT_WALLPAPERS, DEFAULT_DOCK_APP_IDS } from './constants';
import { fetchNui } from './nui';
import { useLocale } from './i18n';
import BrowserApp from './components/apps/BrowserApp';
import CameraApp from './components/apps/CameraApp';
import PlaceholderApp from './components/apps/PlaceholderApp';
import MusicApp from './components/apps/MusicApp';
import BootScreen from './components/BootScreen';
import GarageApp from './components/apps/GarageApp';
import BankApp from './components/apps/BankApp';
import BusinessApp from './components/apps/BusinessApp';
import DispatchApp from './components/apps/DispatchApp';
import WeatherApp from './components/apps/WeatherApp';
import MailApp from './components/apps/MailApp';
import SocialApp from './components/apps/SocialApp';
import MdtApp from './components/apps/MdtApp';
import MediTab from './components/apps/MediTab';
import MechaTab from './components/apps/MechaTab';


const DEFAULT_SETTINGS: PhoneSettings = {
    theme: 'dark',
    airplaneMode: false,
    clockWidgetVisible: true,
    folders: [],
    homeScreenOrder: [],
};

const App: React.FC = () => {
    const { t, locale, setLocale } = useLocale();

    const [isVisible, setIsVisible] = useState(false);
    const [isBooting, setIsBooting] = useState(true);
    const [activeApp, setActiveApp] = useState<AppType | null>(null);
    
    // Data states, populated from NUI
    const [userData, setUserData] = useState<UserData | null>(null);
    const [installedAppIds, setInstalledAppIds] = useState<AppType[]>([]);
    const [dockAppIds, setDockAppIds] = useState<AppType[]>([]);
    const [wallpapers, setWallpapers] = useState<Wallpaper[]>(DEFAULT_WALLPAPERS);
    const [currentWallpaperUrl, setCurrentWallpaperUrl] = useState<string>(DEFAULT_WALLPAPERS[0].url);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
    const [songs, setSongs] = useState<Song[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [mails, setMails] = useState<MailType[]>([]);
    const [alerts, setAlerts] = useState<DispatchAlert[]>([]);
    const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
    const [settings, setSettings] = useState<PhoneSettings>(DEFAULT_SETTINGS);
    const [onDuty, setOnDuty] = useState(false);
    
    // Layout states
    const [folders, setFolders] = useState<Folder[]>([]);
    const [homeScreenOrder, setHomeScreenOrder] = useState<string[]>([]);

    // Job-specific data
    const [mdtIncidents, setMdtIncidents] = useState<MdtIncident[]>([]);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [mechanicInvoices, setMechanicInvoices] = useState<MechanicInvoice[]>([]);
    const [onDutyUnits, setOnDutyUnits] = useState<OnDutyUnit[]>([]);

    // Shared state for music player
    const [musicState, setMusicState] = useState<MusicState>({ currentSong: null, isPlaying: false, progress: 0, duration: 0 });

    // Call states
    const [callState, setCallState] = useState<'idle' | 'incoming' | 'active'>('idle');
    const [activeCallContact, setActiveCallContact] = useState<Contact | null>(null);

    const allApps = useMemo(() => ALL_APPS.filter(app => !app.requiredJobs || app.requiredJobs.includes(userData?.job || '')), [userData?.job]);
    const installedApps = useMemo(() => {
        const appMap = new Map(allApps.map(app => [app.id, app]));
        return installedAppIds.map(id => appMap.get(id)).filter((a): a is AppInfo => !!a);
    }, [installedAppIds, allApps]);


    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme);
    }, [settings.theme]);

    useEffect(() => {
        const handleNuiMessage = (event: MessageEvent) => {
            const { type, payload } = event.data;
            switch (type) {
                case 'setVisible':
                    if (payload && !isVisible) {
                        setIsBooting(true);
                        setTimeout(() => setIsBooting(false), 2500);
                        fetchNui('phone:server:requestData');
                    }
                    setIsVisible(payload);
                    if (!payload) goHome();
                    break;
                case 'loadData':
                    const { userData: ud, contacts, calls, messages, vehicles, bank, businesses, mails, songs, alerts, social_posts, mdt_incidents, medical_records, mechanic_invoices } = payload;
                    
                    setUserData(ud);
                    setOnDuty(ud.onduty || false);
                    setCurrentWallpaperUrl(ud.wallpaper || DEFAULT_WALLPAPERS[0].url);
                    setLocale(ud.language || 'fr');

                    try { setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(ud.settings) }); } catch (e) { setSettings(DEFAULT_SETTINGS); }
                    try { setInstalledAppIds(JSON.parse(ud.installed_apps)); } catch (e) { setInstalledAppIds(allApps.filter(a => !a.isRemovable).map(a => a.id)); }
                    try { setDockAppIds(JSON.parse(ud.dock_order)); } catch(e) { setDockAppIds(DEFAULT_DOCK_APP_IDS); }
                    try { setFolders(JSON.parse(ud.folders)); } catch(e) { setFolders([]); }
                    try { 
                        const order = JSON.parse(ud.home_screen_order);
                        setHomeScreenOrder(order.length > 0 ? order : installedApps.map(a => a.id));
                    } catch(e) { setHomeScreenOrder(installedApps.map(a => a.id)); }

                    setContacts(contacts || []);
                    setCallHistory(calls || []);
                    setConversations(messages || []);
                    setVehicles(vehicles || []);
                    setBankAccount(bank || null);
                    setBusinesses(businesses || []);
                    setMails(mails || []);
                    setSongs(songs || []);
                    setAlerts(alerts || []);
                    setSocialPosts(social_posts || []);
                    setMdtIncidents(mdt_incidents || []);
                    setMedicalRecords(medical_records || []);
                    setMechanicInvoices(mechanic_invoices || []);
                    break;
                case 'incomingCall':
                    setActiveCallContact(payload.contact);
                    setCallState('incoming');
                    setIsVisible(true);
                    break;
                case 'updateUnits':
                    setOnDutyUnits(payload.units || []);
                    break;
            }
        };
        window.addEventListener('message', handleNuiMessage);
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') fetchNui('close'); };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('message', handleNuiMessage);
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isVisible, setLocale, allApps, installedApps]);

    const openApp = (app: AppType) => setActiveApp(app);
    const goHome = () => setActiveApp(null);

    const handleAcceptCall = () => { setCallState('active'); fetchNui('call:accept'); };
    const handleDeclineCall = () => { setCallState('idle'); setActiveCallContact(null); fetchNui('call:decline'); };
    const handleEndCall = () => { setCallState('idle'); setActiveCallContact(null); fetchNui('call:end'); goHome(); };
    const handlePlaceCall = (contact: Contact) => { setActiveCallContact(contact); setCallState('active'); setActiveApp(AppType.PHONE); fetchNui('call:start', { phoneNumber: contact.phoneNumber }); };
    const handleUpdateSettings = (newSettings: Partial<PhoneSettings>) => { const updated = { ...settings, ...newSettings }; setSettings(updated); fetchNui('phone:updateSettings', { settings: JSON.stringify(updated) }); };
    const handleSetWallpaper = (url: string) => { setCurrentWallpaperUrl(url); fetchNui('updateWallpaper', { wallpaperUrl: url }); }
    const handleSetLanguage = (lang: 'en' | 'fr') => { setLocale(lang); fetchNui('updateLanguage', { lang }); }
    
    const persistInstalledApps = (newAppIds: AppType[]) => fetchNui('updateInstalledApps', { apps: JSON.stringify(newAppIds) });
    
    const handleInstallApp = (app: AppInfo) => {
        const newAppIds = [...installedAppIds, app.id];
        setInstalledAppIds(newAppIds);
        setHomeScreenOrder(prev => [...prev, app.id]);
        persistInstalledApps(newAppIds);
    };

    const handleUninstallApp = (appToUninstall: AppInfo) => {
        if (!appToUninstall.isRemovable) return;
        const newAppIds = installedAppIds.filter(id => id !== appToUninstall.id);
        setInstalledAppIds(newAppIds);
        persistInstalledApps(newAppIds);

        setDockAppIds(prev => prev.filter(id => id !== appToUninstall.id));
        setHomeScreenOrder(prev => prev.filter(id => id !== appToUninstall.id));
        setFolders(prev => {
            const newFolders = prev.map(f => ({ ...f, appIds: f.appIds.filter(id => id !== appToUninstall.id) }));
            const foldersToDissolve = newFolders.filter(f => f.appIds.length < 2);
            const remainingFolders = newFolders.filter(f => f.appIds.length >= 2);
            const appsFromDissolved = foldersToDissolve.flatMap(f => f.appIds);
            setHomeScreenOrder(p => [...p.filter(id => !foldersToDissolve.some(f => f.id === id)), ...appsFromDissolved]);
            return remainingFolders;
        });
    };
    
    const handleSetDockAppIds = (newDockIds: AppType[]) => { setDockAppIds(newDockIds); fetchNui('updateDockOrder', { dock_order: JSON.stringify(newDockIds) }); };
    
    useEffect(() => { fetchNui('phone:updateLayout', { folders: JSON.stringify(folders), home_screen_order: JSON.stringify(homeScreenOrder) }); }, [folders, homeScreenOrder]);

    const handleCreateFolder = (droppedAppId: AppType, targetAppId: AppType) => { const newFolder: Folder = { id: `folder-${Date.now()}`, name: t('default_folder_name'), appIds: [targetAppId, droppedAppId] }; setFolders(p => [...p, newFolder]); setHomeScreenOrder(p => p.filter(id => id !== droppedAppId).map(id => id === targetAppId ? newFolder.id : id)); setDockAppIds(p => p.filter(id => id !== droppedAppId && id !== targetAppId)); };
    const handleAddToFolder = (folderId: string, appId: AppType) => { setFolders(p => p.map(f => f.id === folderId ? { ...f, appIds: [...f.appIds, appId] } : f)); setHomeScreenOrder(p => p.filter(id => id !== appId)); setDockAppIds(p => p.filter(id => id !== appId)); };
    const handleRemoveFromFolder = (folderId: string, appId: AppType) => { let dissolved = false; setFolders(p => { const nfs = p.map(f => f.id === folderId ? { ...f, appIds: f.appIds.filter(id => id !== appId) } : f); const f = nfs.find(f => f.id === folderId); if (f && f.appIds.length < 2) { dissolved = true; setHomeScreenOrder(po => { const fi = po.indexOf(folderId); const no = [...po]; if (fi !== -1) no.splice(fi, 1, ...f.appIds, appId); else no.push(...f.appIds, appId); return no; }); return nfs.filter(f => f.id !== folderId); } return nfs; }); if (!dissolved) setHomeScreenOrder(p => [...p, appId]); };
    const handleRenameFolder = (folderId: string, newName: string) => setFolders(p => p.map(f => f.id === folderId ? { ...f, name: newName } : f));
    const handleUpdateFolderApps = (folderId: string, newAppIds: AppType[]) => setFolders(p => p.map(f => f.id === folderId ? { ...f, appIds: newAppIds } : f));

    const handleBackup = () => fetchNui('phone:backupData');
    const handleBankTransfer = (data: any) => fetchNui('bank:transfer', data);
    const handleRequestVehicle = (vehicleId: string) => fetchNui('garage:requestVehicle', { vehicleId });
    const handleSetBusinessGPS = (location: Business['location']) => fetchNui('business:setWaypoint', { location });
    const handleCreateAlert = (data: any) => fetchNui('dispatch:createAlert', data);
    const handleSendMail = (data: any) => fetchNui('mail:send', data);
    const handleDeleteMail = (mailId: string) => fetchNui('mail:delete', { mailId });
    const handleSetSongs = (newSongs: Song[]) => { setSongs(newSongs); fetchNui('updateSongs', { songs: newSongs }); }
    const handleCreatePost = (data: any) => fetchNui('social:createPost', data);
    const handleLikePost = (postId: string) => { setSocialPosts(p => p.map(post => post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post)); fetchNui('social:likePost', { postId }); }
    const handleSetDuty = (status: boolean) => { setOnDuty(status); fetchNui('phone:setDuty', { status }); }
    const handleSearchCitizens = async (query: string): Promise<MdtCitizen[]> => (await fetchNui<MdtCitizen[]>('mdt:searchCitizens', { query })) || [];
    const handleCreateIncident = (data: any) => fetchNui('mdt:createIncident', data);
    const handleSearchMedicalRecords = async (query: string): Promise<MedicalRecord[]> => (await fetchNui<MedicalRecord[]>('meditab:searchRecords', { query })) || [];
    const handleCreateMedicalRecord = (data: any) => fetchNui('meditab:createRecord', data);
    const handleSearchVehicleInfo = async (plate: string): Promise<any> => (await fetchNui('mechatab:searchVehicle', { plate })) || null;
    const handleCreateInvoice = (data: any) => fetchNui('mechatab:createInvoice', data);
    const handleClearMissedCalls = () => { if (callHistory.some(c => c.isNew && c.direction === CallDirection.MISSED)) { setCallHistory(p => p.map(call => ({ ...call, isNew: false }))); fetchNui('phone:clearMissedCalls'); } };
    const handleClearUnreadMessages = (phoneNumber: string) => { setConversations(p => p.map(convo => convo.phoneNumber === phoneNumber ? { ...convo, unread: 0 } : convo)); fetchNui('phone:clearUnreadMessages', { phoneNumber }); };
    const handleBrowserStateChange = (newState: { tabs: BrowserTab[], activeTabId: string | null }) => {
        handleUpdateSettings({ browserState: newState });
    };

    const appsWithNotifications = useMemo(() => {
        const unreadMessagesCount = conversations.reduce((sum, convo) => sum + convo.unread, 0);
        const missedCallsCount = callHistory.filter(call => call.isNew && call.direction === CallDirection.MISSED).length;
        return installedApps.map(app => {
            if (app.id === AppType.MESSAGES) return { ...app, notificationCount: unreadMessagesCount };
            if (app.id === AppType.PHONE) return { ...app, notificationCount: missedCallsCount };
            return app;
        });
    }, [installedApps, conversations, callHistory]);

    const renderAppContent = () => {
        if (callState === 'active' && activeApp === AppType.PHONE && activeCallContact) {
            return <InCallUI contact={activeCallContact} onEndCall={handleEndCall} />;
        }

        switch (activeApp) {
            case AppType.PHONE: return <PhoneApp onPlaceCall={handlePlaceCall} contacts={contacts} recentCalls={callHistory} onViewRecents={handleClearMissedCalls} />;
            case AppType.MESSAGES: return <MessagesApp conversations={conversations} myNumber={userData?.phone_number || ""} onViewConversation={handleClearUnreadMessages} />;
            case AppType.SETTINGS: return <SettingsApp myPhoneNumber={userData?.phone_number || "N/A"} currentLanguage={locale as 'en' | 'fr'} onSetLanguage={handleSetLanguage} setCurrentWallpaper={handleSetWallpaper} wallpapers={wallpapers} setWallpapers={(newWallpapers) => { setWallpapers(newWallpapers); fetchNui('updateWallpapers', { wallpapers: newWallpapers }); }} onOpenMarketplace={() => openApp(AppType.MARKETPLACE)} settings={settings} onUpdateSettings={handleUpdateSettings} onBackup={handleBackup} />;
            case AppType.MARKETPLACE: return <MarketplaceApp installedAppIds={installedAppIds} onInstallApp={handleInstallApp} onUninstallApp={handleUninstallApp} userJob={userData?.job || ''} />;
            case AppType.BROWSER: return <BrowserApp initialState={settings.browserState} onStateChange={handleBrowserStateChange} />;
            case AppType.CAMERA: return <CameraApp />;
            case AppType.MUSIC: return <MusicApp songs={songs} setSongs={handleSetSongs} musicState={musicState} setMusicState={setMusicState} />;
            case AppType.GARAGE: return <GarageApp vehicles={vehicles} onRequestVehicle={handleRequestVehicle} />;
            case AppType.BANK: return <BankApp account={bankAccount} onTransfer={handleBankTransfer} />;
            case AppType.BUSINESSES: return <BusinessApp businesses={businesses} onSetGPS={handleSetBusinessGPS} />;
            case AppType.DISPATCH: return <DispatchApp alerts={alerts} onCreateAlert={handleCreateAlert} />;
            case AppType.WEATHER: return <WeatherApp locale={locale as 'en' | 'fr'} />;
            case AppType.MAIL: return <MailApp mails={mails} myEmailAddress={userData?.email || "me@ls.mail"} onSend={handleSendMail} onDelete={handleDeleteMail} />;
            case AppType.SOCIAL: return <SocialApp posts={socialPosts} onCreatePost={handleCreatePost} onLikePost={handleLikePost} />;
            case AppType.MDT: return <MdtApp onSetDuty={handleSetDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchCitizens={handleSearchCitizens} onCreateIncident={handleCreateIncident} />;
            case AppType.MEDITAB: return <MediTab onSetDuty={handleSetDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchRecords={handleSearchMedicalRecords} onCreateRecord={handleCreateMedicalRecord} />;
            case AppType.MECHATAB: return <MechaTab onSetDuty={handleSetDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchVehicle={handleSearchVehicleInfo} onCreateInvoice={handleCreateInvoice} invoices={mechanicInvoices} />;
            case AppType.PHOTOS: case AppType.CLOCK: case AppType.NOTES: case AppType.REMINDERS: case AppType.STOCKS: case AppType.HEALTH: case AppType.WALLET: return <PlaceholderApp appNameKey={activeApp + '_title'} />;
            default:
                return <HomeScreen 
                    apps={appsWithNotifications}
                    dockAppIds={dockAppIds}
                    setDockAppIds={handleSetDockAppIds}
                    onOpenApp={openApp}
                    onUninstallApp={handleUninstallApp}
                    clockWidgetVisible={settings.clockWidgetVisible}
                    onSetClockWidgetVisible={(isVisible) => handleUpdateSettings({ clockWidgetVisible: isVisible })}
                    folders={folders}
                    homeScreenOrder={homeScreenOrder}
                    onReorderHome={setHomeScreenOrder}
                    onCreateFolder={handleCreateFolder}
                    onAddToFolder={handleAddToFolder}
                    onRemoveFromFolder={handleRemoveFromFolder}
                    onRenameFolder={handleRenameFolder}
                    onUpdateFolderApps={handleUpdateFolderApps}
                />;
        }
    };

    if (!isVisible) return null;
    if (isBooting) return <BootScreen />;

    return (
        <div className="min-h-screen flex items-center justify-center">
            <PhoneShell 
                onHomeClick={goHome} callState={callState} activeCallContact={activeCallContact} locale={locale as 'en' | 'fr'} wallpaperUrl={currentWallpaperUrl}
                settings={settings} onUpdateSettings={handleUpdateSettings} musicState={musicState} setMusicState={setMusicState}
                notifications={{ missedCalls: callHistory.filter(c => c.isNew && c.direction === CallDirection.MISSED), unreadMessages: conversations.filter(c => c.unread > 0) }}
                onClearMissedCalls={handleClearMissedCalls} onClearUnreadMessages={handleClearUnreadMessages}
            >
                {callState === 'incoming' && activeCallContact ? (
                    <IncomingCall contact={activeCallContact} onAccept={handleAcceptCall} onDecline={handleDeclineCall} />
                ) : (
                    renderAppContent()
                )}
            </PhoneShell>
        </div>
    );
};

export default App;]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/nui.ts</file>
    <description>Creating the NUI helper function for communication between the UI and the client script.</description>
    <content><![CDATA[
/**
 * @param eventName - The name of the NUI callback event
 * @param data - The data to be sent to the NUI callback
 * @returns - A promise resolving when the fetch is complete.
 */
export async function fetchNui<T>(eventName: string, data: unknown = {}): Promise<T | void> {
    const resourceName = (window as any).GetParentResourceName ? (window as any).GetParentResourceName() : 'phone';

    try {
        const resp = await fetch(`https://${resourceName}/${eventName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(data),
        });

        if (!resp.ok) {
            throw new Error(`Failed to fetch NUI event ${eventName}. Status: ${resp.status}`);
        }

        return await resp.json();
    } catch (e) {
        // This will happen in a browser environment
        // console.error(`NUI Error: ${e.message}. This is expected in a browser.`);
        return; // Return void or mock data if needed for browser testing
    }
}]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/i18n.ts</file>
    <description>Creating the internationalization provider and hook for multi-language support.</description>
    <content><![CDATA[
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Translations = { [key: string]: string };
type LocaleContextType = {
    locale: string;
    setLocale: (locale: string) => void;
    t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode; initialLocale?: string }> = ({ children, initialLocale = 'en' }) => {
    const [locale, setLocale] = useState(initialLocale);
    const [translations, setTranslations] = useState<Translations>({});

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const response = await fetch(`/locales/${locale}.json`);
                if (!response.ok) {
                    throw new Error(`Could not load ${locale}.json`);
                }
                const data = await response.json();
                setTranslations(data);
            } catch (error) {
                console.error('Failed to fetch translations:', error);
                // Fallback to English if the selected locale fails
                if (locale !== 'en') {
                    setLocale('en');
                }
            }
        };

        fetchTranslations();
    }, [locale]);
    
    useEffect(() => {
        setLocale(initialLocale);
    }, [initialLocale]);

    const t = (key: string): string => {
        return translations[key] || key;
    };

    return React.createElement(LocaleContext.Provider, { value: { locale, setLocale, t } }, children);
};

export const useLocale = (): LocaleContextType => {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
};]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/types.ts</file>
    <description>Creating the TypeScript types definition file for the application.</description>
    <content><![CDATA[
import type { LucideIcon } from 'lucide-react';

export enum AppType {
    PHONE = 'phone',
    MESSAGES = 'messages',
    MUSIC = 'music',
    SETTINGS = 'settings',
    MARKETPLACE = 'marketplace',
    SOCIAL = 'social',
    
    // iOS Style Apps
    BROWSER = 'browser',
    CAMERA = 'camera',
    PHOTOS = 'photos',
    CLOCK = 'clock',
    MAIL = 'mail',
    WEATHER = 'weather',
    MAPS = 'maps',
    NOTES = 'notes',
    REMINDERS = 'reminders',
    STOCKS = 'stocks',
    HEALTH = 'health',
    WALLET = 'wallet',

    // Custom Functional Apps
    GARAGE = 'garage',
    BANK = 'bank',
    BUSINESSES = 'businesses',
    DISPATCH = 'dispatch',

    // Job-Specific Apps
    MDT = 'mdt',
    MEDITAB = 'meditab',
    MECHATAB = 'mechatab'
}

export interface AppInfo {
    id: AppType;
    name: string; // This is a translation key
    icon: LucideIcon;
    color: string;
    bgColor?: string;
    notificationCount?: number;
    isRemovable: boolean;
    requiredJobs?: string[];
}

export interface Folder {
    id: string;
    name: string;
    appIds: AppType[];
}

export type HomeScreenItem = 
    | { type: 'app', id: AppType }
    | { type: 'folder', id: string };

export interface SocialPost {
    id: string;
    authorName: string;
    authorAvatarUrl: string;
    imageUrl: string;
    caption: string;
    likes: number;
    isLiked: boolean; // Client-side state
    timestamp: string; // e.g., "5m", "2h", "1d"
}

export interface Wallpaper {
    id: string;
    name: string;
    url: string;
    isCustom?: boolean;
}

export interface BrowserTab {
    id: string;
    title: string;
    url: string;
    history: string[];
    historyIndex: number;
}

export interface PhoneSettings {
    theme: 'light' | 'dark';
    airplaneMode: boolean;
    clockWidgetVisible: boolean;
    folders: Folder[];
    homeScreenOrder: string[];
    browserState?: {
        tabs: BrowserTab[];
        activeTabId: string | null;
    };
}

export interface UserData {
    id: number;
    identifier: string;
    phone_number: string;
    email?: string;
    job: string;
    onduty: boolean;
    wallpaper: string;
    language: 'en' | 'fr';
    installed_apps: string; // JSON string of AppType[]
    dock_order: string; // JSON string of AppType[]
    settings: string; // JSON string of PhoneSettings
    folders: string; // JSON string of Folder[]
    home_screen_order: string; // JSON string of string[]
}

export interface Message {
    id: number;
    content: string;
    timestamp: string; // Pre-formatted string
    isSender: boolean;
}

export interface Conversation {
    contactName: string;
    phoneNumber: string;
    messages: Message[];
    lastMessage: string;
    timestamp: string; // Pre-formatted string
    unread: number;
    avatarUrl?: string;
}

export interface Contact {
    id: string;
    name: string;
    phoneNumber: string;
    avatarUrl?: string;
}

export enum CallDirection {
    INCOMING = 'incoming',
    OUTGOING = 'outgoing',
    MISSED = 'missed',
}

export interface CallRecord {
    id: number;
    contact: Contact; // Embed the contact object
    direction: CallDirection;
    timestamp: string; // Pre-formatted string
    isNew?: boolean;
}

export enum DispatchDepartment {
    POLICE = 'police',
    AMBULANCE = 'ambulance',
    FIRE = 'fire',
    CITIZEN = 'citizen',
}

export interface DispatchDepartmentInfo {
    color: string;
    icon: LucideIcon;
}

export interface DispatchAlert {
    id: number;
    department: DispatchDepartment;
    title: string;
    details: string;
    timestamp: string;
    location: string;
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    url: string;
}

export interface MusicState {
    currentSong: Song | null;
    isPlaying: boolean;
    progress: number;
    duration: number;
}

// Types for weather data from wttr.in
export interface WeatherCondition {
    value: string;
}

export interface WeatherDataPoint {
    temp_C: string;
    temp_F: string;
    weatherDesc: WeatherCondition[];
    weatherCode: string;
    time?: string;
}

export interface WeatherDay {
    date: string;
    maxtemp_C: string;
    maxtemp_F: string;
    mintemp_C: string;
    mintemp_F: string;
    hourly: WeatherDataPoint[];
}

export interface WeatherInfo {
    current_condition: WeatherDataPoint[];
    weather: WeatherDay[];
}

// Vehicle App Types
export enum VehicleStatus {
    GARAGED = 'garaged',
    IMPOUNDED = 'impounded',
    OUT = 'out',
}

export interface Vehicle {
    id: string;
    name: string;
    plate: string;
    status: VehicleStatus;
    imageUrl?: string;
}

// Bank App Types
export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
}

export interface BankAccount {
    balance: number;
    transactions: Transaction[];
}

// Business App Types
export interface Business {
    id: string;
    name: string;
    type: string;
    owner: string;
    logoUrl: string;
    description: string;
    location: { x: number; y: number; z: number };
}

// Mail App Types
export interface Mail {
    id: string;
    from: string;
    subject: string;
    body: string;
    timestamp: string;
    isRead: boolean;
}

// Job-Specific App Types

export interface OnDutyUnit {
    identifier: string;
    name: string;
    pos: { x: number, y: number, z: number };
}

// MDT
export interface MdtCitizen {
    identifier: string;
    name:string;
    dateofbirth: string;
    gender: 'Male' | 'Female' | 'Other';
    image_url: string;
    phone_number: string;
    incidents?: MdtIncident[];
    licenses?: any[]; // Define later
    vehicles?: Vehicle[];
}

export interface MdtIncident {
    id: number;
    title: string;
    timestamp: string;
    officers_involved: string; // JSON array of names
    civilians_involved: string; // JSON array of names
    reports: MdtReport[];
}

export interface MdtReport {
    id: number;
    author: string;
    timestamp: string;
    content: string;
}

// MediTab
export interface MedicalRecord {
    id: number;
    patient_identifier: string;
    timestamp: string;
    doctor: string;
    diagnosis: string;
    treatment: string;
    notes: string;
}

// MechaTab
export interface MechanicInvoice {
    id: number;
    customer_name: string;
    vehicle_plate: string;
    mechanic: string;
    timestamp: string;
    services: string; // JSON array of { name: string, price: number }
    total: number;
    is_paid: boolean;
}]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/constants.ts</file>
    <description>Creating the constants file, defining all available applications and default settings.</description>
    <content><![CDATA[
import type { AppInfo, Wallpaper } from './types';
import { AppType } from './types';
import { 
    Phone, MessageCircle, Settings, Globe, Camera, LayoutGrid, Landmark, Car, Siren, Building2, Users, Music, Mail, Sun, Image, Clock, Map, NotebookText, ListTodo, AreaChart, Heart, Wallet,
    ClipboardList, Stethoscope, Wrench
} from 'lucide-react';

export const ALL_APPS: AppInfo[] = [
    // System Apps (Non-removable)
    { id: AppType.PHONE, name: 'phone_title', icon: Phone, color: 'text-white', bgColor: 'bg-green-500', isRemovable: false },
    { id: AppType.MESSAGES, name: 'messages_title', icon: MessageCircle, color: 'text-white', bgColor: 'bg-blue-500', notificationCount: 0, isRemovable: false },
    { id: AppType.SETTINGS, name: 'settings_title', icon: Settings, color: 'text-neutral-800', bgColor: 'bg-neutral-200', isRemovable: false },
    { id: AppType.BROWSER, name: 'browser_title', icon: Globe, color: 'text-blue-500', bgColor: 'bg-white', isRemovable: false },
    { id: AppType.BANK, name: 'bank_title', icon: Landmark, color: 'text-white', bgColor: 'bg-emerald-500', isRemovable: false },
    { id: AppType.MARKETPLACE, name: 'app_store_title', icon: LayoutGrid, color: 'text-white', bgColor: 'bg-sky-500', isRemovable: false },
    
    // Functional Apps (Non-removable for now, can be changed)
    { id: AppType.CAMERA, name: 'camera_title', icon: Camera, color: 'text-neutral-300', bgColor: 'bg-neutral-800', isRemovable: false },
    { id: AppType.GARAGE, name: 'garage_title', icon: Car, color: 'text-white', bgColor: 'bg-orange-500', isRemovable: false },
    { id: AppType.DISPATCH, name: 'dispatch_title', icon: Siren, color: 'text-white', bgColor: 'bg-red-500', isRemovable: false },
    { id: AppType.BUSINESSES, name: 'businesses_title', icon: Building2, color: 'text-white', bgColor: 'bg-cyan-500', isRemovable: false },

    // Optional Apps (Removable)
    { id: AppType.SOCIAL, name: 'social_title', icon: Users, color: 'text-white', bgColor: 'bg-purple-500', isRemovable: true },
    { id: AppType.MUSIC, name: 'music_title', icon: Music, color: 'text-white', bgColor: 'bg-rose-500', isRemovable: true },
    { id: AppType.MAIL, name: 'mail_title', icon: Mail, color: 'text-white', bgColor: 'bg-sky-400', isRemovable: true },
    { id: AppType.WEATHER, name: 'weather_title', icon: Sun, color: 'text-yellow-300', bgColor: 'bg-blue-400', isRemovable: true },
    { id: AppType.PHOTOS, name: 'photos_title', icon: Image, color: 'text-rose-500', bgColor: 'bg-white', isRemovable: true },
    { id: AppType.CLOCK, name: 'clock_title', icon: Clock, color: 'text-white', bgColor: 'bg-black', isRemovable: true },
    { id: AppType.MAPS, name: 'maps_title', icon: Map, color: 'text-white', bgColor: 'bg-green-600', isRemovable: true },
    { id: AppType.NOTES, name: 'notes_title', icon: NotebookText, color: 'text-neutral-800', bgColor: 'bg-yellow-300', isRemovable: true },
    { id: AppType.REMINDERS, name: 'reminders_title', icon: ListTodo, color: 'text-black', bgColor: 'bg-white', isRemovable: true },
    { id: AppType.STOCKS, name: 'stocks_title', icon: AreaChart, color: 'text-white', bgColor: 'bg-neutral-800', isRemovable: true },
    { id: AppType.HEALTH, name: 'health_title', icon: Heart, color: 'text-red-500', bgColor: 'bg-white', isRemovable: true },
    { id: AppType.WALLET, name: 'wallet_title', icon: Wallet, color: 'text-white', bgColor: 'bg-black', isRemovable: true },

    // Job-Specific Apps (Removable)
    { id: AppType.MDT, name: 'mdt_title', icon: ClipboardList, color: 'text-white', bgColor: 'bg-blue-700', isRemovable: true, requiredJobs: ['sast', 'lspd', 'lssd', 'gouv', 'fib'] },
    { id: AppType.MEDITAB, name: 'meditab_title', icon: Stethoscope, color: 'text-white', bgColor: 'bg-rose-600', isRemovable: true, requiredJobs: ['sams', 'lsfd'] },
    { id: AppType.MECHATAB, name: 'mechatab_title', icon: Wrench, color: 'text-white', bgColor: 'bg-amber-600', isRemovable: true, requiredJobs: ['mechanic', 'bennys'] },
];

export const DEFAULT_DOCK_APP_IDS = [AppType.PHONE, AppType.BROWSER, AppType.MESSAGES, AppType.SETTINGS];
export const MAX_DOCK_APPS = 10;

export const DEFAULT_WALLPAPERS: Wallpaper[] = [
    { id: 'ios_default_new', name: 'iOS Default', url: 'https://i.pinimg.com/originals/8c/f4/98/8cf498ef295f66b4f987405af2d810c3.jpg' },
    { id: 'aurora', name: 'Aurora', url: 'https://w.forfun.com/fetch/1e/1e07353155359a933f7d8c6a28e5a759.jpeg' },
    { id: 'mountain', name: 'Mountain', url: 'https://w.forfun.com/fetch/03/03a74ac7d4a20b9231478174f7626372.jpeg' },
    { id: 'abstract', name: 'Abstract', url: 'https://w.forfun.com/fetch/51/5129c158652453e0791483861c8a1639.jpeg' },
    { id: 'wave', name: 'Wave', url: 'https://w.forfun.com/fetch/d4/d4a460144dedb95768a49c6d17960682.jpeg' },
    { id: 'city', name: 'City', url: 'https://w.forfun.com/fetch/e0/e0cf3b9f3d2427a7eb9f272a74c602a8.jpeg' },
];]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/locales/en.json</file>
    <description>Creating the English language translation file.</description>
    <content><![CDATA[
{
    "home": "Home",
    "phone_title": "Phone",
    "messages_title": "Messages",
    "settings_title": "Settings",
    "browser_title": "Browser",
    "camera_title": "Camera",
    "photos_title": "Photos",
    "clock_title": "Clock",
    "mail_title": "Mail",
    "weather_title": "Weather",
    "maps_title": "Maps",
    "notes_title": "Notes",
    "reminders_title": "Reminders",
    "stocks_title": "Stocks",
    "health_title": "Health",
    "wallet_title": "Wallet",
    "app_store_title": "App Store",
    "music_title": "Music",
    "garage_title": "Garage",
    "bank_title": "Bank",
    "businesses_title": "Businesses",
    "dispatch_title": "Dispatch",
    "social_title": "Social",
    "mdt_title": "MDT",
    "meditab_title": "MediTab",
    "mechatab_title": "MechaTab",

    "recents": "Recents",
    "contacts": "Contacts",
    "keypad": "Keypad",
    "general": "General",
    "wallpaper": "Wallpaper",
    "language": "Language",
    "my_number": "My Number",
    "incoming_call": "incoming call...",
    "decline": "Decline",
    "accept": "Accept",
    "mute": "Mute",
    "speaker": "Speaker",
    "no_messages": "You have no messages.",
    "no_recents": "No recent calls.",
    "no_contacts": "No contacts found.",
    "under_construction": "This application is under construction.",
    "install": "Install",
    "installing": "Installing...",
    "uninstall": "Uninstall",
    "installed": "Installed",
    "standard_app": "Standard App",
    "system_app": "System App",
    "job_restricted_app": "Job-Restricted App",
    "done_button": "Done",
    "default_folder_name": "Folder",

    "account_balance": "Account Balance",
    "transfer": "Transfer",
    "recent_transactions": "Recent Transactions",
    "no_transactions": "No transactions to display.",
    "new_transfer": "New Transfer",
    "recipient_iban": "Recipient IBAN",
    "amount": "Amount",
    "reason": "Reason (Optional)",
    "send_transfer": "Send Transfer",

    "my_vehicles": "My Vehicles",
    "status": "Status",
    "plate": "Plate",
    "garaged": "Garaged",
    "impounded": "Impounded",
    "out": "Out",
    "request_vehicle": "Request Vehicle",
    "no_vehicles": "No vehicles found in your garages.",

    "business_directory": "Business Directory",
    "set_gps": "Set GPS",
    "no_businesses": "No businesses listed.",
    "owner": "Owner",

    "create_alert": "Create Alert",
    "title": "Title",
    "details": "Details",
    "location": "Location",
    "send_alert": "Send Alert",
    "no_alerts": "No Active Alerts",
    "no_alerts_desc": "All quiet on the streets.",

    "inbox": "Inbox",
    "compose": "Compose",
    "to": "To",
    "subject": "Subject",
    "mail_body": "Mail Body",
    "send_email": "Send Email",
    "no_mail": "Your inbox is empty.",
    "delete": "Delete",
    "cancel": "Cancel",

    "create_new_post": "Create New Post",
    "image_url_placeholder": "Image URL",
    "caption_placeholder": "Write a caption...",
    "post_button": "Post",
    
    "airplane_mode": "Airplane Mode",
    "notifications": "Notifications",
    "display_and_brightness": "Display & Brightness",
    "dark_mode": "Dark Mode",
    "light_mode": "Light Mode",
    "appearance": "Appearance",
    "backup": "Backup",
    "backup_now": "Back Up Now",
    "last_backup": "Last backup",
    "never": "Never",
    "backup_desc": "Back up your contacts, messages, apps and data.",

    "select_a_conversation": "Select a conversation",
    "select_a_conversation_prompt": "Choose a conversation from the list to start chatting.",
    "select_setting": "Select a Setting",
    "select_setting_prompt": "Choose an item from the menu to configure.",

    "dashboard": "Dashboard",
    "duty_status": "Duty Status",
    "on_duty": "On Duty",
    "off_duty": "Off Duty",
    "live_map": "Live Map",
    "active_units": "Active Units",
    "no_units_onduty": "No units currently on duty.",
    
    "mdt_citizen_search": "Citizen Search",
    "mdt_incident_reports": "Incident Reports",
    "mdt_criminal_database": "Criminal Database",
    "mdt_lab_requests": "Lab Requests",
    "mdt_search_placeholder": "Search by name or phone number...",
    "mdt_no_results": "No results found.",
    "mdt_create_incident": "Create Incident Report",
    "mdt_incident_title": "Incident Title",
    "mdt_officers_involved": "Officers Involved (comma separated)",
    "mdt_civilians_involved": "Civilians Involved (comma separated)",
    "mdt_report_content": "Report Content",
    "mdt_submit_report": "Submit Report",
    "mdt_incidents": "Incidents",
    "mdt_reports": "Reports",
    "mdt_add_report": "Add Report",

    "meditab_patient_records": "Patient Records",
    "meditab_search_placeholder": "Search by name...",
    "meditab_no_records": "No medical records found for this patient.",
    "meditab_create_record": "Create Medical Record",
    "meditab_diagnosis": "Diagnosis",
    "meditab_treatment": "Treatment",
    "meditab_notes": "Notes",
    "meditab_submit_record": "Submit Record",

    "mechatab_vehicle_lookup": "Vehicle Lookup",
    "mechatab_invoices": "Invoices",
    "mechatab_search_placeholder": "Search by license plate...",
    "mechatab_vehicle_info": "Vehicle Information",
    "mechatab_owner": "Owner",
    "mechatab_no_vehicle_info": "No information found for this vehicle.",
    "mechatab_create_invoice": "Create Invoice",
    "mechatab_customer_name": "Customer Name",
    "mechatab_service_description": "Service Description",
    "mechatab_service_cost": "Cost",
    "mechatab_add_service": "Add Service",
    "mechatab_total": "Total",
    "mechatab_submit_invoice": "Submit Invoice",

    "brightness": "Brightness",
    "volume": "Volume",
    "not_playing": "Not Playing",
    "notifications_center_title": "Notifications",
    "no_notifications": "No new notifications",
    "clear_all": "Clear All"
}]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/locales/fr.json</file>
    <description>Creating the French language translation file.</description>
    <content><![CDATA[
{
    "home": "Accueil",
    "phone_title": "Téléphone",
    "messages_title": "Messages",
    "settings_title": "Réglages",
    "browser_title": "Navigateur",
    "camera_title": "Appareil photo",
    "photos_title": "Photos",
    "clock_title": "Horloge",
    "mail_title": "Mail",
    "weather_title": "Météo",
    "maps_title": "Plans",
    "notes_title": "Notes",
    "reminders_title": "Rappels",
    "stocks_title": "Bourse",
    "health_title": "Santé",
    "wallet_title": "Cartes",
    "app_store_title": "App Store",
    "music_title": "Musique",
    "garage_title": "Garage",
    "bank_title": "Banque",
    "businesses_title": "Entreprises",
    "dispatch_title": "Services d'urgence",
    "social_title": "Social",
    "mdt_title": "MDT",
    "meditab_title": "MediTab",
    "mechatab_title": "MechaTab",

    "recents": "Récents",
    "contacts": "Contacts",
    "keypad": "Clavier",
    "general": "Général",
    "wallpaper": "Fond d'écran",
    "language": "Langue",
    "my_number": "Mon numéro",
    "incoming_call": "appel entrant...",
    "decline": "Refuser",
    "accept": "Accepter",
    "mute": "Silence",
    "speaker": "Haut-parleur",
    "no_messages": "Vous n'avez aucun message.",
    "no_recents": "Aucun appel récent.",
    "no_contacts": "Aucun contact trouvé.",
    "under_construction": "Cette application est en cours de construction.",
    "install": "Installer",
    "installing": "Installation...",
    "uninstall": "Désinstaller",
    "installed": "Installé",
    "standard_app": "Application standard",
    "system_app": "Application système",
    "job_restricted_app": "Appli. de métier",
    "done_button": "Terminé",
    "default_folder_name": "Dossier",

    "account_balance": "Solde du compte",
    "transfer": "Virement",
    "recent_transactions": "Transactions récentes",
    "no_transactions": "Aucune transaction à afficher.",
    "new_transfer": "Nouveau virement",
    "recipient_iban": "IBAN du destinataire",
    "amount": "Montant",
    "reason": "Raison (Optionnel)",
    "send_transfer": "Envoyer le virement",

    "my_vehicles": "Mes véhicules",
    "status": "Statut",
    "plate": "Plaque",
    "garaged": "Au garage",
    "impounded": "En fourrière",
    "out": "Dehors",
    "request_vehicle": "Sortir le véhicule",
    "no_vehicles": "Aucun véhicule trouvé dans vos garages.",

    "business_directory": "Annuaire des entreprises",
    "set_gps": "Mettre le GPS",
    "no_businesses": "Aucune entreprise répertoriée.",
    "owner": "Propriétaire",

    "create_alert": "Créer une alerte",
    "title": "Titre",
    "details": "Détails",
    "location": "Lieu",
    "send_alert": "Envoyer l'alerte",
    "no_alerts": "Aucune alerte active",
    "no_alerts_desc": "Tout est calme dans les rues.",

    "inbox": "Boîte de réception",
    "compose": "Nouveau message",
    "to": "À",
    "subject": "Sujet",
    "mail_body": "Corps de l'e-mail",
    "send_email": "Envoyer l'e-mail",
    "no_mail": "Votre boîte de réception est vide.",
    "delete": "Supprimer",
    "cancel": "Annuler",

    "create_new_post": "Créer une publication",
    "image_url_placeholder": "URL de l'image",
    "caption_placeholder": "Écrivez une légende...",
    "post_button": "Publier",

    "airplane_mode": "Mode avion",
    "notifications": "Notifications",
    "display_and_brightness": "Affichage et luminosité",
    "dark_mode": "Mode sombre",
    "light_mode": "Mode clair",
    "appearance": "Apparence",
    "backup": "Sauvegarde",
    "backup_now": "Sauvegarder maintenant",
    "last_backup": "Dernière sauvegarde",
    "never": "Jamais",
    "backup_desc": "Sauvegardez vos contacts, messages, applications et données.",
    
    "select_a_conversation": "Sélectionner une conversation",
    "select_a_conversation_prompt": "Choisissez une conversation dans la liste pour commencer à discuter.",
    "select_setting": "Sélectionner un réglage",
    "select_setting_prompt": "Choisissez un élément dans le menu pour le configurer.",

    "dashboard": "Tableau de bord",
    "duty_status": "Statut de service",
    "on_duty": "En service",
    "off_duty": "Hors service",
    "live_map": "Carte en direct",
    "active_units": "Unités actives",
    "no_units_onduty": "Aucune unité en service actuellement.",

    "mdt_citizen_search": "Recherche citoyen",
    "mdt_incident_reports": "Rapports d'incident",
    "mdt_criminal_database": "Base de données criminelle",
    "mdt_lab_requests": "Demandes au labo",
    "mdt_search_placeholder": "Rechercher par nom ou n° de téléphone...",
    "mdt_no_results": "Aucun résultat trouvé.",
    "mdt_create_incident": "Créer un rapport d'incident",
    "mdt_incident_title": "Titre de l'incident",
    "mdt_officers_involved": "Officiers impliqués (séparés par une virgule)",
    "mdt_civilians_involved": "Civils impliqués (séparés par une virgule)",
    "mdt_report_content": "Contenu du rapport",
    "mdt_submit_report": "Soumettre le rapport",
    "mdt_incidents": "Incidents",
    "mdt_reports": "Rapports",
    "mdt_add_report": "Ajouter un rapport",

    "meditab_patient_records": "Dossiers patient",
    "meditab_search_placeholder": "Rechercher par nom...",
    "meditab_no_records": "Aucun dossier médical trouvé pour ce patient.",
    "meditab_create_record": "Créer un dossier médical",
    "meditab_diagnosis": "Diagnostic",
    "meditab_treatment": "Traitement",
    "meditab_notes": "Notes",
    "meditab_submit_record": "Soumettre le dossier",

    "mechatab_vehicle_lookup": "Recherche véhicule",
    "mechatab_invoices": "Factures",
    "mechatab_search_placeholder": "Rechercher par plaque d'immatriculation...",
    "mechatab_vehicle_info": "Informations du véhicule",
    "mechatab_owner": "Propriétaire",
    "mechatab_no_vehicle_info": "Aucune information trouvée pour ce véhicule.",
    "mechatab_create_invoice": "Créer une facture",
    "mechatab_customer_name": "Nom du client",
    "mechatab_service_description": "Description du service",
    "mechatab_service_cost": "Coût",
    "mechatab_add_service": "Ajouter un service",
    "mechatab_total": "Total",
    "mechatab_submit_invoice": "Soumettre la facture",

    "brightness": "Luminosité",
    "volume": "Volume",
    "not_playing": "Aucune lecture",
    "notifications_center_title": "Notifications",
    "no_notifications": "Aucune nouvelle notification",
    "clear_all": "Tout effacer"
}]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/components/PhoneShell.tsx</file>
    <description>Creating the main PhoneShell component that provides the tablet frame and wallpaper.</description>
    <content><![CDATA[
import React, { ReactNode, useState, useRef } from 'react';
import StatusBar from './StatusBar';
import ControlCenter from './shell/ControlCenter';
import type { Contact, PhoneSettings, MusicState, CallRecord, Conversation } from '../types';

interface PhoneShellProps {
    children: ReactNode;
    onHomeClick: () => void;
    callState: 'idle' | 'incoming' | 'active';
    activeCallContact: Contact | null;
    locale: 'en' | 'fr';
    wallpaperUrl: string;
    settings: PhoneSettings;
    onUpdateSettings: (settings: Partial<PhoneSettings>) => void;
    musicState: MusicState;
    setMusicState: (state: MusicState) => void;
    notifications: {
        missedCalls: CallRecord[];
        unreadMessages: Conversation[];
    };
    onClearMissedCalls: () => void;
    onClearUnreadMessages: (phoneNumber: string) => void;
}

const PhoneShell: React.FC<PhoneShellProps> = (props) => {
    const { children, onHomeClick, wallpaperUrl, locale } = props;
    const [isControlCenterOpen, setControlCenterOpen] = useState(false);
    const swipeStartY = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        swipeStartY.current = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (swipeStartY.current === null) return;
        
        const deltaY = e.touches[0].clientY - swipeStartY.current;
        if (deltaY > 50) { // Swipe down threshold
            setControlCenterOpen(true);
            swipeStartY.current = null;
        }
    };

    const handleTouchEnd = () => {
        swipeStartY.current = null;
    };

    return (
        <div 
            className="w-[1400px] h-[940px] rounded-[60px] shadow-2xl shadow-black/80 border-4 border-neutral-800 flex flex-col relative p-2 bg-cover bg-center"
            style={{ backgroundImage: `url('${wallpaperUrl}')` }}
        >
            <div className="relative w-full h-full bg-transparent rounded-[52px] flex flex-col overflow-hidden">
                <div 
                    className="absolute top-0 left-0 right-0 h-12 z-20"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                />
                
                <ControlCenter
                    isOpen={isControlCenterOpen}
                    onClose={() => setControlCenterOpen(false)}
                    {...props}
                />
                
                <StatusBar locale={locale} />
                
                <main className="flex-grow bg-transparent overflow-y-auto">
                    {children}
                </main>
                
                {/* Home Bar */}
                <div className="h-10 flex-shrink-0 flex items-center justify-center pt-2 pb-4">
                     <button
                        onClick={onHomeClick}
                        className="w-64 h-2 bg-white/60 rounded-full hover:bg-white/90 transition-colors"
                        aria-label="Home"
                    ></button>
                </div>
            </div>
        </div>
    );
};

export default PhoneShell;]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/components/StatusBar.tsx</file>
    <description>Creating the StatusBar component for the top of the UI.</description>
    <content><![CDATA[
import React, { useState, useEffect } from 'react';
import { Wifi, Signal, BatteryFull } from 'lucide-react';

interface StatusBarProps {
    locale: 'en' | 'fr';
}

const StatusBar: React.FC<StatusBarProps> = ({ locale }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timerId);
    }, []);

    const formatTime = (date: Date) => {
        const timeZone = locale === 'fr' ? 'Europe/Paris' : 'America/Los_Angeles';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone });
    };

    return (
        <header className="h-12 px-8 flex justify-between items-center text-white flex-shrink-0 z-10 relative">
            <div className="text-sm font-semibold w-12 text-left">
                {formatTime(time)}
            </div>
            <div className="flex items-center gap-2">
                <Signal size={16} />
                <Wifi size={16} />
                <BatteryFull size={20} />
            </div>
        </header>
    );
};

export default StatusBar;]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/components/HomeScreen.tsx</file>
    <description>Creating the HomeScreen component with drag-and-drop functionality for apps and folders.</description>
    <content><![CDATA[

import React, { useState, useRef } from 'react';
import type { AppInfo, Folder } from '../types';
import { AppType } from '../types';
import AppIcon from './AppIcon';
import { MAX_DOCK_APPS } from '../constants';
import ClockWidget from './ClockWidget';
import { useLocale } from '../i18n';
import { XCircle } from 'lucide-react';
import FolderIcon from './FolderIcon';
import FolderView from './FolderView';

interface HomeScreenProps {
    apps: AppInfo[];
    dockAppIds: AppType[];
    setDockAppIds: (ids: AppType[]) => void;
    onOpenApp: (appId: AppType) => void;
    onUninstallApp: (app: AppInfo) => void;
    clockWidgetVisible: boolean;
    onSetClockWidgetVisible: (isVisible: boolean) => void;
    folders: Folder[];
    homeScreenOrder: string[];
    onReorderHome: (order: string[]) => void;
    onCreateFolder: (droppedAppId: AppType, targetAppId: AppType) => void;
    onAddToFolder: (folderId: string, appId: AppType) => void;
    onRemoveFromFolder: (folderId: string, appId: AppType) => void;
    onRenameFolder: (folderId: string, newName: string) => void;
    onUpdateFolderApps: (folderId: string, newAppIds: AppType[]) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = (props) => {
    const {
        apps, dockAppIds, setDockAppIds, onOpenApp, onUninstallApp,
        clockWidgetVisible, onSetClockWidgetVisible, folders, homeScreenOrder,
        onReorderHome, onCreateFolder, onAddToFolder, onRemoveFromFolder,
        onRenameFolder, onUpdateFolderApps
    } = props;
    
    const [draggedItem, setDraggedItem] = useState<{ id: string, type: 'app' | 'folder' } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [openFolder, setOpenFolder] = useState<Folder | null>(null);
    const { t, locale } = useLocale();

    const allItemsMap = new Map<string, AppInfo | Folder>();
    apps.forEach(app => allItemsMap.set(app.id, app));
    folders.forEach(folder => allItemsMap.set(folder.id, folder));
    
    const homeScreenItems = homeScreenOrder
        .map(id => ({ id, item: allItemsMap.get(id) }))
        .filter(data => dockAppIds.indexOf(data.id as AppType) === -1 && data.item)

    const dockApps = dockAppIds.map(id => apps.find(app => app.id === id)).filter((app): app is AppInfo => !!app);
    
    const longPressTimer = useRef<number | undefined>();
    const pressDidFire = useRef(false);

    const handleEnterEditMode = () => setIsEditing(true);

    const handleWidgetMouseDown = (e: React.MouseEvent) => {
        pressDidFire.current = false;
        longPressTimer.current = window.setTimeout(() => {
            handleEnterEditMode();
            pressDidFire.current = true;
        }, 700);
    };

    const handleWidgetMouseUp = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLElement>, id: string, type: 'app' | 'folder') => {
        if (!isEditing) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('itemId', id);
        e.dataTransfer.setData('itemType', type);
        setDraggedItem({ id, type });
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const sourceId = e.dataTransfer.getData('itemId');
        const sourceType = e.dataTransfer.getData('itemType') as 'app' | 'folder';
        if (!sourceId || !sourceType) return;
        
        setDraggedItem(null);

        const dropElement = document.elementFromPoint(e.clientX, e.clientY);
        const targetButton = dropElement?.closest('button[data-id]');
        const targetDropzoneDiv = dropElement?.closest('div[data-dropzone]');
        
        const targetId = targetButton?.getAttribute('data-id');
        const targetType = targetButton?.getAttribute('data-type') as 'app' | 'folder' | undefined;
        const dropZone = targetDropzoneDiv?.getAttribute('data-dropzone') as 'main' | 'dock' | null;
        
        if (sourceType === 'app' && targetType === 'app' && sourceId !== targetId) {
            onCreateFolder(sourceId as AppType, targetId as AppType);
        } else if (sourceType === 'app' && targetType === 'folder' && targetId) {
            onAddToFolder(targetId, sourceId as AppType);
        } else if (dropZone === 'main') {
             if (!targetId || targetId === sourceId) { // Dropped on empty space
                if (dockAppIds.includes(sourceId as AppType)) { // Dock -> Main
                    setDockAppIds(dockAppIds.filter(id => id !== sourceId));
                    onReorderHome([...homeScreenOrder, sourceId]);
                }
                return;
             }
             const reordered = [...homeScreenOrder];
             const sourceIdx = reordered.indexOf(sourceId);
             if (sourceIdx !== -1) reordered.splice(sourceIdx, 1);
             
             const targetIdx = reordered.indexOf(targetId);
             reordered.splice(targetIdx, 0, sourceId);
             onReorderHome(reordered);

        } else if (dropZone === 'dock' && sourceType === 'app') {
            const currentDockIds = [...dockAppIds];
            const sourceIsDocked = currentDockIds.includes(sourceId as AppType);
            
            if (sourceIsDocked) { // Reorder Dock -> Dock
                 const sourceIdx = currentDockIds.indexOf(sourceId as AppType);
                 currentDockIds.splice(sourceIdx, 1);
            } else { // Move Main -> Dock
                 if (currentDockIds.length >= MAX_DOCK_APPS) return;
                 onReorderHome(homeScreenOrder.filter(id => id !== sourceId));
            }

            const targetIdx = targetId ? currentDockIds.indexOf(targetId as AppType) : currentDockIds.length;
            currentDockIds.splice(targetIdx, 0, sourceId as AppType);
            setDockAppIds(currentDockIds);
        }
    };
    
    const handleDragEnd = () => setDraggedItem(null);

    return (
        <div className="px-2 pt-1 pb-2 h-full flex flex-col justify-between">
            {openFolder && (
                 <FolderView
                    folder={openFolder}
                    allApps={apps}
                    onClose={() => setOpenFolder(null)}
                    onRenameFolder={onRenameFolder}
                    onUpdateFolderApps={onUpdateFolderApps}
                    onRemoveFromFolder={onRemoveFromFolder}
                    onUninstallApp={onUninstallApp}
                    isEditing={isEditing}
                 />
            )}
            <div className="pt-12 px-10 flex justify-between items-start min-h-[150px]">
                {clockWidgetVisible && (
                    <div className={`relative ${isEditing ? 'jiggle' : ''}`} onMouseDown={handleWidgetMouseDown} onMouseUp={handleWidgetMouseUp} onMouseLeave={handleWidgetMouseUp}>
                         {isEditing && (
                            <button onClick={(e) => { e.stopPropagation(); onSetClockWidgetVisible(false); }} className="absolute -top-2 -left-2 z-10 text-white" aria-label={`Delete Clock Widget`}>
                                <XCircle size={28} className="bg-neutral-600 fill-neutral-800 rounded-full" />
                            </button>
                        )}
                        <ClockWidget locale={locale as 'en' | 'fr'} />
                    </div>
                )}
                {isEditing && (
                    <button onClick={() => setIsEditing(false)} className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg self-center">
                        {t('done_button')}
                    </button>
                )}
            </div>
            <div className="flex-grow grid grid-cols-10 gap-y-6 gap-x-4 content-start pt-12 px-8" onDrop={handleDrop} onDragOver={handleDragOver} data-dropzone="main">
                {homeScreenItems.map(({ id, item }) => {
                    if (item && 'appIds' in item) { // It's a Folder
                        const folderApps = item.appIds.map(appId => apps.find(a => a.id === appId)).filter((app): app is AppInfo => !!app);
                        return <FolderIcon 
                            key={id} 
                            folder={item} 
                            apps={folderApps} 
                            isEditing={isEditing} 
                            isDragging={draggedItem?.id === id}
                            onClick={() => !isEditing && setOpenFolder(item)} 
                            onDragStart={(e) => handleDragStart(e, id, 'folder')}
                            onDragEnd={handleDragEnd}
                        />
                    }
                    if (item && 'icon' in item) { // It's an App
                        return <AppIcon
                            key={id}
                            app={item}
                            isDraggable={isEditing} isEditing={isEditing}
                            isDragging={draggedItem?.id === id}
                            onClick={() => !isEditing && onOpenApp(item.id)}
                            onDragStart={(e) => handleDragStart(e, id, 'app')}
                            onDragEnd={handleDragEnd}
                            onEnterEditMode={handleEnterEditMode}
                            onDelete={() => onUninstallApp(item)}
                        />
                    }
                    return null;
                })}
            </div>
            <div className="mb-1 p-2 bg-white/10 backdrop-blur-3xl rounded-3xl" onDrop={handleDrop} onDragOver={handleDragOver} data-dropzone="dock">
                <div className="flex flex-row justify-center items-center gap-x-2">
                    {dockApps.map((app) => (
                         <AppIcon
                            key={app.id} app={app}
                            isDraggable={isEditing} isEditing={isEditing} isDocked={true}
                            isDragging={draggedItem?.id === app.id}
                            onClick={() => !isEditing && onOpenApp(app.id)}
                            onDragStart={(e) => handleDragStart(e, app.id, 'app')}
                            onDragEnd={handleDragEnd}
                            onEnterEditMode={handleEnterEditMode}
                            onDelete={() => onUninstallApp(app)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/components/AppIcon.tsx</file>
    <description>Creating the AppIcon component for displaying application icons on the home screen.</description>
    <content><![CDATA[
import React, { useRef } from 'react';
import type { AppInfo } from '../types';
import { useLocale } from '../i18n';
import { XCircle } from 'lucide-react';

interface AppIconProps {
    app: AppInfo;
    onClick: () => void;
    isDocked?: boolean;
    isDraggable?: boolean;
    isEditing?: boolean;
    isDragging?: boolean;
    onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void;
    onDragEnd?: () => void;
    onEnterEditMode: () => void;
    onDelete: () => void;
}

const AppIcon: React.FC<AppIconProps> = (props) => {
    const { 
        app, onClick, isDocked = false, isDraggable = false, isEditing = false, isDragging = false,
        onDragStart, onDragEnd, onEnterEditMode, onDelete
    } = props;
    const { t } = useLocale();
    const longPressTimer = useRef<number | undefined>();
    const pressDidFire = useRef(false);

    const handleMouseDown = () => {
        pressDidFire.current = false;
        const enterEditMode = () => {
            onEnterEditMode();
            pressDidFire.current = true;
        };
        longPressTimer.current = window.setTimeout(enterEditMode, 700);
    };

    const handleMouseUp = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleClick = () => {
        if (!pressDidFire.current) {
            onClick();
        }
    };

    const renderIcon = () => {
        const IconComponent = app.icon;
        return <IconComponent className={`${app.color} w-12 h-12`} style={{ filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.4))' }} />;
    };

    return (
        <button 
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            draggable={isDraggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            data-appid={app.id}
            data-id={app.id}
            data-type="app"
            data-dropzone={isDocked ? 'dock' : 'main'}
            className={`flex flex-col items-center group w-24 h-28 transition-transform duration-200 ease-in-out relative ${isDocked ? 'justify-center' : 'justify-start gap-2'} ${isDragging ? 'opacity-30 scale-110' : ''} ${isEditing ? 'jiggle' : ''}`}
            aria-label={t(app.name)}
        >
            {isEditing && app.isRemovable && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute top-0 left-0 z-10 text-white"
                    aria-label={`Delete ${t(app.name)}`}
                >
                    <XCircle size={28} className="bg-neutral-600 fill-neutral-800 rounded-full" />
                </button>
            )}
            <div className={`w-20 h-20 rounded-[1.3rem] flex items-center justify-center relative transition-transform duration-200 group-active:scale-95 overflow-hidden pointer-events-none ${app.bgColor || 'bg-neutral-800'}`}>
                {renderIcon()}
                 
                {app.notificationCount > 0 && !isEditing && (
                     <div 
                        className="absolute top-1 right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-[var(--bg-primary)]"
                        role="status"
                        aria-label="New notification"
                     ></div>
                )}
            </div>
            {!isDocked && <span className="text-white text-sm font-medium drop-shadow-lg pointer-events-none" style={{textShadow: '0 1px 2px rgb(0 0 0 / 0.7)'}}>{t(app.name)}</span>}
        </button>
    );
};

export default AppIcon;]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/components/FolderIcon.tsx</file>
    <description>Creating the FolderIcon component for displaying app folders on the home screen.</description>
    <content><![CDATA[
import React from 'react';
import type { Folder, AppInfo } from '../types';
import { useLocale } from '../i18n';

interface FolderIconProps {
    folder: Folder;
    apps: AppInfo[];
    onClick: () => void;
    isEditing?: boolean;
    isDragging?: boolean;
    onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void;
    onDragEnd?: () => void;
}

const FolderIcon: React.FC<FolderIconProps> = (props) => {
    const { folder, apps, onClick, isEditing, isDragging, onDragStart, onDragEnd } = props;
    const { t } = useLocale();

    return (
        <button
            onClick={onClick}
            draggable={isEditing}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            data-id={folder.id}
            data-type="folder"
            className={`flex flex-col items-center group w-24 h-28 justify-start gap-2 transition-transform duration-200 ease-in-out relative ${isDragging ? 'opacity-30 scale-110' : ''} ${isEditing ? 'jiggle' : ''}`}
            aria-label={folder.name}
        >
            <div className="w-20 h-20 bg-neutral-700/80 rounded-[1.3rem] flex items-center justify-center relative transition-transform duration-200 group-active:scale-95 p-1.5 pointer-events-none">
                <div className="grid grid-cols-3 gap-1 w-full h-full">
                    {apps.slice(0, 9).map((app, index) => {
                        const Icon = app.icon;
                        return (
                             <div key={app.id + index} className={`w-full h-full rounded-md flex items-center justify-center overflow-hidden ${app.bgColor}`}>
                                <Icon className={app.color} size={12} />
                            </div>
                        )
                    })}
                </div>
            </div>
            <span className="text-white text-sm font-medium drop-shadow-lg pointer-events-none" style={{textShadow: '0 1px 2px rgb(0 0 0 / 0.7)'}}>{folder.name}</span>
        </button>
    );
};

export default FolderIcon;]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/components/FolderView.tsx</file>
    <description>Creating the FolderView component, an overlay for viewing and managing apps within a folder.</description>
    <content><![CDATA[
import React, { useState, useRef, useEffect } from 'react';
import type { Folder, AppInfo, AppType } from '../types';
import AppIcon from './AppIcon';

interface FolderViewProps {
    folder: Folder;
    allApps: AppInfo[];
    onClose: () => void;
    onRenameFolder: (folderId: string, newName: string) => void;
    onUpdateFolderApps: (folderId: string, newAppIds: AppType[]) => void;
    onRemoveFromFolder: (folderId: string, appId: AppType) => void;
    onUninstallApp: (app: AppInfo) => void;
    isEditing: boolean;
}

const FolderView: React.FC<FolderViewProps> = (props) => {
    const { folder, allApps, onClose, onRenameFolder, onUpdateFolderApps, onRemoveFromFolder, onUninstallApp, isEditing } = props;
    
    const [isRenaming, setIsRenaming] = useState(false);
    const [folderName, setFolderName] = useState(folder.name);
    const inputRef = useRef<HTMLInputElement>(null);

    const folderApps = folder.appIds
        .map(id => allApps.find(app => app.id === id))
        .filter((app): app is AppInfo => !!app);

    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming]);

    const handleRename = () => {
        if (folderName.trim()) {
            onRenameFolder(folder.id, folderName.trim());
        } else {
            setFolderName(folder.name);
        }
        setIsRenaming(false);
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, app: AppInfo) => {
        e.dataTransfer.setData('appIdFromFolder', app.id);
        e.dataTransfer.setData('folderIdSource', folder.id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const appId = e.dataTransfer.getData('appIdFromFolder') as AppType;
        if (!appId) return;

        // Check if dropped outside the folder view
        const dropElement = document.elementFromPoint(e.clientX, e.clientY);
        if (!dropElement?.closest('[data-folder-view-content]')) {
            onRemoveFromFolder(folder.id, appId);
            onClose();
            return;
        }

        const targetButton = dropElement?.closest('button[data-appid]');
        const targetAppId = targetButton?.getAttribute('data-appid') as AppType | null;
        
        const reordered = [...folder.appIds];
        const sourceIdx = reordered.indexOf(appId);
        if (sourceIdx !== -1) reordered.splice(sourceIdx, 1);
        
        const targetIdx = targetAppId ? reordered.indexOf(targetAppId) : reordered.length;
        reordered.splice(targetIdx, 0, appId);
        onUpdateFolderApps(folder.id, reordered);
    };
    
    return (
        <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xl z-20 flex items-center justify-center p-8"
            onClick={onClose}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div
                data-folder-view-content
                onClick={e => e.stopPropagation()}
                className="bg-neutral-800/80 p-6 rounded-[2.5rem] w-full max-w-4xl min-h-[400px] flex flex-col items-center gap-4"
                style={{ animation: 'scale-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
            >
                {isRenaming ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={folderName}
                        onChange={e => setFolderName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={e => e.key === 'Enter' && handleRename()}
                        className="bg-neutral-700 text-white text-3xl font-bold text-center rounded-lg px-2 py-1 outline-none"
                    />
                ) : (
                    <h2 onClick={() => setIsRenaming(true)} className="text-white text-3xl font-bold">{folder.name}</h2>
                )}
                
                <div className="grid grid-cols-5 gap-y-6 gap-x-4 content-start pt-4">
                     {folderApps.map(app => (
                        <AppIcon
                            key={app.id}
                            app={app}
                            isDraggable={isEditing}
                            isEditing={isEditing}
                            onClick={() => { if(!isEditing) onClose(); /* open app here */ }}
                            onDragStart={e => handleDragStart(e, app)}
                            onEnterEditMode={() => {}}
                            onDelete={() => onUninstallApp(app)}
                        />
                    ))}
                </div>
            </div>
             <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default FolderView;]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/components/ClockWidget.tsx</file>
    <description>Creating the Clock & Weather widget for the home screen.</description>
    <content><![CDATA[

import React, { useState, useEffect } from 'react';
import type { WeatherInfo, WeatherDataPoint } from '../types';
import { Sun, Cloudy, CloudRain, Snowflake, Zap, CloudDrizzle, CloudFog, LoaderCircle, AlertTriangle } from 'lucide-react';

interface ClockWidgetProps {
    locale: 'en' | 'fr';
}

// Helper to map wttr.in weather codes to Lucide icons
export const getWeatherIcon = (codeStr: string, size: number = 28): JSX.Element => {
    const code = parseInt(codeStr, 10);
    const props = { size, strokeWidth: 1.5 };

    if (isNaN(code)) return <Sun {...props} className="text-yellow-300" />;
    
    if (code >= 386) return <Zap {...props} className="text-yellow-300" />; // Thunder
    if (code === 350) return <Snowflake {...props} className="text-cyan-200" />; // Ice pellets
    if ((code >= 317 && code <= 338) || (code >= 368 && code <= 377)) return <Snowflake {...props} className="text-white" />; // Snow
    if ((code >= 281 && code <= 314) || (code >= 353 && code <= 359)) return <CloudRain {...props} className="text-blue-300" />; // Rain
    if (code >= 263 && code <= 266) return <CloudDrizzle {...props} className="text-blue-200" />; // Drizzle
    if (code >= 179 && code <= 248) return <CloudFog {...props} className="text-slate-400" />; // Fog
    if (code >= 116 && code <= 143) return <Cloudy {...props} className="text-slate-300" />; // Cloudy
    if (code === 113) return <Sun {...props} className="text-yellow-300" />; // Sunny
    
    return <Sun {...props} className="text-yellow-300" />; // Default
};


const ClockWidget: React.FC<ClockWidgetProps> = ({ locale }) => {
    const [date, setDate] = useState(new Date());
    const [weather, setWeather] = useState<WeatherInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { timeZone, location } = locale === 'fr' 
        ? { timeZone: 'Europe/Paris', location: 'Paris' }
        : { timeZone: 'America/Los_Angeles', location: 'Los+Angeles' };

    useEffect(() => {
        const fetchWeather = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://wttr.in/${location}?format=j1&lang=${locale}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch weather data.');
                }
                const data = await response.json();
                setWeather(data);
            } catch (err) {
                setError('Could not load weather.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWeather();
    }, [location, locale]);

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000 * 60); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const day = date.toLocaleDateString(locale, { weekday: 'long', timeZone });
    const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone });

    const condition: WeatherDataPoint | undefined = weather?.current_condition[0];

    const renderWeather = () => {
        if (isLoading) {
            return <LoaderCircle size={24} className="animate-spin text-neutral-400" />;
        }
        if (error || !condition) {
            return <span title={error || "No weather data"}><AlertTriangle size={24} className="text-red-400" /></span>;
        }
        return (
             <div className="flex gap-2 items-center">
                {getWeatherIcon(condition.weatherCode, 36)}
                <div className="text-left">
                    <p className="font-semibold text-xl">{locale === 'fr' ? `${condition.temp_C}°C` : `${condition.temp_F}°F`}</p>
                    <p className="text-sm text-neutral-300 -mt-1">{condition.weatherDesc[0].value}</p>
                </div>
            </div>
        );
    };

    return (
        <div 
            className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-3xl p-4 text-white shadow-lg flex items-center justify-between"
            style={{textShadow: '0 1px 3px rgb(0 0 0 / 0.5)'}}
        >
            <div className="flex flex-col">
                 <p className="text-base font-medium capitalize text-neutral-300">{day}</p>
                 <p className="text-8xl font-bold -mt-2 -ml-1">{time}</p>
            </div>
            <div className="flex flex-col items-end">
                {renderWeather()}
            </div>
        </div>
    );
};

export default ClockWidget;]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/components/BootScreen.tsx</file>
    <description>Creating the BootScreen component shown when the tablet is opened.</description>
    <content><![CDATA[
import React from 'react';

const BootScreen: React.FC = () => {
    return (
        <div className="w-[1400px] h-[940px] bg-black rounded-[60px] shadow-2xl shadow-black/80 border-4 border-neutral-800 flex flex-col items-center justify-center relative p-2">
            <div className="relative w-full h-full bg-black rounded-[52px] flex flex-col items-center justify-center overflow-hidden">
                <img 
                    src="https://i.ibb.co/7dgR0Cj3/Neon-Purple-V-Sign-Against-Dark-Brick-Wall-Photoroom.png" 
                    alt="Boot Logo"
                    className="w-1/2 h-auto animate-fade-in-out" 
                />
            </div>
            <style>
                {`
                    @keyframes fade-in-out {
                        0% {
                            opacity: 0;
                        }
                        20%, 80% {
                            opacity: 1;
                        }
                        100% {
                            opacity: 0;
                        }
                    }
                    .animate-fade-in-out {
                        animation: fade-in-out 2.5s ease-in-out forwards;
                    }
                `}
            </style>
        </div>
    );
};

export default BootScreen;]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/components/InCallUI.tsx</file>
    <description>Creating the InCallUI component for the active call screen.</description>
    <content><![CDATA[
import React, { useState, useEffect } from 'react';
import type { Contact } from '../types';
import { Mic, MicOff, Volume2, Grip, Phone } from 'lucide-react';
import { useLocale } from '../i18n';

interface InCallUIProps {
    contact: Contact;
    onEndCall: () => void;
}

const InCallUI: React.FC<InCallUIProps> = ({ contact, onEndCall }) => {
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(false);
    const { t } = useLocale();

    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const ControlButton: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void, active?: boolean }> = ({ icon, label, onClick, active }) => (
        <div className="flex flex-col items-center gap-2">
            <button onClick={onClick} className={`w-28 h-28 rounded-full flex items-center justify-center transition-colors duration-200 ${active ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {icon}
            </button>
            <span className="text-lg font-medium text-white/90">{label}</span>
        </div>
    );

    return (
        <div className="h-full flex flex-col justify-between items-center text-white bg-black/70 backdrop-blur-2xl p-8">
            <div className="text-center mt-28">
                <h2 className="text-7xl font-semibold">{contact.name}</h2>
                <p className="text-3xl text-slate-300 mt-2">{formatDuration(duration)}</p>
            </div>
            
            <div className="w-full max-w-lg grid grid-cols-3 gap-5 mb-16">
                <ControlButton 
                    icon={isMuted ? <MicOff size={48} /> : <Mic size={48} />} 
                    label={t('mute')}
                    onClick={() => setIsMuted(!isMuted)}
                    active={isMuted}
                />
                <ControlButton icon={<Grip size={48} />} label={t('keypad')} />
                <ControlButton 
                    icon={<Volume2 size={48} />} 
                    label={t('speaker')}
                    onClick={() => setIsSpeaker(!isSpeaker)}
                    active={isSpeaker}
                />
            </div>

            <button 
                onClick={onEndCall}
                className="w-28 h-28 rounded-full bg-red-500 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-100"
            >
                <Phone size={52} />
            </button>
        </div>
    );
};

export default InCallUI;]]></content>
  </change>
  <change>
    <file>lsfive-phone/html/components/IncomingCall.tsx</file>
    <description>Creating the IncomingCall component for the incoming call screen.</description>
    <content><![CDATA[
import React from 'react';
import type { Contact } from '../types';
import { Phone, X } from 'lucide-react';
import { useLocale } from '../i18n';

interface IncomingCallProps {
    contact: Contact;
    onAccept: () => void;
    onDecline: () => void;
}

const IncomingCall: React.FC<IncomingCallProps> = ({ contact, onAccept, onDecline }) => {
    const { t } = useLocale();

    return (
        <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-3xl z-50 flex flex-col justify-between items-center p-8 text-white">
            <div className="text-center mt-24">
                <h2 className="text-7xl font-semibold">{contact.name}</h2>
                <p className="text-3xl text-slate-300">{t('incoming_call')}</p>
            </div>

            <img 
                src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.name.charAt(0)}&background=random&size=128`}
                alt={contact.name}
                className="w-56 h-56 rounded-full border-4 border-neutral-700 shadow-lg"
            />
            
            <div className="w-full max-w-md flex justify-around items-center mb-16">
                <div className="flex flex-col items-center gap-3">
                    <button 
                        onClick={onDecline}
                        className="w-28 h-28 rounded-full bg-red-500 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-100"
                    >
                        <X size={56} />
                    </button>
                    <span className="text-xl">{t('decline')}</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                     <button 
                        onClick={onAccept}
                        className="w-28 h-28 rounded-full bg-green-500 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-100"
                    >
                        <Phone size={52} />
                    </button>
                    <span className="text-xl">{t('accept')}</span>
                </div>
            </div>
        </div>
    );
};

export default IncomingCall;]]></content>
  </change>
</changes>