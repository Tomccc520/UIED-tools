-- AI Provider + 图片 AI 能力默认配置补丁
-- 执行库：uiedtool
-- 说明：补齐 ai_model.matting_model_id、ai_model.ai_provider_configs 与 ai_model.ai_image_ability_configs，
--      供后台 AI 模型管理、前台 AI Provider 代理与图片 AI 代理统一读取

SET NAMES utf8mb4;
START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();
SET @matting_model_id = 'iic/cv_unet_universal-matting';
SET @ai_provider_configs = '[{"provider":"siliconflow","label":"SiliconFlow","description":"适合当前站内多数 DeepSeek/写作/搜索工具，兼容现有模型列表。","enabled":true,"isDefault":true,"baseUrl":"https://api.siliconflow.cn/v1","apiKey":"","defaultModel":"deepseek-ai/DeepSeek-R1-Distill-Qwen-7B"},{"provider":"deepseek","label":"DeepSeek 官方","description":"适合官方 deepseek-chat / deepseek-reasoner 场景。","enabled":false,"isDefault":false,"baseUrl":"https://api.deepseek.com/v1","apiKey":"","defaultModel":"deepseek-chat"},{"provider":"kimi","label":"Kimi / Moonshot","description":"适合配置 Moonshot Chat Completions 接口，默认模型可自行填写。","enabled":false,"isDefault":false,"baseUrl":"https://api.moonshot.cn/v1","apiKey":"","defaultModel":"moonshot-v1-8k"},{"provider":"doubao","label":"豆包 / 火山方舟","description":"适合配置火山引擎方舟接入点，默认模型请填写你的 Endpoint ID。","enabled":false,"isDefault":false,"baseUrl":"https://ark.cn-beijing.volces.com/api/v3","apiKey":"","defaultModel":""},{"provider":"openai","label":"OpenAI 兼容接口","description":"适合兼容 OpenAI Chat Completions 协议的模型网关与自建中转。","enabled":false,"isDefault":false,"baseUrl":"https://api.openai.com/v1","apiKey":"","defaultModel":""}]';
SET @ai_image_ability_configs = '[{"ability":"prompt_reverse","label":"图片提示词反推","description":"上传图片后反推提示词，供 Prompt Reverse 页面使用。","enabled":true,"method":"POST","upstreamUrl":"https://api.pearktrue.cn/api/prompt_image","apiKeyHeader":"","apiKey":"","timeoutSeconds":90},{"ability":"stable_diffusion","label":"Stable Diffusion 绘图","description":"根据提示词生成图片，供 StableDiffusion 页面使用。","enabled":true,"method":"GET","upstreamUrl":"https://api.pearktrue.cn/api/stablediffusion/","apiKeyHeader":"","apiKey":"","timeoutSeconds":120},{"ability":"ai_qrcode","label":"AI 二维码","description":"根据提示词与链接生成 AI 艺术二维码。","enabled":true,"method":"GET","upstreamUrl":"https://api.pearktrue.cn/api/aiqrcode/","apiKeyHeader":"","apiKey":"","timeoutSeconds":120},{"ability":"ocr","label":"OCR 图像识别","description":"识别图片文字内容，兼容文件上传与图片 URL 输入。","enabled":true,"method":"POST","upstreamUrl":"https://api.pearktrue.cn/api/ocr/","apiKeyHeader":"","apiKey":"","timeoutSeconds":90},{"ability":"image_enhance","label":"图像增强","description":"上传图片后执行清晰化增强，供 ImageEnhance 页面使用。","enabled":true,"method":"POST","upstreamUrl":"https://api.pearktrue.cn/api/imagedistinct/","apiKeyHeader":"","apiKey":"","timeoutSeconds":120},{"ability":"text_to_speech","label":"文本配音生成","description":"根据文本、角色和风格生成语音音频，供 TextToSpeech 页面使用。","enabled":true,"method":"GET","upstreamUrl":"https://api.pearktrue.cn/api/freedub","apiKeyHeader":"","apiKey":"","timeoutSeconds":120}]';

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'ai_model', 'matting_model_id', @matting_model_id, @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM la_system_config WHERE `type` = 'ai_model' AND `name` = 'matting_model_id'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'ai_model', 'ai_provider_configs', @ai_provider_configs, @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM la_system_config WHERE `type` = 'ai_model' AND `name` = 'ai_provider_configs'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'ai_model', 'ai_image_ability_configs', @ai_image_ability_configs, @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM la_system_config WHERE `type` = 'ai_model' AND `name` = 'ai_image_ability_configs'
);

COMMIT;
