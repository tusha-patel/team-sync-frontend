import { createContext, useContext, useEffect } from "react";
import useAuth from "@/hooks/api/use-auth";
import { UserType, WorkspaceType } from "@/types/api.type";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetWorkspaceQuery from "@/hooks/api/use-get-workspace";
import { useNavigate } from "react-router-dom";
import { PermissionType } from "@/constant";
import UsePermissions from "@/hooks/use-permissions";

// Define the context shape
type AuthContextType = {
  user?: UserType;
  workspace?: WorkspaceType;
  hasPermission: (permission: PermissionType) => boolean;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
  workspaceLoading: boolean;
  refetchAuth: () => void;
  refetchWorkspace: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: authData, error: authError, isLoading, isFetching, refetch: refetchAuth } = useAuth();
  const user = authData?.user;
  const workspaceId = useWorkspaceId();
  const navigate = useNavigate();


  const { data: workspaceData, isLoading: workspaceLoading, error: workspaceError, refetch: refetchWorkspace } = useGetWorkspaceQuery(workspaceId)
  const workspace = workspaceData?.workspace;
  useEffect(() => {
    if (workspaceError) {
      if (workspaceError?.errorCode === "ACCESS_UNAUTHORIZED") {
        navigate("/")
      }
    }
  }, [navigate, workspaceError]);

  const permissions = UsePermissions(user, workspace);
  const hasPermission = (permission: PermissionType): boolean => {
    return permissions.includes(permission);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        error: authError || workspaceError,
        isLoading,
        isFetching,
        workspaceLoading,
        refetchAuth,
        refetchWorkspace,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider >
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useCurrentUserContext must be used within a AuthProvider");
  }
  return context;
};
