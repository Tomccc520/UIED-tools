/**
* @file GalaxyMotion.vue
* @description 星系运动查看工具，模拟宇宙中星系、行星、恒星等天体的运动轨迹
*
* @copyright Tomda (https://www.tomda.top)
* @copyright UIED技术团队 (https://fsuied.com)
* @copyright 2024-2025 All Rights Reserved.
*
* @author Tomda
* @createDate 2024-06-20
* @lastUpdate 2024-06-20 15:30
* @version Beta 1.0.0
* @toolsCount 当前工具总数：62个
*
* @features
* - 模拟宇宙中星系、恒星和行星的运动轨迹
* - 支持调整星系数量、大小和运动速度
* - 支持暂停/播放和重置功能
* - 包含太阳系模拟和行星运动
* - 优雅的响应式布局设计
* - 支持自定义天体颜色和轨迹效果
* - 沉浸式宇宙体验，适合放松摸鱼
*/

<template>
  <main class="galaxy-motion-container">
    <aside class="controls-panel" :class="{ 'collapsed': isPanelCollapsed }">
      <div class="panel-toggle" @click="togglePanel" v-if="!isSmallScreen">
        <span class="toggle-icon">{{ isPanelCollapsed ? '»' : '«' }}</span>
      </div>
      <header v-show="!isPanelCollapsed">
        <h1>星系运动控制面板</h1>
      </header>
      <section class="control-content" v-show="!isPanelCollapsed">
        <div class="control-group">
          <h2>显示模式</h2>
          <div class="mode-buttons">
            <button v-for="mode in displayModes" :key="mode.value" @click="displayMode = mode.value"
              :class="['mode-button', { 'active': displayMode === mode.value }]">
              {{ mode.label }}
            </button>
          </div>
        </div>

        <div class="control-group" v-if="displayMode !== 'universe'">
          <h2>选择星系</h2>
          <select v-model="selectedGalaxySystem" class="mode-select" @change="resetAnimation">
            <option v-for="system in galaxySystems" :key="system.id" :value="system.id">
              {{ system.name }}
            </option>
          </select>
        </div>

        <div class="control-group" v-if="displayMode !== 'universe'">
          <h2>缩放比例</h2>
          <div class="slider-container">
            <i class="speed-icon slow">小</i>
            <input type="range" v-model="zoomLevel" min="0.5" max="2.5" step="0.1" aria-label="缩放比例" />
            <i class="speed-icon fast">大</i>
          </div>
          <div class="value-display">{{ zoomLevel.toFixed(1) }}</div>
          <div class="auto-zoom-option">
            <label class="auto-zoom-label">
              <input type="checkbox" v-model="autoAdjustZoom" @change="toggleAutoZoom" />
              <span>自动适应屏幕</span>
            </label>
          </div>
          <div class="screen-tip" v-if="isSmallScreen">
            <i class="tip-icon">💡</i>
            <span>小提示：横屏查看可获得更好的体验</span>
          </div>
        </div>

        <div class="control-group">
          <h2>运动速度</h2>
          <div class="slider-container">
            <i class="speed-icon slow">慢</i>
            <input type="range" v-model="speed" min="0.1" max="2" step="0.1" aria-label="运动速度" />
            <i class="speed-icon fast">快</i>
          </div>
          <div class="value-display">{{ speed.toFixed(1) }}</div>
        </div>

        <div class="control-group" v-if="displayMode === 'universe'">
          <h2>星系数量</h2>
          <input type="range" v-model="galaxyCount" min="50" max="500" step="10" aria-label="星系数量" />
          <div class="value-display">{{ galaxyCount }}</div>
        </div>

        <div class="control-group" v-if="displayMode === 'universe'">
          <h2>星系大小</h2>
          <input type="range" v-model="galaxySize" min="1" max="5" step="0.1" aria-label="星系大小" />
          <div class="value-display">{{ galaxySize.toFixed(1) }}</div>
        </div>

        <div class="control-group" v-if="displayMode !== 'universe'">
          <h2>天体轨道</h2>
          <div class="toggle-switch">
            <input type="checkbox" id="orbit-toggle" v-model="showOrbits" aria-label="显示轨道" />
            <label for="orbit-toggle" class="toggle-label">
              <span class="toggle-inner"></span>
              <span class="toggle-switch-label">{{ showOrbits ? '显示' : '隐藏' }}</span>
            </label>
          </div>
        </div>

        <div class="control-group" v-if="displayMode !== 'universe'">
          <h2>天体名称</h2>
          <div class="toggle-switch">
            <input type="checkbox" id="name-toggle" v-model="showNames" aria-label="显示名称" />
            <label for="name-toggle" class="toggle-label">
              <span class="toggle-inner"></span>
              <span class="toggle-switch-label">{{ showNames ? '显示' : '隐藏' }}</span>
            </label>
          </div>
        </div>

        <nav class="control-buttons">
          <button @click="resetAnimation" class="control-button reset-button">
            <span class="button-icon" aria-hidden="true">↻</span>
            <span>重置</span>
          </button>
          <button @click="toggleAnimation" class="control-button play-button">
            <span class="button-icon" aria-hidden="true">{{ isAnimating ? '⏸' : '▶' }}</span>
            <span>{{ isAnimating ? '暂停' : '播放' }}</span>
          </button>
        </nav>
      </section>
    </aside>
    <canvas ref="galaxyCanvas" class="galaxy-canvas" aria-label="星系动画"></canvas>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';

