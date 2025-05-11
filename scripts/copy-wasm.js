import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { existsSync, mkdirSync, copyFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 源文件路径
const sourceFile = resolve(
  __dirname,
  '../node_modules/gifsicle-wasm-browser/dist/gifsicle.wasm'
)

// 目标文件路径
const targetDir = resolve(__dirname, '../public')
const targetFile = resolve(targetDir, 'gifsicle.wasm')

// 确保目标目录存在
if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true })
}

// 复制文件
copyFileSync(sourceFile, targetFile)

console.log('WASM file copied successfully!') 