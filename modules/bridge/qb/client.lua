local qb = exports['qb-core']:GetCoreObject()

local function ReOrderJob(job)
    return {
        label = job.label,
        grade_label = job.grade.name,
        name = job.name,
        grade = job.grade.level,
        salary = job.grade.payment
    }
end

local function ReOrderPlayerData(data)
    return {
        identifier = data.citizenid,
        job = ReOrderJob(data.job),
    }
end

PlayerData = ReOrderPlayerData(qb.Functions.GetPlayerData())