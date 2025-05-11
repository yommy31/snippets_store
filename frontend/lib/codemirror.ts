import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { sql } from '@codemirror/lang-sql';
import { rust } from '@codemirror/lang-rust';
import { yaml } from '@codemirror/lang-yaml';
import { xml } from '@codemirror/lang-xml';
import {StreamLanguage} from "@codemirror/language";
import {go} from "@codemirror/legacy-modes/mode/go";
import {toml} from "@codemirror/legacy-modes/mode/toml";
import {shell} from "@codemirror/legacy-modes/mode/shell";
import {cmake} from "@codemirror/legacy-modes/mode/cmake";

import { Extension } from '@codemirror/state';
import { LanguageOption } from '@/types';

/**
 * 根据语言获取相应的 CodeMirror 语言扩展
 */
export function getLanguageExtension(language: string): Extension {
  switch (language) {
    case 'javascript':
      return javascript();
    case 'typescript':
      return javascript({ typescript: true });
    case 'html':
      return html();
    case 'css':
      return css();
    case 'python':
      return python();
    case 'json':
      return json();
    case 'markdown':
      return markdown();
    case 'sql':
      return sql();
    case 'cpp':
      return cpp();
    case 'java':
      return java();
    case 'yaml':
      return yaml();
    case 'xml':
      return xml();
    case 'rust':
      return rust();
    case 'go':
      return StreamLanguage.define(go);
    case 'shell':
      return StreamLanguage.define(shell);
    case 'toml':
      return StreamLanguage.define(toml);
    case 'cmake':
      return StreamLanguage.define(cmake);
    case 'plaintext':
    default:
      return [];
  }
}

/**
 * 获取基于系统主题的 CodeMirror 主题
 * @param isDarkMode 是否为暗色模式
 */
export function getThemeBasedOnMode(isDarkMode: boolean) {
  return isDarkMode ? 'dark' : 'light';
}