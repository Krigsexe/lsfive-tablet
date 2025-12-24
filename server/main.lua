--[[
    LSFIVE TABLET - SERVER
    Gestion base de données, événements serveur, et intégration frameworks
]]

-- Player data cache
local PlayerPhoneData = {}
local OnDutyPlayers = {}

--[[
    INITIALIZATION
]]
CreateThread(function()
    -- Wait for database
    Wait(1000)

    LSFiveTablet.DetectFramework()
    LSFiveTablet.Debug('Server initialized with framework: ' .. (LSFiveTablet.Framework or 'standalone'))

    -- Initialize tables if needed
    InitializeDatabase()
end)

function InitializeDatabase()
    -- Check if tables exist, create if not
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `tablet_users` (
            `identifier` VARCHAR(60) NOT NULL,
            `phone_number` VARCHAR(20) DEFAULT NULL,
            `settings` LONGTEXT DEFAULT NULL,
            `installed_apps` LONGTEXT DEFAULT NULL,
            `dock_order` LONGTEXT DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`identifier`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])

    LSFiveTablet.Debug('Database tables verified')
end

--[[
    PLAYER HELPERS
]]
function GetPlayerIdentifier(source)
    local framework = LSFiveTablet.DetectFramework()
    local fw = LSFiveTablet.GetFramework()

    if framework == 'esx' then
        local xPlayer = fw.GetPlayerFromId(source)
        return xPlayer and xPlayer.identifier
    elseif framework == 'qbcore' then
        local Player = fw.Functions.GetPlayer(source)
        return Player and Player.PlayerData.citizenid
    else
        -- Standalone: use license
        for _, id in ipairs(GetPlayerIdentifiers(source)) do
            if string.match(id, 'license:') then
                return id
            end
        end
    end
    return nil
end

function GetPlayerName(source)
    local framework = LSFiveTablet.DetectFramework()
    local fw = LSFiveTablet.GetFramework()

    if framework == 'esx' then
        local xPlayer = fw.GetPlayerFromId(source)
        return xPlayer and xPlayer.getName() or GetPlayerName(source)
    elseif framework == 'qbcore' then
        local Player = fw.Functions.GetPlayer(source)
        if Player then
            local charinfo = Player.PlayerData.charinfo
            return charinfo.firstname .. ' ' .. charinfo.lastname
        end
    end
    return GetPlayerName(source) or 'Unknown'
end

function GetPlayerJob(source)
    local framework = LSFiveTablet.DetectFramework()
    local fw = LSFiveTablet.GetFramework()

    if framework == 'esx' then
        local xPlayer = fw.GetPlayerFromId(source)
        return xPlayer and xPlayer.job and xPlayer.job.name or 'unemployed'
    elseif framework == 'qbcore' then
        local Player = fw.Functions.GetPlayer(source)
        return Player and Player.PlayerData.job and Player.PlayerData.job.name or 'unemployed'
    end
    return 'civilian'
end

function GetPlayerBankBalance(source)
    local framework = LSFiveTablet.DetectFramework()
    local fw = LSFiveTablet.GetFramework()

    if framework == 'esx' then
        local xPlayer = fw.GetPlayerFromId(source)
        return xPlayer and xPlayer.getAccount('bank').money or 0
    elseif framework == 'qbcore' then
        local Player = fw.Functions.GetPlayer(source)
        return Player and Player.PlayerData.money.bank or 0
    end
    return 0
end

function GetPlayerPhoneNumber(source)
    local identifier = GetPlayerIdentifier(source)
    if not identifier then return nil end

    -- Check cache first
    if PlayerPhoneData[identifier] and PlayerPhoneData[identifier].phone_number then
        return PlayerPhoneData[identifier].phone_number
    end

    -- Fetch from database
    local result = MySQL.scalar.await('SELECT phone_number FROM tablet_users WHERE identifier = ?', { identifier })

    if result then
        return result
    end

    -- Generate new phone number
    local phoneNumber = LSFiveTablet.GeneratePhoneNumber()

    -- Save to database
    MySQL.insert.await('INSERT INTO tablet_users (identifier, phone_number) VALUES (?, ?) ON DUPLICATE KEY UPDATE phone_number = VALUES(phone_number)', {
        identifier, phoneNumber
    })

    return phoneNumber
end

--[[
    INITIAL DATA REQUEST
]]
RegisterNetEvent('lsfive-tablet:server:requestInitialData', function()
    local source = source
    local identifier = GetPlayerIdentifier(source)

    if not identifier then
        LSFiveTablet.Debug('No identifier for player ' .. source)
        return
    end

    -- Initialize player data if needed
    if not PlayerPhoneData[identifier] then
        PlayerPhoneData[identifier] = {}
    end

    -- Fetch all initial data
    local phoneNumber = GetPlayerPhoneNumber(source)
    local contacts = FetchContacts(identifier)
    local conversations = FetchConversations(identifier)
    local callHistory = FetchCallHistory(identifier)
    local bankAccount = {
        balance = GetPlayerBankBalance(source),
        transactions = FetchTransactions(identifier)
    }
    local vehicles = FetchVehicles(source)
    local songs = FetchSongs(identifier)
    local mails = FetchMails(identifier)
    local socialPosts = FetchSocialPosts()
    local settings = FetchSettings(identifier)
    local dispatchAlerts = FetchDispatchAlerts()

    local data = {
        phoneNumber = phoneNumber,
        contacts = contacts,
        conversations = conversations,
        callHistory = callHistory,
        bankAccount = bankAccount,
        vehicles = vehicles,
        songs = songs,
        mails = mails,
        socialPosts = socialPosts,
        settings = settings,
        dispatchAlerts = dispatchAlerts
    }

    TriggerClientEvent('lsfive-tablet:client:receiveInitialData', source, data)
end)

