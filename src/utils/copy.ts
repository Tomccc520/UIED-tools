/**
 * 通用的复制文本函数
 * @param text 要复制的文本
 * @returns Promise<boolean> 是否复制成功
 */
export const copy = async (text: string): Promise<boolean> => {
  // 优先使用 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API 失败，尝试降级方案');
    }
  }

  // 降级使用 execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // 设置样式使其不可见
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
};