const route = useRoute();

// SEO 配置
const pageTitle = computed(() => `星系运动查看工具 - 宇宙天体模拟器 | 摸鱼工具`);
const pageDescription = computed(() => `沉浸式星系运动查看工具，模拟宇宙中星系、行星、恒星等天体的运动轨迹，提供太阳系、银河系、仙女座等多种天体模型，支持调整速度和视角，体验宇宙奥秘。`);
const pageKeywords = '星系运动,太阳系模拟,宇宙模拟器,天体运动,摸鱼工具,星系轨迹,银河系,仙女座星系,3D宇宙';
const currentUrl = computed(() => `${window.location.origin}${route.path}`);

// 更新头部信息
useHead({
  // 标题
  title: pageTitle,

  // Meta 标签
  meta: [
    { name: 'description', content: pageDescription },
    { name: 'keywords', content: pageKeywords },
    // Open Graph 标签用于社交媒体分享
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: pageDescription },
    { property: 'og:url', content: currentUrl },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: `${window.location.origin}/images/tools/galaxy-motion.jpg` }
  ],

  // 结构化数据
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': pageTitle.value,
        'description': pageDescription.value,
        'applicationCategory': '教育工具,娱乐工具',
        'operatingSystem': 'Web',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'CNY'
        },
        'keywords': pageKeywords,
        'url': currentUrl.value
      })
    }
  ],

  // 规范链接
  link: [
    {
      rel: 'canonical',
      href: currentUrl
    }
  ]
});

// 控制参数
const speed = ref(1);
const galaxyCount = ref(200);
const galaxySize = ref(2);
const isAnimating = ref(true);
const displayMode = ref('solarSystem'); // 默认显示太阳系
const showOrbits = ref(true);
const showNames = ref(true);
const selectedGalaxySystem = ref('solarSystem'); // 默认为太阳系
const zoomLevel = ref(1.0); // 新增：缩放级别控制
const isPanelCollapsed = ref(true); // 默认折叠控制面板
const autoAdjustZoom = ref(true); // 添加自动调整缩放比例的开关
const isSmallScreen = ref(false); // 添加小屏幕检测

// 显示模式选项
const displayModes = [
  { label: '宇宙星系', value: 'universe' },
  { label: '星系模型', value: 'galaxySystem' }
];

// 可选星系系统
const galaxySystems = [
  { id: 'solarSystem', name: '太阳系' },
  { id: 'andromedaSystem', name: '仙女座星系' },
  { id: 'orionSystem', name: '猎户座星云' },
  { id: 'trappistSystem', name: 'TRAPPIST-1系统' },
  { id: 'milkyWaySystem', name: '银河系' },
  { id: 'alphaCentauriSystem', name: '半人马座α星系' },
  { id: 'crabNebulaSystem', name: '蟹状星云' },
  { id: 'spiralGalaxySystem', name: '旋涡星系M51' }
];

// 画布引用
const galaxyCanvas = ref(null);
let ctx = null;
let animationFrameId = null;
let galaxies = [];
let solarSystem = [];
let celestialSystems = {};

// 星系对象
class Galaxy {
  constructor(x, y, radius, color, vx, vy) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.vx = vx;
    this.vy = vy;
    this.trail = [];
    this.maxTrailLength = 20;
    // 添加初始位置，用于重置
    this.initialX = x;
    this.initialY = y;
  }

  update(ctx, width, height, speedFactor) {
    // 更新位置
    this.x += this.vx * speedFactor;
    this.y += this.vy * speedFactor;

    // 边界检查 - 使用包裹方式而不是反弹，避免星系聚集在边缘
    if (this.x < -this.radius) this.x = width + this.radius;
    if (this.x > width + this.radius) this.x = -this.radius;
    if (this.y < -this.radius) this.y = height + this.radius;
    if (this.y > height + this.radius) this.y = -this.radius;

    // 保存轨迹
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    // 绘制轨迹
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.radius / 4;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // 绘制星系
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  // 添加重置方法
  reset() {
    this.x = this.initialX;
    this.y = this.initialY;
    this.trail = [];
  }
}

