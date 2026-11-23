import { useQuery } from '@tanstack/react-query';
import { resumeApi } from '@/features/resume/api/resume.api';

export const resumeKeys = {
  careers: () => ['resume', 'careers'] as const,
  skills: () => ['resume', 'skills'] as const,
  educations: () => ['resume', 'educations'] as const,
  credentials: () => ['resume', 'credentials'] as const,
};

export const useCareers = () => useQuery({ queryKey: resumeKeys.careers(), queryFn: resumeApi.listCareers });
export const useSkills = () => useQuery({ queryKey: resumeKeys.skills(), queryFn: resumeApi.listSkills });
export const useEducations = () => useQuery({ queryKey: resumeKeys.educations(), queryFn: resumeApi.listEducations });
export const useCredentials = () => useQuery({ queryKey: resumeKeys.credentials(), queryFn: resumeApi.listCredentials });
