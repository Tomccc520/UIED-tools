-- Tools 布局文案与品牌链接配置项增量 SQL（适用于已初始化数据库）
-- 执行库：uiedtool（或你的 likeadmin-go 实际业务库）

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsSiteSlogan', '免费在线工具集', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsSiteSlogan'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsSidebarRecommendTitle', '推荐工具', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsSidebarRecommendTitle'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsFooterIntro', '{webName} 是 UIED技术团队运营的 uiedtool.com 在线工具平台', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsFooterIntro'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsFooterQuickTitle', '工具快捷入口', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsFooterQuickTitle'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsFooterFriendTitle', '友情链接', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsFooterFriendTitle'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsOfficialMediaTitle', '官方媒体', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsOfficialMediaTitle'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsFooterSupportLabel', '技术支持', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsFooterSupportLabel'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsFooterSupportLinks', '[{"name":"uiedtool.com","link":"https://uiedtool.com/"},{"name":"UIED技术团队","link":"https://fsuied.com"}]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsFooterSupportLinks'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsHotTools', '[{"title":"Adobe 正版全家桶可用AI","desc":"Adobe 正版全家桶可用AI","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"Gemini3 可用 nanobanana","desc":"Gemini3 可用 nanobanana","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"AI学习网站","desc":"每天逛一逛","link":"https://www.uied.cn/category/aigc/ai"},{"title":"免费AI生成PPT","desc":"AI智能生成PPT","link":"https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047"},{"title":"AIGC学习网站","desc":"UIED技术团队官网","link":"https://uied.cn/"},{"title":"AIGC工具","desc":"AI智能工具集合","link":"https://universalbus.cn/?s=lPLG02aydo"},{"title":"Midjourney绘画","desc":"AI绘画生成工具","link":"https://nf.video/czybtp/?gid=26"},{"title":"GPT-5.2","desc":"最新版GPT-5.2智能对话工具","link":"https://nf.video/oemcwv/?gid=18"},{"title":"ChatExcel表格","desc":"AI Excel 数据分析辅助工具","link":"https://www.chatexcel.com/#/home?partner_uuid=4227AB911C6531FF898C5E7BB54757E6"}]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsHotTools'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsHeaderLinks', '[{"name":"官网首页","link":"https://uiedtool.com/"}]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsHeaderLinks'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsSidebarRecommend', '[{"name":"热门工具","link":"#recommend-hot"},{"name":"随机推荐","link":"/tools/random-tools"},{"name":"每日热榜","link":"/tools/hot-ranking"},{"name":"实时资讯","link":"/tools/ai-news"},{"name":"AI工具箱","link":"/tools/ai/toolbox"},{"name":"官网首页","link":"https://uiedtool.com/"}]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsSidebarRecommend'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsFooterQuickSections', '[{"title":"设计","items":[{"name":"色彩对比度","link":"/tools/design/contrast-checker"},{"name":"CSS阴影","link":"/tools/design/box-shadow"},{"name":"黄金比例","link":"/tools/design/golden-ratio"},{"name":"Blob生成器","link":"/tools/design/blob-maker"},{"name":"玻璃拟态","link":"/tools/design/glassmorphism"}]},{"title":"图像","items":[{"name":"图片压缩","link":"/tools/image-compress"},{"name":"二维码生成","link":"/tools/qrcode"},{"name":"图片切割","link":"/tools/img-cut"},{"name":"图片处理","link":"/tools/signimage"},{"name":"GIF压缩","link":"/tools/gif-compress"}]},{"title":"PDF","items":[{"name":"图片转PDF","link":"/tools/img-to-pdf"},{"name":"PDF转图片","link":"/tools/pdf-to-images"},{"name":"PDF合并","link":"/tools/pdf-merge"},{"name":"PDF分割","link":"/tools/pdf-split"}]},{"title":"文本","items":[{"name":"文本对比","link":"/tools/diff"},{"name":"Markdown编辑","link":"/tools/markdown"},{"name":"字数统计","link":"/tools/wordcount"}]},{"title":"开发","items":[{"name":"JSON转换","link":"/tools/json"},{"name":"正则测试","link":"/tools/reg"},{"name":"时间戳","link":"/tools/timetran"}]},{"title":"文案","items":[{"name":"疯狂星期四","link":"/tools/copywriting/kfc"},{"name":"今日诗词","link":"/tools/copywriting/daily-poem"},{"name":"舔狗日记","link":"/tools/copywriting/dog-diary"},{"name":"朋友圈文案","link":"/tools/copywriting/moments"}]}]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsFooterQuickSections'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsFooterFriendSections', '[{"title":"官方入口","items":[{"name":"官网首页","link":"https://uiedtool.com/"},{"name":"AI工具箱","link":"https://uiedtool.com/tools/ai/toolbox"},{"name":"视频工具","link":"https://uiedtool.com/tools/video"},{"name":"更新日志","link":"https://uiedtool.com/changelog"}]},{"title":"社区内容","items":[{"name":"AI资讯","link":"https://hot.uied.cn/"},{"name":"设计导航","link":"https://hao.uied.cn/"},{"name":"UIED技术团队","link":"https://fsuied.com"},{"name":"关于我们","link":"https://uiedtool.com/about"}]}]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsFooterFriendSections'
);

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsOfficialMediaLinks', '[{"name":"知乎","link":"https://www.zhihu.com/org/uiedyong-hu-ti-yan-jiao-liu-xue-xi"},{"name":"小红书","link":"https://www.xiaohongshu.com/user/profile/5dc2ccb0000000000100ba83"},{"name":"微博","link":"https://weibo.com/u/7542146005"},{"name":"B站","link":"https://space.bilibili.com/3493135908866790?spm_id_from=333.1007.0.0"}]', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsOfficialMediaLinks'
);

