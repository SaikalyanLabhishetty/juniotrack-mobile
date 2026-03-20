import * as SecureStore from "expo-secure-store";
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type UserProfile = {
  email: string;
  name: string;
  role: "teacher" | "parent";
  uid: string;
  organizationId: string;
  schoolId: string;
};

type AuthContextValue = {
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (token: string, user: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
};

const AUTH_TOKEN_KEY = "syndeo-auth-token";
const AUTH_USER_KEY = "syndeo-auth-user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(AUTH_USER_KEY);
        if (storedToken) {
          setToken(storedToken);
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const signIn = async (tokenValue: string, userProfile: UserProfile) => {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, tokenValue);
    await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(userProfile));
    setToken(tokenValue);
    setUser(userProfile);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      signIn,
      signOut,
    }),
    [token, user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
