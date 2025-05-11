const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const rateLimit = require('express-rate-limit');

// 模型选项
const modelOptions = [
  { label: 'DeepSeek R1 Distill Qwen 32B', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B' },
  { label: 'DeepSeek R1 Distill Qwen 14B', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B' },
  { label: 'DeepSeek R1 Distill Qwen 8B', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-8B' },
  { label: 'DeepSeek R1 Distill Qwen 7B', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B' },
  { label: 'DeepSeek R1 Distill Qwen 1.5B', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B' },
  { label: 'DeepSeek R1', value: 'deepseek-ai/DeepSeek-R1' },
  { label: 'DeepSeek V3', value: 'deepseek-ai/DeepSeek-V3' },
  { label: 'DeepSeek V2.5', value: 'deepseek-ai/DeepSeek-V2.5' },
  { label: 'Qwen 2.5 7B', value: 'Qwen/Qwen2.5-7B-Instruct' },
  { label: 'Qwen 2 1.5B', value: 'Qwen/Qwen2-1.5B-Instruct' },
  { label: 'Yi 1.5 6B', value: 'Yi/Yi-1.5-6B-Instruct' },
  { label: 'InternLM 2.5 7B', value: 'InternLM/InternLM2-Chat-7B' },
  { label: 'InternLM 2.5 1.8B', value: 'InternLM/InternLM2-Chat-1.8B' },
  { label: 'GLM4 6B', value: 'THUDM/GLM4-6B' },
  { label: 'Gemma 2 7B', value: 'Google/Gemma-7B-it' },
  { label: 'Gemma 2 2B', value: 'Google/Gemma-2B-it' }
];

// 创建速率限制器
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15分钟
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 50, // 限制每个IP在windowMs时间内最多请求50次
  message: { message: '请求太频繁,请稍后再试' }
});

// 应用速率限制
router.use(limiter);

// 文案生成接口
router.post('/generate', async (req, res) => {
  try {
    const { model, prompt, style } = req.body;

    // 验证模型是否在允许的选项中
    const validModels = modelOptions.map(option => option.value);
    if (!validModels.includes(model)) {
      return res.status(400).json({ message: '无效的模型选择' });
    }

    // 调用 AI API
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: '你是一个专业的小红书文案写作专家。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API调用失败:', error);
      throw new Error(error.message || 'API调用失败');
    }

    const result = await response.json();

    // 验证响应格式
    if (!result?.choices?.[0]?.message?.content) {
      throw new Error('API响应格式错误');
    }

    // 返回结果
    res.json({
      content: result.choices[0].message.content
    });

  } catch (error) {
    console.error('生成文案失败:', error);
    res.status(500).json({
      message: error.message || '服务器错误'
    });
  }
});

module.exports = router;
