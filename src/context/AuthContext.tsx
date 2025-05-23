import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";

// Define AuthContext Type
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  setCurrentUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  userType: string | null;
  setUserType: (userType: string | null) => void;
  username: string | null;
  setUsername: (username: string | null) => void;
  nav: boolean;
  setNav: (value: boolean) => void;
  role:
    | "doctor"
    | "researchInstitution"
    | "farmer"
    | "ngo"
    | "volunteer"
    | null;
  setRole: (
    value:
      | "doctor"
      | "researchInstitution"
      | "farmer"
      | "ngo"
      | "volunteer"
      | null
  ) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom Hook to use AuthContext
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider Component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [nav, setNav] = useState<boolean>(false);
  const [role, setRole] = useState<
    "doctor" | "researchInstitution" | "farmer" | "ngo" | "volunteer" | null
  >(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        userType,
        setUserType,
        setCurrentUser,
        setLoading,
        username,
        setUsername,
        nav,
        setNav,
        role,
        setRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