// 天体对象（太阳、行星等）
class CelestialBody {
  constructor(name, radius, color, orbitRadius, orbitSpeed, startAngle = 0, hasRings = false, ringColor = null, moons = [], glowEffect = false) {
    this.name = name;
    this.radius = radius;
    this.color = color;
    this.orbitRadius = orbitRadius;
    this.orbitSpeed = orbitSpeed;
    this.angle = startAngle;
    this.x = 0;
    this.y = 0;
    this.hasRings = hasRings;
    this.ringColor = ringColor || color;
    this.moons = moons.map(moon => ({
      ...moon,
      angle: Math.random() * Math.PI * 2
    }));
    this.glowEffect = glowEffect;
  }

  update(ctx, centerX, centerY, speedFactor, zoomFactor = 1.0) {
    // 更新位置
    this.angle += this.orbitSpeed * speedFactor * 0.01;
    // 应用缩放因子
    const scaledOrbitRadius = this.orbitRadius * zoomFactor;
    this.x = centerX + Math.cos(this.angle) * scaledOrbitRadius;
    this.y = centerY + Math.sin(this.angle) * scaledOrbitRadius;

    // 绘制轨道
    if (showOrbits.value) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, scaledOrbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();
    }

    // 如果有发光效果，绘制光晕
    if (this.glowEffect) {
      const gradient = ctx.createRadialGradient(
        this.x, this.y, this.radius * zoomFactor,
        this.x, this.y, this.radius * 2 * zoomFactor
      );
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 2 * zoomFactor, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // 绘制天体
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * zoomFactor, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // 如果有环，绘制行星环
    if (this.hasRings) {
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.radius * 2 * zoomFactor, this.radius * 0.5 * zoomFactor, 0, 0, Math.PI * 2);
      ctx.strokeStyle = this.ringColor;
      ctx.lineWidth = this.radius * 0.2 * zoomFactor;
      ctx.stroke();
    }

