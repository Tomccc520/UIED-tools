SET NAMES utf8mb4;

START TRANSACTION;

-- 用户购买记录（会员套餐/积分包）
CREATE TABLE IF NOT EXISTS `la_user_purchase_order` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_sn` varchar(40) NOT NULL DEFAULT '' COMMENT '订单号',
  `user_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户ID',
  `product_type` varchar(20) NOT NULL DEFAULT '' COMMENT '商品类型: member_plan/points_pack',
  `product_code` varchar(64) NOT NULL DEFAULT '' COMMENT '商品编码',
  `product_name` varchar(120) NOT NULL DEFAULT '' COMMENT '商品名称',
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '订单金额',
  `currency` varchar(10) NOT NULL DEFAULT 'CNY' COMMENT '币种',
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态: 0=待支付,1=已支付,2=已关闭',
  `pay_channel` varchar(20) NOT NULL DEFAULT 'mock' COMMENT '支付渠道',
  `trade_no` varchar(64) NOT NULL DEFAULT '' COMMENT '第三方交易号',
  `callback_status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '回调状态: 0=未回调,1=回调成功,2=回调失败',
  `callback_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '回调时间',
  `callback_error` varchar(255) NOT NULL DEFAULT '' COMMENT '回调错误信息',
  `member_days` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '会员天数',
  `points` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '基础积分',
  `gift_points` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '赠送积分',
  `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '备注',
  `paid_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '支付时间',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_sn` (`order_sn`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_callback_status` (`callback_status`),
  KEY `idx_trade_no` (`trade_no`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户购买记录表';

-- 兼容历史表结构：将订单状态统一升级为 0=待支付,1=已支付,2=已关闭
ALTER TABLE `la_user_purchase_order`
  MODIFY COLUMN `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态: 0=待支付,1=已支付,2=已关闭';

-- 用户积分流水（扣次/赠送/充值）
CREATE TABLE IF NOT EXISTS `la_user_points_log` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户ID',
  `change_type` varchar(32) NOT NULL DEFAULT '' COMMENT '流水类型',
  `change_amount` int(11) NOT NULL DEFAULT 0 COMMENT '积分变动值(可正可负)',
  `balance_after` int(11) NOT NULL DEFAULT 0 COMMENT '变动后余额',
  `tool_key` varchar(120) NOT NULL DEFAULT '' COMMENT '工具标识',
  `action` varchar(32) NOT NULL DEFAULT '' COMMENT '动作标识',
  `order_sn` varchar(40) NOT NULL DEFAULT '' COMMENT '关联订单号',
  `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '备注',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_sn` (`order_sn`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户积分流水表';

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'login', 'memberPlans', '[{\"code\":\"vip_month\",\"name\":\"VIP月卡\",\"price\":29,\"memberDays\":30,\"giftPoints\":80,\"sort\":1,\"status\":1,\"badge\":\"热卖\"},{\"code\":\"vip_quarter\",\"name\":\"VIP季卡\",\"price\":79,\"memberDays\":90,\"giftPoints\":300,\"sort\":2,\"status\":1,\"badge\":\"推荐\"},{\"code\":\"vip_year\",\"name\":\"VIP年卡\",\"price\":299,\"memberDays\":365,\"giftPoints\":1500,\"sort\":3,\"status\":1,\"badge\":\"省钱\"}]', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
WHERE NOT EXISTS (
  SELECT 1 FROM `la_system_config` WHERE `type` = 'login' AND `name` = 'memberPlans'
);

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'login', 'pointsPacks', '[{\"code\":\"points_100\",\"name\":\"100积分包\",\"price\":9.9,\"points\":100,\"giftPoints\":0,\"sort\":1,\"status\":1},{\"code\":\"points_500\",\"name\":\"500积分包\",\"price\":39.9,\"points\":500,\"giftPoints\":50,\"sort\":2,\"status\":1},{\"code\":\"points_1000\",\"name\":\"1000积分包\",\"price\":69.9,\"points\":1000,\"giftPoints\":200,\"sort\":3,\"status\":1}]', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
WHERE NOT EXISTS (
  SELECT 1 FROM `la_system_config` WHERE `type` = 'login' AND `name` = 'pointsPacks'
);

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'login', 'memberRightsIntro', '会员有效期内可免费使用积分工具；购买会员套餐将赠送积分；积分包购买后即时到账。', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
WHERE NOT EXISTS (
  SELECT 1 FROM `la_system_config` WHERE `type` = 'login' AND `name` = 'memberRightsIntro'
);

COMMIT;
