---
name: uied-tools-fullstack-sync
description: 用于 tools-web 项目的前后端联动开发与回归。适用于“纯前端工具 + likeadmin-go 后台 + Python AI服务”的接口设计、菜单权限、配额计费与联调验收。
license: Internal project skill
---

本技能用于统一前后端协作方式，降低联调成本，避免“页面改了但接口未对齐”。

## 适用场景

- 新增后台管理能力：会员、配额、支付、配置中心
- 新增 AI 服务能力：如抠图、OCR、文生图
- 前端工具页接入后台鉴权与次数限制

## 标准联调流程

1. 定义接口契约  
先确定 URL、请求参数、响应结构、错误码，不先写页面细节。

2. 后台先给可调接口  
后台先返回稳定 JSON，哪怕先写 mock 数据也可以。

3. 前端按契约接入  
前端只依赖契约字段，不直接猜后台结构。

4. 菜单与权限同步  
后台新增菜单、按钮权限点，前端再挂页面入口。

5. 闭环回归  
完成“保存配置 -> 接口返回 -> 前端生效 -> 异常提示”全链路验证。

## 推荐目录约定

- 前端工具站：`src/components/Tools/**`
- 后台基座：`backend/likeadmin-go`
- AI 服务：`backend/matting-service`（可扩展为 `backend/ai-services/*`）
- 部署文档：`docs/ai-matting-baota-deploy.md`

## 接口约定建议

- 管理后台 API 前缀：`/api/admin/*`
- AI 推理 API 前缀：`/api/matting/*`
- 统一返回结构：`{ code, msg, data, traceId }`
- 统一错误码：鉴权、配额不足、任务失败、超时、参数错误

## 回归清单（每次发版至少执行）

1. 登录态接口是否正常（未登录/已登录）
2. 配额扣减是否准确（成功扣次、失败不扣次）
3. 关键工具路由是否可达
4. 工具主按钮是否可点击并返回结果
5. 失败场景是否有明确错误提示

## 项目当前建议

- 大版本阶段先保持“前端站点稳定”，后台能力增量接入。
- AI 模型推理放 Python 服务，likeadmin-go 专注业务与运营管理。