    // 更新并绘制卫星
    this.moons.forEach(moon => {
      moon.angle += moon.orbitSpeed * speedFactor * 0.02;
      const scaledMoonOrbitRadius = moon.orbitRadius * zoomFactor;
      const moonX = this.x + Math.cos(moon.angle) * scaledMoonOrbitRadius;
      const moonY = this.y + Math.sin(moon.angle) * scaledMoonOrbitRadius;

      // 绘制卫星轨道
      if (showOrbits.value) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, scaledMoonOrbitRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.stroke();
      }

      // 绘制卫星
      ctx.beginPath();
      ctx.arc(moonX, moonY, moon.radius * zoomFactor, 0, Math.PI * 2);
      ctx.fillStyle = moon.color;
      ctx.fill();

      // 显示卫星名称 - 简化为只有白色文字
      if (showNames.value && moon.name) {
        const moonTextX = moonX;
        const moonTextY = moonY - moon.radius * 1.5 * zoomFactor;
        const moonTextSize = moon.radius * 1.5 * zoomFactor;

        // 直接绘制文字，无背景
        ctx.font = `${moonTextSize}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.fillText(moon.name, moonTextX, moonTextY);
      }
    });

    // 显示天体名称 - 简化为只有白色文字
    if (showNames.value && this.name) {
      const textX = this.x;
      const textY = this.y - this.radius * 1.5 * zoomFactor;
      const textSize = this.radius * 0.8 * zoomFactor;

      // 直接绘制文字，无背景
      ctx.font = `${textSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.textAlign = 'center';
      ctx.fillText(this.name, textX, textY);
    }
  }
}

// 初始化星系
const initGalaxies = () => {
  const canvas = galaxyCanvas.value;
  const { width, height } = canvas;
  galaxies = [];

  // 确定合适的星系大小
  let minRadius = 1;
  let maxRadiusMultiplier = galaxySize.value;

  // 小屏幕上增大最小半径，确保可见性
  if (width < 768) {
    minRadius = 1.5;
    maxRadiusMultiplier = Math.max(2, galaxySize.value);
  }

  // 计算适合的星系数量（小屏幕上减少数量）
  const adjustedGalaxyCount = width < 768 ?
    Math.min(galaxyCount.value, 200) : galaxyCount.value;

  // 确保星系均匀分布在屏幕上
  const gridSize = Math.ceil(Math.sqrt(adjustedGalaxyCount));
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  for (let i = 0; i < adjustedGalaxyCount; i++) {
    // 计算网格位置
    const gridX = i % gridSize;
    const gridY = Math.floor(i / gridSize);

    // 在网格内随机分布以避免规则排列
    const offsetX = Math.random() * cellWidth;
    const offsetY = Math.random() * cellHeight;

    const x = gridX * cellWidth + offsetX;
    const y = gridY * cellHeight + offsetY;

    // 调整速度以适应不同屏幕大小
    const speedMultiplier = Math.min(width, height) / 1000;
    const vx = (Math.random() - 0.5) * 2 * speedMultiplier;
    const vy = (Math.random() - 0.5) * 2 * speedMultiplier;

    const radius = Math.random() * maxRadiusMultiplier + minRadius;
    const hue = Math.random() * 360;
    const color = `hsl(${hue}, 70%, 60%)`;

    galaxies.push(new Galaxy(x, y, radius, color, vx, vy));
  }
};

// 初始化太阳系
const initSolarSystem = () => {
  const canvas = galaxyCanvas.value;
  const { width, height } = canvas;
  const centerX = width / 2;
  const centerY = height / 2;

  // 根据屏幕大小自动调整缩放比例
  let baseScale = Math.min(width, height) / 900; // 基础缩放因子

  // 小屏幕设备时增加缩放比例以确保可见性
  if (width < 768) {
    baseScale = Math.min(width, height) / 600; // 为小屏幕提供更大的缩放比例
  }

  // 如果启用了自动调整缩放，则根据屏幕大小设置缩放级别
  if (autoAdjustZoom.value) {
    // 根据屏幕大小调整默认缩放级别
    if (width < 768) {
      zoomLevel.value = Math.max(0.8, baseScale * 1.5); // 小屏幕上放大
    } else if (width < 1024) {
      zoomLevel.value = Math.max(0.9, baseScale * 1.2); // 中等屏幕
    } else {
      zoomLevel.value = 1.0; // 大屏幕保持默认
    }
  }

  const scale = baseScale; // 保持原始比例计算

  // 添加太阳
  const sun = new CelestialBody(
    '太阳',
    25 * scale,
    'rgba(255, 215, 0, 1)',
    0,
    0,
    0,
    false,
    null,
    [],
    true
  );

  // 添加行星
  const mercury = new CelestialBody(
    '水星',
    3 * scale,
    '#A9A9A9',
    50 * scale,
    4.1
  );

  const venus = new CelestialBody(
    '金星',
    6 * scale,
    '#E6E6FA',
    70 * scale,
    1.6
  );

  const earth = new CelestialBody(
    '地球',
    6.5 * scale,
    '#1E90FF',
    95 * scale,
    1,
    0,
    false,
    null,
    [
      {
        name: '月球',
        radius: 1.8 * scale,
        color: '#D3D3D3',
        orbitRadius: 15 * scale,
        orbitSpeed: 3.5
      }
    ]
  );

  const mars = new CelestialBody(
    '火星',
    5 * scale,
    '#FF4500',
    125 * scale,
    0.8,
    0,
    false,
    null,
    [
      {
        name: '火卫一',
        radius: 1 * scale,
        color: '#A9A9A9',
        orbitRadius: 12 * scale,
        orbitSpeed: 4
      },
      {
        name: '火卫二',
        radius: 0.8 * scale,
        color: '#C0C0C0',
        orbitRadius: 18 * scale,
        orbitSpeed: 3
      }
    ]
  );

  const jupiter = new CelestialBody(
    '木星',
    16 * scale,
    '#FFA500',
    170 * scale,
    0.4,
    0,
    false,
    null,
    [
      {
        name: '木卫一',
        radius: 1.5 * scale,
        color: '#FFFF00',
        orbitRadius: 25 * scale,
        orbitSpeed: 3
      },
      {
        name: '木卫二',
        radius: 1.3 * scale,
        color: '#F5F5DC',
        orbitRadius: 32 * scale,
        orbitSpeed: 2.5
      },
      {
        name: '木卫三',
        radius: 2 * scale,
        color: '#D3D3D3',
        orbitRadius: 40 * scale,
        orbitSpeed: 2
      },
      {
        name: '木卫四',
        radius: 1.8 * scale,
        color: '#A9A9A9',
        orbitRadius: 50 * scale,
        orbitSpeed: 1.5
      }
    ]
  );

  const saturn = new CelestialBody(
    '土星',
    14 * scale,
    '#DAA520',
    210 * scale,
    0.3,
    0,
    true,
    'rgba(210, 180, 140, 0.7)'
  );

  const uranus = new CelestialBody(
    '天王星',
    10 * scale,
    '#00FFFF',
    250 * scale,
    0.2,
    0,
    true,
    'rgba(173, 216, 230, 0.6)'
  );

  const neptune = new CelestialBody(
    '海王星',
    10 * scale,
    '#1E90FF',
    290 * scale,
    0.15
  );

  celestialSystems.solarSystem = [sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];

  // 初始化仙女座星系
  const andromedaCenter = new CelestialBody(
    '仙女座星系中心',
    30 * scale,
    'rgba(255, 160, 200, 1)',
    0,
    0,
    0,
    false,
    null,
    [],
    true
  );

  // 添加仙女座星系的恒星和行星
  const andromedaStars = [];
  for (let i = 0; i < 8; i++) {
    // 使用屏幕适应的轨道半径
    const orbitRadius = (50 + i * 40) * scale;
    const starColor = `hsl(${280 + i * 10}, 70%, 70%)`;
    const starSize = (5 + Math.random() * 5) * scale;
    // 随机角度使星体分布更均匀
    const startAngle = Math.random() * Math.PI * 2;
    const star = new CelestialBody(
      `恒星-${i + 1}`,
      starSize,
      starColor,
      orbitRadius,
      0.2 + Math.random() * 0.5,
      startAngle
    );
    andromedaStars.push(star);
  }

  celestialSystems.andromedaSystem = [andromedaCenter, ...andromedaStars];

  // 初始化猎户座星云
  const orionCenter = new CelestialBody(
    '猎户座中心',
    20 * scale,
    'rgba(100, 200, 255, 1)',
    0,
    0,
    0,
    false,
    null,
    [],
    true
  );

  // 添加猎户座的恒星
  const orionStars = [];
  // 调整为6颗恒星，在小屏幕上更容易显示
  for (let i = 0; i < 6; i++) {
    const angle = i * (Math.PI * 2 / 6);
    // 使用屏幕适应的距离
    const distance = 80 * scale;
    const star = new CelestialBody(
      `猎户座恒星-${i + 1}`,
      8 * scale,
      '#5F9EA0',
      distance,
      0.05,
      angle
    );
    orionStars.push(star);
  }

  celestialSystems.orionSystem = [orionCenter, ...orionStars];

  // TRAPPIST-1系统
  const trappistStar = new CelestialBody(
    'TRAPPIST-1恒星',
    18 * scale,
    '#FF4500',
    0,
    0,
    0,
    false,
    null,
    [],
    true
  );

  // 添加TRAPPIST-1的七颗行星
  const trappistPlanets = [];
  const planetNames = ['b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const planetColors = ['#A0522D', '#CD853F', '#4682B4', '#2E8B57', '#6A5ACD', '#708090', '#778899'];

  // 在小屏幕上减少行星数量，确保可见性
  const planetCount = width < 768 ? 5 : 7;

  for (let i = 0; i < planetCount; i++) {
    // 小屏幕上轨道半径更小，以适应屏幕
    const orbitFactorMultiplier = width < 768 ? 0.75 : 1.0;
    const orbitRadius = (40 + i * 25) * scale * orbitFactorMultiplier;
    const planet = new CelestialBody(
      `TRAPPIST-1${planetNames[i]}`,
      (3 + i * 0.5) * scale,
      planetColors[i],
      orbitRadius,
      3.0 / (i + 1),
      Math.random() * Math.PI * 2
    );
    trappistPlanets.push(planet);
  }

  celestialSystems.trappistSystem = [trappistStar, ...trappistPlanets];

  // 初始化银河系
  const milkyWayCenter = new CelestialBody(
    '银河系中心黑洞',
    35 * scale,
    'rgba(255, 220, 180, 1)',
    0,
    0,
    0,
    false,
    null,
    [],
    true
  );

  // 添加银河系的恒星和星团
  const milkyWayStars = [];
  // 创建螺旋臂结构
  for (let arm = 0; arm < 4; arm++) {
    const baseAngle = arm * Math.PI / 2; // 四个主要螺旋臂
    // 沿着每个螺旋臂放置恒星
    for (let i = 0; i < 7; i++) {
      const distance = (80 + i * 30) * scale;
      const angle = baseAngle + i * 0.3; // 螺旋形状
      const starSize = (3 + Math.random() * 4) * scale;
      // 使用与螺旋臂位置相关的颜色
      const hue = (50 + arm * 60 + i * 10) % 360;
      const starColor = `hsl(${hue}, 80%, 70%)`;
      const star = new CelestialBody(
        `恒星-${arm}-${i}`,
        starSize,
        starColor,
        distance,
        0.1 + Math.random() * 0.3,
        angle
      );
      milkyWayStars.push(star);
    }
  }

  celestialSystems.milkyWaySystem = [milkyWayCenter, ...milkyWayStars];

  // 初始化半人马座α星系（三恒星系统）
  const alphaCentauriA = new CelestialBody(
    '半人马座α星A',
    22 * scale,
    '#FFFACD',
    0,
    0,
    0,
    false,
    null,
    [],
    true
  );

  const alphaCentauriB = new CelestialBody(
    '半人马座α星B',
    18 * scale,
    '#FFE4B5',
    80 * scale,
    0.15,
    0
  );

  const proxima = new CelestialBody(
    '比邻星(半人马座α星C)',
    8 * scale,
    '#FF6347',
    150 * scale,
    0.1,
    Math.PI,
    false,
    null,
    [
      {
        name: '比邻星b(可能宜居)',
        radius: 3 * scale,
        color: '#32CD32',
        orbitRadius: 15 * scale,
        orbitSpeed: 2.5
      }
    ]
  );

  celestialSystems.alphaCentauriSystem = [alphaCentauriA, alphaCentauriB, proxima];

  // 初始化蟹状星云（超新星遗迹）
  const crabPulsar = new CelestialBody(
    '蟹状星云中子星',
    15 * scale,
    '#00FFFF',
    0,
    0,
    0,
    false,
    null,
    [],
    true
  );

  // 添加爆发的气体和尘埃
  const crabNebulaGas = [];
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = (40 + Math.random() * 100) * scale;
    const size = (3 + Math.random() * 8) * scale;
    const hue = Math.random() > 0.5 ? 180 + Math.random() * 60 : 0 + Math.random() * 60;
    const gas = new CelestialBody(
      '',  // 气体没有名称
      size,
      `hsla(${hue}, 80%, 60%, 0.7)`,
      distance,
      0.05 + Math.random() * 0.1,
      angle
    );
    crabNebulaGas.push(gas);
  }

  celestialSystems.crabNebulaSystem = [crabPulsar, ...crabNebulaGas];

  // 初始化旋涡星系M51
  const spiralCore = new CelestialBody(
    'M51星系核心',
    30 * scale,
    'rgba(255, 240, 200, 1)',
    0,
    0,
    0,
    false,
    null,
    [],
    true
  );

  // 创建漂亮的旋涡结构
  const spiralGalaxyStars = [];
  // 两个主要螺旋臂
  for (let arm = 0; arm < 2; arm++) {
    const baseAngle = arm * Math.PI; // 两个主要螺旋臂，相隔180度
    // 沿着每个螺旋臂放置恒星和星团
    for (let i = 0; i < 12; i++) {
      const distance = (60 + i * 20) * scale;
      // 使用对数螺旋方程创建更真实的螺旋形态
      const angle = baseAngle + 0.4 * Math.log(1 + i * 0.2) * 2 * Math.PI;
      const starSize = (4 + Math.random() * 5) * scale;
      // 基于位置的颜色，中心偏黄，外围偏蓝
      const hue = 60 - i * 5 + arm * 10;
      const starColor = `hsl(${hue}, 80%, 70%)`;
      const star = new CelestialBody(
        '', // 不显示恒星名称以减少视觉干扰
        starSize,
        starColor,
        distance,
        0.15 - i * 0.01,
        angle
      );
      spiralGalaxyStars.push(star);
    }
  }

  celestialSystems.spiralGalaxySystem = [spiralCore, ...spiralGalaxyStars];
};

// 修改动画循环函数，调整清除画布的透明度以减少拖影
const animate = () => {
  if (!isAnimating.value) return;

  const canvas = galaxyCanvas.value;
  const { width, height } = canvas;

  // 清空画布 - 调整透明度以更好地清除前一帧
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // 增加透明度，更好地清除之前的内容
  ctx.fillRect(0, 0, width, height);

  if (displayMode.value === 'universe') {
    // 更新并绘制星系
    galaxies.forEach(galaxy => {
      galaxy.update(ctx, width, height, speed.value);
    });
  } else {
    // 绘制背景星星
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 1 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
      ctx.fill();
    }

    // 更新并绘制选中的星系
    // 计算中心点
    const panelWidth = isSmallScreen.value ? 0 : (isPanelCollapsed.value ? 50 : 320);
    const availableWidth = width - panelWidth;

    // 桌面模式下，向左偏移中心点使星系靠近控制面板
    const centerOffset = isSmallScreen.value ? 0 : 500;
    const centerX = panelWidth + availableWidth / 2 - centerOffset;
    const centerY = height / 2;

    const currentSystem = celestialSystems[selectedGalaxySystem.value] || celestialSystems.solarSystem;
    currentSystem.forEach(body => {
      body.update(ctx, centerX, centerY, speed.value, zoomLevel.value);
    });
  }

