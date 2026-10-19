/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */

export interface PdfEncryptionPasswords {
  userPassword: string
  ownerPassword: string
}

export interface PdfEncryptionRuntime {
  callMain: (args: string[]) => number
  FS: {
    writeFile: (path: string, data: Uint8Array) => void
    readFile: (path: string) => Uint8Array
    unlink: (path: string) => void
  }
}

/**
 * 函数说明：校验 PDF 密码并补齐随机所有者密码，防止空所有者密码使打开密码失效。
 * @param passwords 用户输入的打开密码和权限密码
 * @returns 可交给 AES-256 引擎的密码，不裁剪用户输入
 */
export const resolvePdfEncryptionPasswords = (passwords: PdfEncryptionPasswords): PdfEncryptionPasswords => {
  if (!passwords.userPassword && !passwords.ownerPassword) {
    throw new Error('请至少设置一个密码')
  }
  for (const password of [passwords.userPassword, passwords.ownerPassword]) {
    if (password.includes('\0')) throw new Error('密码不能包含空字符')
    if (new TextEncoder().encode(password).length > 127) {
      throw new Error('密码不能超过 127 个 UTF-8 字节，请缩短后重试')
    }
  }
  const ownerPassword = passwords.ownerPassword || Array.from(
    crypto.getRandomValues(new Uint8Array(32)),
    (value) => value.toString(16).padStart(2, '0')
  ).join('')
  return { userPassword: passwords.userPassword, ownerPassword }
}

/**
 * 函数说明：通过 qpdf 执行 AES-256 加密并返回独立字节副本，结束后清理虚拟文件。
 * @param runtime 当前任务独占的 qpdf 运行时
 * @param source 原始 PDF 字节
 * @param passwords 已校验的打开密码与所有者密码
 * @returns 保留原文档结构和页面内容的加密 PDF 字节
 */
export const encryptPdfWithRuntime = (
  runtime: PdfEncryptionRuntime,
  source: Uint8Array,
  passwords: PdfEncryptionPasswords
): Uint8Array => {
  const inputPath = '/source.pdf'
  const outputPath = '/encrypted.pdf'
  try {
    runtime.FS.writeFile(inputPath, source)
    const exitCode = runtime.callMain([
      inputPath,
      '--encrypt',
      `--user-password=${passwords.userPassword}`,
      `--owner-password=${passwords.ownerPassword}`,
      '--bits=256',
      '--print=full',
      '--modify=none',
      '--extract=n',
      '--',
      outputPath
    ])
    // qpdf 退出码 3 表示仅有修复警告，仍可得到有效文档；其他非零值均禁止下载。
    if (exitCode !== 0 && exitCode !== 3) {
      throw new Error('加密失败，请确认 PDF 未损坏且没有已有的打开密码')
    }
    const result = runtime.FS.readFile(outputPath).slice()
    if (result.length === 0) throw new Error('加密引擎没有生成有效文件，请重试')
    return result
  } finally {
    for (const path of [inputPath, outputPath]) {
      try { runtime.FS.unlink(path) } catch { /* 文件尚未创建时无需清理。 */ }
    }
  }
}