UPDATE la_system_config
SET `value` = '[{"name":"uiedtool.com","link":"https://uiedtool.com/"},{"name":"UIED技术团队","link":"https://fsuied.com"}]', `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsFooterSupportLinks' AND (TRIM(IFNULL(`value`, '')) = '' OR TRIM(`value`) = '[]');

UPDATE la_system_config
SET `value` = '[{"name":"官网首页","link":"https://uiedtool.com/"}]', `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsHeaderLinks' AND (TRIM(IFNULL(`value`, '')) = '' OR TRIM(`value`) = '[]');

UPDATE la_system_config
SET `value` = '[{"name":"热门工具","link":"#recommend-hot"},{"name":"随机推荐","link":"/tools/random-tools"},{"name":"每日热榜","link":"/tools/hot-ranking"},{"name":"实时资讯","link":"/tools/ai-news"},{"name":"AI工具箱","link":"/tools/ai/toolbox"},{"name":"官网首页","link":"https://uiedtool.com/"}]', `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsSidebarRecommend' AND (TRIM(IFNULL(`value`, '')) = '' OR TRIM(`value`) = '[]');

UPDATE la_system_config
SET `value` = '[{"title":"设计","items":[{"name":"色彩对比度","link":"/tools/design/contrast-checker"},{"name":"CSS阴影","link":"/tools/design/box-shadow"},{"name":"黄金比例","link":"/tools/design/golden-ratio"},{"name":"Blob生成器","link":"/tools/design/blob-maker"},{"name":"玻璃拟态","link":"/tools/design/glassmorphism"}]},{"title":"图像","items":[{"name":"图片压缩","link":"/tools/image-compress"},{"name":"二维码生成","link":"/tools/qrcode"},{"name":"图片切割","link":"/tools/img-cut"},{"name":"图片处理","link":"/tools/signimage"},{"name":"GIF压缩","link":"/tools/gif-compress"}]},{"title":"PDF","items":[{"name":"图片转PDF","link":"/tools/img-to-pdf"},{"name":"PDF转图片","link":"/tools/pdf-to-images"},{"name":"PDF合并","link":"/tools/pdf-merge"},{"name":"PDF分割","link":"/tools/pdf-split"}]},{"title":"文本","items":[{"name":"文本对比","link":"/tools/diff"},{"name":"Markdown编辑","link":"/tools/markdown"},{"name":"字数统计","link":"/tools/wordcount"}]},{"title":"开发","items":[{"name":"JSON转换","link":"/tools/json"},{"name":"正则测试","link":"/tools/reg"},{"name":"时间戳","link":"/tools/timetran"}]},{"title":"文案","items":[{"name":"疯狂星期四","link":"/tools/copywriting/kfc"},{"name":"今日诗词","link":"/tools/copywriting/daily-poem"},{"name":"舔狗日记","link":"/tools/copywriting/dog-diary"},{"name":"朋友圈文案","link":"/tools/copywriting/moments"}]}]', `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsFooterQuickSections' AND (TRIM(IFNULL(`value`, '')) = '' OR TRIM(`value`) = '[]');

UPDATE la_system_config
SET `value` = '[{"title":"官方入口","items":[{"name":"官网首页","link":"https://uiedtool.com/"},{"name":"AI工具箱","link":"https://uiedtool.com/tools/ai/toolbox"},{"name":"视频工具","link":"https://uiedtool.com/tools/video"},{"name":"更新日志","link":"https://uiedtool.com/changelog"}]},{"title":"社区内容","items":[{"name":"AI资讯","link":"https://hot.uied.cn/"},{"name":"设计导航","link":"https://hao.uied.cn/"},{"name":"UIED技术团队","link":"https://fsuied.com"},{"name":"关于我们","link":"https://uiedtool.com/about"}]}]', `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsFooterFriendSections' AND (TRIM(IFNULL(`value`, '')) = '' OR TRIM(`value`) = '[]');

UPDATE la_system_config
SET `value` = '[{"name":"知乎","link":"https://www.zhihu.com/org/uiedyong-hu-ti-yan-jiao-liu-xue-xi"},{"name":"小红书","link":"https://www.xiaohongshu.com/user/profile/5dc2ccb0000000000100ba83"},{"name":"微博","link":"https://weibo.com/u/7542146005"},{"name":"B站","link":"https://space.bilibili.com/3493135908866790?spm_id_from=333.1007.0.0"}]', `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsOfficialMediaLinks' AND (TRIM(IFNULL(`value`, '')) = '' OR TRIM(`value`) = '[]');

UPDATE la_system_config
SET `value` = '{webName} 是 UIED技术团队运营的 uiedtool.com 在线工具平台', `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsFooterIntro' AND (TRIM(IFNULL(`value`, '')) = '' OR `value` = '在线工具平台');

COMMIT;