  animationFrameId = requestAnimationFrame(animate);
};

// 重置动画
const resetAnimation = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  if (displayMode.value === 'universe') {
    initGalaxies();
  } else {
    initSolarSystem();
  }

  // 清除画布，确保没有残留
  const canvas = galaxyCanvas.value;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 如果启用了自动缩放，重新应用屏幕适应的缩放
  if (autoAdjustZoom.value) {
    const { width } = canvas;
    if (width < 768) {
      zoomLevel.value = Math.max(0.8, zoomLevel.value);
    } else if (width < 1024) {
      zoomLevel.value = Math.max(0.9, Math.min(zoomLevel.value, 1.5));
    }
  }

  if (isAnimating.value) {
    animate();
  }
};

// 切换动画状态
const toggleAnimation = () => {
  isAnimating.value = !isAnimating.value;
  if (isAnimating.value) {
    animate();
  }
};

// 监听参数变化
watch([galaxyCount, galaxySize], () => {
  if (displayMode.value === 'universe') {
    resetAnimation();
  }
});

// 监听显示模式变化
watch(displayMode, () => {
  resetAnimation();
});

// 调整画布大小
const resizeCanvas = () => {
  if (!galaxyCanvas.value) return;

  const canvas = galaxyCanvas.value;
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // 检测是否为小屏幕
  isSmallScreen.value = window.innerWidth < 768;

  // 在移动端上强制取消折叠状态
  if (isSmallScreen.value) {
    isPanelCollapsed.value = false;
  }

  // 在屏幕尺寸变化时重新调整缩放级别
  const { width } = canvas;
  if (autoAdjustZoom.value && displayMode.value !== 'universe') {
    if (width < 768) {
      zoomLevel.value = Math.max(0.8, zoomLevel.value);
    } else if (width < 1024) {
      zoomLevel.value = Math.max(0.9, Math.min(zoomLevel.value, 1.5));
    }
  }

  // 重新初始化
  resetAnimation();
};