--[[
    CONTACTS
]]
function FetchContacts(identifier)
    local result = MySQL.query.await('SELECT * FROM tablet_contacts WHERE owner_identifier = ? ORDER BY name ASC', { identifier })
    return result or {}
end

RegisterNetEvent('lsfive-tablet:server:getContacts', function()
    local source = source
    local identifier = GetPlayerIdentifier(source)
    local contacts = FetchContacts(identifier)
    TriggerClientEvent('lsfive-tablet:client:receiveContacts', source, contacts)
end)

RegisterNetEvent('lsfive-tablet:server:addContact', function(data)
    local source = source
    local identifier = GetPlayerIdentifier(source)

    if not data.name or not data.phoneNumber then return end

    local name = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.name, 50))
    local phoneNumber = LSFiveTablet.ValidateString(data.phoneNumber, 20)
    local avatarUrl = LSFiveTablet.ValidateString(data.avatarUrl, 255)

    MySQL.insert('INSERT INTO tablet_contacts (owner_identifier, name, phone_number, avatar_url) VALUES (?, ?, ?, ?)', {
        identifier, name, phoneNumber, avatarUrl
    })

    LSFiveTablet.Notify(source, 'Contacts', 'Contact added', 'success')
end)

RegisterNetEvent('lsfive-tablet:server:deleteContact', function(contactId)
    local source = source
    local identifier = GetPlayerIdentifier(source)

    MySQL.execute('DELETE FROM tablet_contacts WHERE id = ? AND owner_identifier = ?', { contactId, identifier })
    LSFiveTablet.Notify(source, 'Contacts', 'Contact deleted', 'success')
end)

--[[
    MESSAGES
]]
function FetchConversations(identifier)
    local result = MySQL.query.await([[
        SELECT
            m.*,
            c.name as contact_name,
            c.avatar_url as contact_avatar
        FROM tablet_messages m
        LEFT JOIN tablet_contacts c ON c.phone_number = m.sender_number AND c.owner_identifier = ?
        WHERE m.receiver_identifier = ? OR m.sender_identifier = ?
        ORDER BY m.timestamp DESC
    ]], { identifier, identifier, identifier })

    -- Group by conversation
    local conversations = {}
    local conversationMap = {}

    for _, msg in ipairs(result or {}) do
        local otherNumber = msg.sender_identifier == identifier and msg.receiver_number or msg.sender_number

        if not conversationMap[otherNumber] then
            conversationMap[otherNumber] = {
                phoneNumber = otherNumber,
                contactName = msg.contact_name or otherNumber,
                avatarUrl = msg.contact_avatar,
                messages = {},
                lastMessage = msg.content,
                timestamp = msg.timestamp,
                unread = 0
            }
            table.insert(conversations, conversationMap[otherNumber])
        end

        table.insert(conversationMap[otherNumber].messages, {
            id = msg.id,
            content = msg.content,
            timestamp = LSFiveTablet.FormatTimestamp(msg.timestamp),
            isSender = msg.sender_identifier == identifier
        })

        if not msg.is_read and msg.receiver_identifier == identifier then
            conversationMap[otherNumber].unread = conversationMap[otherNumber].unread + 1
        end
    end

    return conversations
end

RegisterNetEvent('lsfive-tablet:server:getConversations', function()
    local source = source
    local identifier = GetPlayerIdentifier(source)
    local conversations = FetchConversations(identifier)
    TriggerClientEvent('lsfive-tablet:client:receiveConversations', source, conversations)
end)

RegisterNetEvent('lsfive-tablet:server:sendMessage', function(data)
    local source = source
    local identifier = GetPlayerIdentifier(source)
    local senderNumber = GetPlayerPhoneNumber(source)

    if not data.phoneNumber or not data.content then return end

    local content = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.content, 500))
    local receiverNumber = LSFiveTablet.ValidateString(data.phoneNumber, 20)

    -- Find receiver identifier
    local receiverIdentifier = MySQL.scalar.await('SELECT identifier FROM tablet_users WHERE phone_number = ?', { receiverNumber })

    MySQL.insert('INSERT INTO tablet_messages (sender_identifier, sender_number, receiver_identifier, receiver_number, content) VALUES (?, ?, ?, ?, ?)', {
        identifier, senderNumber, receiverIdentifier, receiverNumber, content
    })

    -- Notify receiver if online
    if receiverIdentifier then
        for _, playerId in ipairs(GetPlayers()) do
            local pIdentifier = GetPlayerIdentifier(playerId)
            if pIdentifier == receiverIdentifier then
                TriggerClientEvent('lsfive-tablet:client:newMessage', playerId, {
                    senderNumber = senderNumber,
                    senderName = GetPlayerName(source),
                    content = content,
                    timestamp = 'Now'
                })
                break
            end
        end
    end
