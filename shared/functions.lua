--[[
    LSFIVE TABLET - SHARED FUNCTIONS
    Fonctions utilitaires partagées client/serveur
]]

LSFiveTablet = LSFiveTablet or {}

-- Framework detection cache
LSFiveTablet.Framework = nil
LSFiveTablet.FrameworkObject = nil

--[[
    FRAMEWORK DETECTION
]]
function LSFiveTablet.DetectFramework()
    if LSFiveTablet.Framework then
        return LSFiveTablet.Framework
    end

    if Config.Framework ~= 'auto' then
        LSFiveTablet.Framework = Config.Framework
        return LSFiveTablet.Framework
    end

    -- Auto-detect
    if GetResourceState('es_extended') == 'started' then
        LSFiveTablet.Framework = 'esx'
    elseif GetResourceState('qb-core') == 'started' then
        LSFiveTablet.Framework = 'qbcore'
    else
        LSFiveTablet.Framework = 'standalone'
    end

    if Config.Debug then
        print('[LSFive-Tablet] Framework detected: ' .. LSFiveTablet.Framework)
    end

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
    JOB GROUP CHECK
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

--[[
    GET JOB GROUP
]]
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

--[[
    FORMAT PHONE NUMBER
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

--[[
    GENERATE PHONE NUMBER
]]
function LSFiveTablet.GeneratePhoneNumber()
    local length = Config.PhoneNumberLength or 4
    local min = 10^(length - 1)
    local max = (10^length) - 1
    local randomPart = math.random(min, max)

    return string.format(Config.PhoneFormat, randomPart)
end

--[[
    FORMAT TIMESTAMP
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

--[[
    FORMAT CURRENCY
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
    DEBUG PRINT
]]
function LSFiveTablet.Debug(...)
    if Config.Debug then
        print('[LSFive-Tablet]', ...)
    end
end

--[[
    NOTIFICATION HELPER
]]
function LSFiveTablet.Notify(source, title, message, type)
    type = type or 'info'

    if IsDuplicityVersion() then
        -- Server side
        if Config.UseOxLibNotifications then
            TriggerClientEvent('ox_lib:notify', source, {
                title = title,
                description = message,
                type = type,
                position = Config.NotificationPosition
            })
        else
            TriggerClientEvent('lsfive-tablet:client:notify', source, title, message, type)
        end
    else
        -- Client side
        if Config.UseOxLibNotifications and lib then
            lib.notify({
                title = title,
                description = message,
                type = type,
                position = Config.NotificationPosition
            })
        else
            -- Fallback native notification
            BeginTextCommandThefeedPost('STRING')
            AddTextComponentSubstringPlayerName(message)
            EndTextCommandThefeedPostTicker(false, true)
        end
    end
end

--[[
    SAFE JSON ENCODE
]]
function LSFiveTablet.JsonEncode(data)
    local success, result = pcall(json.encode, data)
    if success then
        return result
    end
    return '{}'
end

--[[
    SAFE JSON DECODE
]]
function LSFiveTablet.JsonDecode(str)
    if not str or str == '' or str == 'null' then
        return nil
    end

    local success, result = pcall(json.decode, str)
    if success then
        return result
    end
    return nil
end

--[[
    TABLE UTILITIES
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

--[[
    VALIDATE DATA TYPES
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

--[[
    SANITIZE INPUT (XSS Prevention)
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