// 生命周期钩子
onMounted(() => {
  const canvas = galaxyCanvas.value;
  ctx = canvas.getContext('2d');

  // 设置画布
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 检测是否为小屏幕
  isSmallScreen.value = window.innerWidth < 768;

  // 在移动端上强制取消折叠状态
  if (isSmallScreen.value) {
    isPanelCollapsed.value = false;
  }

  // 初始化并开始动画
  if (displayMode.value === 'universe') {
    initGalaxies();
  } else {
    initSolarSystem();
  }

  animate();

  window.addEventListener('resize', resizeCanvas);
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  window.removeEventListener('resize', resizeCanvas);
});

const togglePanel = () => {
  isPanelCollapsed.value = !isPanelCollapsed.value;
};

// 添加到控制面板中的自动缩放选项
const toggleAutoZoom = () => {
  autoAdjustZoom.value = !autoAdjustZoom.value;
  if (autoAdjustZoom.value) {
    resizeCanvas(); // 立即应用自动缩放
  }
};
</script>

<style scoped>
.galaxy-motion-container {
  display: flex;
  height: 100vh;
  background-color: #000;
  color: #fff;
  font-family: Arial, sans-serif;
  flex-direction: row;
  overflow-y: hidden;
  /* 只阻止垂直滚动，允许左右滚动 */
}