end)

--[[
    CALLS
]]
function FetchCallHistory(identifier)
    local result = MySQL.query.await([[
        SELECT
            ch.*,
            c.name as contact_name,
            c.avatar_url as contact_avatar
        FROM tablet_calls ch
        LEFT JOIN tablet_contacts c ON c.phone_number = ch.other_number AND c.owner_identifier = ?
        WHERE ch.owner_identifier = ?
        ORDER BY ch.timestamp DESC
        LIMIT 50
    ]], { identifier, identifier })

    local calls = {}
    for _, call in ipairs(result or {}) do
        table.insert(calls, {
            id = call.id,
            contact = {
                id = call.id,
                name = call.contact_name or call.other_number,
                phoneNumber = call.other_number,
                avatarUrl = call.contact_avatar
            },
            direction = call.direction,
            timestamp = LSFiveTablet.FormatTimestamp(call.timestamp),
            isNew = call.is_new == 1
        })
    end

    return calls
end

RegisterNetEvent('lsfive-tablet:server:getCallHistory', function()
    local source = source
    local identifier = GetPlayerIdentifier(source)
    local history = FetchCallHistory(identifier)
    TriggerClientEvent('lsfive-tablet:client:receiveCallHistory', source, history)
end)

RegisterNetEvent('lsfive-tablet:server:makeCall', function(phoneNumber)
    local source = source
    local identifier = GetPlayerIdentifier(source)
    local callerNumber = GetPlayerPhoneNumber(source)

    -- Log outgoing call
    MySQL.insert('INSERT INTO tablet_calls (owner_identifier, other_number, direction) VALUES (?, ?, ?)', {
        identifier, phoneNumber, 'outgoing'
    })

    -- Find receiver
    local receiverIdentifier = MySQL.scalar.await('SELECT identifier FROM tablet_users WHERE phone_number = ?', { phoneNumber })

    if receiverIdentifier then
        -- Log incoming call for receiver
        MySQL.insert('INSERT INTO tablet_calls (owner_identifier, other_number, direction, is_new) VALUES (?, ?, ?, ?)', {
            receiverIdentifier, callerNumber, 'incoming', 1
        })

        -- Notify receiver
        for _, playerId in ipairs(GetPlayers()) do
            local pIdentifier = GetPlayerIdentifier(playerId)
            if pIdentifier == receiverIdentifier then
                TriggerClientEvent('lsfive-tablet:client:incomingCall', playerId, {
                    id = source,
                    name = GetPlayerName(source),
                    phoneNumber = callerNumber
                })

                -- Set up voice call if enabled
                if Config.EnableVoiceCalls then
                    SetupVoiceCall(source, playerId)
                end
                break
            end
        end
    end
end)

RegisterNetEvent('lsfive-tablet:server:endCall', function()
    local source = source
    -- End voice call if active
    if Config.EnableVoiceCalls then
        EndVoiceCall(source)
    end
end)

function SetupVoiceCall(caller, receiver)
    local voiceSystem = Config.VoiceSystem

    if voiceSystem == 'auto' then
        if GetResourceState('pma-voice') == 'started' then
            voiceSystem = 'pma-voice'
        elseif GetResourceState('mumble-voip') == 'started' then
            voiceSystem = 'mumble-voip'
        else
            return
        end
    end

    if voiceSystem == 'pma-voice' then
        local callChannel = 'tablet-call-' .. caller
        exports['pma-voice']:setPlayerCall(caller, callChannel)
        exports['pma-voice']:setPlayerCall(receiver, callChannel)
    end
end

function EndVoiceCall(source)
    local voiceSystem = Config.VoiceSystem

    if voiceSystem == 'auto' then
        if GetResourceState('pma-voice') == 'started' then
            voiceSystem = 'pma-voice'
        else
            return
        end
    end

    if voiceSystem == 'pma-voice' then
        exports['pma-voice']:setPlayerCall(source, nil)
    end
end

--[[
    BANK
]]
function FetchTransactions(identifier)
    local result = MySQL.query.await('SELECT * FROM tablet_transactions WHERE owner_identifier = ? ORDER BY timestamp DESC LIMIT 20', { identifier })

    local transactions = {}
    for _, tx in ipairs(result or {}) do
        table.insert(transactions, {
            id = tx.id,
            date = LSFiveTablet.FormatTimestamp(tx.timestamp),
            description = tx.description,
            amount = tx.amount,
            type = tx.type
        })
    end

    return transactions
end

RegisterNetEvent('lsfive-tablet:server:getBankAccount', function()
    local source = source
    local identifier = GetPlayerIdentifier(source)

    local account = {
        balance = GetPlayerBankBalance(source),
        transactions = FetchTransactions(identifier)
    }

    TriggerClientEvent('lsfive-tablet:client:receiveBankAccount', source, account)
end)

