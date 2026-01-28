import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteGraphDialogProps {
  openDelete: boolean;
  setOpenDelete: React.Dispatch<React.SetStateAction<boolean>>;
  deleteGraph: boolean;
  setDeleteGraph: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteGraphDialog = ({
  openDelete,
  setOpenDelete,
  deleteGraph,
  setDeleteGraph,
}: DeleteGraphDialogProps) => {
  return (
    <Dialog open={openDelete} onOpenChange={setOpenDelete}>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Warning!</DialogTitle>
        </DialogHeader>

        <p>Are you sure you want to delete the graph?</p>

        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() => setDeleteGraph(true)}
            >
              Yes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteGraphDialog;
