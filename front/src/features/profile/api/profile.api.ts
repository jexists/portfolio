import { assetUrl } from '@/lib/assetUrl';
import { http } from '@/lib/axios';
import type { Profile, ProfileDto } from '@/features/profile/types/profile.types';

/** 문서 id(_id)는 화면에서 쓰지 않는다. 빈 avatar(Go zero value)는 사진 없음으로 본다. */
export function toProfile(dto: ProfileDto): Profile {
  const { _id, avatar, ...rest } = dto;
  void _id;
  return { ...rest, avatarUrl: avatar ? assetUrl(avatar) : undefined };
}

export const profileApi = {
  async getProfile(): Promise<Profile> {
    const { data } = await http.get<ProfileDto>('/profile');
    return toProfile(data);
  },
};

export type ProfileApi = typeof profileApi;