RegisterNetEvent('lsfive-tablet:server:transferMoney', function(data)
    local source = source
    local identifier = GetPlayerIdentifier(source)
    local framework = LSFiveTablet.DetectFramework()
    local fw = LSFiveTablet.GetFramework()

    if not data.phoneNumber or not data.amount then
        TriggerClientEvent('lsfive-tablet:client:transferResult', source, false, 'Invalid data')
        return
    end

    local amount = LSFiveTablet.ValidateNumber(data.amount, Config.MinimumTransfer, 999999999)
    if not amount then
        TriggerClientEvent('lsfive-tablet:client:transferResult', source, false, 'Invalid amount')
        return
    end

    -- Find receiver
    local receiverIdentifier = MySQL.scalar.await('SELECT identifier FROM tablet_users WHERE phone_number = ?', { data.phoneNumber })
    if not receiverIdentifier then
        TriggerClientEvent('lsfive-tablet:client:transferResult', source, false, 'Recipient not found')
        return
    end

    -- Check sender balance
    local balance = GetPlayerBankBalance(source)
    local fee = math.floor(amount * (Config.TransferFee / 100))
    local totalCost = amount + fee

    if balance < totalCost then
        TriggerClientEvent('lsfive-tablet:client:transferResult', source, false, 'Insufficient funds')
        return
    end

    -- Process transfer
    if framework == 'esx' then
        local xPlayer = fw.GetPlayerFromId(source)
        xPlayer.removeAccountMoney('bank', totalCost, 'Tablet transfer')

        -- Find receiver and add money
        for _, playerId in ipairs(GetPlayers()) do
            local pIdentifier = GetPlayerIdentifier(playerId)
            if pIdentifier == receiverIdentifier then
                local xReceiver = fw.GetPlayerFromId(playerId)
                xReceiver.addAccountMoney('bank', amount, 'Tablet transfer received')
                LSFiveTablet.Notify(playerId, 'Bank', 'You received ' .. LSFiveTablet.FormatCurrency(amount), 'success')
                break
            end
        end

    elseif framework == 'qbcore' then
        local Player = fw.Functions.GetPlayer(source)
        Player.Functions.RemoveMoney('bank', totalCost, 'Tablet transfer')

        for _, playerId in ipairs(GetPlayers()) do
            local pIdentifier = GetPlayerIdentifier(playerId)
            if pIdentifier == receiverIdentifier then
                local Receiver = fw.Functions.GetPlayer(playerId)
                Receiver.Functions.AddMoney('bank', amount, 'Tablet transfer received')
                LSFiveTablet.Notify(playerId, 'Bank', 'You received ' .. LSFiveTablet.FormatCurrency(amount), 'success')
                break
            end
        end
    end

    -- Log transactions
    MySQL.insert('INSERT INTO tablet_transactions (owner_identifier, amount, type, description) VALUES (?, ?, ?, ?)', {
        identifier, -totalCost, 'debit', 'Transfer to ' .. data.phoneNumber
    })
    MySQL.insert('INSERT INTO tablet_transactions (owner_identifier, amount, type, description) VALUES (?, ?, ?, ?)', {
        receiverIdentifier, amount, 'credit', 'Transfer received'
    })

    TriggerClientEvent('lsfive-tablet:client:transferResult', source, true, 'Transfer successful')
end)

--[[
    VEHICLES
]]
function FetchVehicles(source)
    local identifier = GetPlayerIdentifier(source)
    local framework = LSFiveTablet.DetectFramework()
    local vehicles = {}

    if framework == 'esx' then
        local result = MySQL.query.await('SELECT * FROM owned_vehicles WHERE owner = ?', { identifier })
        for _, v in ipairs(result or {}) do
            local vehicleData = json.decode(v.vehicle) or {}
            table.insert(vehicles, {
                id = v.plate,
                name = vehicleData.model or v.vehicle,
                plate = v.plate,
                status = v.stored == 1 and 'garaged' or 'out',
                imageUrl = nil
            })
        end
    elseif framework == 'qbcore' then
        local result = MySQL.query.await('SELECT * FROM player_vehicles WHERE citizenid = ?', { identifier })
        for _, v in ipairs(result or {}) do
            table.insert(vehicles, {
                id = v.plate,
                name = v.vehicle,
                plate = v.plate,
                status = v.state == 1 and 'garaged' or (v.state == 0 and 'out' or 'impounded'),
                imageUrl = nil
            })
        end
    end

    return vehicles
end

RegisterNetEvent('lsfive-tablet:server:getVehicles', function()
    local source = source
    local vehicles = FetchVehicles(source)
    TriggerClientEvent('lsfive-tablet:client:receiveVehicles', source, vehicles)
end)

RegisterNetEvent('lsfive-tablet:server:requestVehicle', function(vehicleId)
    local source = source

    if not Config.EnableGarageSpawn then
        TriggerClientEvent('lsfive-tablet:client:vehicleSpawned', source, false, 'Vehicle spawn disabled')
        return
    end

    -- This is a basic implementation - you may want to integrate with your garage system
    TriggerClientEvent('lsfive-tablet:client:vehicleSpawned', source, true, 'Use your garage to spawn vehicles')
end)

--[[
    DISPATCH
]]
function FetchDispatchAlerts()
    local result = MySQL.query.await('SELECT * FROM tablet_dispatch ORDER BY timestamp DESC LIMIT ?', { Config.MaxDispatchAlerts })

    local alerts = {}
    for _, alert in ipairs(result or {}) do
        table.insert(alerts, {
            id = alert.id,
            department = alert.department,
            title = alert.title,
            details = alert.details,
            location = alert.location,
            timestamp = LSFiveTablet.FormatTimestamp(alert.timestamp)
        })
    end

    return alerts
