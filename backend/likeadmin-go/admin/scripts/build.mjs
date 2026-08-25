import { execaCommand } from 'execa'
import path from 'path'
import fsExtra from 'fs-extra'

const { existsSync, remove, copy } = fsExtra
const cwd = process.cwd()

// 打包发布路径，谨慎改动
const releaseRelativePath = '../frontend'
const distPath = path.resolve(cwd, 'dist')
const releasePath = path.resolve(cwd, releaseRelativePath)
const shouldCopyToFrontend = process.env.COPY_TO_FRONTEND === '1'

/**
 * 函数说明：执行后台管理前端构建，并按开关决定是否同步到 ../frontend。
 */
async function build() {
    await execaCommand('vite build', { stdio: 'inherit', encoding: 'utf-8', cwd })

    if (!shouldCopyToFrontend) {
        console.log('[INFO] 已完成构建，未开启 frontend 同步（可使用 COPY_TO_FRONTEND=1 开启）。')
        return
    }

    if (existsSync(releasePath)) {
        await remove(releasePath)
    }
    console.log(`文件正在复制 ==> ${releaseRelativePath}`)
    try {
        await copyFile(distPath, releasePath)
    } catch (error) {
        console.log(`\n ${error}`)
    }
    console.log(`文件已复制 ==> ${releaseRelativePath}`)
}

/**
 * 函数说明：复制目录到目标路径。
 */
function copyFile(sourceDir, targetDir) {
    return new Promise((resolve, reject) => {
        copy(sourceDir, targetDir, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

build()
