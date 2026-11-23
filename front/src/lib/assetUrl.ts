/** public/ 아래 이미지(/images/...)는 하위 경로 배포(GitHub Pages /portfolio/)에서도 열리게 base 를 붙인다. Node 스크립트에는 import.meta.env 가 없다 */
export const assetUrl = (src: string) => (src.startsWith('/') ? `${(import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '')}${src}` : src);
