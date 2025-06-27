import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { format } from "date-fns";
import { Loader } from "lucide-react";

const RecentMembers = () => {

  const workspaceId = useWorkspaceId();

  const { data, isLoading } = useGetWorkspaceMembers(workspaceId);

  const members = data?.members || [];


  return (
    <div className="flex flex-col pt-2">

      {isLoading ? <Loader className="animate-spin w-8 h-8 place-self-center flex  " /> : null}

      {members.length === 0 && (
        <div className="font-semibold text-sm text-muted-foreground text-center py-5 ">
          Member not found
        </div>
      )}

      <ul role="list" className="space-y-3">
        {members.map((member, index) => {
          return (
            <li
              key={index}
              role="listitem"
              className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-9 w-9 sm:flex">
                  <AvatarImage src={member.userId.profilePicture || ""} alt={member.userId.name} />
                  <AvatarFallback
                    className={`${getAvatarColor(member.userId.name)}`}
                  >
                    {" "}
                    {getAvatarFallbackText(member.userId.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Member Details */}
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-900">{member.userId?.name}</p>
                <p className="text-sm text-gray-500">{member.role.name}</p>
              </div>

              {/* Joined Date */}
              <div className="ml-auto text-sm text-gray-500">
                <p>Joined</p>
                <p>{member.joinedAt ? format(member.joinedAt, "PPP") : null}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  );
};

export default RecentMembers;
