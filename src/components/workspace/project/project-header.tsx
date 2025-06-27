/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router-dom";
import CreateTaskDialog from "../task/create-task-dialog";
import EditProjectDialog from "./edit-project-dialog";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProjectByIdQueryFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import PermissionsGuard from "@/components/resuable/permission-guard";
import { Permissions } from "@/constant";

const ProjectHeader = () => {
  const param = useParams();
  const projectId = param.projectId as string;
  const workspaceId = useWorkspaceId();

  const { data, isPending, isError } = useQuery({
    queryKey: ["singleProject", projectId],
    queryFn: () => getProjectByIdQueryFn({
      workspaceId,
      projectId,
    }),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    enabled: !!projectId,
  });


  const project = data?.project;

  // Fallback if no project data is found
  const projectEmoji = project?.emoji || "📊";
  const projectName = project?.name || "Untitled project";

  const renderContent = () => {
    if (isPending) return <span>Loading...</span>;
    if (isError) return <span>Error occured</span>;
    return (
      <>
        <span>{projectEmoji}</span>
        <span className="capitalize"> {projectName}</span>
      </>
    );
  };
  return (
    <div className="flex items-center justify-between space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="flex items-center gap-3 text-xl font-medium truncate tracking-tight">
          {renderContent()}
        </h2>
        <PermissionsGuard requiredPermission={Permissions.EDIT_PROJECT} >
          <EditProjectDialog project={project as any} />
        </PermissionsGuard>
      </div>
      <CreateTaskDialog projectId={projectId} />
    </div>
  );
};

export default ProjectHeader;
