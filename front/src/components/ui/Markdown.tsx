import { Children, isValidElement, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './Markdown.module.scss';

/** 제목 글자만 모은다 (굵게·코드 등이 섞여도) */
function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) =>
      typeof child === 'string' || typeof child === 'number'
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? textOf(child.props.children)
          : '',
    )
    .join('');
}

/** GitHub 과 같은 제목 id: 소문자, 글자·숫자·_·-·공백만 남기고 공백은 - (본문의 #사례-1-... 링크와 맞춘다) */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '')
    .replace(/ /g, '-');
}

const components: Components = {
  // 본문 안의 외부 링크는 새 탭으로 연다
  a: ({ href, children }) =>
    href && /^https?:\/\//.test(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <a href={href}>{children}</a>
    ),
  h2: ({ children }) => <h2 id={headingId(textOf(children))}>{children}</h2>,
  h3: ({ children }) => <h3 id={headingId(textOf(children))}>{children}</h3>,
};

/** 원본 md 본문(GFM 표 포함)을 화면 글꼴·색으로 보여 준다 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