end

RegisterNetEvent('lsfive-tablet:server:getDispatchAlerts', function()
    local source = source
    local alerts = FetchDispatchAlerts()
    TriggerClientEvent('lsfive-tablet:client:receiveDispatchAlerts', source, alerts)
end)

RegisterNetEvent('lsfive-tablet:server:createDispatchAlert', function(data)
    local source = source

    if not data.department or not data.title then return end

    local title = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.title, 100))
    local details = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.details, 500))
    local location = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.location, 100))
    local department = data.department

    local alertId = MySQL.insert.await('INSERT INTO tablet_dispatch (department, title, details, location) VALUES (?, ?, ?, ?)', {
        department, title, details, location
    })

    local alert = {
        id = alertId,
        department = department,
        title = title,
        details = details,
        location = location,
        timestamp = 'Now'
    }

    -- Broadcast to relevant players
    for _, playerId in ipairs(GetPlayers()) do
        local job = GetPlayerJob(playerId)
        local jobGroup = LSFiveTablet.GetJobGroup(job)

        -- Send to all LEO for police, all EMS for ambulance, etc.
        local shouldReceive = false
        if department == 'police' and jobGroup == 'leo' then
            shouldReceive = true
        elseif department == 'ambulance' and jobGroup == 'ems' then
            shouldReceive = true
        elseif department == 'fire' and (jobGroup == 'ems' or job == 'fire' or job == 'lsfd') then
            shouldReceive = true
        elseif department == 'citizen' then
            shouldReceive = true
        end

        if shouldReceive then
            TriggerClientEvent('lsfive-tablet:client:newDispatchAlert', playerId, alert)
        end
    end
end)

-- Export for external resources
exports('SendDispatchAlert', function(department, title, details, location, coords)
    local data = {
        department = department,
        title = title,
        details = details,
        location = location
    }

    local alertId = MySQL.insert.await('INSERT INTO tablet_dispatch (department, title, details, location) VALUES (?, ?, ?, ?)', {
        department, title, details, location
    })

    local alert = {
        id = alertId,
        department = department,
        title = title,
        details = details,
        location = location,
        timestamp = 'Now',
        coords = coords
    }

    -- Broadcast
    for _, playerId in ipairs(GetPlayers()) do
        local job = GetPlayerJob(playerId)
        local jobGroup = LSFiveTablet.GetJobGroup(job)

        local shouldReceive = (department == 'police' and jobGroup == 'leo') or
                              (department == 'ambulance' and jobGroup == 'ems') or
                              (department == 'fire' and jobGroup == 'ems') or
                              department == 'citizen'

        if shouldReceive then
            TriggerClientEvent('lsfive-tablet:client:newDispatchAlert', playerId, alert)
        end
    end

    return alertId
end)

--[[
    MUSIC
]]
function FetchSongs(identifier)
    local result = MySQL.query.await('SELECT * FROM tablet_songs WHERE owner_identifier = ? ORDER BY title ASC', { identifier })

    local songs = {}
    for _, song in ipairs(result or {}) do
        table.insert(songs, {
            id = tostring(song.id),
            title = song.title,
            artist = song.artist,
            url = song.url
        })
    end

    return songs
end

RegisterNetEvent('lsfive-tablet:server:getSongs', function()
    local source = source
    local identifier = GetPlayerIdentifier(source)
    local songs = FetchSongs(identifier)
    TriggerClientEvent('lsfive-tablet:client:receiveSongs', source, songs)
end)

RegisterNetEvent('lsfive-tablet:server:addSong', function(data)
    local source = source
    local identifier = GetPlayerIdentifier(source)

    if not data.title or not data.url then return end

    local title = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.title, 100))
    local artist = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.artist, 100)) or 'Unknown'
    local url = LSFiveTablet.ValidateString(data.url, 500)

    MySQL.insert('INSERT INTO tablet_songs (owner_identifier, title, artist, url) VALUES (?, ?, ?, ?)', {
        identifier, title, artist, url
    })

    LSFiveTablet.Notify(source, 'Music', 'Song added', 'success')
end)

RegisterNetEvent('lsfive-tablet:server:deleteSong', function(songId)
    local source = source
    local identifier = GetPlayerIdentifier(source)

    MySQL.execute('DELETE FROM tablet_songs WHERE id = ? AND owner_identifier = ?', { songId, identifier })
end)

--[[
    MAIL
]]
function FetchMails(identifier)
    local result = MySQL.query.await('SELECT * FROM tablet_mails WHERE receiver_identifier = ? ORDER BY timestamp DESC LIMIT ?', { identifier, Config.MaxMailsPerPlayer })

    local mails = {}
    for _, mail in ipairs(result or {}) do
        table.insert(mails, {
            id = tostring(mail.id),
            from = mail.sender_email,
            subject = mail.subject,
            body = mail.body,
            timestamp = LSFiveTablet.FormatTimestamp(mail.timestamp),
            isRead = mail.is_read == 1
        })
    end

    return mails
end

RegisterNetEvent('lsfive-tablet:server:getMails', function()
    local source = source
    local identifier = GetPlayerIdentifier(source)
    local mails = FetchMails(identifier)
    TriggerClientEvent('lsfive-tablet:client:receiveMails', source, mails)
end)

