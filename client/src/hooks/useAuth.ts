import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  level: number;
  xp: number;
  totalXp: number;
  currentXp: number;
  xpToNext: number;
  xpToNextLevel: number;
  avatarClass: string;
  createdAt: string;
}

async function fetchMe(): Promise<UserProfile | null> {
  try {
    const data: any = await api.get("/auth/me");
    return data.user ?? null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery<UserProfile | null>({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
    staleTime: 30_000,
  });

  const loginMutation = useMutation({
    mutationFn: (creds: { email: string; password: string }) =>
      api.post<{ user: UserProfile }>("/auth/login", creds),
    onSuccess: (data) => qc.setQueryData(["me"], data.user),
  });

  const registerMutation = useMutation({
    mutationFn: (data: {
      username: string;
      email: string;
      password: string;
      displayName?: string;
      avatarClass?: string;
    }) => api.post<{ user: UserProfile }>("/auth/register", data),
    onSuccess: (data) => qc.setQueryData(["me"], data.user),
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.post("/auth/logout", {}),
    onSuccess: () => {
      qc.setQueryData(["me"], null);
      qc.clear();
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isLoggedIn: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error?.message,
  };
}
