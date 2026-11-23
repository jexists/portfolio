export interface ProfileLink {
  type: 'github' | 'linkedin' | 'blog' | 'website';
  label: string;
  url: string;
}

export interface Strength {
  title: string;
  text: string;
}

/** 언어 한 줄 */
export interface LabeledText {
  label: string;
  text: string;
}

/** 기술 요점 한 줄: 라벨 + 기술 이름(배지) */
export interface SkillSummaryRow {
  label: string;
  items: string[];
}

export interface Profile {
  name: string;
  nameEn: string;
  role: string;
  years: string;
  location: string;
  email: string;
  avatarUrl?: string;
  headline: string;
  summary: string[];
  links: ProfileLink[];
  strengths: Strength[];
  /** 기술 탭 맨 위 요점 */
  skillSummary?: SkillSummaryRow[];
  /** 기술 탭 맨 아래 언어 */
  languages?: LabeledText[];
  /** 전체 탭 기술 카드의 대표 기술 설명 */
  skillHighlights?: LabeledText[];
}

/** API 응답 문서 (mockup/profiles.json, Mongo profiles 컬렉션과 같은 모양) */
export interface ProfileDto extends Omit<Profile, 'avatarUrl'> {
  _id: string;
  avatar?: string;
}