RegisterNetEvent('lsfive-tablet:server:sendMail', function(data)
    local source = source
    local identifier = GetPlayerIdentifier(source)
    local senderEmail = GetPlayerName(source):gsub(' ', '.'):lower() .. '@' .. Config.EmailDomain

    if not data.to or not data.subject or not data.body then return end

    local toEmail = LSFiveTablet.ValidateString(data.to, 100)
    local subject = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.subject, 100))
    local body = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.body, 2000))

    -- Find receiver by email pattern (name@domain)
    -- This is simplified - you may want more sophisticated email lookup
    MySQL.insert('INSERT INTO tablet_mails (sender_identifier, sender_email, receiver_identifier, receiver_email, subject, body) VALUES (?, ?, ?, ?, ?, ?)', {
        identifier, senderEmail, nil, toEmail, subject, body
    })

    LSFiveTablet.Notify(source, 'Mail', 'Email sent', 'success')
end)

RegisterNetEvent('lsfive-tablet:server:deleteMail', function(mailId)
    local source = source
    local identifier = GetPlayerIdentifier(source)

    MySQL.execute('DELETE FROM tablet_mails WHERE id = ? AND receiver_identifier = ?', { mailId, identifier })
end)

--[[
    SOCIAL
]]
function FetchSocialPosts()
    local result = MySQL.query.await('SELECT * FROM tablet_social ORDER BY timestamp DESC LIMIT 50')

    local posts = {}
    for _, post in ipairs(result or {}) do
        table.insert(posts, {
            id = tostring(post.id),
            authorName = post.author_name,
            authorAvatarUrl = post.author_avatar,
            imageUrl = post.image_url,
            caption = post.caption,
            likes = post.likes or 0,
            isLiked = false, -- Would need per-user tracking
            timestamp = LSFiveTablet.FormatTimestamp(post.timestamp)
        })
    end

    return posts
end

RegisterNetEvent('lsfive-tablet:server:getSocialPosts', function()
    local source = source
    local posts = FetchSocialPosts()
    TriggerClientEvent('lsfive-tablet:client:receiveSocialPosts', source, posts)
end)

RegisterNetEvent('lsfive-tablet:server:createSocialPost', function(data)
    local source = source

    if not data.caption then return end

    local authorName = GetPlayerName(source)
    local caption = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.caption, Config.MaxPostLength))
    local imageUrl = LSFiveTablet.ValidateString(data.imageUrl, 500)

    MySQL.insert('INSERT INTO tablet_social (author_name, author_avatar, image_url, caption) VALUES (?, ?, ?, ?)', {
        authorName, nil, imageUrl, caption
    })

    LSFiveTablet.Notify(source, 'Social', 'Post created', 'success')
end)

RegisterNetEvent('lsfive-tablet:server:toggleLikePost', function(postId)
    local source = source
    -- Simple like increment - you may want per-user tracking
    MySQL.execute('UPDATE tablet_social SET likes = likes + 1 WHERE id = ?', { postId })
end)

--[[
    BUSINESSES
]]
RegisterNetEvent('lsfive-tablet:server:getBusinesses', function()
    local source = source

    -- Fetch from your business system or a static table
    local result = MySQL.query.await('SELECT * FROM tablet_businesses ORDER BY name ASC')

    local businesses = {}
    for _, biz in ipairs(result or {}) do
        table.insert(businesses, {
            id = tostring(biz.id),
            name = biz.name,
            type = biz.type,
            owner = biz.owner,
            logoUrl = biz.logo_url,
            description = biz.description,
            location = LSFiveTablet.JsonDecode(biz.location) or { x = 0, y = 0, z = 0 }
        })
    end

    TriggerClientEvent('lsfive-tablet:client:receiveBusinesses', source, businesses)
end)

--[[
    MDT (Law Enforcement)
]]
RegisterNetEvent('lsfive-tablet:server:mdtSearchCitizens', function(query)
    local source = source
    local job = GetPlayerJob(source)

    if not LSFiveTablet.IsJobInGroup(job, 'leo') then
        TriggerClientEvent('lsfive-tablet:client:receiveMdtCitizens', source, {})
        return
    end

    local framework = LSFiveTablet.DetectFramework()
    local citizens = {}

    if framework == 'esx' then
        local result = MySQL.query.await([[
            SELECT identifier, firstname, lastname, dateofbirth, sex
            FROM users
            WHERE firstname LIKE ? OR lastname LIKE ? OR identifier LIKE ?
            LIMIT 20
        ]], { '%'..query..'%', '%'..query..'%', '%'..query..'%' })

        for _, c in ipairs(result or {}) do
            table.insert(citizens, {
                identifier = c.identifier,
                name = c.firstname .. ' ' .. c.lastname,
                dateofbirth = c.dateofbirth or 'Unknown',
                gender = c.sex == 'm' and 'Male' or 'Female',
                image_url = nil,
                phone_number = nil
            })
        end

    elseif framework == 'qbcore' then
        local result = MySQL.query.await([[
            SELECT citizenid, charinfo
            FROM players
            WHERE JSON_EXTRACT(charinfo, '$.firstname') LIKE ?
               OR JSON_EXTRACT(charinfo, '$.lastname') LIKE ?
               OR citizenid LIKE ?
            LIMIT 20
        ]], { '%'..query..'%', '%'..query..'%', '%'..query..'%' })

        for _, c in ipairs(result or {}) do
            local charinfo = LSFiveTablet.JsonDecode(c.charinfo) or {}
            table.insert(citizens, {
                identifier = c.citizenid,
                name = (charinfo.firstname or '') .. ' ' .. (charinfo.lastname or ''),
                dateofbirth = charinfo.birthdate or 'Unknown',
                gender = charinfo.gender == 0 and 'Male' or 'Female',
                image_url = nil,
                phone_number = charinfo.phone
            })
        end
    end

    TriggerClientEvent('lsfive-tablet:client:receiveMdtCitizens', source, citizens)
end)

