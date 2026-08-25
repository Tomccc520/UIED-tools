SET NAMES utf8mb4;

-- 修复后台菜单中文名称乱码（仅处理出现 ? 的记录，避免覆盖已正常配置）
UPDATE la_system_auth_menu SET menu_name = '工作台' WHERE menu_type = 'C' AND paths = 'workbench' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '权限管理' WHERE menu_type = 'M' AND paths = 'permission' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '管理员列表' WHERE menu_type = 'C' AND perms = 'system:admin:list' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '管理员详情' WHERE menu_type = 'A' AND perms = 'system:admin:detail' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '管理员新增' WHERE menu_type = 'A' AND perms = 'system:admin:add' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '管理员编辑' WHERE menu_type = 'A' AND perms = 'system:admin:edit' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '管理员删除' WHERE menu_type = 'A' AND perms = 'system:admin:del' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '管理员停用' WHERE menu_type = 'A' AND perms = 'system:admin:disable' AND menu_name LIKE '%?%';

UPDATE la_system_auth_menu SET menu_name = '角色管理' WHERE menu_type = 'C' AND paths = 'role' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '角色详情' WHERE menu_type = 'A' AND perms = 'system:role:detail' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '角色新增' WHERE menu_type = 'A' AND perms = 'system:role:add' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '角色编辑' WHERE menu_type = 'A' AND perms = 'system:role:edit' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '角色删除' WHERE menu_type = 'A' AND perms = 'system:role:del' AND menu_name LIKE '%?%';

UPDATE la_system_auth_menu SET menu_name = '菜单管理' WHERE menu_type = 'C' AND paths = 'menu' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '菜单详情' WHERE menu_type = 'A' AND perms = 'system:menu:detail' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '菜单新增' WHERE menu_type = 'A' AND perms = 'system:menu:add' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '菜单编辑' WHERE menu_type = 'A' AND perms = 'system:menu:edit' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '菜单删除' WHERE menu_type = 'A' AND perms = 'system:menu:del' AND menu_name LIKE '%?%';

UPDATE la_system_auth_menu SET menu_name = '组织管理' WHERE menu_type = 'M' AND paths = 'organization' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '部门管理' WHERE menu_type = 'C' AND paths = 'department' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '部门详情' WHERE menu_type = 'A' AND perms = 'system:dept:detail' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '部门新增' WHERE menu_type = 'A' AND perms = 'system:dept:add' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '部门编辑' WHERE menu_type = 'A' AND perms = 'system:dept:edit' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '部门删除' WHERE menu_type = 'A' AND perms = 'system:dept:del' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '岗位管理' WHERE menu_type = 'C' AND paths = 'post' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '岗位详情' WHERE menu_type = 'A' AND perms = 'system:post:detail' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '岗位新增' WHERE menu_type = 'A' AND perms = 'system:post:add' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '岗位编辑' WHERE menu_type = 'A' AND perms = 'system:post:edit' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '岗位删除' WHERE menu_type = 'A' AND perms = 'system:post:del' AND menu_name LIKE '%?%';

UPDATE la_system_auth_menu SET menu_name = '系统设置' WHERE menu_type = 'M' AND paths = 'setting' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '网站设置' WHERE menu_type = 'M' AND paths = 'website' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '网站信息' WHERE menu_type = 'C' AND paths = 'information' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '保存配置' WHERE menu_type = 'A' AND perms = 'setting:website:save' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '网站备案' WHERE menu_type = 'C' AND paths = 'filing' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '备案保存' WHERE menu_type = 'A' AND perms = 'setting:copyright:save' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '政策协议' WHERE menu_type = 'C' AND paths = 'protocol' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '协议保存' WHERE menu_type = 'A' AND perms = 'setting:protocol:save' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '字典管理' WHERE menu_type = 'C' AND paths = 'dict' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '字典类型新增' WHERE menu_type = 'A' AND perms = 'setting:dict:type:add' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '字典类型编辑' WHERE menu_type = 'A' AND perms = 'setting:dict:type:edit' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '字典类型删除' WHERE menu_type = 'A' AND perms = 'setting:dict:type:del' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '字典数据管理' WHERE menu_type = 'C' AND paths = 'dict/data' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '字典数据新增' WHERE menu_type = 'A' AND perms = 'setting:dict:data:add' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '字典数据编辑' WHERE menu_type = 'A' AND perms = 'setting:dict:data:edit' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '字典数据删除' WHERE menu_type = 'A' AND perms = 'setting:dict:data:del' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '系统维护' WHERE menu_type = 'M' AND paths = 'system' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '系统环境' WHERE menu_type = 'C' AND paths = 'environment' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '系统缓存' WHERE menu_type = 'C' AND paths = 'cache' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '系统日志' WHERE menu_type = 'C' AND paths = 'journal' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '存储设置' WHERE menu_type = 'C' AND paths = 'storage' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '保存配置' WHERE menu_type = 'A' AND perms = 'setting:storage:edit' AND menu_name LIKE '%?%';

