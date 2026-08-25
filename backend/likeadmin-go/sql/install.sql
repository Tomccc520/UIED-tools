SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for la_album
-- ----------------------------
DROP TABLE IF EXISTS `la_album`;
CREATE TABLE `la_album`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `cid` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '类目ID',
  `aid` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '管理员ID',
  `uid` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户ID',
  `type` tinyint(2) UNSIGNED NOT NULL DEFAULT 10 COMMENT '文件类型: [10=图片, 20=视频]',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '文件名称',
  `uri` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '文件路径',
  `ext` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '文件扩展',
  `size` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件大小',
  `is_delete` int(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除: 0=否, 1=是',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_cid`(`cid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '相册管理表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_album_cate
-- ----------------------------
DROP TABLE IF EXISTS `la_album_cate`;
CREATE TABLE `la_album_cate`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `pid` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '父级ID',
  `type` tinyint(2) UNSIGNED NOT NULL DEFAULT 10 COMMENT '类型: [10=图片, 20=视频]',
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '分类名称',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除: [0=否, 1=是]',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '相册分类表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_article
-- ----------------------------
DROP TABLE IF EXISTS `la_article`;
CREATE TABLE `la_article`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `cid` int(10) UNSIGNED NOT NULL COMMENT '分类',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '标题',
  `intro` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '简介',
  `summary` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '' COMMENT '摘要',
  `image` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '封面',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '内容',
  `author` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '作者',
  `visit` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览',
  `sort` int(10) UNSIGNED NOT NULL DEFAULT 50 COMMENT '排序',
  `is_show` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否显示: 0=否, 1=是',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除: 0=否, 1=是',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `cid_idx`(`cid`) USING BTREE COMMENT '分类索引'
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '文章资讯表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_article_category
-- ----------------------------
DROP TABLE IF EXISTS `la_article_category`;
CREATE TABLE `la_article_category`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '名称',
  `sort` smallint(5) UNSIGNED NOT NULL DEFAULT 50 COMMENT '排序',
  `is_show` tinyint(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否显示: 0=否, 1=是',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除: 0=否, 1=是',
  `create_time` int(10) UNSIGNED NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NULL DEFAULT 0 COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '文章分类表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_article_collect
-- ----------------------------
DROP TABLE IF EXISTS `la_article_collect`;
CREATE TABLE `la_article_collect`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户ID',
  `article_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '文章ID',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '文章收藏表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_decorate_page
-- ----------------------------
DROP TABLE IF EXISTS `la_decorate_page`;
CREATE TABLE `la_decorate_page`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `page_type` tinyint(2) UNSIGNED NOT NULL DEFAULT 10 COMMENT '页面类型',
  `page_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '页面名称',
  `page_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '页面数据',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '页面装修表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_decorate_tabbar
-- ----------------------------
DROP TABLE IF EXISTS `la_decorate_tabbar`;
CREATE TABLE `la_decorate_tabbar`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '导航名称',
  `selected` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '未选图标',
  `unselected` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '已选图标',
  `link` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '链接地址',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '底部装修表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_dict_data
-- ----------------------------
DROP TABLE IF EXISTS `la_dict_data`;
CREATE TABLE `la_dict_data`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `type_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '类型',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '键名',
  `value` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '数值',
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '备注',
  `sort` smallint(5) UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) NOT NULL COMMENT '状态: 0=停用, 1=正常',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除: 0=否, 1=是',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '字典数据表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_dict_type
-- ----------------------------
DROP TABLE IF EXISTS `la_dict_type`;
CREATE TABLE `la_dict_type`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dict_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '字典名称',
  `dict_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '字典类型',
  `dict_remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '字典备注',
  `dict_status` tinyint(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT '字典状态: 0=停用, 1=正常',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除: 0=否, 1=是',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '字典类型表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_gen_table
-- ----------------------------
DROP TABLE IF EXISTS `la_gen_table`;
CREATE TABLE `la_gen_table`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `table_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '表名称',
  `table_comment` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '表描述',
  `sub_table_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '关联表名称',
  `sub_table_fk` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '关联表外键',
  `author_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '作者的名称',
  `entity_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '实体的名称',
  `module_name` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '生成模块名',
  `function_name` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '生成功能名',
  `tree_primary` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '树主键字段',
  `tree_parent` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '树父级字段',
  `tree_name` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '树显示字段',
  `gen_tpl` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'crud' COMMENT '生成模板方式: [crud=单表, tree=树表]',
  `gen_type` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '生成代码方式: [0=zip压缩包, 1=自定义路径]',
  `gen_path` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '/' COMMENT '生成代码路径: [不填默认项目路径]',
  `remarks` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '备注信息',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '代码生成业务表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_gen_table_column
-- ----------------------------
DROP TABLE IF EXISTS `la_gen_table_column`;
CREATE TABLE `la_gen_table_column`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '列主键',
  `table_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '表外键',
  `column_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '列名称',
  `column_comment` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '列描述',
  `column_length` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '0' COMMENT '列长度',
  `column_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '列类型 ',
  `java_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'JAVA类型',
  `java_field` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'JAVA字段',
  `is_pk` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否主键: [1=是, 0=否]',
  `is_increment` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否自增: [1=是, 0=否]',
  `is_required` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否必填: [1=是, 0=否]',
  `is_insert` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否插入字段: [1=是, 0=否]',
  `is_edit` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否编辑字段: [1=是, 0=否]',
  `is_list` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否列表字段: [1=是, 0=否]',
  `is_query` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否查询字段: [1=是, 0=否]',
  `query_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'EQ' COMMENT '查询方式: [等于、不等于、大于、小于、范围]',
  `html_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '显示类型: [文本框、文本域、下拉框、复选框、单选框、日期控件]',
  `dict_type` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '字典类型',
  `sort` smallint(5) UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序编号',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '代码生成字段表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_hot_search
-- ----------------------------
DROP TABLE IF EXISTS `la_hot_search`;

-- ----------------------------
-- Table structure for la_system_license
-- ----------------------------
DROP TABLE IF EXISTS `la_system_license`;
CREATE TABLE `la_system_license`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `license_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '授权码',
  `customer_name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '客户名称',
  `contact_name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '联系人',
  `contact_mobile` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '联系电话',
  `contact_email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '联系邮箱',
  `product_code` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '产品编码',
  `bound_domain` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '绑定域名',
  `machine_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '机器码',
  `edition` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'free' COMMENT '授权版本',
  `raw_status` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'inactive' COMMENT '原始授权状态',
  `company_name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '公司名称',
  `domain_limit` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '域名额度',
  `domain_whitelist` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '授权域名白名单(JSON)',
  `signature` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '授权签名串',
  `sign_version` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '签名版本',
  `is_signature_valid` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '签名是否有效',
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '授权状态:0未激活,1已授权,2已过期,3已冻结',
  `expire_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '过期时间',
  `activated_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '激活时间',
  `last_verify_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '最近校验时间',
  `last_verify_message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '最近校验说明',
  `last_verify_payload` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '最近校验原始结果',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '备注',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '源码授权配置表' ROW_FORMAT = Dynamic;
CREATE TABLE `la_hot_search`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '关键词',
  `sort` smallint(5) UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序号',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '热门搜索配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_notice_setting
-- ----------------------------
DROP TABLE IF EXISTS `la_notice_setting`;
CREATE TABLE `la_notice_setting`  (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `scene` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '场景编号',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '场景名称',
  `remarks` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '场景描述',
  `recipient` tinyint(1) NOT NULL DEFAULT 1 COMMENT '接收人员: [1=用户, 2=平台]',
  `type` tinyint(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT '通知类型: [1=业务, 2=验证]',
  `system_notice` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '系统的通知设置',
  `sms_notice` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '短信的通知设置',
  `oa_notice` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '公众号通知设置',
  `mnp_notice` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '小程序通知设置',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '消息通知设置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_official_reply
-- ----------------------------
DROP TABLE IF EXISTS `la_official_reply`;
CREATE TABLE `la_official_reply`  (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '规则名',
  `keyword` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '关键词',
  `reply_type` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '回复类型: [1=关注回复 2=关键字回复, 3=默认回复]',
  `matching_type` tinyint(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT '匹配方式: [1=全匹配, 2=模糊匹配]',
  `content_type` tinyint(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT '内容类型: [1=文本]',
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '启动状态: [1=启动, 0=关闭]',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '回复内容',
  `sort` int(11) UNSIGNED NOT NULL DEFAULT 50 COMMENT '排序编号',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除',
  `create_time` int(10) UNSIGNED NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NULL DEFAULT 0 COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '公众号的回复表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_system_auth_admin
-- ----------------------------
DROP TABLE IF EXISTS `la_system_auth_admin`;
CREATE TABLE `la_system_auth_admin`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dept_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '部门ID',
  `post_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '岗位ID',
  `username` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户账号',
  `nickname` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户昵称',
  `password` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户密码',
  `avatar` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户头像',
  `role` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '角色主键',
  `salt` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '加密盐巴',
  `sort` smallint(5) UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序编号',
  `is_multipoint` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '多端登录: 0=否, 1=是',
  `is_disable` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否禁用: 0=否, 1=是',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除: 0=否, 1=是',
  `last_login_ip` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '最后登录IP',
  `last_login_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '最后登录',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统管理成员表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_system_auth_dept
-- ----------------------------
DROP TABLE IF EXISTS `la_system_auth_dept`;
CREATE TABLE `la_system_auth_dept`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `pid` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '上级主键',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '部门名称',
  `duty` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '负责人名',
  `mobile` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '联系电话',
  `sort` smallint(5) UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序编号',
  `is_stop` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否禁用: 0=否, 1=是',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除: 0=否, 1=是',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统部门管理表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_system_auth_menu
-- ----------------------------
DROP TABLE IF EXISTS `la_system_auth_menu`;
CREATE TABLE `la_system_auth_menu`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `pid` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '上级菜单',
  `menu_type` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '权限类型: M=目录，C=菜单，A=按钮',
  `menu_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '菜单名称',
  `menu_icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '菜单图标',
  `menu_sort` smallint(5) UNSIGNED NOT NULL DEFAULT 0 COMMENT '菜单排序',
  `perms` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '权限标识',
  `paths` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '路由地址',
  `component` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '前端组件',
  `selected` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '选中路径',
  `params` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '路由参数',
  `is_cache` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否缓存: 0=否, 1=是',
  `is_show` tinyint(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否显示: 0=否, 1=是',
  `is_disable` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否禁用: 0=否, 1=是',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 775 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统菜单管理表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_system_auth_perm
-- ----------------------------
DROP TABLE IF EXISTS `la_system_auth_perm`;
CREATE TABLE `la_system_auth_perm`  (
  `id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '主键',
  `role_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '角色ID',
  `menu_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '菜单ID',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统角色菜单表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_system_auth_post
-- ----------------------------
DROP TABLE IF EXISTS `la_system_auth_post`;
CREATE TABLE `la_system_auth_post`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '岗位编码',
  `name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '岗位名称',
  `remarks` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '岗位备注',
  `sort` smallint(5) UNSIGNED NOT NULL DEFAULT 0 COMMENT '岗位排序',
  `is_stop` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否停用: 0=否, 1=是',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除: 0=否, 1=是',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统岗位管理表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_system_auth_role
-- ----------------------------
DROP TABLE IF EXISTS `la_system_auth_role`;
CREATE TABLE `la_system_auth_role`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '角色名称',
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '备注信息',
  `sort` smallint(5) UNSIGNED NOT NULL DEFAULT 0 COMMENT '角色排序',
  `is_disable` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否禁用: 0=否, 1=是',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统角色管理表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_system_config
-- ----------------------------
DROP TABLE IF EXISTS `la_system_config`;
CREATE TABLE `la_system_config`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '' COMMENT '类型',
  `name` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '键',
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '值',
  `create_time` int(10) UNSIGNED NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统全局配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_system_log_login
-- ----------------------------
DROP TABLE IF EXISTS `la_system_log_login`;
CREATE TABLE `la_system_log_login`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '注解',
  `admin_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '管理员ID',
  `username` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '登录账号',
  `ip` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '登录地址',
  `os` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '操作系统',
  `browser` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '' COMMENT '浏览器',
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT '操作状态: 1=成功, 2=失败',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统登录日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_system_log_operate
-- ----------------------------
DROP TABLE IF EXISTS `la_system_log_operate`;
CREATE TABLE `la_system_log_operate`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `admin_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '操作人ID',
  `type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '请求类型: GET/POST/PUT',
  `title` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '' COMMENT '操作标题',
  `ip` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '请求IP',
  `url` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '请求接口',
  `method` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '请求方法',
  `args` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '请求参数',
  `error` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '错误信息',
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT '执行状态: 1=成功, 2=失败',
  `start_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '开始时间',
  `end_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '结束时间',
  `task_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '执行耗时',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统操作日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_system_log_sms
-- ----------------------------
DROP TABLE IF EXISTS `la_system_log_sms`;
CREATE TABLE `la_system_log_sms`  (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'id',
  `scene` int(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '场景编号',
  `mobile` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '手机号码',
  `content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '发送内容',
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '发送状态：[0=发送中, 1=发送成功, 2=发送失败]',
  `results` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '短信结果',
  `send_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '发送时间',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统短信日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_user
-- ----------------------------
DROP TABLE IF EXISTS `la_user`;
CREATE TABLE `la_user`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `sn` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '编号',
  `avatar` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '头像',
  `real_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '真实姓名',
  `nickname` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户昵称',
  `username` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户账号',
  `password` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户密码',
  `mobile` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户电话',
  `qq_email` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'QQ邮箱',
  `points_balance` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '积分余额',
  `points_daily_grant_date` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '积分每日赠送日期',
  `points_total_earned` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计获得积分',
  `points_total_consumed` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计消耗积分',
  `member_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'free' COMMENT '会员等级',
  `member_expire_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '会员到期时间',
  `salt` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '加密盐巴',
  `sex` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户性别: [1=男, 2=女]',
  `channel` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '注册渠道: [1=微信小程序, 2=微信公众号, 3=手机H5, 4=电脑PC, 5=苹果APP, 6=安卓APP]',
  `is_disable` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否禁用: [0=否, 1=是]',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否删除: [0=否, 1=是]',
  `last_login_ip` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '最后登录IP',
  `last_login_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '最后登录时间',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_user_auth
-- ----------------------------
DROP TABLE IF EXISTS `la_user_auth`;
CREATE TABLE `la_user_auth`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户ID',
  `openid` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'Openid',
  `unionid` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'Unionid',
  `client` tinyint(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT '客户端类型: [1=微信小程序, 2=微信公众号, 3=手机H5, 4=电脑PC, 5=苹果APP, 6=安卓APP]',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `openid`(`openid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户授权表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_user_purchase_order
-- ----------------------------
DROP TABLE IF EXISTS `la_user_purchase_order`;
CREATE TABLE `la_user_purchase_order`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_sn` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '订单号',
  `user_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户ID',
  `product_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '商品类型: member_plan/points_pack',
  `product_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '商品编码',
  `product_name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '商品名称',
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '订单金额',
  `currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'CNY' COMMENT '币种',
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态: 0=待支付,1=已支付,2=已关闭',
  `pay_channel` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'mock' COMMENT '支付渠道',
  `trade_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '第三方交易号',
  `callback_status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '回调状态: 0=未回调,1=回调成功,2=回调失败',
  `callback_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '回调时间',
  `callback_error` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '回调错误信息',
  `member_days` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '会员天数',
  `points` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '基础积分',
  `gift_points` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '赠送积分',
  `delivery_status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '交付状态: 0=未交付,1=已交付,2=待补充,3=已失效',
  `license_bound_domain` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '授权绑定域名',
  `license_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '授权码',
  `download_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '源码下载链接',
  `download_check_status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '下载检测状态: 0=未检测,1=链接可访问,2=下载异常',
  `download_check_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '最近下载检测时间',
  `download_check_message` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '最近下载检测结果',
  `delivery_note` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '交付备注',
  `delivered_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '交付时间',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '备注',
  `paid_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '支付时间',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `delete_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_order_sn`(`order_sn`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_callback_status`(`callback_status`) USING BTREE,
  INDEX `idx_trade_no`(`trade_no`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户购买记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_user_purchase_callback_audit
-- ----------------------------
DROP TABLE IF EXISTS `la_user_purchase_callback_audit`;
CREATE TABLE `la_user_purchase_callback_audit`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_sn` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '订单号',
  `pay_channel` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '支付渠道',
  `trade_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '交易号',
  `callback_result` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '回调结果',
  `callback_message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '回调消息',
  `callback_timestamp` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '回调时间戳',
  `callback_nonce` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '回调随机串',
  `sign_digest` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '签名摘要',
  `sign_verified` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '验签结果: 0未通过,1通过',
  `replay_detected` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否命中重放: 0否,1是',
  `replay_kind` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '重放类型: event/nonce',
  `lock_acquired` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否获取处理锁: 0否,1是',
  `process_stage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '处理阶段',
  `process_result` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '处理结果',
  `request_payload` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '回调请求载荷',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_order_sn`(`order_sn`) USING BTREE,
  INDEX `idx_trade_no`(`trade_no`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE,
  INDEX `idx_replay_detected`(`replay_detected`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '支付回调审计日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_user_points_log
-- ----------------------------
DROP TABLE IF EXISTS `la_user_points_log`;
CREATE TABLE `la_user_points_log`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户ID',
  `change_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '流水类型',
  `change_amount` int(11) NOT NULL DEFAULT 0 COMMENT '积分变动值(可正可负)',
  `balance_after` int(11) NOT NULL DEFAULT 0 COMMENT '变动后余额',
  `tool_key` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '工具标识',
  `action` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '动作标识',
  `order_sn` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '关联订单号',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '备注',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_order_sn`(`order_sn`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户积分流水表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_user_points_consume
-- ----------------------------
DROP TABLE IF EXISTS `la_user_points_consume`;
CREATE TABLE `la_user_points_consume`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户ID',
  `request_id` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '单次工具运行幂等标识',
  `tool_key` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '工具标识',
  `action` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '动作标识',
  `consume_points` int(11) NOT NULL DEFAULT 0 COMMENT '本次预扣积分',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'reserved' COMMENT '状态: reserved/committed/refunded/expired',
  `expires_at` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '预扣过期时间',
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '结算或退款原因',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_request`(`user_id`, `request_id`) USING BTREE,
  INDEX `idx_user_status_expire`(`user_id`, `status`, `expires_at`) USING BTREE,
  INDEX `idx_status_expire`(`status`, `expires_at`, `id`) USING BTREE,
  INDEX `idx_tool_key`(`tool_key`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户工具积分预扣状态表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for la_tool_ranking_daily
-- ----------------------------
DROP TABLE IF EXISTS `la_tool_ranking_daily`;
CREATE TABLE `la_tool_ranking_daily`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `stat_date` date NOT NULL COMMENT '统计日期',
  `tool_key` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '工具唯一标识',
  `tool_title` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '工具标题',
  `tool_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '工具链接',
  `cate_title` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '分类标题',
  `view_count` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '访问次数',
  `start_count` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '开始处理次数',
  `success_count` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '成功次数',
  `download_count` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '下载次数',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uniq_stat_date_tool_key`(`stat_date`, `tool_key`) USING BTREE,
  INDEX `idx_tool_key`(`tool_key`) USING BTREE,
  INDEX `idx_update_time`(`update_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '工具排行榜按日聚合表' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------
-- INSERT
-- ----------------------------
BEGIN;
INSERT INTO `la_system_auth_dept` VALUES (1, 0, '默认部门', '康明', '18327647788', 10, 0, 0, 1649841995, 1660190949, 0);
INSERT INTO `la_system_auth_admin` VALUES (1, 1, 0, 'admin', 'admin', '7fac2474740becfaf1ecbdd6cc8fb076', '/api/static/backend_avatar.png', '0', '5Xar0', 0, 1, 0, 0, '127.0.0.1', 1660641347, 1642321599, 1660287325, 0);
INSERT INTO `la_system_auth_role` VALUES (1, '审核员', '审核数据', 0, 0, 1668679451, 1668679468);
COMMIT;

BEGIN;
INSERT INTO `la_system_config` VALUES (1, 'storage', 'default', 'local', 1660620367, 1662620927);
INSERT INTO `la_system_config` VALUES (2, 'storage', 'local', '{\"name\":\"本地存储\"}', 1660620367, 1662620927);
INSERT INTO `la_system_config` VALUES (3, 'storage', 'qiniu', '{\"name\":\"七牛云存储\",\"bucket\":\"\",\"secretKey\":\"\",\"accessKey\":\"\",\"domain\":\"\"}', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (4, 'storage', 'aliyun', '{\"name\":\"阿里云存储\",\"bucket\":\"\",\"secretKey\":\"\",\"accessKey\":\"\",\"domain\":\"\"}', 1660620367, 1662620071);
INSERT INTO `la_system_config` VALUES (5, 'storage', 'qcloud', '{\"name\":\"腾讯云存储\",\"bucket\":\"\",\"secretKey\":\"\",\"accessKey\":\"\",\"domain\":\"\",\"region\":\"\"}', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (6, 'sms', 'default', 'aliyun', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (7, 'sms', 'aliyun', '{\"name\":\"阿里云短信\",\"alias\":\"aliyun\",\"sign\":\"\",\"appKey\":\"\",\"secretKey\":\"\"}', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (8, 'sms', 'tencent', '{\"name\":\"腾讯云短信\",\"alias\":\"tencent\",\"sign\":\"\",\"appId\":\"\",\"secretId\":\"\",\"secretKey\":\"\"}', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (9, 'sms', 'huawei', '{\"name\":\"华为云短信\",\"alias\":\"huawei\"}', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (10, 'website', 'name', 'UIED-Tools', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (11, 'website', 'logo', '/api/static/backend_logo.png', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (12, 'website', 'favicon', '/api/static/backend_favicon.ico', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (13, 'website', 'backdrop', '/api/static/backend_backdrop.png', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (14, 'website', 'copyright', '[{\"name\":\"uiedtool.com\",\"link\":\"https://uiedtool.com/\"}]', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (15, 'website', 'shopName', 'uiedtool.com', 1631255140, 1631255140);
INSERT INTO `la_system_config` VALUES (16, 'website', 'shopLogo', '/api/static/shop_logo.png', 1631255140, 1631255140);
INSERT INTO `la_system_config` VALUES (26, 'website', 'toolsSiteSlogan', '免费在线工具集', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (81, 'website', 'toolsSidebarRecommendTitle', '推荐工具', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (104, 'website', 'toolsSidebarBrandText', 'UIED-Tools', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (27, 'website', 'toolsFooterIntro', '{webName} 是 UIED技术团队运营的 uiedtool.com 在线工具平台', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (82, 'website', 'toolsFooterQuickTitle', '工具快捷入口', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (83, 'website', 'toolsFooterFriendTitle', '友情链接', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (84, 'website', 'toolsOfficialMediaTitle', '官方媒体', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (85, 'website', 'toolsFooterSupportLabel', '技术支持', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (28, 'website', 'toolsFooterSupportLinks', '[{"name":"uiedtool.com","link":"https://uiedtool.com/"},{"name":"UIED技术团队","link":"https://fsuied.com"}]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (87, 'website', 'toolsFooterRecordLinks', '[{"name":"粤ICP备2022056875号","link":"https://beian.miit.gov.cn/"},{"name":"网站地图","link":"/sitemap.xml"}]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (86, 'website', 'toolsHotTools', '[{"title":"Adobe 正版全家桶可用AI","desc":"Adobe 正版全家桶可用AI","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"Gemini3 可用 nanobanana","desc":"Gemini3 可用 nanobanana","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"AI学习网站","desc":"每天逛一逛","link":"https://www.uied.cn/category/aigc/ai"},{"title":"免费AI生成PPT","desc":"AI智能生成PPT","link":"https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047"},{"title":"AIGC学习网站","desc":"UIED技术团队官网","link":"https://uied.cn/"},{"title":"AIGC工具","desc":"AI智能工具集合","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"Midjourney绘画","desc":"AI绘画生成工具","link":"https://nf.video/czybtp/?gid=26"},{"title":"GPT-5.2","desc":"最新版GPT-5.2智能对话工具","link":"https://nf.video/oemcwv/?gid=18"},{"title":"ChatExcel表格","desc":"AI Excel 数据分析辅助工具","link":"https://www.chatexcel.com/#/home?partner_uuid=4227AB911C6531FF898C5E7BB54757E6"}]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (21, 'website', 'toolsHeaderLinks', '[{"name":"官网首页","link":"https://uiedtool.com/"}]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (22, 'website', 'toolsSidebarRecommend', '[{"name":"热门工具","link":"#recommend-hot"},{"name":"随机推荐","link":"/tools/random-tools"},{"name":"每日热榜","link":"/tools/hot-ranking"},{"name":"每日文章","link":"https://hot.uied.cn/"},{"name":"实时资讯","link":"/tools/ai-news"},{"name":"AI产品榜","link":"https://hao.uied.cn/"}]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (88, 'website', 'toolsSidebarCategoryMenus', '[{"key":"ai","title":"AI工具箱","cateTitle":"AI工具箱","link":"/tools/ai/toolbox","icon":"/icons/sidebar/ai.svg"},{"key":"design","title":"设计工具","cateTitle":"设计工具","icon":"/icons/sidebar/design.svg"},{"key":"image","title":"图片处理","cateTitle":"图片处理","icon":"/icons/sidebar/image.svg"},{"key":"office","title":"办公工具","cateTitle":"办公工具","icon":"/icons/sidebar/office.svg"},{"key":"daily","title":"生活常用","cateTitle":"生活常用","icon":"/icons/sidebar/daily.svg"},{"key":"copywriting","title":"文案工具","cateTitle":"文案工具","icon":"/icons/sidebar/copywriting.svg"},{"key":"psychology","title":"潜能测试","cateTitle":"潜能测试","icon":"/icons/sidebar/psychology.svg"},{"key":"video","title":"剪辑工具","cateTitle":"剪辑工具","icon":"/icons/sidebar/video.svg"},{"key":"dev","title":"开发工具","cateTitle":"开发工具","icon":"/icons/sidebar/dev.svg"},{"key":"slacking","title":"摸鱼工具","cateTitle":"摸鱼工具","icon":"/icons/sidebar/slacking.svg"},{"key":"efficiency","title":"效率工具","cateTitle":"效率工具","icon":"/icons/sidebar/efficiency.svg"}]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (90, 'website', 'toolsCategoryTree', '[]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (89, 'website', 'toolsSidebarBottomLinks', '[{"name":"更新记录","link":"/changelog"},{"name":"意见反馈","link":"https://uiedtool.com/"},{"name":"关于我们","link":"/about"}]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (91, 'website', 'toolsSidebarMenuBlocks', '[]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (23, 'website', 'toolsFooterQuickSections', '[{"title":"设计","items":[{"name":"色彩对比度","link":"/tools/design/contrast-checker"},{"name":"CSS阴影","link":"/tools/design/box-shadow"},{"name":"黄金比例","link":"/tools/design/golden-ratio"},{"name":"Blob生成器","link":"/tools/design/blob-maker"},{"name":"玻璃拟态","link":"/tools/design/glassmorphism"}]},{"title":"图像","items":[{"name":"图片压缩","link":"/tools/image-compress"},{"name":"二维码生成","link":"/tools/qrcode"},{"name":"图片切割","link":"/tools/img-cut"},{"name":"图片处理","link":"/tools/signimage"},{"name":"GIF压缩","link":"/tools/gif-compress"}]},{"title":"PDF","items":[{"name":"图片转PDF","link":"/tools/img-to-pdf"},{"name":"PDF转图片","link":"/tools/pdf-to-images"},{"name":"PDF合并","link":"/tools/pdf-merge"},{"name":"PDF分割","link":"/tools/pdf-split"}]},{"title":"文本","items":[{"name":"文本对比","link":"/tools/diff"},{"name":"Markdown编辑","link":"/tools/markdown"},{"name":"字数统计","link":"/tools/wordcount"}]},{"title":"开发","items":[{"name":"JSON转换","link":"/tools/json"},{"name":"正则测试","link":"/tools/reg"},{"name":"时间戳","link":"/tools/timetran"}]},{"title":"文案","items":[{"name":"疯狂星期四","link":"/tools/copywriting/kfc"},{"name":"今日诗词","link":"/tools/copywriting/daily-poem"},{"name":"舔狗日记","link":"/tools/copywriting/dog-diary"},{"name":"朋友圈文案","link":"/tools/copywriting/moments"}]}]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (24, 'website', 'toolsFooterFriendSections', '[{"title":"官方入口","items":[{"name":"官网首页","link":"https://uiedtool.com/"},{"name":"AI工具箱","link":"https://uiedtool.com/tools/ai/toolbox"},{"name":"视频工具","link":"https://uiedtool.com/tools/video"},{"name":"更新日志","link":"https://uiedtool.com/changelog"}]},{"title":"社区内容","items":[{"name":"AI资讯","link":"https://hot.uied.cn/"},{"name":"设计导航","link":"https://hao.uied.cn/"},{"name":"UIED技术团队","link":"https://fsuied.com"},{"name":"关于我们","link":"https://uiedtool.com/about"}]}]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (25, 'website', 'toolsOfficialMediaLinks', '[{"name":"知乎","link":"https://www.zhihu.com/org/uiedyong-hu-ti-yan-jiao-liu-xue-xi"},{"name":"小红书","link":"https://www.xiaohongshu.com/user/profile/5dc2ccb0000000000100ba83"},{"name":"微博","link":"https://weibo.com/u/7542146005"},{"name":"B站","link":"https://space.bilibili.com/3493135908866790?spm_id_from=333.1007.0.0"}]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (17, 'protocol', 'service', '{\"name\":\"服务协议\",\"content\":\"\"}', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (18, 'protocol', 'privacy', '{\"name\":\"隐私协议\",\"content\":\"\"}', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (19, 'tabbar', 'style', '{\"defaultColor\":\"#4A5DFF\",\"selectedColor\":\"#EA5455\"}', 1660620367, 1662544900);
INSERT INTO `la_system_config` VALUES (20, 'search', 'isHotSearch', '0', 1660620367, 1662546997);
INSERT INTO `la_system_config` VALUES (30, 'h5_channel', 'status', '1', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (31, 'h5_channel', 'close', '0', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (32, 'h5_channel', 'url', '', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (40, 'mp_channel', 'name', '', 1660620367, 1662551403);
INSERT INTO `la_system_config` VALUES (41, 'mp_channel', 'primaryId', '', 1660620367, 1662551403);
INSERT INTO `la_system_config` VALUES (42, 'mp_channel', 'appId', '', 1660620367, 1662551403);
INSERT INTO `la_system_config` VALUES (43, 'mp_channel', 'appSecret', '', 1660620367, 1662551403);
INSERT INTO `la_system_config` VALUES (44, 'mp_channel', 'qrCode', '', 1660620367, 1662551403);
INSERT INTO `la_system_config` VALUES (50, 'wx_channel', 'appId', '', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (51, 'wx_channel', 'appSecret', '', 1660620367, 1660620367);
INSERT INTO `la_system_config` VALUES (55, 'oa_channel', 'name', '', 1660620367, 1662551337);
INSERT INTO `la_system_config` VALUES (56, 'oa_channel', 'primaryId', ' ', 1660620367, 1662551337);
INSERT INTO `la_system_config` VALUES (57, 'oa_channel', 'qrCode', '', 1662551337, 1662551337);
INSERT INTO `la_system_config` VALUES (58, 'oa_channel', 'appId', '', 1660620367, 1662551337);
INSERT INTO `la_system_config` VALUES (59, 'oa_channel', 'appSecret', '', 1660620367, 1662551337);
INSERT INTO `la_system_config` VALUES (60, 'oa_channel', 'url', '', 1660620367, 1662551337);
INSERT INTO `la_system_config` VALUES (61, 'oa_channel', 'token', '', 1660620367, 1662551337);
INSERT INTO `la_system_config` VALUES (62, 'oa_channel', 'encodingAesKey', '', 1660620367, 1662551337);
INSERT INTO `la_system_config` VALUES (63, 'oa_channel', 'encryptionType', '1', 1660620367, 1662551337);
INSERT INTO `la_system_config` VALUES (64, 'oa_channel', 'menus', '[]', 1631255140, 1663118712);
INSERT INTO `la_system_config` VALUES (70, 'login', 'loginWay', '1,2', 1660620367, 1662538771);
INSERT INTO `la_system_config` VALUES (71, 'login', 'forceBindMobile', '0', 1660620367, 1662538771);
INSERT INTO `la_system_config` VALUES (72, 'login', 'openAgreement', '1', 1660620367, 1662538771);
INSERT INTO `la_system_config` VALUES (73, 'login', 'openOtherAuth', '1', 1660620367, 1662538771);
INSERT INTO `la_system_config` VALUES (74, 'login', 'autoLoginAuth', '1,2', 1660620367, 1662538771);
INSERT INTO `la_system_config` VALUES (75, 'login', 'memberEnabled', '0', 1660620367, 1662538771);
INSERT INTO `la_system_config` VALUES (76, 'login', 'memberTrialDays', '0', 1660620367, 1662538771);
INSERT INTO `la_system_config` VALUES (77, 'login', 'memberPlans', '[{\"code\":\"vip_month\",\"name\":\"VIP月卡\",\"price\":29,\"memberDays\":30,\"giftPoints\":80,\"sort\":1,\"status\":1,\"badge\":\"热卖\"},{\"code\":\"vip_quarter\",\"name\":\"VIP季卡\",\"price\":79,\"memberDays\":90,\"giftPoints\":300,\"sort\":2,\"status\":1,\"badge\":\"推荐\"},{\"code\":\"vip_year\",\"name\":\"VIP年卡\",\"price\":299,\"memberDays\":365,\"giftPoints\":1500,\"sort\":3,\"status\":1,\"badge\":\"省钱\"}]', 1660620367, 1662538771);
INSERT INTO `la_system_config` VALUES (78, 'login', 'pointsPacks', '[{\"code\":\"points_100\",\"name\":\"100积分包\",\"price\":9.9,\"points\":100,\"giftPoints\":0,\"sort\":1,\"status\":1},{\"code\":\"points_500\",\"name\":\"500积分包\",\"price\":39.9,\"points\":500,\"giftPoints\":50,\"sort\":2,\"status\":1},{\"code\":\"points_1000\",\"name\":\"1000积分包\",\"price\":69.9,\"points\":1000,\"giftPoints\":200,\"sort\":3,\"status\":1}]', 1660620367, 1662538771);
INSERT INTO `la_system_config` VALUES (79, 'login', 'memberRightsIntro', '会员有效期内可免费使用积分工具；购买会员套餐将赠送积分；积分包购买后即时到账。', 1660620367, 1662538771);
INSERT INTO `la_system_config` VALUES (102, 'login', 'frontendLoginEnabled', '0', 1660620367, 1662538771);
INSERT INTO `la_system_config` VALUES (80, 'user', 'defaultAvatar', '/api/static/default_avatar.png', 1660620367, 1662535156);
INSERT INTO `la_system_config` VALUES (92, 'ai_model', 'matting_model_id', 'koukoutu', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (103, 'ai_model', 'matting_provider_configs', '[{"provider":"aliyun","label":"\\u963f\\u91cc\\u4e91\\u901a\\u7528\\u5206\\u5272","description":"\\u9002\\u5408\\u4eba\\u3001\\u52a8\\u7269\\u3001\\u98df\\u7269\\u3001\\u5546\\u54c1\\u548c\\u5bb6\\u5c45\\u7b49\\u89c6\\u89c9\\u4e2d\\u5fc3\\u4e3b\\u4f53\\u3002","apiUrl":"","apiKey":"","accessKeyId":"","accessKeySecret":"","endpoint":"imageseg.cn-shanghai.aliyuncs.com","timeoutSeconds":120},{"provider":"koukoutu","label":"\\u62a0\\u62a0\\u56fe API","description":"\\u540c\\u6b65\\u6587\\u4ef6\\u62a0\\u56fe\\uff0c\\u9002\\u5408\\u5feb\\u901f\\u63a5\\u5165\\u901a\\u7528\\u80cc\\u666f\\u79fb\\u9664\\u3002","apiUrl":"https://sync.koukoutu.com/v1/create","apiKey":"","accessKeyId":"","accessKeySecret":"","endpoint":"","timeoutSeconds":120}]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (93, 'ai_model', 'ai_provider_configs', '[{\"provider\":\"siliconflow\",\"label\":\"SiliconFlow\",\"description\":\"适合当前站内多数 DeepSeek/写作/搜索工具，兼容现有模型列表。\",\"enabled\":true,\"isDefault\":true,\"baseUrl\":\"https://api.siliconflow.cn/v1\",\"apiKey\":\"\",\"defaultModel\":\"deepseek-ai/DeepSeek-R1-Distill-Qwen-7B\"},{\"provider\":\"deepseek\",\"label\":\"DeepSeek 官方\",\"description\":\"适合官方 deepseek-chat / deepseek-reasoner 场景。\",\"enabled\":false,\"isDefault\":false,\"baseUrl\":\"https://api.deepseek.com/v1\",\"apiKey\":\"\",\"defaultModel\":\"deepseek-chat\"},{\"provider\":\"kimi\",\"label\":\"Kimi / Moonshot\",\"description\":\"适合配置 Moonshot Chat Completions 接口，默认模型可自行填写。\",\"enabled\":false,\"isDefault\":false,\"baseUrl\":\"https://api.moonshot.cn/v1\",\"apiKey\":\"\",\"defaultModel\":\"moonshot-v1-8k\"},{\"provider\":\"doubao\",\"label\":\"豆包 / 火山方舟\",\"description\":\"适合配置火山引擎方舟接入点，默认模型请填写你的 Endpoint ID。\",\"enabled\":false,\"isDefault\":false,\"baseUrl\":\"https://ark.cn-beijing.volces.com/api/v3\",\"apiKey\":\"\",\"defaultModel\":\"\"},{\"provider\":\"openai\",\"label\":\"OpenAI 兼容接口\",\"description\":\"适合兼容 OpenAI Chat Completions 协议的模型网关与自建中转。\",\"enabled\":false,\"isDefault\":false,\"baseUrl\":\"https://api.openai.com/v1\",\"apiKey\":\"\",\"defaultModel\":\"\"}]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (94, 'ai_model', 'ai_image_ability_configs', '[{\"ability\":\"prompt_reverse\",\"label\":\"图片提示词反推\",\"description\":\"上传图片后反推提示词，供 Prompt Reverse 页面使用。\",\"enabled\":true,\"method\":\"POST\",\"upstreamUrl\":\"https://api.pearktrue.cn/api/prompt_image\",\"apiKeyHeader\":\"\",\"apiKey\":\"\",\"timeoutSeconds\":90},{\"ability\":\"stable_diffusion\",\"label\":\"Stable Diffusion 绘图\",\"description\":\"根据提示词生成图片，供 StableDiffusion 页面使用。\",\"enabled\":true,\"method\":\"GET\",\"upstreamUrl\":\"https://api.pearktrue.cn/api/stablediffusion/\",\"apiKeyHeader\":\"\",\"apiKey\":\"\",\"timeoutSeconds\":120},{\"ability\":\"ai_qrcode\",\"label\":\"AI 二维码\",\"description\":\"根据提示词与链接生成 AI 艺术二维码。\",\"enabled\":true,\"method\":\"GET\",\"upstreamUrl\":\"https://api.pearktrue.cn/api/aiqrcode/\",\"apiKeyHeader\":\"\",\"apiKey\":\"\",\"timeoutSeconds\":120},{\"ability\":\"ocr\",\"label\":\"OCR 图像识别\",\"description\":\"识别图片文字内容，兼容文件上传与图片 URL 输入。\",\"enabled\":true,\"method\":\"POST\",\"upstreamUrl\":\"https://api.pearktrue.cn/api/ocr/\",\"apiKeyHeader\":\"\",\"apiKey\":\"\",\"timeoutSeconds\":90},{\"ability\":\"image_enhance\",\"label\":\"图像增强\",\"description\":\"上传图片后执行清晰化增强，供 ImageEnhance 页面使用。\",\"enabled\":true,\"method\":\"POST\",\"upstreamUrl\":\"https://api.pearktrue.cn/api/imagedistinct/\",\"apiKeyHeader\":\"\",\"apiKey\":\"\",\"timeoutSeconds\":120},{\"ability\":\"text_to_speech\",\"label\":\"文本配音生成\",\"description\":\"根据文本、角色和风格生成语音音频，供 TextToSpeech 页面使用。\",\"enabled\":true,\"method\":\"GET\",\"upstreamUrl\":\"https://api.pearktrue.cn/api/freedub\",\"apiKeyHeader\":\"\",\"apiKey\":\"\",\"timeoutSeconds\":120}]', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (95, 'license', 'enforce', '0', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (96, 'license', 'verifyApiUrl', 'https://fsuied.com/api/license/detail', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (97, 'license', 'verifyApiToken', '', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (98, 'license', 'verifyApiMethod', 'GET', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (99, 'license', 'verifyApiTimeout', '10000', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (100, 'license', 'verifyApiAllowInsecureTls', '0', 1711000000, 1711000000);
INSERT INTO `la_system_config` VALUES (101, 'license', 'apiSignSecret', '', 1711000000, 1711000000);
COMMIT;

BEGIN;
INSERT INTO `la_system_license` (
  `id`, `license_key`, `customer_name`, `contact_name`, `contact_mobile`, `contact_email`,
  `product_code`, `bound_domain`, `machine_code`, `edition`, `raw_status`, `company_name`,
  `domain_limit`, `domain_whitelist`, `signature`, `sign_version`, `is_signature_valid`,
  `status`, `expire_time`, `activated_time`, `last_verify_time`, `last_verify_message`,
  `last_verify_payload`, `remark`, `create_time`, `update_time`
) VALUES (
  1, '', '', '', '', '',
  'uiedtool-commercial', '', '', 'free', 'inactive', '',
  0, '[]', '', '', 0,
  0, 0, 0, 0, '尚未校验授权，请录入授权码后点击“立即校验”。',
  '', '', 1711000000, 1711000000
);
COMMIT;

BEGIN;
INSERT INTO `la_notice_setting` VALUES (1, 101, '登录验证码', '用户手机号码登录时发送', 1, 2, '{}', '{\"type\":\"sms\",\"templateId\":\"SMS_222458159\",\"content\":\"您正在登录，验证码${code}，切勿将验证码泄露于他人，本条验证码有效期5分钟。\",\"tips\":[\"可选变量 验证码:code\",\"示例：您正在登录，验证码${code}，切勿将验证码泄露于他人，本条验证码有效期5分钟。\",\"生效条件：1、管理后台完成短信设置。2、第三方短信平台申请模板。\"],\"status\":\"1\"}', '{}', '{}', 0, 1648696695, 1648696695, 0);
INSERT INTO `la_notice_setting` VALUES (2, 102, '绑定手机验证码', '用户绑定手机号码时发送', 1, 2, '{}', '{\"type\":\"sms\",\"templateId\":\"SMS_175615069\",\"content\":\"您正在绑定手机号，验证码${code}，切勿将验证码泄露于他人，本条验证码有效期5分钟。\",\"tips\":[\"可选变量 验证码:code\",\"示例：您正在绑定手机号，验证码${code}，切勿将验证码泄露于他人，本条验证码有效期5分钟。\",\"生效条件：1、管理后台完成短信设置。2、第三方短信平台申请模板。\"],\"status\":\"1\"}', '{}', '{}', 0, 1648696695, 1648696695, 0);
INSERT INTO `la_notice_setting` VALUES (3, 103, '变更手机验证码', '用户变更手机号码时发送', 1, 2, '{}', '{\"type\":\"sms\",\"templateId\":\"SMS_207952628\",\"content\":\"您正在变更手机号，验证码${code}，切勿将验证码泄露于他人，本条验证码有效期5分钟。\",\"tips\":[\"可选变量 验证码:code\",\"示例：您正在变更手机号，验证码${code}，切勿将验证码泄露于他人，本条验证码有效期5分钟。\",\"生效条件：1、管理后台完成短信设置。2、第三方短信平台申请模板。\"],\"status\":\"1\"}', '{}', '{}', 0, 1648696695, 1648696695, 0);
INSERT INTO `la_notice_setting` VALUES (4, 104, '找回登录密码验证码', '用户找回登录密码号码时发送', 1, 2, '{}', '{\"type\":\"sms\",\"templateId\":\"SMS_175615069\",\"content\":\"您正在找回登录密码，验证码${code}，切勿将验证码泄露于他人，本条验证码有效期5分钟。\",\"tips\":[\"可选变量 验证码:code\",\"示例：您正在找回登录密码，验证码${code}，切勿将验证码泄露于他人，本条验证码有效期5分钟。\",\"条验证码有效期5分钟。\"],\"status\":\"1\"}', '{}', '{}', 0, 1648696695, 1648696695, 0);
COMMIT;

BEGIN;
INSERT INTO `la_decorate_tabbar` VALUES (13, '首页', '/api/static/tabbar_home_sel.png', '/api/static/tabbar_home.png', '{\"path\":\"/pages/index/index\",\"name\":\"商城首页\",\"type\":\"shop\"}', 1662688157, 1662688157);
INSERT INTO `la_decorate_tabbar` VALUES (14, '资讯', '/api/static/tabbar_text_sel.png', '/api/static/tabbar_text.png', '{\"path\":\"/pages/news/news\",\"name\":\"文章资讯\",\"type\":\"shop\"}', 1662688157, 1662688157);
INSERT INTO `la_decorate_tabbar` VALUES (15, '我的', '/api/static/tabbar_me_sel.png', '/api/static/tabbar_me.png', '{\"path\":\"/pages/user/user\",\"name\":\"个人中心\",\"type\":\"shop\"}', 1662688157, 1662688157);
COMMIT;

BEGIN;
INSERT INTO `la_decorate_page` VALUES (1, 1, '商城首页', '[{\"title\":\"搜索\",\"name\":\"search\",\"disabled\":1,\"content\":{},\"styles\":{}},{\"title\":\"首页轮播图\",\"name\":\"banner\",\"content\":{\"enabled\":1,\"data\":[{\"image\":\"/api/static/banner01.png\",\"name\":\"\",\"link\":{\"path\":\"/pages/index/index\",\"name\":\"商城首页\",\"type\":\"shop\"}},{\"image\":\"/api/static/banner02.png\",\"name\":\"\",\"link\":{}}]},\"styles\":{}},{\"title\":\"导航菜单\",\"name\":\"nav\",\"content\":{\"enabled\":1,\"data\":[{\"image\":\"/api/static/nav01.png\",\"name\":\"资讯中心\",\"link\":{\"path\":\"/pages/news/news\",\"name\":\"文章资讯\",\"type\":\"shop\"}},{\"image\":\"/api/static/nav02.png\",\"name\":\"我的收藏\",\"link\":{\"path\":\"/pages/collection/collection\",\"name\":\"我的收藏\",\"type\":\"shop\"}},{\"image\":\"/api/static/nav03.png\",\"name\":\"个人设置\",\"link\":{\"path\":\"/pages/user_set/user_set\",\"name\":\"个人设置\",\"type\":\"shop\"}},{\"image\":\"/api/static/nav04.png\",\"name\":\"联系客服\",\"link\":{\"path\":\"/pages/customer_service/customer_service\",\"name\":\"联系客服\",\"type\":\"shop\"}},{\"image\":\"/api/static/nav05.png\",\"name\":\"关于我们\",\"link\":{\"path\":\"/pages/as_us/as_us\",\"name\":\"关于我们\",\"type\":\"shop\"}}]},\"styles\":{}},{\"id\":\"l84almsk2uhyf\",\"title\":\"资讯\",\"name\":\"news\",\"disabled\":1,\"content\":{},\"styles\":{}}]', 1661757188, 1663321380);
INSERT INTO `la_decorate_page` VALUES (2, 2, '个人中心', '[{\"title\":\"用户信息\",\"name\":\"user-info\",\"disabled\":1,\"content\":{},\"styles\":{}},{\"title\":\"我的服务\",\"name\":\"my-service\",\"content\":{\"style\":2,\"title\":\"服务中心\",\"data\":[{\"image\":\"/api/static/user_collect.png\",\"name\":\"我的收藏\",\"link\":{\"path\":\"/pages/collection/collection\",\"name\":\"我的收藏\",\"type\":\"shop\"}},{\"image\":\"/api/static/user_setting.png\",\"name\":\"个人设置\",\"link\":{\"path\":\"/pages/user_set/user_set\",\"name\":\"个人设置\",\"type\":\"shop\"}},{\"image\":\"/api/static/user_kefu.png\",\"name\":\"联系客服\",\"link\":{\"path\":\"/pages/customer_service/customer_service\",\"name\":\"联系客服\",\"type\":\"shop\"}}]},\"styles\":{}},{\"title\":\"个人中心广告图\",\"name\":\"user-banner\",\"content\":{\"enabled\":1,\"data\":[{\"image\":\"/api/static/ad01.jpg\",\"name\":\"\",\"link\":{}}]},\"styles\":{}}]', 1661757188, 1663320728);
INSERT INTO `la_decorate_page` VALUES (3, 3, '客服设置', '[{\"title\":\"客服设置\",\"name\":\"customer-service\",\"content\":{\"title\":\"添加客服二维码\",\"time\":\"早上 9:00 - 22:00\",\"mobile\":\"13800138000\",\"qrcode\":\"\"},\"styles\":{}}]', 1661757188, 1662689155);
COMMIT;

BEGIN;
INSERT INTO `la_article_category` VALUES (1, '文章资讯', 0, 1, 0, 1663317280, 1663317282, 0);
INSERT INTO `la_article_category` VALUES (2, '社会热点', 0, 1, 0, 1663321464, 1663321494, 0);
COMMIT;

BEGIN;
INSERT INTO `la_article` VALUES (1, 1, '让生活更精致！五款居家好物推荐，实用性超高', '##好物推荐🔥', '随着当代生活节奏的忙碌，很多人在闲暇之余都想好好的享受生活。随着科技的发展，也出现了越来越多可以帮助我们提升幸福感，让生活变得更精致的产品，下面周周就给大家盘点五款居家必备的好物，都是实用性很高的产品，周周可以保证大家买了肯定会喜欢。', '/api/static/article01.png', '<p><img src=\"https://likeadmin-java.yixiangonline.com/api/uploads/image/20220916/46d29489-4260-4917-8eca-d0f6cba6af23.png\" alt=\"\" data-href=\"\" style=\"\"/></p><p>拥有一台投影仪，闲暇时可以在家里直接看影院级别的大片，光是想想都觉得超级爽。市面上很多投影仪大几千，其实周周觉得没必要，选泰捷这款一千多的足够了，性价比非常高。</p><p>泰捷的专业度很高，在电视TV领域研发已经十年，有诸多专利和技术创新，荣获国内外多项技术奖项，拿下了腾讯创新工场投资，打造的泰捷视频TV端和泰捷电视盒子都获得了极高评价。</p><p>这款投影仪的分辨率在3000元内无敌，做到了真1080P高分辨率，也就是跟市场售价三千DLP投影仪一样的分辨率，真正做到了分毫毕现，像桌布的花纹、天空的云彩等，这些细节都清晰可见。</p><p>亮度方面，泰捷达到了850ANSI流明，同价位一般是200ANSI。这是因为泰捷为了提升亮度和LCD技术透射率低的问题，首创高功率LED灯源，让其亮度做到同价位最好。专业媒体也进行了多次对比，效果与3000元价位投影仪相当。</p><p>操作系统周周也很喜欢，完全不卡。泰捷作为资深音视频品牌，在系统优化方面有十年的研发经验，打造出的“零极”系统是业内公认效率最高、速度最快的系统，用户也评价它流畅度能一台顶三台，而且为了解决行业广告多这一痛点，系统内不植入任何广告。</p>', '红花', 9, 0, 1, 0, 1663317759, 1663322726, 0);
INSERT INTO `la_article` VALUES (2, 1, '埋葬UI设计师的坟墓不是内卷，而是免费模式', '', '本文从另外一个角度，聊聊作者对UI设计师职业发展前景的担忧，欢迎从事UI设计的同学来参与讨论，会有赠书哦', '/api/static/article02.jpeg', '<p><br></p><p style=\"text-align: justify;\">一个职业，卷，根本就没什么大不了的，尤其是成熟且收入高的职业，不卷才不符合事物发展的规律。何况 UI 设计师的人力市场到今天也和 5 年前一样，还是停留在大型菜鸡互啄的场面。远不能和医疗、证券、教师或者演艺练习生相提并论。</p><p style=\"text-align: justify;\">真正会让我对 <a href=\"https://www.uisdc.com/tag/ui\" target=\"_blank\">UI</a> 设计师发展前景觉得悲观的事情就只有一件 —— 国内的互联网产品免费机制。这也是一个我一直以来想讨论的话题，就在这次写一写。</p><p style=\"text-align: justify;\">国内互联网市场的发展，是一部浩瀚的 “免费经济” 发展史。虽然今天免费已经是深入国内民众骨髓的认知，但最早的中文互联网也是需要付费的，网游也都是要花钱的。</p><p style=\"text-align: justify;\">只是自有国情在此，付费确实阻碍了互联网行业的扩张和普及，一批创业家就开始通过免费的模式为用户提供服务，从而扩大了自己的产品覆盖面和普及程度。</p><p style=\"text-align: justify;\">印象最深的就是免费急先锋周鸿祎，和现在鲜少出现在公众视野不同，一零年前他是当之无愧的互联网教主，因为他开发出了符合中国国情的互联网产品 “打法”，让 360 的发展如日中天。</p><p style=\"text-align: justify;\">就是他在自传中提到：</p><p style=\"text-align: justify;\">只要是在互联网上每个人都需要的服务，我们就认为它是基础服务，基础服务一定是免费的，这样的话不会形成价值歧视。就是说，只要这种服务是每个人都一定要用的，我一定免费提供，而且是无条件免费。增值服务不是所有人都需要的，这个比例可能会相当低，它只是百分之几甚至更少比例的人需要，所以这种服务一定要收费……</p><p style=\"text-align: justify;\">这就是互联网的游戏规则，它决定了要想建立一个有效的商业模式，就一定要有海量的用户基数……</p>', '一一', 23, 0, 1, 0, 1663320938, 1663322854, 0);
INSERT INTO `la_article` VALUES (3, 2, '金山电池公布“沪广深市民绿色生活方式”调查结果', '', '60%以上受访者认为高质量的10分钟足以完成“自我充电”', '/api/static/article03.png', '<p style=\"text-align: left;\"><strong>深圳，2021年10月22日）</strong>生活在一线城市的沪广深市民一向以效率见称，工作繁忙和快节奏的生活容易缺乏充足的休息。近日，一项针对沪广深市民绿色生活方式而展开的网络问卷调查引起了大家的注意。问卷的问题设定集中于市民对休息时间的看法，以及从对循环充电电池的使用方面了解其对绿色生活方式的态度。该调查采用随机抽样的模式，并对最终收集的1,500份有效问卷进行专业分析后发现，超过60%的受访者表示，在每天的工作时段能拥有10分钟高质量的休息时间，就可以高效“自我充电”。该调查结果反映出，在快节奏时代下，人们需要高质量的休息时间，也要学会利用高效率的休息方式和工具来应对快节奏的生活，以时刻保持“满电”状态。</p><p style=\"text-align: left;\">　　<strong>60%以上受访者认为高质量的10分钟足以完成“自我充电”</strong></p><p style=\"text-align: left;\">　　这次调查超过1,500人，主要聚焦18至85岁的沪广深市民，了解他们对于休息时间的观念及使用充电电池的习惯，结果发现：</p><p style=\"text-align: left;\">　　· 90%以上有工作受访者每天工作时间在7小时以上，平均工作时间为8小时，其中43%以上的受访者工作时间超过9小时</p><p style=\"text-align: left;\">　　· 70%受访者认为在工作期间拥有10分钟“自我充电”时间不是一件困难的事情</p><p style=\"text-align: left;\">　　· 60%受访者认为在工作期间有10分钟休息时间足以为自己快速充电</p><p style=\"text-align: left;\">　　临床心理学家黄咏诗女士在发布会上分享为自己快速充电的实用技巧，她表示：“事实上，只要选择正确的休息方法，10分钟也足以为自己充电。以喝咖啡为例，我们可以使用心灵休息法 ── 静观呼吸，慢慢感受咖啡的温度和气味，如果能配合着聆听流水或海洋的声音，能够有效放松大脑及心灵。”</p><p style=\"text-align: left;\">　　这次调查结果反映出沪广深市民的希望在繁忙的工作中适时停下来，抽出10分钟喝杯咖啡、聆听音乐或小睡片刻，为自己充电。金山电池全新推出的“绿再十分充”超快速充电器仅需10分钟就能充好电，喝一杯咖啡的时间既能完成“自我充电”，也满足设备使用的用电需求，为提升工作效率和放松身心注入新能量。</p><p style=\"text-align: left;\">　　<strong>金山电池推出10分钟超快电池充电器*绿再十分充，以创新科技为市场带来革新体验</strong></p><p style=\"text-align: left;\">　　该问卷同时从沪广深市民对循环充电电池的使用方面进行了调查，以了解其对绿色生活方式的态度：</p><p style=\"text-align: left;\">　　· 87%受访者目前没有使用充电电池，其中61%表示会考虑使用充电电池</p><p style=\"text-align: left;\">　　· 58%受访者过往曾使用过充电电池，却只有20%左右市民仍在使用</p><p style=\"text-align: left;\">　　· 60%左右受访者认为充电电池尚未被广泛使用，主要障碍来自于充电时间过长、缺乏相关教育</p><p style=\"text-align: left;\">　　· 90%以上受访者认为充电电池充满电需要1小时或更长的时间</p><p style=\"text-align: left;\">　　金山电池一直致力于为大众提供安全可靠的充电电池，并与消费者的需求和生活方式一起演变及进步。今天，金山电池宣布推出10分钟超快电池充电器*绿再十分充，只需10分钟*即可将4粒绿再十分充充电电池充好电，充电速度比其他品牌提升3倍**。充电器的LED灯可以显示每粒电池的充电状态和模式，并提示用户是否错误插入已损坏电池或一次性电池。尽管其体型小巧，却具备多项创新科技 ，如拥有独特的充电算法以优化充电电流，并能根据各个电池类型、状况和温度用最短的时间为充电电池充好电;绿再十分充内置横流扇，有效防止电池温度过热和提供低噪音的充电环境等。<br></p>', '中网资讯科技', 3, 0, 1, 0, 1663322665, 1663322665, 0);
COMMIT;

BEGIN;
INSERT INTO `la_system_auth_menu` VALUES (1, 0, 'C', '工作台', 'system-icon-Desktop', 50, 'index:console', 'workbench', 'workbench/index', '', '', 1, 1, 0, 1650341765, 1668672757);
INSERT INTO `la_system_auth_menu` VALUES (100, 0, 'M', '权限管理', 'system-icon-Lock', 44, '', 'permission', '', '', '', 0, 1, 0, 1650341765, 1662626201);
INSERT INTO `la_system_auth_menu` VALUES (101, 100, 'C', '管理员', 'local-icon-wode', 0, 'system:admin:list', 'admin', 'permission/admin/index', '', '', 1, 1, 0, 1650341765, 1663301404);
INSERT INTO `la_system_auth_menu` VALUES (102, 101, 'A', '管理员详情', '', 0, 'system:admin:detail', '', '', '', '', 0, 1, 0, 1650341765, 1660201785);
INSERT INTO `la_system_auth_menu` VALUES (103, 101, 'A', '管理员新增', '', 0, 'system:admin:add', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (104, 101, 'A', '管理员编辑', '', 0, 'system:admin:edit', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (105, 101, 'A', '管理员删除', '', 0, 'system:admin:del', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (106, 101, 'A', '管理员状态', '', 0, 'system:admin:disable', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (110, 100, 'C', '角色管理', 'system-icon-Woman', 0, 'system:role:list', 'role', 'permission/role/index', '', '', 1, 1, 0, 1650341765, 1663301451);
INSERT INTO `la_system_auth_menu` VALUES (111, 110, 'A', '角色详情', '', 0, 'system:role:detail', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (112, 110, 'A', '角色新增', '', 0, 'system:role:add', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (113, 110, 'A', '角色编辑', '', 0, 'system:role:edit', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (114, 110, 'A', '角色删除', '', 0, 'system:role:del', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (120, 100, 'C', '菜单管理', 'system-icon-Tool', 0, 'system:menu:list', 'menu', 'permission/menu/index', '', '', 1, 1, 0, 1650341765, 1663301388);
INSERT INTO `la_system_auth_menu` VALUES (121, 120, 'A', '菜单详情', '', 0, 'system:menu:detail', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (122, 120, 'A', '菜单新增', '', 0, 'system:menu:add', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (123, 120, 'A', '菜单编辑', '', 0, 'system:menu:edit', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (124, 120, 'A', '菜单删除', '', 0, 'system:menu:del', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (130, 0, 'M', '组织管理', 'system-icon-Storage', 45, '', 'organization', '', '', '', 0, 1, 0, 1650341765, 1664416715);
INSERT INTO `la_system_auth_menu` VALUES (131, 130, 'C', '部门管理', 'system-icon-Location', 0, 'system:dept:list', 'department', 'organization/department/index', '', '', 1, 1, 0, 1650341765, 1660201994);
INSERT INTO `la_system_auth_menu` VALUES (132, 131, 'A', '部门详情', '', 0, 'system:dept:detail', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (133, 131, 'A', '部门新增', '', 0, 'system:dept:add', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (134, 131, 'A', '部门编辑', '', 0, 'system:dept:edit', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (135, 131, 'A', '部门删除', '', 0, 'system:dept:del', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (140, 130, 'C', '岗位管理', 'system-icon-Tag', 0, 'system:post:list', 'post', 'organization/post/index', '', '', 1, 1, 0, 1650341765, 1660202057);
INSERT INTO `la_system_auth_menu` VALUES (141, 140, 'A', '岗位详情', '', 0, 'system:post:detail', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (142, 140, 'A', '岗位新增', '', 0, 'system:post:add', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (143, 140, 'A', '岗位编辑', '', 0, 'system:post:edit', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (144, 140, 'A', '岗位删除', '', 0, 'system:post:del', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (200, 0, 'M', '其它管理', '', 0, '', '', '', '', '', 0, 0, 0, 1650341765, 1660636870);
INSERT INTO `la_system_auth_menu` VALUES (201, 200, 'M', '图库管理', '', 0, '', '', '', '', '', 0, 0, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (202, 201, 'A', '文件列表', '', 0, 'albums:albumList', '', '', '', '', 0, 0, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (203, 201, 'A', '文件命名', '', 0, 'albums:albumRename', '', '', '', '', 0, 0, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (204, 201, 'A', '文件移动', '', 0, 'albums:albumMove', '', '', '', '', 0, 0, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (205, 201, 'A', '文件删除', '', 0, 'albums:albumDel', '', '', '', '', 0, 0, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (206, 201, 'A', '分类列表', '', 0, 'albums:cateList', '', '', '', '', 0, 0, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (207, 201, 'A', '分类新增', '', 0, 'albums:cateAdd', '', '', '', '', 0, 0, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (208, 201, 'A', '分类命名', '', 0, 'albums:cateRename', '', '', '', '', 0, 0, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (209, 201, 'A', '分类删除', '', 0, 'albums:cateDel', '', '', '', '', 0, 0, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (215, 200, 'M', '上传管理', '', 0, '', '', '', '', '', 0, 0, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (216, 215, 'A', '上传图片', '', 0, 'upload:image', '', '', '', '', 0, 0, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (217, 215, 'A', '上传视频', '', 0, 'upload:video', '', '', '', '', 0, 0, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (500, 0, 'M', '系统设置', 'system-icon-Settings', 0, '', 'setting', '', '', '', 0, 1, 0, 1650341765, 1662626322);
INSERT INTO `la_system_auth_menu` VALUES (501, 500, 'M', '网站设置', 'system-icon-Apps', 10, '', 'website', '', '', '', 0, 0, 0, 1650341765, 1663233572);
INSERT INTO `la_system_auth_menu` VALUES (502, 560, 'C', '网站信息', '', 40, 'setting:website:detail', 'information', 'setting/website/information', '', '', 0, 1, 0, 1650341765, 1660202218);
INSERT INTO `la_system_auth_menu` VALUES (503, 502, 'A', '保存配置', '', 0, 'setting:website:save', '', '', '', '', 0, 0, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (505, 560, 'C', '网站备案', '', 30, 'setting:copyright:detail', 'filing', 'setting/website/filing', '', '', 0, 1, 0, 1650341765, 1660202294);
INSERT INTO `la_system_auth_menu` VALUES (506, 505, 'A', '备案保存', '', 0, 'setting:copyright:save', '', 'setting/website/protocol', '', '', 0, 0, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (510, 560, 'C', '政策协议', '', 20, 'setting:protocol:detail', 'protocol', 'setting/website/protocol', '', '', 0, 1, 0, 1660027606, 1660202312);
INSERT INTO `la_system_auth_menu` VALUES (511, 510, 'A', '协议保存', '', 0, 'setting:protocol:save', '', '', '', '', 0, 0, 0, 1660027606, 1663670865);
INSERT INTO `la_system_auth_menu` VALUES (515, 600, 'C', '字典管理', 'system-icon-Archive', 0, 'setting:dict:type:list', 'dict', 'setting/dict/type/index', '', '', 0, 1, 0, 1660035436, 1663226087);
INSERT INTO `la_system_auth_menu` VALUES (516, 515, 'A', '字典类型新增', '', 0, 'setting:dict:type:add', '', '', '', '', 0, 1, 0, 1660202761, 1660202761);
INSERT INTO `la_system_auth_menu` VALUES (517, 515, 'A', '字典类型编辑', '', 0, 'setting:dict:type:edit', '', '', '', '', 0, 1, 0, 1660202842, 1660202842);
INSERT INTO `la_system_auth_menu` VALUES (518, 515, 'A', '字典类型删除', '', 0, 'setting:dict:type:del', '', '', '', '', 0, 1, 0, 1660202903, 1660202903);
INSERT INTO `la_system_auth_menu` VALUES (519, 600, 'C', '字典数据管理', '', 0, 'setting:dict:data:list', 'dict/data', 'setting/dict/data/index', '/dev_tools/dict', '', 0, 0, 0, 1660202948, 1663309252);
INSERT INTO `la_system_auth_menu` VALUES (520, 515, 'A', '字典数据新增', '', 0, 'setting:dict:data:add', '', '', '', '', 0, 1, 0, 1660203117, 1660203117);
INSERT INTO `la_system_auth_menu` VALUES (521, 515, 'A', '字典数据编辑', '', 0, 'setting:dict:data:edit', '', '', '', '', 0, 1, 0, 1660203142, 1660203142);
INSERT INTO `la_system_auth_menu` VALUES (522, 515, 'A', '字典数据删除', '', 0, 'setting:dict:data:del', '', '', '', '', 0, 1, 0, 1660203159, 1660203159);
INSERT INTO `la_system_auth_menu` VALUES (550, 500, 'M', '系统维护', 'system-icon-Settings', 0, '', 'system', '', '', '', 0, 1, 0, 1650341765, 1660202466);
INSERT INTO `la_system_auth_menu` VALUES (551, 550, 'C', '系统环境', '', 0, 'monitor:server', 'environment', 'setting/system/environment', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (552, 550, 'C', '系统缓存', '', 0, 'monitor:cache', 'cache', 'setting/system/cache', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (553, 550, 'C', '系统日志', '', 0, 'system:log:operate', 'journal', 'setting/system/journal', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (555, 500, 'C', '存储设置', 'system-icon-Folder', 6, 'setting:storage:list', 'storage', 'setting/storage/index', '', '', 0, 1, 0, 1650341765, 1663312996);
INSERT INTO `la_system_auth_menu` VALUES (556, 555, 'A', '保存配置', '', 0, 'setting:storage:edit', '', '', '', '', 0, 1, 0, 1650341765, 1650341765);
INSERT INTO `la_system_auth_menu` VALUES (557, 0, 'M', 'AI模型管理', 'system-icon-Apps', 41, 'setting:ai:model:manage', 'ai_model_manage', '', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (558, 557, 'C', 'AI抠图 API', '', 0, 'setting:ai:model:detail', 'ai_model', 'setting/website/ai_model', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (559, 558, 'A', '保存配置', '', 0, 'setting:ai:model:save', '', '', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (565, 557, 'C', 'AI Provider 管理', '', 1, 'setting:ai:provider:detail', 'ai_provider', 'setting/website/ai_model', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (591, 565, 'A', '获取模型', '', 0, 'setting:ai:provider:models', '', '', '/ai_model_manage/ai_provider', '', 0, 1, 0, 1787673600, 1787673600);
INSERT INTO `la_system_auth_menu` VALUES (566, 557, 'C', 'AI工具能力代理', '', 2, 'setting:ai:ability:detail', 'ai_ability', 'setting/website/ai_model', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (560, 0, 'M', '官网设置', 'system-icon-Home', 42, 'setting:website:official:manage', 'official_site', '', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (561, 560, 'C', '热门工具', '', 80, 'setting:website:hottools:detail', 'hot_tools', 'setting/website/hot_tools', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (562, 561, 'A', '保存配置', '', 0, 'setting:website:hottools:save', '', '', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (563, 560, 'C', '前端布局', '', 130, 'setting:website:layout:detail', 'frontend_layout', 'setting/website/frontend_layout', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (564, 563, 'A', '保存配置', '', 0, 'setting:website:layout:save', '', '', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (571, 560, 'C', '菜单设置', '', 110, 'setting:website:sidebar:detail', 'sidebar', 'setting/website/sidebar', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (572, 571, 'A', '保存配置', '', 0, 'setting:website:sidebar:save', '', '', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (573, 560, 'C', '头部设置', '', 100, 'setting:website:header:detail', 'header', 'setting/website/header', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (574, 573, 'A', '保存配置', '', 0, 'setting:website:header:save', '', '', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (575, 560, 'C', '页脚设置', '', 90, 'setting:website:footer:detail', 'footer', 'setting/website/footer', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (576, 575, 'A', '保存配置', '', 0, 'setting:website:footer:save', '', '', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (569, 560, 'C', '工具主数据', '', 120, 'setting:website:catalog:detail', 'tools_catalog', 'setting/website/tools_catalog', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (570, 569, 'A', '保存配置', '', 0, 'setting:website:catalog:save', '', '', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (567, 560, 'C', 'SEO设置', '', 50, 'setting:website:seo:detail', 'seo', 'setting/website/seo', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (568, 567, 'A', '保存配置', '', 0, 'setting:website:seo:save', '', '', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (577, 560, 'C', '授权管理', 'IconLock', 10, 'setting:license:detail', 'license', 'setting/website/license', '', '', 0, 0, 1, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (578, 577, 'A', '授权保存', '', 0, 'setting:license:save', 'save', '', '/official_site/license', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (579, 577, 'A', '授权校验', '', 1, 'setting:license:verify', 'verify', '', '/official_site/license', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (580, 560, 'C', '热榜管理', '', 60, 'setting:website:toolranking:detail', 'tool_ranking_manage', 'setting/website/tool_ranking_manage', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (581, 580, 'A', '读取榜单', '', 0, 'setting:tool-ranking:list', '', '', '/official_site/tool_ranking_manage', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (582, 580, 'A', '读取概览', '', 1, 'setting:tool-ranking:summary', '', '', '/official_site/tool_ranking_manage', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (583, 560, 'C', '榜单配置', '', 70, 'setting:website:toolranking:config:detail', 'tool_ranking_config', 'setting/website/tool_ranking_config', '', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (584, 583, 'A', '读取配置', '', 0, 'setting:tool-ranking:config:detail', '', '', '/official_site/tool_ranking_config', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (585, 583, 'A', '保存配置', '', 1, 'setting:tool-ranking:config:save', '', '', '/official_site/tool_ranking_config', '', 0, 1, 0, 1711000000, 1711000000);
INSERT INTO `la_system_auth_menu` VALUES (588, 0, 'M', '运营管理', 'system-icon-Dashboard', 44, 'operation:manage', 'operation', '', '', '', 0, 1, 0, 1787587200, 1787587200);
INSERT INTO `la_system_auth_menu` VALUES (589, 588, 'C', '广告管理', '', 100, 'operation:advertising:detail', 'advertising', 'operation/advertising/index', '', '', 0, 1, 0, 1787587200, 1787587200);
INSERT INTO `la_system_auth_menu` VALUES (590, 589, 'A', '保存广告', '', 0, 'operation:advertising:save', '', '', '/operation/advertising', '', 0, 1, 0, 1787587200, 1787587200);
INSERT INTO `la_system_auth_menu` VALUES (600, 0, 'M', '开发工具', 'system-icon-Pen', 0, '', 'dev_tools', '', '', '', 0, 1, 0, 1660027606, 1664335701);
INSERT INTO `la_system_auth_menu` VALUES (610, 600, 'C', '代码生成器', 'system-icon-File', 0, 'gen:list', 'code', 'dev_tools/code/index', '', '', 0, 1, 0, 1660028954, 1660532510);
INSERT INTO `la_system_auth_menu` VALUES (611, 610, 'A', '导入数据表', '', 0, 'gen:importTable', '', '', '', '', 0, 1, 0, 1660532389, 1660532389);
INSERT INTO `la_system_auth_menu` VALUES (612, 610, 'A', '生成代码', '', 0, 'gen:genCode', '', '', '', '', 0, 1, 0, 1660532421, 1660532421);
INSERT INTO `la_system_auth_menu` VALUES (613, 610, 'A', '下载代码', '', 0, 'gen:downloadCode', '', '', '', '', 0, 1, 0, 1660532437, 1660532437);
INSERT INTO `la_system_auth_menu` VALUES (614, 610, 'A', '预览代码', '', 0, 'gen:previewCode', '', '', '', '', 0, 1, 0, 1660532549, 1660532549);
INSERT INTO `la_system_auth_menu` VALUES (616, 610, 'A', '同步表结构', '', 0, 'gen:syncTable', '', '', '', '', 0, 1, 0, 1660532781, 1660532781);
INSERT INTO `la_system_auth_menu` VALUES (617, 610, 'A', '删除数据表', '', 0, 'gen:delTable', '', '', '', '', 0, 1, 0, 1660532800, 1660532800);
INSERT INTO `la_system_auth_menu` VALUES (618, 610, 'A', '数据表详情', '', 0, 'gen:detail', '', '', '', '', 0, 1, 0, 1660532964, 1660532977);
INSERT INTO `la_system_auth_menu` VALUES (700, 0, 'M', '素材管理', 'system-icon-Image', 43, '', 'material', '', '', '', 0, 1, 0, 1660203293, 1663300847);
INSERT INTO `la_system_auth_menu` VALUES (701, 700, 'C', '素材中心', 'system-icon-Image', 0, '', 'index', 'material/index', '', '', 0, 1, 0, 1660203402, 1663301493);
INSERT INTO `la_system_auth_menu` VALUES (702, 700, 'C', '图标库', 'system-icon-Apps', 1, 'material:icon:library', 'icons', 'material/icons', '', '', 0, 1, 0, 1711000000, 1711000000);
-- INSERT INTO `la_system_auth_menu` VALUES (703, 0, 'M', '文章资讯', 'system-icon-Message', 49, '', 'article', '', '', '', 0, 1, 0, 1661757636, 1664416659);
-- INSERT INTO `la_system_auth_menu` VALUES (704, 703, 'C', '文章管理', 'system-icon-Message', 3, 'article:list', 'lists', 'article/lists/index', '', '', 1, 1, 0, 1661757743, 1663658220);
-- INSERT INTO `la_system_auth_menu` VALUES (705, 703, 'C', '文章栏目', 'system-icon-Tags', 0, 'article:cate:list', 'column', 'article/column/index', '', '', 1, 1, 0, 1661759218, 1663578137);
INSERT INTO `la_system_auth_menu` VALUES (706, 0, 'M', '渠道设置', 'system-icon-Message', 46, '', 'channel', '', '', '', 0, 1, 0, 1661767630, 1664416682);
-- INSERT INTO `la_system_auth_menu` VALUES (707, 706, 'C', 'H5设置', 'system-icon-Mobile', 0, 'channel:h5:detail', 'h5', 'channel/h5', '', '', 0, 1, 0, 1661768566, 1662626123);
-- INSERT INTO `la_system_auth_menu` VALUES (708, 706, 'M', '微信公众号', 'local-icon-dingdan', 0, '', 'wx_oa', '', '', '', 0, 1, 0, 1661769386, 1663301237);
-- INSERT INTO `la_system_auth_menu` VALUES (709, 708, 'C', '公众号配置', '', 0, 'channel:oa:detail', 'config', 'channel/wx_oa/config', '', '', 0, 1, 0, 1661769457, 1662638440);
-- INSERT INTO `la_system_auth_menu` VALUES (710, 706, 'C', '微信小程序', 'local-icon-weixin', 0, 'channel:mp:detail', 'weapp', 'channel/weapp', '', '', 0, 1, 0, 1661823746, 1663301266);
INSERT INTO `la_system_auth_menu` VALUES (711, 706, 'C', '微信开放平台', 'system-icon-Dashboard', 0, 'channel:wx:detail', 'wx_dev', 'channel/wx_dev', '', '', 0, 1, 0, 1661824989, 1663310675);
INSERT INTO `la_system_auth_menu` VALUES (712, 0, 'M', '用户管理', 'system-icon-User', 48, '', 'consumer', '', '', '', 0, 1, 0, 1661832966, 1663294141);
INSERT INTO `la_system_auth_menu` VALUES (713, 712, 'C', '用户列表', 'system-icon-User', 100, 'user:list', 'lists', 'consumer/lists/index', '', '', 0, 1, 0, 1661839365, 1663301092);
-- INSERT INTO `la_system_auth_menu` VALUES (714, 714, 'A', '用户编辑', '', 0, 'user:edit', 'detail', 'consumer/lists/detail', '/consumer/lists', '', 0, 0, 0, 1661840502, 1662627718);
-- INSERT INTO `la_system_auth_menu` VALUES (715, 600, 'C', '编辑数据表', '', 0, 'gen:editTable', 'code/edit', 'dev_tools/code/edit', '/dev_tools/code', '', 0, 0, 0, 1661843525, 1661843615);
-- INSERT INTO `la_system_auth_menu` VALUES (716, 705, 'A', '栏目详情', '', 0, 'article:cate:detail', 'lists/edit', 'article/lists/edit', '/article/lists', '', 0, 0, 0, 1661844126, 1662626009);
-- INSERT INTO `la_system_auth_menu` VALUES (717, 0, 'M', '装修管理', 'system-icon-Brush', 47, '', 'decoration', '', '', '', 0, 1, 0, 1661845634, 1664416675);
-- INSERT INTO `la_system_auth_menu` VALUES (718, 717, 'C', '页面装修', 'system-icon-Copy', 0, 'decorate:pages:detail', 'pages', 'decoration/pages/index', '', '', 0, 1, 0, 1661845678, 1663294313);
-- INSERT INTO `la_system_auth_menu` VALUES (719, 717, 'C', '底部导航', 'system-icon-Location', 0, 'decorate:tabbar:detail', 'tabbar', 'decoration/tabbar', '', '', 0, 1, 0, 1661845811, 1663294354);
-- INSERT INTO `la_system_auth_menu` VALUES (720, 500, 'M', '消息通知', 'system-icon-Message', 9, '', 'message', '', '', '', 0, 1, 0, 1661848742, 1662626364);
-- INSERT INTO `la_system_auth_menu` VALUES (721, 720, 'C', '通知设置', '', 0, 'setting:notice:list', 'notice', 'message/notice/index', '', '', 0, 1, 0, 1661848772, 1662638112);
-- INSERT INTO `la_system_auth_menu` VALUES (722, 720, 'C', '通知详情', '', 0, 'setting:notice:detail', 'notice/edit', 'message/notice/edit', '/setting/message/notice', '', 0, 0, 0, 1661848944, 1663142853);
-- INSERT INTO `la_system_auth_menu` VALUES (723, 720, 'C', '短信设置', '', 0, 'setting:sms:list', 'short_letter', 'message/short_letter/index', '', '', 0, 1, 0, 1661848995, 1662638165);
-- INSERT INTO `la_system_auth_menu` VALUES (724, 500, 'M', '用户设置', 'local-icon-keziyuyue', 8, '', 'user', '', '', '', 0, 1, 0, 1662455407, 1663301570);
-- INSERT INTO `la_system_auth_menu` VALUES (725, 724, 'C', '用户设置', '', 0, 'setting:user:detail', 'setup', 'setting/user/setup', '', '', 0, 1, 0, 1662455555, 1663312225);
-- INSERT INTO `la_system_auth_menu` VALUES (726, 724, 'C', '登录注册', '', 0, 'setting:login:detail', 'login_register', 'setting/user/login_register', '', '', 0, 1, 0, 1662456475, 1663312263);
-- INSERT INTO `la_system_auth_menu` VALUES (728, 500, 'C', '热门搜索', 'system-icon-Search', 7, 'setting:search:detail', 'search', 'setting/search/index', '', '', 0, 1, 0, 1662540429, 1663312392);
-- INSERT INTO `la_system_auth_menu` VALUES (730, 704, 'A', '文章新增', '', 0, 'article:add', '', '', '', '', 0, 1, 0, 1662625870, 1662625870);
-- INSERT INTO `la_system_auth_menu` VALUES (732, 704, 'A', '文章删除', '', 0, 'article:del', '', '', '', '', 0, 1, 0, 1662625894, 1662625894);
-- INSERT INTO `la_system_auth_menu` VALUES (733, 704, 'A', '文章状态', '', 0, 'article:change', '', '', '', '', 0, 1, 0, 1662625909, 1662625909);
-- INSERT INTO `la_system_auth_menu` VALUES (734, 705, 'A', '栏目新增', '', 0, 'article:cate:add', '', '', '', '', 0, 1, 0, 1662626024, 1662626024);
-- INSERT INTO `la_system_auth_menu` VALUES (735, 705, 'A', '栏目编辑', '', 0, 'article:cate:edit', '', '', '', '', 0, 1, 0, 1662626044, 1662626044);
-- INSERT INTO `la_system_auth_menu` VALUES (736, 705, 'A', '栏目删除', '', 0, 'article:cate:del', '', '', '', '', 0, 1, 0, 1662626060, 1662626060);
-- INSERT INTO `la_system_auth_menu` VALUES (737, 705, 'A', '栏目状态', '', 0, 'article:cate:change', '', '', '', '', 0, 1, 0, 1662626077, 1662626077);
-- INSERT INTO `la_system_auth_menu` VALUES (738, 704, 'A', '文章编辑', '', 0, 'article:edit', 'lists/edit', 'article/lists/edit', '', '', 0, 0, 0, 1662626554, 1663309550);
INSERT INTO `la_system_auth_menu` VALUES (739, 712, 'C', '用户详情', '', 0, 'user:detail', 'detail', 'consumer/lists/detail', '/consumer/lists', '', 0, 0, 0, 1662628049, 1662628049);
INSERT INTO `la_system_auth_menu` VALUES (740, 739, 'A', '用户编辑', '', 0, 'user:edit', '', '', '', '', 0, 1, 0, 1662628085, 1662628085);
INSERT INTO `la_system_auth_menu` VALUES (586, 712, 'C', '登录与商业化', '', 90, 'setting:login:detail', 'login_commerce', 'setting/user/login_register', '', '', 0, 1, 0, 1785513600, 1785513600);
INSERT INTO `la_system_auth_menu` VALUES (587, 586, 'A', '保存配置', '', 0, 'setting:login:save', '', '', '/consumer/login_commerce', '', 0, 1, 0, 1785513600, 1785513600);
-- INSERT INTO `la_system_auth_menu` VALUES (741, 721, 'A', '设置保存', '', 0, 'setting:notice:save', '', '', '', '', 0, 1, 0, 1662638049, 1662638049);
-- INSERT INTO `la_system_auth_menu` VALUES (742, 723, 'A', '短信详情', '', 0, 'setting:sms:detail', '', '', '', '', 0, 1, 0, 1662638180, 1662638180);
-- INSERT INTO `la_system_auth_menu` VALUES (743, 723, 'A', '保存设置', '', 0, 'setting:sms:save', '', '', '', '', 0, 1, 0, 1662638196, 1662638196);
-- INSERT INTO `la_system_auth_menu` VALUES (744, 707, 'A', '设置保存', '', 0, 'channel:h5:save', '', '', '', '', 0, 1, 0, 1662638326, 1662638326);
-- INSERT INTO `la_system_auth_menu` VALUES (745, 710, 'A', '设置保存', '', 0, 'channel:mp:detail', '', '', '', '', 0, 1, 0, 1662638359, 1662638359);
INSERT INTO `la_system_auth_menu` VALUES (746, 711, 'A', '保存设置', '', 0, 'channel:wx:save', '', '', '', '', 0, 1, 0, 1662638410, 1662638410);
-- INSERT INTO `la_system_auth_menu` VALUES (747, 709, 'A', '保存', '', 0, 'channel:oa:save', '', '', '', '', 0, 1, 0, 1662638459, 1663310514);
-- INSERT INTO `la_system_auth_menu` VALUES (748, 708, 'C', '菜单管理', '', 0, '', 'menu', 'channel/wx_oa/menu', '', '', 0, 1, 0, 1663050714, 1663050714);
-- INSERT INTO `la_system_auth_menu` VALUES (750, 708, 'C', '关注回复', '', 0, 'channel:oaReplyFollow:list', 'follow', 'channel/wx_oa/reply/follow_reply', '', '', 0, 1, 0, 1663149592, 1664511108);
-- INSERT INTO `la_system_auth_menu` VALUES (751, 708, 'C', '关键字回复', '', 0, 'channel:oaReplyKeyword:list', 'keyword', 'channel/wx_oa/reply/keyword_reply', '', '', 0, 1, 0, 1663149622, 1664511241);
-- INSERT INTO `la_system_auth_menu` VALUES (752, 708, 'C', '默认回复', '', 0, 'channel:oaReplyDefault:list', 'default', 'channel/wx_oa/reply/default_reply', '', '', 0, 1, 0, 1663149650, 1664517685);
-- INSERT INTO `la_system_auth_menu` VALUES (753, 718, 'A', '保存', '', 0, 'decorate:pages:save', '', '', '', '', 0, 1, 0, 1663236648, 1663236648);
-- INSERT INTO `la_system_auth_menu` VALUES (754, 719, 'A', '保存', '', 0, 'decorate:tabbar:save', '', '', '', '', 0, 1, 0, 1663236675, 1663236675);
-- INSERT INTO `la_system_auth_menu` VALUES (755, 704, 'A', '文章详情', '', 0, 'article:detail', '', '', '', '', 0, 1, 0, 1663310241, 1663310252);
-- INSERT INTO `la_system_auth_menu` VALUES (756, 748, 'A', '发布', '', 0, 'channel:oaMenu:publish', '', '', '', '', 0, 1, 0, 1663310379, 1663310525);
-- INSERT INTO `la_system_auth_menu` VALUES (757, 748, 'A', '保存', '', 0, 'channel:oaMenu:save', '', '', '', '', 0, 1, 0, 1663310556, 1663310556);
-- INSERT INTO `la_system_auth_menu` VALUES (758, 725, 'A', '保存', '', 0, 'setting:user:save', '', '', '', '', 0, 1, 0, 1663312193, 1663312193);
-- INSERT INTO `la_system_auth_menu` VALUES (759, 726, 'A', '保存', '', 0, 'setting:login:save', '', '', '', '', 0, 1, 0, 1663312289, 1663312289);
-- INSERT INTO `la_system_auth_menu` VALUES (760, 728, 'A', '保存', '', 0, 'setting:search:save', '', '', '', '', 0, 1, 0, 1663312423, 1663312423);
-- INSERT INTO `la_system_auth_menu` VALUES (762, 750, 'A', '新增', '', 0, 'channel:oaReplyFollow:add', '', '', '', '', 1, 1, 0, 1664511131, 1664511131);
-- INSERT INTO `la_system_auth_menu` VALUES (763, 750, 'A', '状态', '', 0, 'channel:oaReplyFollow:status', '', '', '', '', 1, 1, 0, 1664511160, 1664511160);
-- INSERT INTO `la_system_auth_menu` VALUES (764, 750, 'A', '编辑', '', 0, 'channel:oaReplyFollow:edit', '', '', '', '', 1, 1, 0, 1664511177, 1664511190);
-- INSERT INTO `la_system_auth_menu` VALUES (765, 750, 'A', '删除', '', 0, 'channel:oaReplyFollow:del', '', '', '', '', 1, 1, 0, 1664511208, 1664511208);
-- INSERT INTO `la_system_auth_menu` VALUES (766, 751, 'A', '新增', '', 0, 'channel:oaReplyKeyword:add', '', '', '', '', 1, 1, 0, 1664511264, 1664511264);
-- INSERT INTO `la_system_auth_menu` VALUES (767, 751, 'A', '状态', '', 0, 'channel:oaReplyKeyword:status', '', '', '', '', 1, 1, 0, 1664511295, 1664511295);
-- INSERT INTO `la_system_auth_menu` VALUES (768, 751, 'A', '编辑', '', 0, 'channel:oaReplyKeyword:edit', '', '', '', '', 1, 1, 0, 1664511312, 1664511312);
-- INSERT INTO `la_system_auth_menu` VALUES (769, 751, 'A', '删除', '', 0, 'channel:oaReplyKeyword:del', '', '', '', '', 1, 1, 0, 1664511327, 1664511327);
-- INSERT INTO `la_system_auth_menu` VALUES (770, 752, 'A', '新增', '', 0, 'channel:oaReplyDefault:add', '', '', '', '', 1, 1, 0, 1664517709, 1664517709);
-- INSERT INTO `la_system_auth_menu` VALUES (771, 752, 'A', '编辑', '', 0, 'channel:oaReplyDefault:edit', '', '', '', '', 1, 1, 0, 1664517725, 1664517725);
-- INSERT INTO `la_system_auth_menu` VALUES (772, 752, 'A', '状态', '', 0, 'channel:oaReplyDefault:status', '', '', '', '', 1, 1, 0, 1664517757, 1664517757);
-- INSERT INTO `la_system_auth_menu` VALUES (773, 752, 'A', '删除', '', 0, 'channel:oaReplyDefault:del', '', '', '', '', 1, 1, 0, 1664517778, 1664517778);
-- INSERT INTO `la_system_auth_menu` VALUES (774, 610, 'A', '导入数据表列表', '', 0, 'gen:db', '', '', '', '', 1, 1, 0, 1665646316, 1665646316);
-- INSERT INTO `la_system_auth_menu` VALUES (775, 703, 'C', '文章添加/编辑', '', 0, 'article:add/edit', 'lists/edit', 'article/lists/edit', '/article/lists', '', 0, 0, 0, 1668677477, 1668677477);
UPDATE `la_system_config`
SET `value` = REPLACE(`value`, 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B', 'deepseek-ai/DeepSeek-V3.2')
WHERE `type` = 'ai_model' AND `name` = 'ai_provider_configs';
COMMIT;
