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
    try {
      const profile = await getUserProfile();
        // Fetch signed profile image URL
        let signedUrl: string | null = null;
        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
            const res = await fetch(`${API_BASE_URL}/users/profile-picture`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            if (res.ok) {
              const data = await res.json();
              signedUrl = data.imageUrl || null;
            }
          }
        } catch (e) {
          console.error('Error fetching profile picture:', e);
        }
        // Only update user if profileImageUrl actually changed to avoid unnecessary re-renders
        const updatedUser = { ...profile, profileImageUrl: signedUrl || profile.profileImageUrl };
        setUser(updatedUser);
        return updatedUser;
    } catch (e) {
      console.error('Error in refreshUser:', e);
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
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};