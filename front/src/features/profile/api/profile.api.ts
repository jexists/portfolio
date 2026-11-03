import { http } from '@/lib/axios';
import type { Profile, ProfileDto } from '@/features/profile/types/profile.types';

export function toProfile(dto: ProfileDto): Profile {
  return {
    name: dto.name,
    nameEn: dto.nameEn,
    role: dto.role,
    location: dto.location,
    kakaoId: dto.kakaoId,
    email: dto.email,
    website: dto.website,
    github: dto.github,
    avatarUrl: dto.avatar,
    keywords: dto.keywords,
    body: dto.body,
  };
}

export const profileApi = {
  async getProfile(): Promise<Profile> {
    const { data } = await http.get<ProfileDto>('/profile');
    return toProfile(data);
  },
};

export type ProfileApi = typeof profileApi;
