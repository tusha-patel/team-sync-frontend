import { PermissionType } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";


const withPermission = (WrappedComponents: React.ComponentType,
  requiredPermission: PermissionType) => {

  const WithPermission = (props: React.ComponentProps<typeof WrappedComponents>) => {
    const { user, hasPermission, isLoading } = useAuthContext();
    const navigate = useNavigate();
    const workspaceId = useWorkspaceId();

    useEffect(() => {
      if (!user || !hasPermission(requiredPermission)) {
        navigate(`/workspace/${workspaceId}`);
      }
    }, [user, hasPermission, navigate, workspaceId]);

    if (isLoading) {
      return <div>Loading...</div>
    }

    if (!user || !hasPermission(requiredPermission)) {
      return;
    }
    return <WrappedComponents {...props} />
  }

    return WithPermission;
}

export default withPermission;
