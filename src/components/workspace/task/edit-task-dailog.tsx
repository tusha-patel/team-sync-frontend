import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { FC } from "react";
import EditTaskForm from "./edit-task-form";
import { TaskType } from "@/types/api.type";

interface EditTaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    task: TaskType | null; 
}

const EditTaskDialog: FC<EditTaskDialogProps> = ({ isOpen, onClose, task }) => {
    return (
        <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <EditTaskForm onClose={onClose} defaultValues={task} />
            </DialogContent>
        </Dialog>
    );
};

export default EditTaskDialog;
