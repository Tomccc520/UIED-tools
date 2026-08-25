-- tools 顶部 Banner 轮播配置项增量 SQL（适用于已初始化数据库）
-- 执行库：uiedtool（或你的 likeadmin-go 实际业务库）

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();
SET @default_banner_slides = '[{"badge":"推荐","text":"一人企业Vibe Coding社区！","link":"https://fsuied.com","gradient":"linear-gradient(to right,#6366f1,#e0e7ff,#edf2ff,#8b5cf6)"},{"badge":"热门","text":"GPT-5.4重回巅峰 智能对话","link":"https://nf.video/mbx1u6/?gid=18","gradient":"linear-gradient(to right,#ec4899,#fbe7ef,#fdf2f8,#f472b6)"},{"badge":"新品","text":"免费AI编程工具 Trae - 智能编码助手","link":"https://www.trae.com.cn/?utm_source=advertising&utm_medium=uied_ug_cpa&utm_term=hw_trae_uied","gradient":"linear-gradient(to right,#a855f7,#f3e8ff,#f5f3ff,#c084fc)"},{"badge":"新品","text":"腾讯元宝 智能对话新体验","link":"https://yuanbao.paluai.com/uied","gradient":"linear-gradient(to right,#ffc800,#ffed99,#fff8cc,#ffaa00)"},{"badge":"高效","text":"免费AI生成PPT - 一键生成演示文稿","link":"https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047","gradient":"linear-gradient(to right,#10b981,#d1fae5,#ecfdf5,#34d399)"},{"badge":"特惠","text":"Adobe 正版全家桶可用AI","link":"https://universalbus.cn/?s=lPLG02aydo","gradient":"linear-gradient(to right,#f97316,#ffedd5,#fff7ed,#fb923c)"},{"badge":"新品","text":"Gemini3 可用 nanobanana","link":"https://universalbus.cn/?s=lPLG02aydo","gradient":"linear-gradient(to right,#0ea5e9,#e0f2fe,#f0f9ff,#38bdf8)"}]';

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsBannerSlides', @default_banner_slides, @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'website' AND `name` = 'toolsBannerSlides'
);

UPDATE la_system_config
SET `value` = @default_banner_slides, `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsBannerSlides'
  AND (TRIM(IFNULL(`value`, '')) = '' OR TRIM(`value`) = '[]');

COMMIT;
