import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Loader } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import { getAvatarColor, getAvatarFallbackText, transformOptions } from "@/lib/helper";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { TaskType } from "@/types/api.type";
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editTaskMutionFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
    title: z.string().trim().min(1, {
        message: "Title is required",
    }),
    description: z.string().trim(),
    projectId: z.string().trim().min(1, {
        message: "Project is required",
    }),
    status: z.enum(
        Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
        {
            required_error: "Status is required",
        }
    ),
    priority: z.enum(
        Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum],
        {
            required_error: "Priority is required",
        }
    ),
    assignedTo: z.string().trim().min(1, {
        message: "AssignedTo is required",
    }),
    dueDate: z.date({
        required_error: "A date of birth is required.",
    }),
});

const EditTaskForm = (props: {
    onClose: () => void;
    defaultValues: TaskType | null;
}) => {
    const { onClose, defaultValues } = props;
    const { projectId } = useParams();
    const queryClient = useQueryClient()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: defaultValues?.title || "",
            description: defaultValues?.description || "",
            projectId: projectId ? projectId : (typeof defaultValues?.project === "string" ? defaultValues.project : defaultValues?.project?._id ?? ""),
            assignedTo: typeof defaultValues?.assignedTo === "string"
                ? defaultValues.assignedTo
                : (defaultValues?.assignedTo && typeof (defaultValues.assignedTo as { _id?: string })._id === "string"
                    ? (defaultValues.assignedTo as { _id: string })._id
                    : ""),
            dueDate: defaultValues?.dueDate ? new Date(defaultValues.dueDate) : undefined,
            status: defaultValues?.status || undefined,
            priority: defaultValues?.priority || undefined,

        },
    });
    const { mutate, isPending } = useMutation({
        mutationFn: editTaskMutionFn
    })
    const onSubmit = (data: z.infer<typeof formSchema>) => {
        if (isPending) return;
        const payload = {
            taskId: defaultValues?._id,
            workspaceId,
            projectId: defaultValues?.project?._id,
            data: {
                ...data,
                dueDate: data?.dueDate?.toISOString(),
            }
        }
        mutate(payload, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ["project-analytics", projectId],
                });
                queryClient.invalidateQueries({
                    queryKey: ["all-tasks", workspaceId]
                })
                toast({
                    title: "success",
                    description: "Task updated successfully",
                    variant: "success"
                });
                setTimeout(() => onClose(), 300);
            },
            onError: (error) => {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive"
                })
            }
        });
    }

    const taskStatusList = Object.values(TaskStatusEnum);
    const taskPriorityList = Object.values(TaskPriorityEnum);
    const statusOptions = transformOptions(taskStatusList);
    const priorityOptions = transformOptions(taskPriorityList);
    const workspaceId = useWorkspaceId();
    // const isLoading = false;

    const { data, isLoading } = useGetProjectsInWorkspaceQuery({
        workspaceId,
        skip: !!projectId,
    });

    const projects = data?.projects || [];
    const projectOptions = projects?.map((project) => {
        return {
            label: (
                <div className="flex items-center gap-1">
                    <span>{project.emoji}</span>
                    <span>{project.name}</span>
                </div>
            ),
            value: project._id,

        }
    });

    // Workspace Memebers
    const { data: memberData } = useGetWorkspaceMembers(workspaceId);
    const members = memberData?.members || [];

    const membersOptions = members?.map((member) => {
        const name = member.userId?.name || "unknown";
        const initials = getAvatarFallbackText(name);
        const avatarColor = getAvatarColor(name);
        return {
            label: (
                <div className="flex items-center space-x-2 " >
                    <Avatar className="h-7 w-7 ">
                        <AvatarImage src={member?.userId?.profilePicture || " "} alt="profile image" />
                        <AvatarFallback className={avatarColor} >
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span>{name}</span>
                </div>
            ),
            value: member.userId._id,
        }
    })


    return (
        <div className="w-full h-auto max-w-full">
            <div className="h-full">
                <div className="mb-5 pb-2 border-b">
                    <h1
                        className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1
            text-center sm:text-left"
                    >
                        Update Task
                    </h1>
                    <p className="text-muted-foreground text-sm leading-tight">
                        Organize and manage tasks, resources, and team collaboration
                    </p>
                </div>
                <Form {...form}>
                    <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                        <div>
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                            Task title
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Website Redesign"
                                                className="!h-[48px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* {Description} */}
                        <div>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                            Task description
                                            <span className="text-xs font-extralight ml-2">
                                                Optional
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea rows={1} placeholder="Description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* {ProjectId} */}
                        {!projectId && (
                            <div>
                                <FormField
                                    control={form.control}
                                    name="projectId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a project" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {isLoading && (
                                                        <div className="my-2">
                                                            <Loader className="w-4 h-4 place-self-center flex animate-spin" />
                                                        </div>
                                                    )}
                                                    <div className="w-full max-h-[200px] overflow-y-auto scrollbar " >
                                                        {projectOptions?.map((option) => (
                                                            <SelectItem key={option.value}
                                                                className="!capitalize cursor-pointer "
                                                                value={option.value} >
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </div>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* {Members AssigneeTo} */}
                        <div>
                            <FormField
                                control={form.control}
                                name="assignedTo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assigned To</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        {(() => {
                                                            const selected = membersOptions.find(opt => opt.value === field.value);
                                                            return selected?.label || "Select an assignee";
                                                        })()}
                                                    </SelectTrigger>
                                                </FormControl>
                                            </FormControl>
                                            <SelectContent>
                                                {
                                                    membersOptions?.map((option) => (
                                                        <SelectItem value={option.value} className="cursor-pointer" key={option.value}  >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* {Due Date} */}
                        <div className="!mt-2">
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full flex-1 pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={
                                                        (date) =>
                                                            date <
                                                            new Date(new Date().setHours(0, 0, 0, 0)) || // Disable past dates
                                                            date > new Date("2100-12-31") //Prevent selection beyond a far future date
                                                    }
                                                    initialFocus
                                                    defaultMonth={new Date()}
                                                    fromMonth={new Date()}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* {Status} */}
                        <div>
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        className="!text-muted-foreground !capitalize"
                                                        placeholder="Select a status"
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {statusOptions?.map((status) => (
                                                    <SelectItem
                                                        className="!capitalize"
                                                        key={status.value}
                                                        value={status.value}
                                                    >
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* {Priority} */}
                        <div>
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {priorityOptions?.map((priority) => (
                                                    <SelectItem
                                                        className="!capitalize"
                                                        key={priority.value}
                                                        value={priority.value}
                                                    >
                                                        {priority.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            className="flex place-self-end  h-[40px] text-white font-semibold"
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending && <Loader className="animate-spin" />}
                            Update
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );

}

export default EditTaskForm