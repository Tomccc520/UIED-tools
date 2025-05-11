require('dotenv').config();
const express = require('express');
const cors = require('cors');
const xiaohongshuRouter = require('./routes/xiaohongshu');

const app = express();

// 解析 JSON 请求体
app.use(express.json());

// 配置 CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: function(origin, callback) {
    // 允许没有origin的请求（比如同源请求）
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = '此源站未被CORS策略允许';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// 路由
app.use('/api/xiaohongshu', xiaohongshuRouter);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: '服务器错误'
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