RegisterNetEvent('lsfive-tablet:server:getOnDutyUnits', function()
    local source = source
    local units = {}

    for identifier, data in pairs(OnDutyPlayers) do
        table.insert(units, {
            identifier = identifier,
            name = data.name,
            pos = data.pos or { x = 0, y = 0, z = 0 }
        })
    end

    TriggerClientEvent('lsfive-tablet:client:receiveOnDutyUnits', source, units)
end)

RegisterNetEvent('lsfive-tablet:server:mdtCreateIncident', function(data)
    local source = source
    local job = GetPlayerJob(source)

    if not LSFiveTablet.IsJobInGroup(job, 'leo') then return end

    local title = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.title, 100))
    local officers = LSFiveTablet.JsonEncode(data.officers or {})
    local civilians = LSFiveTablet.JsonEncode(data.civilians or {})

    MySQL.insert('INSERT INTO tablet_mdt_incidents (title, officers_involved, civilians_involved, created_by) VALUES (?, ?, ?, ?)', {
        title, officers, civilians, GetPlayerIdentifier(source)
    })

    LSFiveTablet.Notify(source, 'MDT', 'Incident created', 'success')
end)

RegisterNetEvent('lsfive-tablet:server:toggleDuty', function()
    local source = source
    local identifier = GetPlayerIdentifier(source)
    local name = GetPlayerName(source)

    if OnDutyPlayers[identifier] then
        OnDutyPlayers[identifier] = nil
        LSFiveTablet.Debug(name .. ' went off duty')
    else
        OnDutyPlayers[identifier] = {
            name = name,
            source = source,
            pos = nil
        }
        LSFiveTablet.Debug(name .. ' went on duty')
    end
end)

-- Update on-duty player positions
CreateThread(function()
    while true do
        Wait(5000)

        for identifier, data in pairs(OnDutyPlayers) do
            local playerId = data.source
            if playerId and GetPlayerPing(playerId) > 0 then
                local ped = GetPlayerPed(playerId)
                if ped then
                    local coords = GetEntityCoords(ped)
                    OnDutyPlayers[identifier].pos = { x = coords.x, y = coords.y, z = coords.z }
                end
            else
                OnDutyPlayers[identifier] = nil
            end
        end
    end
end)

--[[
    MEDITAB (EMS)
]]
RegisterNetEvent('lsfive-tablet:server:mediSearchRecords', function(query)
    local source = source
    local job = GetPlayerJob(source)

    if not LSFiveTablet.IsJobInGroup(job, 'ems') then
        TriggerClientEvent('lsfive-tablet:client:receiveMedicalRecords', source, {})
        return
    end

    local result = MySQL.query.await([[
        SELECT * FROM tablet_medical_records
        WHERE patient_name LIKE ? OR patient_identifier LIKE ?
        ORDER BY timestamp DESC
        LIMIT 20
    ]], { '%'..query..'%', '%'..query..'%' })

    local records = {}
    for _, r in ipairs(result or {}) do
        table.insert(records, {
            id = r.id,
            patient_identifier = r.patient_identifier,
            timestamp = LSFiveTablet.FormatTimestamp(r.timestamp),
            doctor = r.doctor,
            diagnosis = r.diagnosis,
            treatment = r.treatment,
            notes = r.notes
        })
    end

    TriggerClientEvent('lsfive-tablet:client:receiveMedicalRecords', source, records)
end)

RegisterNetEvent('lsfive-tablet:server:mediCreateRecord', function(data)
    local source = source
    local job = GetPlayerJob(source)

    if not LSFiveTablet.IsJobInGroup(job, 'ems') then return end

    local patientId = LSFiveTablet.ValidateString(data.patientId, 60)
    local patientName = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.patientName, 100))
    local diagnosis = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.diagnosis, 500))
    local treatment = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.treatment, 500))
    local notes = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.notes, 1000))
    local doctor = GetPlayerName(source)

    MySQL.insert('INSERT INTO tablet_medical_records (patient_identifier, patient_name, doctor, diagnosis, treatment, notes) VALUES (?, ?, ?, ?, ?, ?)', {
        patientId, patientName, doctor, diagnosis, treatment, notes
    })

    LSFiveTablet.Notify(source, 'MediTab', 'Medical record created', 'success')
end)

