import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { getUsers } from "../services/users";
import type { User } from "../types/user";
import type { ApiResponse } from "../common";

interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  updateUserInList: (userId: string, updatedUser: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    console.log("🔄 Refreshing users...");
    setLoading(true);
    setError(null);
    try {
      const response: ApiResponse<User[]> = await getUsers({
        includeInactive: true,
        limit: 1000, // o un número muy alto
        // Si tu backend soporta "sin límite", usa:
        // limit: -1
      });
      console.log("✅ Users loaded:", response.data.length, "users");
      console.log(
        "📋 Users with active status:",
        response.data.map((u) => ({ id: u.id, dni: u.dni, active: u.active }))
      );
      setUsers(response.data);
    } catch (err) {
      console.error("❌ Error loading users:", err);
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserInList = useCallback(
    (userId: string, updatedUser: Partial<User>) => {
      console.log("🔄 Updating user in list:", userId, updatedUser);
      setUsers((prev) => {
        const updated = prev.map((user) =>
          user.id === userId ? { ...user, ...updatedUser } : user
        );
        console.log(
          "📋 Updated users list:",
          updated.map((u) => ({ id: u.id, dni: u.dni, active: u.active }))
        );
        return updated;
      });
    },
    []
  );

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        error,
        refreshUsers,
        updateUserInList,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