.galaxy-canvas {
  flex: 1;
  background-color: #000;
  position: relative;
  /* 确保可以正确定位 */
}

.controls-panel {
  width: 320px;
  min-width: 320px;
  max-width: 320px;
  flex: 0 0 320px;
  padding: 20px;
  background: linear-gradient(to right, rgba(10, 15, 30, 0.95), rgba(10, 10, 20, 0.9));
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.7);
  overflow-y: auto;
  z-index: 10;
  transition: all 0.3s ease;
  position: relative;
}

.controls-panel.collapsed {
  width: 50px;
  min-width: 50px;
  max-width: 50px;
  flex: 0 0 50px;
  padding: 20px 5px;
  overflow: hidden;
}

.panel-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background-color: rgba(52, 152, 219, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s ease;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.controls-panel.collapsed .panel-toggle {
  right: 10px;
  top: 15px;
}

.toggle-icon {
  font-size: 20px;
  color: white;
  font-weight: bold;
  line-height: 1;
}

h1 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #fff;
  text-align: center;
  font-size: 1.6rem;
  letter-spacing: 1px;
}

h2 {
  margin-bottom: 12px;
  color: #fff;
  font-weight: bold;
  letter-spacing: 0.5px;
  font-size: 1rem;
}

.control-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  background-color: rgba(20, 30, 60, 0.6);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(52, 152, 219, 0.4);
}

.control-group label {
  margin-bottom: 12px;
  color: #fff;
  font-weight: bold;
  letter-spacing: 0.5px;
  font-size: 1rem;
}

.value-display {
  text-align: center;
  font-size: 1.2rem;
  color: #fff;
  margin-top: 5px;
}

.slider-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.speed-icon {
  font-style: normal;
  color: #fff;
  font-size: 0.8rem;
  width: 30px;
}

.speed-icon.fast {
  text-align: right;
}

input[type="range"] {
  flex: 1;
  height: 6px;
  background: linear-gradient(to right, #1a3c61, #3498db);
  border-radius: 3px;
  -webkit-appearance: none;
  margin: 10px 0;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #3498db, #2c3e50);
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.8);
}

