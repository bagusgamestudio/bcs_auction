import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { fetchNui } from "@/utils/fetchNui";

interface DeleteDialogProps {
  auctionId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export const DeleteDialog = ({ auctionId, open, onOpenChange, onDeleted }: DeleteDialogProps) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetchNui("deleteAuction", { id: auctionId });
      onOpenChange(false);
      onDeleted();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Auction</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this auction? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};