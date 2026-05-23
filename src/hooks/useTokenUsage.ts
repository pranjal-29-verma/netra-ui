import { useQuery } from '@tanstack/react-query';
import tokenService from '../services/tokenService';

export const TOKEN_USAGE_KEY = ['token-usage'] as const;

export function useTokenUsage() {
  return useQuery({
    queryKey: TOKEN_USAGE_KEY,
    queryFn: () => tokenService.getUsage(),
    staleTime: 60_000,
  });
}