.mode-select {
  padding: 12px;
  background-color: rgba(15, 25, 50, 0.8);
  color: #fff;
  border: 1px solid #3498db;
  border-radius: 8px;
  margin-bottom: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.mode-select:hover {
  background-color: rgba(30, 40, 70, 0.8);
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.5);
}

.mode-buttons {
  display: flex;
  gap: 10px;
}

.mode-button {
  flex: 1;
  padding: 10px;
  background-color: rgba(15, 25, 50, 0.8);
  color: #ccc;
  border: 1px solid #3498db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.mode-button:hover {
  background-color: rgba(30, 40, 70, 0.8);
  color: #fff;
}

.mode-button.active {
  background-color: rgba(52, 152, 219, 0.4);
  color: #fff;
  box-shadow: 0 0 10px rgba(52, 152, 219, 0.7);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  position: relative;
  display: block;
  height: 34px;
  background-color: rgba(15, 25, 50, 0.8);
  border-radius: 34px;
  cursor: pointer;
  transition: .4s;
  padding-left: 60px;
  line-height: 34px;
}

.toggle-inner {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked+.toggle-label .toggle-inner {
  transform: translateX(26px);
  background-color: #3498db;
}

.toggle-switch-label {
  color: #fff;
}

input:checked+.toggle-label {
  background-color: rgba(30, 40, 70, 0.8);
}

.control-buttons {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 15px;
}

.control-button {
  padding: 15px;
  flex: 1;
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  letter-spacing: 1px;
  transition: all 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.button-icon {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.control-button:hover {
  background: linear-gradient(135deg, #2980b9, #1a242f);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}

.control-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.reset-button {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.reset-button:hover {
  background: linear-gradient(135deg, #c0392b, #a33027);
}

.play-button {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.play-button:hover {
  background: linear-gradient(135deg, #27ae60, #219653);
}

.auto-zoom-option {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auto-zoom-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #aaa;
}

.auto-zoom-label input {
  margin-right: 8px;
}

.auto-zoom-label span {
  transition: color 0.3s;
}

.auto-zoom-label:hover span {
  color: #fff;
}

.screen-tip {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #ffd700;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  padding: 5px;
  border-radius: 5px;
  animation: pulse 2s infinite;
}

.tip-icon {
  margin-right: 6px;
  font-style: normal;
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .galaxy-motion-container {
    flex-direction: column-reverse;
    height: 100vh;
    /* 确保在移动设备上填满整个视口 */
  }

  .galaxy-canvas {
    height: 70vh;
    width: 100%;
    border-radius: 0;
  }

  .controls-panel {
    width: 100%;
    min-width: unset;
    max-width: unset;
    flex: none;
    height: auto;
    max-height: 40vh;
    border-right: none;
    border-top: 1px solid #333;
    overflow-y: auto;
    padding: 15px;
  }

  /* 在移动端隐藏收缩按钮 */
  .panel-toggle {
    display: none;
  }

  /* 移动端不再需要折叠模式 */
  .controls-panel.collapsed {
    width: 100%;
    min-width: unset;
    max-width: unset;
    flex: none;
    height: auto;
    max-height: 40vh;
    padding: 15px;
    overflow-y: auto;
  }

  h1 {
    font-size: 1.3rem;
    margin-bottom: 15px;
  }

  h2 {
    font-size: 0.9rem;
    margin-bottom: 8px;
  }

  .control-group {
    margin-bottom: 10px;
    padding: 10px;
  }

  .control-buttons {
    margin-bottom: 15px;
  }

  .control-button {
    padding: 10px;
  }

  .button-icon {
    font-size: 1.2rem;
    margin-bottom: 3px;
  }

  /* 优化移动设备上的滑块控件 */
  input[type="range"] {
    height: 8px;
    /* 增加滑块的高度，便于触摸 */
  }

  input[type="range"]::-webkit-slider-thumb {
    width: 24px;
    height: 24px;
    /* 增大滑块手柄，便于触摸 */
  }

  /* 确保文本在小屏幕上不会太大 */
  .value-display {
    font-size: 1rem;
  }
}

/* 适应极小屏幕 */
@media (max-width: 480px) {
  .galaxy-canvas {
    height: 60vh;
  }

  .controls-panel {
    max-height: 50vh;
  }

  /* 在极小屏幕上减少控制面板的内边距 */
  .control-group {
    padding: 8px;
    margin-bottom: 8px;
  }

  /* 减小按钮间距和大小 */
  .control-buttons {
    gap: 8px;
  }

  /* 确保模式按钮在小屏幕上能够适应宽度 */
  .mode-buttons {
    flex-wrap: wrap;
  }

  .mode-button {
    font-size: 0.8rem;
    padding: 8px;
  }
}
</style>
