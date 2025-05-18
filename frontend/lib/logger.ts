/**
 * 统一的日志工具，支持不同级别的日志输出
 * 在生产环境中自动禁用debug级别的日志
 */
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (message: string, ...args: any[]) => 
    isDev && console.log(`[DEBUG] ${message}`, ...args),
  
  info: (message: string, ...args: any[]) => 
    console.log(`[INFO] ${message}`, ...args),
  
  warn: (message: string, ...args: any[]) => 
    console.warn(`[WARN] ${message}`, ...args),
  
  error: (message: string, ...args: any[]) => 
    console.error(`[ERROR] ${message}`, ...args)
};