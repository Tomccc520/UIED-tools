/**
 * 百度链接自动推送脚本
 */
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置信息
const config = {
  site: 'www.uiedtool.com',
  token: 'HDo4Sk0JJr8tllqv',
  // 每次推送的最大链接数
  maxPushCount: 10,
};

// 从 sitemap.xml 读取所有URL
async function getUrlsFromSitemap() {
  const sitemap = fs.readFileSync(path.join(__dirname, '../public/sitemap.xml'), 'utf-8');
  const urls = sitemap.match(/<loc>(.*?)<\/loc>/g).map(loc =>
    loc.replace(/<\/?loc>/g, '')
  );
  return urls;
}

// 推送URL到百度
async function pushUrlsToBaidu(urls) {
  const apiUrl = `http://data.zz.baidu.com/urls?site=${config.site}&token=${config.token}`;

  try {
    const response = await axios.post(apiUrl, urls.join('\n'), {
      headers: {
        'Content-Type': 'text/plain'
      }
    });

    if (response.status === 200) {
      const data = response.data;
      console.log('推送成功！');
      console.log('成功推送数量:', data.success);
      console.log('剩余配额:', data.remain);
      if (data.not_same_site?.length > 0) {
        console.log('非本站URL:', data.not_same_site);
      }
      if (data.not_valid?.length > 0) {
        console.log('无效URL:', data.not_valid);
      }
      // 如果配额用完，抛出错误
      if (data.remain <= 0) {
        throw new Error('配额已用完，请明天再试');
      }
    }

    return response.data;
  } catch (error) {
    if (error.response?.data?.message === 'over quota') {
      console.error('推送失败: 配额已用完，请明天再试');
      process.exit(1);
    }
    if (error.response) {
      console.error('推送失败:', error.response.data);
      console.error('状态码:', error.response.status);
    } else if (error.request) {
      console.error('没有收到响应:', error.request);
    } else {
      console.error('请求配置错误:', error.message);
    }
    throw error;
  }
}

// 分批推送
async function batchPush() {
  try {
    // 获取所有URL
    const allUrls = await getUrlsFromSitemap();
    console.log(`总共获取到 ${allUrls.length} 个URL`);

    // 分批处理
    for (let i = 0; i < allUrls.length; i += config.maxPushCount) {
      const batch = allUrls.slice(i, i + config.maxPushCount);
      console.log(`正在推送第 ${i / config.maxPushCount + 1} 批，共 ${batch.length} 个URL`);
      await pushUrlsToBaidu(batch);

      // 延迟 5 秒，避免频率过高
      if (i + config.maxPushCount < allUrls.length) {
        console.log('等待 5 秒后继续推送...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log('所有URL推送完成');
  } catch (error) {
    if (error.message === '配额已用完，请明天再试') {
      console.log('今日配额已用完，明天继续推送剩余URL');
      process.exit(0);
    }
    console.error('推送过程出错:', error);
  }
}

// 执行推送
batchPush();
