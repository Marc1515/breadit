"use client";

import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/Dialog";

interface DeleteSubredditButtonProps {
  subredditId: string;
}

export const DeleteSubredditButton = ({
  subredditId,
}: DeleteSubredditButtonProps) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false); // Controlar la visibilidad del modal

  const { mutate: deleteSubreddit, isLoading } = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/subreddit/delete/${subredditId}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error deleting the subreddit",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Subreddit Deleted",
        description: "The subreddit has been deleted successfully",
      });
      router.push("/");
    },
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Button
        className="w-full"
        isLoading={isLoading}
        variant={"destructive"}
        onClick={openModal}
      >
        Delete Community
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Community</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this community? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              className="bg-red-500"
              variant="destructive"
              onClick={() => {
                deleteSubreddit();
                closeModal();
              }}
              isLoading={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
