-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-07-26
--
-- 函数说明：将旧 ModelScope 抠图模型配置迁移为外部抠图 API Provider。

UPDATE `la_system_config`
SET `value` = 'koukoutu',
    `update_time` = UNIX_TIMESTAMP()
WHERE `type` = 'ai_model'
  AND `name` = 'matting_model_id'
  AND `value` IN (
      'iic/cv_unet_image-matting',
      'iic/cv_unet_universal-matting'
  );

UPDATE `la_system_auth_menu`
SET `menu_name` = 'AI抠图 API',
    `update_time` = UNIX_TIMESTAMP()
WHERE `menu_type` = 'C'
  AND `paths` = 'ai_model';

INSERT INTO `la_system_config`
    (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT
    'ai_model',
    'matting_provider_configs',
    '[{"provider":"aliyun","label":"\\u963f\\u91cc\\u4e91\\u901a\\u7528\\u5206\\u5272","description":"\\u9002\\u5408\\u4eba\\u3001\\u52a8\\u7269\\u3001\\u98df\\u7269\\u3001\\u5546\\u54c1\\u548c\\u5bb6\\u5c45\\u7b49\\u89c6\\u89c9\\u4e2d\\u5fc3\\u4e3b\\u4f53\\u3002","apiUrl":"","apiKey":"","accessKeyId":"","accessKeySecret":"","endpoint":"imageseg.cn-shanghai.aliyuncs.com","timeoutSeconds":120},{"provider":"koukoutu","label":"\\u62a0\\u62a0\\u56fe API","description":"\\u540c\\u6b65\\u6587\\u4ef6\\u62a0\\u56fe\\uff0c\\u9002\\u5408\\u5feb\\u901f\\u63a5\\u5165\\u901a\\u7528\\u80cc\\u666f\\u79fb\\u9664\\u3002","apiUrl":"https://sync.koukoutu.com/v1/create","apiKey":"","accessKeyId":"","accessKeySecret":"","endpoint":"","timeoutSeconds":120}]',
    UNIX_TIMESTAMP(),
    UNIX_TIMESTAMP()
WHERE NOT EXISTS (
    SELECT 1
    FROM `la_system_config`
    WHERE `type` = 'ai_model'
      AND `name` = 'matting_provider_configs'
);

UPDATE `la_system_config`
SET `value` = JSON_SET(
        CAST(`value` AS JSON),
        '$[0].label', JSON_UNQUOTE('"\\u963f\\u91cc\\u4e91\\u901a\\u7528\\u5206\\u5272"'),
        '$[0].description', JSON_UNQUOTE('"\\u9002\\u5408\\u4eba\\u3001\\u52a8\\u7269\\u3001\\u98df\\u7269\\u3001\\u5546\\u54c1\\u548c\\u5bb6\\u5c45\\u7b49\\u89c6\\u89c9\\u4e2d\\u5fc3\\u4e3b\\u4f53\\u3002"'),
        '$[1].label', JSON_UNQUOTE('"\\u62a0\\u62a0\\u56fe API"'),
        '$[1].description', JSON_UNQUOTE('"\\u540c\\u6b65\\u6587\\u4ef6\\u62a0\\u56fe\\uff0c\\u9002\\u5408\\u5feb\\u901f\\u63a5\\u5165\\u901a\\u7528\\u80cc\\u666f\\u79fb\\u9664\\u3002"')
    ),
    `update_time` = UNIX_TIMESTAMP()
WHERE `type` = 'ai_model'
  AND `name` = 'matting_provider_configs'
  AND `value` LIKE '%?%';
