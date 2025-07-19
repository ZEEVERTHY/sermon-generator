import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Session } from 'next-auth';

type AuthContextType = {
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
  signIn: (provider?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "unauthenticated",
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();

  const handleSignIn = async (provider?: string) => {
    await signIn(provider);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ session, status, signIn: handleSignIn, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);