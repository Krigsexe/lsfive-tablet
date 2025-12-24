--[[
    ============================================================
    LSFIVE TABLET - SHARED FUNCTIONS
    ============================================================
    Version: 2.0.0
    Fonctions utilitaires partagees client/serveur
    Compatible: ESX, QBCore, Standalone
    ============================================================
]]

LSFiveTablet = LSFiveTablet or {}

-- Framework detection cache
LSFiveTablet.Framework = nil
LSFiveTablet.FrameworkObject = nil
LSFiveTablet.PhoneResourceAvailable = nil

--[[
    ============================================================
    FRAMEWORK DETECTION
    ============================================================
]]
function LSFiveTablet.DetectFramework()
    if LSFiveTablet.Framework then
        return LSFiveTablet.Framework
    end

    if Config.Framework ~= 'auto' then
        LSFiveTablet.Framework = Config.Framework
        return LSFiveTablet.Framework
    end

    -- Auto-detect in order of priority
    if GetResourceState('es_extended') == 'started' then
        LSFiveTablet.Framework = 'esx'
    elseif GetResourceState('qb-core') == 'started' then
        LSFiveTablet.Framework = 'qbcore'
    else
        LSFiveTablet.Framework = 'standalone'
    end

    LSFiveTablet.Debug('Framework detected: ' .. LSFiveTablet.Framework)
    return LSFiveTablet.Framework
end

--[[
    GET FRAMEWORK OBJECT
]]
function LSFiveTablet.GetFramework()
    if LSFiveTablet.FrameworkObject then
        return LSFiveTablet.FrameworkObject
    end

    local framework = LSFiveTablet.DetectFramework()

    if framework == 'esx' then
        LSFiveTablet.FrameworkObject = exports['es_extended']:getSharedObject()
    elseif framework == 'qbcore' then
        LSFiveTablet.FrameworkObject = exports['qb-core']:GetCoreObject()
    end

    return LSFiveTablet.FrameworkObject
end

--[[
    ============================================================
    LSFIVE-PHONE INTEGRATION
    ============================================================
]]
function LSFiveTablet.IsPhoneAvailable()
    if LSFiveTablet.PhoneResourceAvailable ~= nil then
        return LSFiveTablet.PhoneResourceAvailable
    end

    local phoneResource = Config.PhoneIntegration and Config.PhoneIntegration.resourceName or 'lsfive-phone'
    LSFiveTablet.PhoneResourceAvailable = GetResourceState(phoneResource) == 'started'

    if LSFiveTablet.PhoneResourceAvailable then
        LSFiveTablet.Debug('Phone integration available: ' .. phoneResource)
    end

    return LSFiveTablet.PhoneResourceAvailable
end

-- Sync data with phone resource
function LSFiveTablet.SyncWithPhone(source, dataType, data)
    if not Config.PhoneIntegration or not Config.PhoneIntegration.enabled then
        return false
    end

    if not LSFiveTablet.IsPhoneAvailable() then
        return false
    end

    local phoneResource = Config.PhoneIntegration.resourceName or 'lsfive-phone'

    -- Sync based on data type
    if dataType == 'contacts' and Config.PhoneIntegration.syncContacts then
        TriggerEvent(phoneResource .. ':syncContacts', source, data)
        return true
    elseif dataType == 'messages' and Config.PhoneIntegration.syncMessages then
        TriggerEvent(phoneResource .. ':syncMessages', source, data)
        return true
    elseif dataType == 'callHistory' and Config.PhoneIntegration.syncCallHistory then
        TriggerEvent(phoneResource .. ':syncCallHistory', source, data)
        return true
    elseif dataType == 'notification' and Config.PhoneIntegration.crossNotifications then
        TriggerEvent(phoneResource .. ':newNotification', source, data)
        return true
    end

    return false
end

-- Get phone number from phone resource (if available)
function LSFiveTablet.GetPhoneNumberFromPhone(identifier)
    if not Config.PhoneIntegration or not Config.PhoneIntegration.sharePhoneNumber then
        return nil
    end

    if not LSFiveTablet.IsPhoneAvailable() then
        return nil
    end

    local phoneResource = Config.PhoneIntegration.resourceName or 'lsfive-phone'

    -- Try to get phone number from phone resource
    local success, phoneNumber = pcall(function()
        return exports[phoneResource]:GetPlayerPhoneNumber(identifier)
    end)

    if success and phoneNumber then
        return phoneNumber
    end

    return nil
