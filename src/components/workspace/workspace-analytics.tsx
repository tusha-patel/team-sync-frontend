import { useQuery } from "@tanstack/react-query";
import AnalyticsCard from "./common/analytics-card";
import { getWorkspaceAnalyticsQueryFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";

const WorkspaceAnalytics = () => {
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: () => getWorkspaceAnalyticsQueryFn(workspaceId),
  });

  const analytics = data?.analytics;
  return (
    <div className="grid gap-4 md:gap-5 lg:grid-cols-2 xl:grid-cols-3">
      <AnalyticsCard
        isLoading={isPending}
        title={"Total task"}
        value={analytics?.totalTasks || 0}
      />
      <AnalyticsCard
        isLoading={isPending}
        title={"overdue task"}
        value={analytics?.overdueTasks || 0}
      />
      <AnalyticsCard
        isLoading={isPending}
        title={"Completed task"}
        value={analytics?.completedTasks || 0}
      />
    </div>
  );
};

export default WorkspaceAnalytics;