--[[
    MECHATAB (Mechanics)
]]
RegisterNetEvent('lsfive-tablet:server:mechaSearchVehicle', function(plate)
    local source = source
    local job = GetPlayerJob(source)

    if not LSFiveTablet.IsJobInGroup(job, 'mechanic') then
        TriggerClientEvent('lsfive-tablet:client:receiveMechaVehicle', source, nil)
        return
    end

    local framework = LSFiveTablet.DetectFramework()
    local vehicle = nil

    if framework == 'esx' then
        local result = MySQL.single.await('SELECT * FROM owned_vehicles WHERE plate = ?', { plate })
        if result then
            local vehicleData = LSFiveTablet.JsonDecode(result.vehicle) or {}
            vehicle = {
                plate = result.plate,
                model = vehicleData.model or result.vehicle,
                owner = result.owner
            }
        end
    elseif framework == 'qbcore' then
        local result = MySQL.single.await('SELECT * FROM player_vehicles WHERE plate = ?', { plate })
        if result then
            vehicle = {
                plate = result.plate,
                model = result.vehicle,
                owner = result.citizenid
            }
        end
    end

    TriggerClientEvent('lsfive-tablet:client:receiveMechaVehicle', source, vehicle)
end)

RegisterNetEvent('lsfive-tablet:server:mechaCreateInvoice', function(data)
    local source = source
    local job = GetPlayerJob(source)

    if not LSFiveTablet.IsJobInGroup(job, 'mechanic') then return end

    local customerName = LSFiveTablet.SanitizeInput(LSFiveTablet.ValidateString(data.customerName, 100))
    local vehiclePlate = LSFiveTablet.ValidateString(data.vehiclePlate, 20)
    local services = LSFiveTablet.JsonEncode(data.services or {})
    local total = LSFiveTablet.ValidateNumber(data.total, 0, 999999)
    local mechanic = GetPlayerName(source)

    MySQL.insert('INSERT INTO tablet_mechanic_invoices (customer_name, vehicle_plate, mechanic, services, total) VALUES (?, ?, ?, ?, ?)', {
        customerName, vehiclePlate, mechanic, services, total
    })

    LSFiveTablet.Notify(source, 'MechaTab', 'Invoice created', 'success')
end)

RegisterNetEvent('lsfive-tablet:server:mechaGetInvoices', function()
    local source = source
    local job = GetPlayerJob(source)

    if not LSFiveTablet.IsJobInGroup(job, 'mechanic') then
        TriggerClientEvent('lsfive-tablet:client:receiveMechaInvoices', source, {})
        return
    end

    local mechanic = GetPlayerName(source)
    local result = MySQL.query.await('SELECT * FROM tablet_mechanic_invoices WHERE mechanic = ? ORDER BY timestamp DESC LIMIT 50', { mechanic })

    local invoices = {}
    for _, inv in ipairs(result or {}) do
        table.insert(invoices, {
            id = inv.id,
            customer_name = inv.customer_name,
            vehicle_plate = inv.vehicle_plate,
            mechanic = inv.mechanic,
            timestamp = LSFiveTablet.FormatTimestamp(inv.timestamp),
            services = LSFiveTablet.JsonDecode(inv.services) or {},
            total = inv.total,
            is_paid = inv.is_paid == 1
        })
    end

    TriggerClientEvent('lsfive-tablet:client:receiveMechaInvoices', source, invoices)
end)

--[[
    SETTINGS
]]
function FetchSettings(identifier)
    local result = MySQL.single.await('SELECT settings, installed_apps, dock_order FROM tablet_users WHERE identifier = ?', { identifier })

    if result then
        return {
            settings = LSFiveTablet.JsonDecode(result.settings) or {},
            installedApps = LSFiveTablet.JsonDecode(result.installed_apps) or {},
            dockOrder = LSFiveTablet.JsonDecode(result.dock_order) or {}
        }
    end

    return {}
end

RegisterNetEvent('lsfive-tablet:server:getSettings', function()
    local source = source
    local identifier = GetPlayerIdentifier(source)
    local settings = FetchSettings(identifier)
    TriggerClientEvent('lsfive-tablet:client:receiveSettings', source, settings)
end)

RegisterNetEvent('lsfive-tablet:server:saveSettings', function(data)
    local source = source
    local identifier = GetPlayerIdentifier(source)

    local settings = LSFiveTablet.JsonEncode(data.settings or {})
    local installedApps = LSFiveTablet.JsonEncode(data.installedApps or {})
    local dockOrder = LSFiveTablet.JsonEncode(data.dockOrder or {})

    MySQL.execute('UPDATE tablet_users SET settings = ?, installed_apps = ?, dock_order = ? WHERE identifier = ?', {
        settings, installedApps, dockOrder, identifier
    })
end)

--[[
    EXPORTS
]]
exports('GetPlayerIdentifier', GetPlayerIdentifier)
exports('GetPlayerJob', GetPlayerJob)
exports('GetPlayerPhoneNumber', GetPlayerPhoneNumber)
exports('SendNotification', function(source, title, message, type)
    LSFiveTablet.Notify(source, title, message, type)
end)

--[[
    PLAYER DROP CLEANUP
]]
AddEventHandler('playerDropped', function()
    local source = source
    local identifier = GetPlayerIdentifier(source)

    if identifier then
        PlayerPhoneData[identifier] = nil
        OnDutyPlayers[identifier] = nil
    end
end)