end

--[[
    ============================================================
    JOB GROUP FUNCTIONS
    ============================================================
]]
function LSFiveTablet.IsJobInGroup(job, group)
    if not job or not group then return false end

    local jobGroups = Config.JobGroups[group]
    if not jobGroups then return false end

    for _, jobName in ipairs(jobGroups) do
        if job == jobName then
            return true
        end
    end

    return false
end

function LSFiveTablet.GetJobGroup(job)
    if not job then return nil end

    for groupName, jobs in pairs(Config.JobGroups) do
        for _, jobName in ipairs(jobs) do
            if job == jobName then
                return groupName
            end
        end
    end

    return nil
end

function LSFiveTablet.GetAllJobGroups(job)
    if not job then return {} end

    local groups = {}
    for groupName, jobs in pairs(Config.JobGroups) do
        for _, jobName in ipairs(jobs) do
            if job == jobName then
                table.insert(groups, groupName)
                break
            end
        end
    end

    return groups
end

--[[
    ============================================================
    PHONE NUMBER FUNCTIONS
    ============================================================
]]
function LSFiveTablet.FormatPhoneNumber(number)
    if not number then return nil end

    -- Remove non-numeric characters
    local cleaned = tostring(number):gsub('[^0-9]', '')

    -- Format with dashes for readability
    if #cleaned == 7 then
        return cleaned:sub(1, 3) .. '-' .. cleaned:sub(4, 7)
    elseif #cleaned == 10 then
        return '(' .. cleaned:sub(1, 3) .. ') ' .. cleaned:sub(4, 6) .. '-' .. cleaned:sub(7, 10)
    end

    return number
end

function LSFiveTablet.GeneratePhoneNumber()
    local length = Config.PhoneNumberLength or 4
    local min = 10^(length - 1)
    local max = (10^length) - 1
    local randomPart = math.random(min, max)

    return string.format(Config.PhoneFormat, randomPart)
end

function LSFiveTablet.IsValidPhoneNumber(number)
    if not number or type(number) ~= 'string' then
        return false
    end

    local cleaned = number:gsub('[^0-9]', '')
    return #cleaned >= 4 and #cleaned <= 15
end

--[[
    ============================================================
    TIMESTAMP FUNCTIONS
    ============================================================
]]
function LSFiveTablet.FormatTimestamp(timestamp)
    if not timestamp then
        return os.date('%H:%M')
    end

    local time = timestamp
    if type(timestamp) == 'string' then
        -- Try to parse MySQL datetime
        local pattern = '(%d+)-(%d+)-(%d+) (%d+):(%d+):(%d+)'
        local year, month, day, hour, min, sec = timestamp:match(pattern)
        if year then
            time = os.time({
                year = tonumber(year),
                month = tonumber(month),
                day = tonumber(day),
                hour = tonumber(hour),
                min = tonumber(min),
                sec = tonumber(sec)
            })
        else
            return timestamp
        end
    end

    local now = os.time()
    local diff = now - time

    if diff < 60 then
        return 'Now'
    elseif diff < 3600 then
        return math.floor(diff / 60) .. 'm'
    elseif diff < 86400 then
        return math.floor(diff / 3600) .. 'h'
    elseif diff < 604800 then
        return math.floor(diff / 86400) .. 'd'
    else
        return os.date('%d/%m', time)
    end
end

function LSFiveTablet.FormatFullTimestamp(timestamp)
    if not timestamp then
        return os.date('%d/%m/%Y %H:%M')
    end

    if type(timestamp) == 'string' then
        local pattern = '(%d+)-(%d+)-(%d+) (%d+):(%d+):(%d+)'
        local year, month, day, hour, min, sec = timestamp:match(pattern)
        if year then
            return string.format('%s/%s/%s %s:%s', day, month, year, hour, min)
        end
        return timestamp
    end

    return os.date('%d/%m/%Y %H:%M', timestamp)
end