UPDATE la_system_auth_menu SET menu_name = 'AI模型管理' WHERE menu_type = 'M' AND paths = 'ai_model_manage' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = 'AI抠图模型' WHERE menu_type = 'C' AND paths = 'ai_model' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = 'AI Provider 管理' WHERE menu_type = 'C' AND paths = 'ai_provider' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = 'AI工具能力代理' WHERE menu_type = 'C' AND paths = 'ai_ability' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '保存配置' WHERE menu_type = 'A' AND perms = 'setting:ai:model:save' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '官网设置' WHERE menu_type = 'M' AND paths = 'official_site' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '热门工具' WHERE menu_type = 'C' AND paths = 'hot_tools' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '保存配置' WHERE menu_type = 'A' AND perms = 'setting:website:hottools:save' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '前端布局' WHERE menu_type = 'C' AND paths = 'frontend_layout' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '保存配置' WHERE menu_type = 'A' AND perms = 'setting:website:layout:save' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '菜单设置' WHERE menu_type = 'C' AND paths = 'sidebar' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '保存配置' WHERE menu_type = 'A' AND perms = 'setting:website:sidebar:save' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '头部设置' WHERE menu_type = 'C' AND paths = 'header' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '保存配置' WHERE menu_type = 'A' AND perms = 'setting:website:header:save' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '页脚设置' WHERE menu_type = 'C' AND paths = 'footer' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '保存配置' WHERE menu_type = 'A' AND perms = 'setting:website:footer:save' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '工具主数据' WHERE menu_type = 'C' AND paths = 'tools_catalog' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '保存配置' WHERE menu_type = 'A' AND perms = 'setting:website:catalog:save' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = 'SEO设置' WHERE menu_type = 'C' AND paths = 'seo' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '保存配置' WHERE menu_type = 'A' AND perms = 'setting:website:seo:save' AND menu_name LIKE '%?%';

UPDATE la_system_auth_menu SET menu_name = '开发工具' WHERE menu_type = 'M' AND paths = 'dev_tools' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '代码生成器' WHERE menu_type = 'C' AND paths = 'code' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '导入数据表' WHERE menu_type = 'A' AND perms = 'gen:importTable' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '生成代码' WHERE menu_type = 'A' AND perms = 'gen:genCode' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '下载代码' WHERE menu_type = 'A' AND perms = 'gen:downloadCode' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '预览代码' WHERE menu_type = 'A' AND perms = 'gen:previewCode' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '同步表结构' WHERE menu_type = 'A' AND perms = 'gen:syncTable' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '删除数据表' WHERE menu_type = 'A' AND perms = 'gen:delTable' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '数据表详情' WHERE menu_type = 'A' AND perms = 'gen:detail' AND menu_name LIKE '%?%';

UPDATE la_system_auth_menu SET menu_name = '素材管理' WHERE menu_type = 'M' AND paths = 'material' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '素材中心' WHERE menu_type = 'C' AND paths = 'index' AND component = 'material/index' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '图标库' WHERE menu_type = 'C' AND paths = 'icons' AND component = 'material/icons' AND menu_name LIKE '%?%';

