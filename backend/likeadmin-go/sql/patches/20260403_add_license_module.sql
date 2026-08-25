-- 源码授权模块补丁（支持重复执行）
-- 执行库：uiedtool
-- 目标：授权表升级 + 授权配置 + 官网设置授权菜单与权限

SET NAMES utf8mb4;
START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

CREATE TABLE IF NOT EXISTS `la_system_license` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `license_key` varchar(255) NOT NULL DEFAULT '' COMMENT '授权码',
  `customer_name` varchar(120) NOT NULL DEFAULT '' COMMENT '客户名称',
  `contact_name` varchar(120) NOT NULL DEFAULT '' COMMENT '联系人',
  `contact_mobile` varchar(60) NOT NULL DEFAULT '' COMMENT '联系电话',
  `contact_email` varchar(120) NOT NULL DEFAULT '' COMMENT '联系邮箱',
  `product_code` varchar(120) NOT NULL DEFAULT '' COMMENT '产品编码',
  `bound_domain` varchar(255) NOT NULL DEFAULT '' COMMENT '绑定域名',
  `machine_code` varchar(255) NOT NULL DEFAULT '' COMMENT '机器码',
  `edition` varchar(32) NOT NULL DEFAULT 'free' COMMENT '授权版本',
  `raw_status` varchar(64) NOT NULL DEFAULT 'inactive' COMMENT '原始授权状态',
  `company_name` varchar(120) NOT NULL DEFAULT '' COMMENT '公司名称',
  `domain_limit` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '域名额度',
  `domain_whitelist` text NULL COMMENT '授权域名白名单(JSON)',
  `signature` mediumtext NULL COMMENT '授权签名串',
  `sign_version` varchar(32) NOT NULL DEFAULT '' COMMENT '签名版本',
  `is_signature_valid` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '签名是否有效',
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '授权状态:0未激活,1已授权,2已过期,3已冻结',
  `expire_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '过期时间',
  `activated_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '激活时间',
  `last_verify_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '最近校验时间',
  `last_verify_message` varchar(255) NOT NULL DEFAULT '' COMMENT '最近校验说明',
  `last_verify_payload` mediumtext NULL COMMENT '最近校验原始结果',
  `remark` varchar(500) NOT NULL DEFAULT '' COMMENT '备注',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='源码授权配置表';

SET @license_add_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'la_system_license' AND COLUMN_NAME = 'edition') = 0,
  "ALTER TABLE `la_system_license` ADD COLUMN `edition` varchar(32) NOT NULL DEFAULT 'free' COMMENT '授权版本' AFTER `machine_code`",
  'SELECT 1'
);
PREPARE stmt FROM @license_add_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @license_add_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'la_system_license' AND COLUMN_NAME = 'raw_status') = 0,
  "ALTER TABLE `la_system_license` ADD COLUMN `raw_status` varchar(64) NOT NULL DEFAULT 'inactive' COMMENT '原始授权状态' AFTER `edition`",
  'SELECT 1'
);
PREPARE stmt FROM @license_add_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @license_add_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'la_system_license' AND COLUMN_NAME = 'company_name') = 0,
  "ALTER TABLE `la_system_license` ADD COLUMN `company_name` varchar(120) NOT NULL DEFAULT '' COMMENT '公司名称' AFTER `raw_status`",
  'SELECT 1'
);
PREPARE stmt FROM @license_add_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @license_add_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'la_system_license' AND COLUMN_NAME = 'domain_limit') = 0,
  "ALTER TABLE `la_system_license` ADD COLUMN `domain_limit` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '域名额度' AFTER `company_name`",
  'SELECT 1'
);
PREPARE stmt FROM @license_add_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @license_add_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'la_system_license' AND COLUMN_NAME = 'domain_whitelist') = 0,
  "ALTER TABLE `la_system_license` ADD COLUMN `domain_whitelist` text NULL COMMENT '授权域名白名单(JSON)' AFTER `domain_limit`",
  'SELECT 1'
);
PREPARE stmt FROM @license_add_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @license_add_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'la_system_license' AND COLUMN_NAME = 'signature') = 0,
  "ALTER TABLE `la_system_license` ADD COLUMN `signature` mediumtext NULL COMMENT '授权签名串' AFTER `domain_whitelist`",
  'SELECT 1'
);
PREPARE stmt FROM @license_add_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @license_add_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'la_system_license' AND COLUMN_NAME = 'sign_version') = 0,
  "ALTER TABLE `la_system_license` ADD COLUMN `sign_version` varchar(32) NOT NULL DEFAULT '' COMMENT '签名版本' AFTER `signature`",
  'SELECT 1'
);
PREPARE stmt FROM @license_add_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @license_add_sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'la_system_license' AND COLUMN_NAME = 'is_signature_valid') = 0,
  "ALTER TABLE `la_system_license` ADD COLUMN `is_signature_valid` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '签名是否有效' AFTER `sign_version`",
  'SELECT 1'
);
PREPARE stmt FROM @license_add_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO `la_system_license` (
  `id`, `license_key`, `customer_name`, `contact_name`, `contact_mobile`, `contact_email`,
  `product_code`, `bound_domain`, `machine_code`, `edition`, `raw_status`, `company_name`,
  `domain_limit`, `domain_whitelist`, `signature`, `sign_version`, `is_signature_valid`,
  `status`, `expire_time`, `activated_time`, `last_verify_time`, `last_verify_message`,
  `last_verify_payload`, `remark`, `create_time`, `update_time`
)
SELECT
  1, '', '', '', '', '',
  'uiedtool-commercial', '', '', 'free', 'inactive', '',
  0, '[]', '', '', 0,
  0, 0, 0, 0, '尚未校验授权，请录入授权码后点击“立即校验”。',
  '', '', @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM `la_system_license` WHERE `id` = 1
);

UPDATE `la_system_license`
SET
  `product_code` = IF(TRIM(`product_code`) = '' OR `product_code` = 'uied-tools', 'uiedtool-commercial', `product_code`),
  `edition` = IF(TRIM(`edition`) = '', 'free', `edition`),
  `raw_status` = IF(TRIM(`raw_status`) = '', 'inactive', `raw_status`),
  `domain_whitelist` = IF(`domain_whitelist` IS NULL OR TRIM(`domain_whitelist`) = '', '[]', `domain_whitelist`),
  `update_time` = @now_ts
WHERE `id` = 1;

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'license', 'enforce', '0', @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM `la_system_config` WHERE `type` = 'license' AND `name` = 'enforce'
);

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'license', 'verifyApiUrl', 'https://fsuied.com/api/license/detail', @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM `la_system_config` WHERE `type` = 'license' AND `name` = 'verifyApiUrl'
);

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'license', 'verifyApiToken', '', @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM `la_system_config` WHERE `type` = 'license' AND `name` = 'verifyApiToken'
);

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'license', 'verifyApiMethod', 'GET', @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM `la_system_config` WHERE `type` = 'license' AND `name` = 'verifyApiMethod'
);

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'license', 'verifyApiTimeout', '10000', @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM `la_system_config` WHERE `type` = 'license' AND `name` = 'verifyApiTimeout'
);

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'license', 'verifyApiAllowInsecureTls', '0', @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM `la_system_config` WHERE `type` = 'license' AND `name` = 'verifyApiAllowInsecureTls'
);

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'license', 'apiSignSecret', '', @now_ts, @now_ts
WHERE NOT EXISTS (
  SELECT 1 FROM `la_system_config` WHERE `type` = 'license' AND `name` = 'apiSignSecret'
);

UPDATE `la_system_config`
SET `value` = 'https://fsuied.com/api/license/detail', `update_time` = @now_ts
WHERE `type` = 'license' AND `name` = 'verifyApiUrl'
  AND (`value` = '' OR `value` = 'https://fsuied.com/api/license/verify');

UPDATE `la_system_config`
SET `value` = 'GET', `update_time` = @now_ts
WHERE `type` = 'license' AND `name` = 'verifyApiMethod'
  AND TRIM(COALESCE(`value`, '')) = '';

UPDATE `la_system_config`
SET `value` = '10000', `update_time` = @now_ts
WHERE `type` = 'license' AND `name` = 'verifyApiTimeout'
  AND (TRIM(COALESCE(`value`, '')) = '' OR CAST(`value` AS UNSIGNED) = 0);

UPDATE `la_system_config`
SET `value` = '0', `update_time` = @now_ts
WHERE `type` = 'license' AND `name` = 'verifyApiAllowInsecureTls'
  AND TRIM(COALESCE(`value`, '')) = '';

SET @official_site_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE menu_type = 'M' AND paths = 'official_site'
  ORDER BY id ASC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @official_site_menu_id, 'C', '授权管理', 'IconLock', 18, 'setting:license:detail', 'license', 'setting/website/license', '', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @official_site_menu_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_menu
    WHERE perms = 'setting:license:detail' OR component = 'setting/website/license'
  );

SET @license_menu_id = (
  SELECT id
  FROM la_system_auth_menu
  WHERE perms = 'setting:license:detail' AND menu_type = 'C'
  ORDER BY id DESC
  LIMIT 1
);

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @license_menu_id, 'A', '授权保存', '', 0, 'setting:license:save', 'save', '', '/official_site/license', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @license_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:license:save');

INSERT INTO la_system_auth_menu (
  pid, menu_type, menu_name, menu_icon, menu_sort, perms, paths, component, selected, params,
  is_cache, is_show, is_disable, create_time, update_time
)
SELECT
  @license_menu_id, 'A', '授权校验', '', 1, 'setting:license:verify', 'verify', '', '/official_site/license', '',
  0, 1, 0, @now_ts, @now_ts
WHERE @license_menu_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM la_system_auth_menu WHERE perms = 'setting:license:verify');

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, @license_menu_id
FROM la_system_auth_perm p
JOIN la_system_auth_menu m ON m.id = p.menu_id
WHERE @license_menu_id IS NOT NULL
  AND m.perms IN ('setting:website:detail', 'setting:website:layout:detail', 'setting:website:hottools:detail')
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = @license_menu_id
  )
GROUP BY p.role_id;

INSERT INTO la_system_auth_perm (id, role_id, menu_id)
SELECT REPLACE(UUID(), '-', ''), p.role_id, m2.id
FROM la_system_auth_perm p
JOIN la_system_auth_menu m ON m.id = p.menu_id
JOIN la_system_auth_menu m2 ON m2.perms IN ('setting:license:save', 'setting:license:verify')
WHERE m.perms IN ('setting:website:save', 'setting:website:layout:save', 'setting:website:hottools:save')
  AND NOT EXISTS (
    SELECT 1 FROM la_system_auth_perm ap
    WHERE ap.role_id = p.role_id
      AND ap.menu_id = m2.id
  )
GROUP BY p.role_id, m2.id;

COMMIT;
