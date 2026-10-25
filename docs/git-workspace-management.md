<!--
  @copyright Tomda (https://www.tomda.top)
  @copyright UIED技术团队 (https://fsuied.com)
  @author UIED技术团队
  @createDate 2026-10-25
-->

# Git 工作区管理

主站、管理后台和 Go 后端都由 UIED-Tools 根仓跟踪，公开远端为 `opensource`，协作分支为 `opensource/main`。`backend/likeadmin-go/` 是普通源码目录，不需要独立提交到旧的私有 `tool.git`。

## 本次收口

2026-10-25 核对时，根仓 `f54975d8` 已同步 GitHub，工作区干净；后台目录仍保留历史独立 Git 元数据，显示 80 个已跟踪修改和 46 个未跟踪文件。排除一个 `.DS_Store` 后，125 个业务文件全部与根仓 HEAD 逐字节一致，没有漏提交或漏上传。

后台仅有一个工作树，无其他 checkout 依赖。其完整 `.git` 已原样迁至本机忽略目录 `.runtime/git-metadata-backups/20261025-191057/likeadmin-go.git`，同目录的 `manifest.json` 记录原位置、分支、提交和还原方法，另保留原状态与二进制补丁。源码未重置，分支、对象、索引和远端配置均保留在备份中。需要恢复独立仓库时，可按清单把该元数据目录放回原位置。

旧 `UIED-Tools` gitlink 缺少 `.gitmodules` 映射，会让 `git submodule status` 报错。本次仅移除主仓索引里的失效链接，磁盘上的历史目录保留，并继续由既有忽略规则排除。

## 日常核对

从项目根目录检查：

```bash
git status --short --branch
git diff --stat
git diff --cached --stat
git rev-list --left-right --count HEAD...opensource/main
git -C backend/likeadmin-go rev-parse --show-toplevel
```

前两类 diff 为空、`status` 没有文件条目，表示没有待提交改动；提交并推送后，最后的提交计数应为 `0 0`。后台的顶层路径应返回 UIED-Tools 根目录，避免同一批源码再次出现两套 Git 状态。

Codex 的“分支”视图比较基线应选择 `opensource/main`。若选中历史 `origin/master`，显示的是与 Gitee 旧分支的历史差异，并不表示这些代码尚未上传 GitHub。不要通过重置源码、删除历史或强推旧远端来清空这种差异。

这次调整仅处理 Git 管理和文档，不更改产品版本，不打包部署。
