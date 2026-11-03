export interface Profile {
  name: string;
  nameEn: string;
  role: string;
  location: string;
  kakaoId: string;
  email: string;
  website: string;
  github: string;
  avatarUrl?: string;
  keywords: string[];
  body: string;
}

/** API 응답 문서 (mockup/profiles.json, Mongo profiles 컬렉션과 같은 모양) */
export interface ProfileDto {
  _id: string;
  name: string;
  nameEn: string;
  role: string;
  location: string;
  kakaoId: string;
  email: string;
  website: string;
  github: string;
  avatar?: string;
  keywords: string[];
  body: string;
}
