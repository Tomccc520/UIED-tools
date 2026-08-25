-- 函数说明：对齐历史库授权产品编码，统一迁移到商业版默认项目编码 uiedtool-commercial。
SET @now_ts = UNIX_TIMESTAMP();

UPDATE `la_system_license`
SET
  `product_code` = 'uiedtool-commercial',
  `update_time` = @now_ts
WHERE TRIM(IFNULL(`product_code`, '')) = ''
   OR TRIM(`product_code`) = 'uied-tools';

