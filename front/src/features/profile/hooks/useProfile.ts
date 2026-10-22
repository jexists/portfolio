import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/features/profile/api/profile.api';

export const profileKeys = {
  detail: () => ['profile'] as const,
};

export function useProfile() {
  return useQuery({ queryKey: profileKeys.detail(), queryFn: () => profileApi.getProfile() });
}
