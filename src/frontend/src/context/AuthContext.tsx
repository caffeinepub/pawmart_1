import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { UserProfile } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userProfile: UserProfile | null;
  isLoadingProfile: boolean;
  principalStr: string | null;
  showRegistrationModal: boolean;
  setShowRegistrationModal: (show: boolean) => void;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const principalStr = isAuthenticated
    ? (identity?.getPrincipal().toString() ?? null)
    : null;

  const loadProfile = useCallback(async () => {
    if (!actor || isFetching || !isAuthenticated) return;
    setIsLoadingProfile(true);
    try {
      const [profile, adminStatus] = await Promise.all([
        actor.getCallerUserProfile(),
        actor.isCallerAdmin(),
      ]);
      setIsAdmin(adminStatus);
      if (!profile) {
        setUserProfile(null);
        setShowRegistrationModal(true);
      } else {
        setUserProfile(profile);
        setShowRegistrationModal(false);
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setIsLoadingProfile(false);
      setProfileFetched(true);
    }
  }, [actor, isFetching, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAdmin(false);
      setUserProfile(null);
      setProfileFetched(false);
      return;
    }
    if (!isFetching && actor && !profileFetched) {
      loadProfile();
    }
  }, [isAuthenticated, actor, isFetching, profileFetched, loadProfile]);

  const refreshProfile = useCallback(() => {
    setProfileFetched(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        userProfile,
        isLoadingProfile: isLoadingProfile || isInitializing,
        principalStr,
        showRegistrationModal,
        setShowRegistrationModal,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
