-- AI Provider 配置中文乱码修复补丁
-- 适用场景：历史库中的 ai_provider_configs 标签与说明被写成 ????，导致后台 AI Provider 管理页出现乱码。

SET NAMES utf8mb4;

START TRANSACTION;

UPDATE la_system_config
SET `value` = CAST(
    JSON_SET(
        CAST(`value` AS JSON),
        '$[0].label', 'SiliconFlow',
        '$[0].description', '适合当前站内多数 DeepSeek/写作/搜索工具，兼容现有模型列表。',
        '$[1].label', 'DeepSeek 官方',
        '$[1].description', '适合官方 deepseek-chat / deepseek-reasoner 场景。',
        '$[2].label', 'Kimi / Moonshot',
        '$[2].description', '适合配置 Moonshot Chat Completions 接口，默认模型可自行填写。',
        '$[3].label', '豆包 / 火山方舟',
        '$[3].description', '适合配置火山引擎方舟接入点，默认模型请填写你的 Endpoint ID。',
        '$[4].label', 'OpenAI 兼容接口',
        '$[4].description', '适合兼容 OpenAI Chat Completions 协议的模型网关与自建中转。'
    ) AS CHAR CHARACTER SET utf8mb4
) 
WHERE `type` = 'ai_model'
  AND `name` = 'ai_provider_configs'
  AND `value` REGEXP '\\?{2,}|�';

COMMIT;
