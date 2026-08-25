-- la_system_config.value 扩容为 LONGTEXT，避免完整工具分类树/时间线配置写入超长失败
ALTER TABLE `la_system_config`
MODIFY COLUMN `value` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '值';