UPDATE la_system_auth_menu SET menu_name = '渠道设置' WHERE menu_type = 'M' AND paths = 'channel' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = 'H5设置' WHERE menu_type = 'C' AND paths = 'h5' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '微信公众号' WHERE menu_type = 'M' AND paths = 'wx_oa' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '公众号配置' WHERE menu_type = 'C' AND paths = 'config' AND component = 'channel/wx_oa/config' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '微信小程序' WHERE menu_type = 'C' AND paths = 'weapp' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '微信开发平台' WHERE menu_type = 'C' AND paths = 'wx_dev' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '保存设置' WHERE menu_type = 'A' AND perms IN ('channel:h5:save', 'channel:mp:save', 'channel:wx:save', 'channel:oa:save') AND menu_name LIKE '%?%';

UPDATE la_system_auth_menu SET menu_name = '用户管理' WHERE menu_type = 'M' AND paths = 'consumer' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '用户列表' WHERE menu_type = 'C' AND paths = 'lists' AND component = 'consumer/lists/index' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '用户详情' WHERE menu_type = 'C' AND paths = 'detail' AND component = 'consumer/lists/detail' AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '用户编辑' WHERE menu_type = 'A' AND perms = 'user:edit' AND menu_name LIKE '%?%';

UPDATE la_system_auth_menu SET menu_name = '其它管理' WHERE id = 200 AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '图库管理' WHERE id = 201 AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '文件列表' WHERE id = 202 AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '文件命名' WHERE id = 203 AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '文件移动' WHERE id = 204 AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '文件删除' WHERE id = 205 AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '分类列表' WHERE id = 206 AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '分类新增' WHERE id = 207 AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '分类命名' WHERE id = 208 AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '分类删除' WHERE id = 209 AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '上传管理' WHERE id = 215 AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '上传图片' WHERE id = 216 AND menu_name LIKE '%?%';
UPDATE la_system_auth_menu SET menu_name = '上传视频' WHERE id = 217 AND menu_name LIKE '%?%';

-- 修复角色/部门/通知中文种子数据乱码
UPDATE la_system_auth_role SET name = '审核员', remark = '审核数据' WHERE id = 1 AND (name LIKE '%?%' OR remark LIKE '%?%');
UPDATE la_system_auth_dept SET name = '默认部门' WHERE id = 1 AND name LIKE '%?%';
UPDATE la_notice_setting SET name = '登录验证码', remarks = '用户手机号码登录时发送' WHERE id = 1 AND (name LIKE '%?%' OR remarks LIKE '%?%');
UPDATE la_notice_setting SET name = '绑定手机验证码', remarks = '用户绑定手机号码时发送' WHERE id = 2 AND (name LIKE '%?%' OR remarks LIKE '%?%');
UPDATE la_notice_setting SET name = '变更手机验证码', remarks = '用户变更手机号码时发送' WHERE id = 3 AND (name LIKE '%?%' OR remarks LIKE '%?%');
UPDATE la_notice_setting SET name = '找回登录密码验证码', remarks = '用户找回登录密码号码时发送' WHERE id = 4 AND (name LIKE '%?%' OR remarks LIKE '%?%');