--[[
    ============================================================
    CURRENCY FUNCTIONS
    ============================================================
]]
function LSFiveTablet.FormatCurrency(amount)
    if not amount then return '$0' end

    local formatted = tostring(math.floor(amount))
    local k
    while true do
        formatted, k = string.gsub(formatted, '^(-?%d+)(%d%d%d)', '%1,%2')
        if k == 0 then break end
    end

    return '$' .. formatted
end

--[[
    ============================================================
    DEBUG & LOGGING
    ============================================================
]]
function LSFiveTablet.Debug(...)
    if Config.Debug then
        local args = {...}
        local message = '[LSFive-Tablet] '
        for i, v in ipairs(args) do
            message = message .. tostring(v) .. ' '
        end
        print(message)
    end
end

function LSFiveTablet.Error(...)
    local args = {...}
    local message = '[LSFive-Tablet] [ERROR] '
    for i, v in ipairs(args) do
        message = message .. tostring(v) .. ' '
    end
    print(message)
end

--[[
    ============================================================
    NOTIFICATION HELPER
    ============================================================
]]
function LSFiveTablet.Notify(source, title, message, notifyType)
    notifyType = notifyType or 'info'

    if IsDuplicityVersion() then
        -- Server side
        if Config.UseOxLibNotifications then
            TriggerClientEvent('ox_lib:notify', source, {
                title = title,
                description = message,
                type = notifyType,
                position = Config.NotificationPosition,
                duration = Config.NotificationDuration
            })
        else
            TriggerClientEvent('lsfive-tablet:client:notify', source, title, message, notifyType)
        end

        -- Cross-notification to phone if enabled
        if Config.PhoneIntegration and Config.PhoneIntegration.crossNotifications then
            LSFiveTablet.SyncWithPhone(source, 'notification', {
                title = title,
                message = message,
                type = notifyType
            })
        end
    else
        -- Client side
        if Config.UseOxLibNotifications and lib then
            lib.notify({
                title = title,
                description = message,
                type = notifyType,
                position = Config.NotificationPosition,
                duration = Config.NotificationDuration
            })
        else
            -- Fallback native notification
            BeginTextCommandThefeedPost('STRING')
            AddTextComponentSubstringPlayerName(message)
            EndTextCommandThefeedPostTicker(false, true)
        end
    end
end

-- Play notification sound (client only)
function LSFiveTablet.PlayNotificationSound(notifyType)
    if IsDuplicityVersion() then return end

    if not Config.NotificationSounds or not Config.NotificationSounds.enabled then
        return
    end

    local sound = Config.NotificationSounds[notifyType] or Config.NotificationSounds.info
    if sound then
        PlaySoundFrontend(-1, sound.name, sound.set, true)
    end
end

--[[
    ============================================================
    JSON HELPERS
    ============================================================
]]
function LSFiveTablet.JsonEncode(data)
    local success, result = pcall(json.encode, data)
    if success then
        return result
    end
    LSFiveTablet.Error('JSON encode failed:', result)
    return '{}'
end

function LSFiveTablet.JsonDecode(str)
    if not str or str == '' or str == 'null' then
        return nil
    end

    local success, result = pcall(json.decode, str)
    if success then
        return result
    end
    LSFiveTablet.Error('JSON decode failed:', result)
    return nil
end

--[[
    ============================================================
    TABLE UTILITIES
    ============================================================
]]
function LSFiveTablet.TableContains(tbl, value)
    if not tbl then return false end

    for _, v in pairs(tbl) do
        if v == value then
            return true
        end
    end
    return false
end

function LSFiveTablet.TableMerge(t1, t2)
    for k, v in pairs(t2) do
        if type(v) == 'table' and type(t1[k]) == 'table' then
            LSFiveTablet.TableMerge(t1[k], v)
        else
            t1[k] = v
        end
    end
    return t1
end

function LSFiveTablet.TableLength(tbl)
    if not tbl then return 0 end

    local count = 0
    for _ in pairs(tbl) do
        count = count + 1
    end
    return count
end

function LSFiveTablet.TableCopy(tbl)
    if type(tbl) ~= 'table' then return tbl end

    local copy = {}
    for k, v in pairs(tbl) do
        if type(v) == 'table' then
            copy[k] = LSFiveTablet.TableCopy(v)
        else
            copy[k] = v
        end
    end
    return copy
