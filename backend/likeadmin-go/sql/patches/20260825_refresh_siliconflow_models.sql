-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-08-25
-- 将 SiliconFlow 已下线的旧模型 ID 迁移为当前可用模型，保留用户已配置的 API Key。

SET NAMES utf8mb4;
START TRANSACTION;

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B', 'deepseek-ai/DeepSeek-V3.2')
WHERE `type` = 'ai_model' AND `name` = 'ai_provider_configs';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, 'deepseek-ai/DeepSeek-R1-Distill-Llama-8B', 'deepseek-ai/DeepSeek-V3.2')
WHERE `type` = 'ai_model' AND `name` = 'ai_provider_configs';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B', 'deepseek-ai/DeepSeek-V3.2')
WHERE `type` = 'ai_model' AND `name` = 'ai_provider_configs';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B', 'deepseek-ai/DeepSeek-V3.2')
WHERE `type` = 'ai_model' AND `name` = 'ai_provider_configs';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B', 'deepseek-ai/DeepSeek-V3.2')
WHERE `type` = 'ai_model' AND `name` = 'ai_provider_configs';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '"defaultModel":"deepseek-ai/DeepSeek-V3"', '"defaultModel":"deepseek-ai/DeepSeek-V3.2"')
WHERE `type` = 'ai_model' AND `name` = 'ai_provider_configs';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, 'Qwen/Qwen2.5-72B-Instruct', 'Qwen/Qwen3-32B')
WHERE `type` = 'ai_model' AND `name` = 'ai_provider_configs';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, 'THUDM/glm-4-9b-chat', 'Qwen/Qwen3-8B')
WHERE `type` = 'ai_model' AND `name` = 'ai_provider_configs';

COMMIT;
