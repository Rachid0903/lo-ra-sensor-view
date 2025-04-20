
import React, { createContext, useState, useContext, ReactNode } from "react";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Simulating authentication functionality
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, you would make an API call here
      // Simulating successful login for demo purposes
      if (email && password) {
        // Simulating a small delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // For the demo, we'll use a simple condition
        if (email === "test@example.com" && password === "password") {
          const userData: User = {
            id: "user123",
            email,
            firstName: "Jean",
            lastName: "Dupont",
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          return true;
        } else {
          toast({
            title: "Échec de connexion",
            description: "Email ou mot de passe incorrect",
            variant: "destructive",
          });
          return false;
        }
      }
      return false;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<boolean> => {
    try {
      // In a real app, you would make an API call here
      // Simulating successful registration for demo purposes
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
      });
      
      // Auto-login after successful registration
      const userData: User = {
        id: "user123",
        email,
        firstName,
        lastName,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      // In a real app, you would make an API call here
      // Simulating successful password reset request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Email envoyé",
        description: "Un email de réinitialisation a été envoyé à votre adresse",
      });
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la demande de réinitialisation",
        variant: "destructive",
      });
      return false;
    }
  };

  // Check if user is logged in from localStorage on page load
  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