end

--[[
    ============================================================
    VALIDATION FUNCTIONS
    ============================================================
]]
function LSFiveTablet.ValidateString(str, maxLength)
    if type(str) ~= 'string' then return nil end
    if maxLength and #str > maxLength then
        return str:sub(1, maxLength)
    end
    return str
end

function LSFiveTablet.ValidateNumber(num, min, max)
    num = tonumber(num)
    if not num then return nil end
    if min and num < min then return min end
    if max and num > max then return max end
    return num
end

function LSFiveTablet.ValidateEmail(email)
    if not email or type(email) ~= 'string' then
        return false
    end
    return email:match('^[%w._%+-]+@[%w.-]+%.[%a]+$') ~= nil
end

function LSFiveTablet.ValidateURL(url)
    if not url or type(url) ~= 'string' then
        return false
    end
    return url:match('^https?://[%w.-]+') ~= nil
end

--[[
    ============================================================
    SANITIZATION (XSS Prevention)
    ============================================================
]]
function LSFiveTablet.SanitizeInput(str)
    if type(str) ~= 'string' then return str end

    -- Remove potentially dangerous HTML/script tags
    str = str:gsub('<', '&lt;')
    str = str:gsub('>', '&gt;')
    str = str:gsub('"', '&quot;')
    str = str:gsub("'", '&#39;')

    return str
end

function LSFiveTablet.SanitizeSQL(str)
    if type(str) ~= 'string' then return str end

    -- Basic SQL injection prevention (use parameterized queries instead)
    str = str:gsub("'", "''")
    str = str:gsub('\\', '\\\\')

    return str
end

--[[
    ============================================================
    IMAGE URL VALIDATION
    ============================================================
]]
function LSFiveTablet.IsValidImageHost(url)
    if not url or type(url) ~= 'string' then
        return false
    end

    if not Config.ImageHostWhitelist then
        return true
    end

    for _, domain in ipairs(Config.ImageHostWhitelist) do
        if url:find(domain, 1, true) then
            return true
        end
    end

    return false
end

--[[
    ============================================================
    DISTANCE CALCULATION (Client only)
    ============================================================
]]
function LSFiveTablet.GetDistance(coords1, coords2)
    if IsDuplicityVersion() then
        -- Server side - use simple calculation
        local dx = coords1.x - coords2.x
        local dy = coords1.y - coords2.y
        local dz = (coords1.z or 0) - (coords2.z or 0)
        return math.sqrt(dx*dx + dy*dy + dz*dz)
    else
        -- Client side - use native
        return #(vector3(coords1.x, coords1.y, coords1.z) - vector3(coords2.x, coords2.y, coords2.z))
    end
end

--[[
    ============================================================
    RESOURCE STATE CHECK
    ============================================================
]]
function LSFiveTablet.IsResourceStarted(resourceName)
    return GetResourceState(resourceName) == 'started'
end

--[[
    ============================================================
    LOCALIZATION HELPER
    ============================================================
]]
LSFiveTablet.Locales = {}

function LSFiveTablet.LoadLocale(lang)
    local localeFile = LoadResourceFile(GetCurrentResourceName(), 'locales/' .. lang .. '.json')
    if localeFile then
        LSFiveTablet.Locales[lang] = LSFiveTablet.JsonDecode(localeFile)
        LSFiveTablet.Debug('Loaded locale:', lang)
        return true
    end
    return false
end

function LSFiveTablet.Translate(key, lang)
    lang = lang or Config.DefaultLanguage or 'en'

    if not LSFiveTablet.Locales[lang] then
        LSFiveTablet.LoadLocale(lang)
    end

    local locale = LSFiveTablet.Locales[lang]
    if locale and locale[key] then
        return locale[key]
    end

    -- Fallback to English
    if lang ~= 'en' then
        if not LSFiveTablet.Locales['en'] then
            LSFiveTablet.LoadLocale('en')
        end
        if LSFiveTablet.Locales['en'] and LSFiveTablet.Locales['en'][key] then
            return LSFiveTablet.Locales['en'][key]
        end
    end

    return key
end

-- Shorthand
function _T(key, lang)
    return LSFiveTablet.Translate(key, lang)
end
