export interface ProfileLink {
  type: 'github' | 'linkedin' | 'blog' | 'website';
  label: string;
  url: string;
}

export interface Strength {
  title: string;
  text: string;
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
}

/** API 응답 문서 (mockup/profiles.json, Mongo profiles 컬렉션과 같은 모양) */
export interface ProfileDto extends Omit<Profile, 'avatarUrl'> {
  _id: string;
  avatar?: string;
}
