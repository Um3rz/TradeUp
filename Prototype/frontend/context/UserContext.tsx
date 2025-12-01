"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserProfile, User } from "@/lib/userService";



interface UserContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<User | null>;
}



const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => null,
});


export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async (): Promise<User | null> => {
    setIsLoading(true);
    let fetchedProfile: User | null = null;
    try {
      fetchedProfile = await getUserProfile();
      setUser(fetchedProfile);
      return fetchedProfile;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // Set up periodic refresh every 55 minutes (3300000 ms)
    const interval = setInterval(() => {
      refreshUser();
    }, 3300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
