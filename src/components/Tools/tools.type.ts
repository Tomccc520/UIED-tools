import { toolIcons } from './icons'

export interface ToolsReqData {
  cateId: number;
  title: string;
}

export interface Tool {
  id: number;
  title: string;
  logo: string | { type: 'svg', name: keyof typeof toolIcons };
  desc: string;
  url: string;
  cateId?: number;
  cate?: string;
  children?: Tool[];
  isExternal?: boolean;
  releaseDate?: string;
}

export interface ToolCategory {
  id: number;
  title: string;
  icon?: string;
  list: Tool[];
}

export type ToolList = ToolCategory[];