-- 修复官网配置中常见中文文案乱码
UPDATE la_system_config SET value = '免费在线工具集' WHERE type = 'website' AND name = 'toolsSiteSlogan' AND value LIKE '%?%';
UPDATE la_system_config SET value = '推荐工具' WHERE type = 'website' AND name = 'toolsSidebarRecommendTitle' AND value LIKE '%?%';
UPDATE la_system_config SET value = '工具快捷入口' WHERE type = 'website' AND name = 'toolsFooterQuickTitle' AND value LIKE '%?%';
UPDATE la_system_config SET value = '友情链接' WHERE type = 'website' AND name = 'toolsFooterFriendTitle' AND value LIKE '%?%';
UPDATE la_system_config SET value = '官方媒体' WHERE type = 'website' AND name = 'toolsOfficialMediaTitle' AND value LIKE '%?%';
UPDATE la_system_config SET value = '技术支持' WHERE type = 'website' AND name = 'toolsFooterSupportLabel' AND value LIKE '%?%';
UPDATE la_system_config SET value = '[{"title":"官方入口","items":[{"name":"官网首页","link":"https://uiedtool.com/"},{"name":"AI工具箱","link":"https://uiedtool.com/tools/ai/toolbox"},{"name":"视频工具","link":"https://uiedtool.com/tools/video"},{"name":"更新日志","link":"https://uiedtool.com/changelog"}]},{"title":"社区内容","items":[{"name":"AI资讯","link":"https://hot.uied.cn/"},{"name":"设计导航","link":"https://hao.uied.cn/"},{"name":"UIED技术团队","link":"https://fsuied.com"},{"name":"关于我们","link":"https://uiedtool.com/about"}]}]' WHERE type = 'website' AND name = 'toolsFooterFriendSections' AND value LIKE '%?%';
UPDATE la_system_config SET value = '[{"name":"知乎","link":"https://www.zhihu.com/org/uiedyong-hu-ti-yan-jiao-liu-xue-xi"},{"name":"小红书","link":"https://www.xiaohongshu.com/user/profile/5dc2ccb0000000000100ba83"},{"name":"微博","link":"https://weibo.com/u/7542146005"},{"name":"B站","link":"https://space.bilibili.com/3493135908866790?spm_id_from=333.1007.0.0"}]' WHERE type = 'website' AND name = 'toolsOfficialMediaLinks' AND value LIKE '%?%';
UPDATE la_system_config SET value = '[{"title":"Adobe 正版全家桶可用AI","desc":"Adobe 正版全家桶可用AI","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"Gemini3 可用 nanobanana","desc":"Gemini3 可用 nanobanana","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"AI学习网站","desc":"每天逛一逛","link":"https://www.uied.cn/category/aigc/ai"},{"title":"免费AI生成PPT","desc":"AI智能生成PPT","link":"https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047"},{"title":"AIGC学习网站","desc":"UIED技术团队官网","link":"https://uied.cn/"},{"title":"AIGC工具","desc":"AI智能工具集合","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"Midjourney绘画","desc":"AI绘画生成工具","link":"https://nf.video/czybtp/?gid=26"},{"title":"GPT-5.2","desc":"最新版GPT-5.2智能对话工具","link":"https://nf.video/oemcwv/?gid=18"},{"title":"ChatExcel表格","desc":"AI Excel 数据分析辅助工具","link":"https://www.chatexcel.com/#/home?partner_uuid=4227AB911C6531FF898C5E7BB54757E6"}]' WHERE type = 'website' AND name = 'toolsHotTools' AND value LIKE '%?%';
UPDATE la_system_config SET value = '[{"badge":"推荐","text":"一人企业Vibe Coding社区！","link":"https://fsuied.com","gradient":"linear-gradient(to right,#6366f1,#e0e7ff,#edf2ff,#8b5cf6)"},{"badge":"热门","text":"GPT-5.4重回巅峰 智能对话","link":"https://nf.video/mbx1u6/?gid=18","gradient":"linear-gradient(to right,#ec4899,#fbe7ef,#fdf2f8,#f472b6)"},{"badge":"新品","text":"免费AI编程工具 Trae - 智能编码助手","link":"https://www.trae.com.cn/?utm_source=advertising&utm_medium=uied_ug_cpa&utm_term=hw_trae_uied","gradient":"linear-gradient(to right,#a855f7,#f3e8ff,#f5f3ff,#c084fc)"},{"badge":"新品","text":"腾讯元宝 智能对话新体验","link":"https://yuanbao.paluai.com/uied","gradient":"linear-gradient(to right,#ffc800,#ffed99,#fff8cc,#ffaa00)"},{"badge":"高效","text":"免费AI生成PPT - 一键生成演示文稿","link":"https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047","gradient":"linear-gradient(to right,#10b981,#d1fae5,#ecfdf5,#34d399)"},{"badge":"特惠","text":"Adobe 正版全家桶可用AI","link":"https://universalbus.cn/?s=lPLG02aydo","gradient":"linear-gradient(to right,#f97316,#ffedd5,#fff7ed,#fb923c)"},{"badge":"新品","text":"Gemini3 可用 nanobanana","link":"https://universalbus.cn/?s=lPLG02aydo","gradient":"linear-gradient(to right,#0ea5e9,#e0f2fe,#f0f9ff,#38bdf8)"}]' WHERE type = 'website' AND name = 'toolsBannerSlides' AND value LIKE '%?%';
