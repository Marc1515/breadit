"use client";

import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";

interface DeleteSubredditButtonProps {
  subredditId: string;
}

export const DeleteSubredditButton = ({
  subredditId,
}: DeleteSubredditButtonProps) => {
  const router = useRouter();

  const { mutate: deleteSubreddit, isLoading } = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/subreddit/delete/${subredditId}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "The was an error deleting the subreddit",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Subreddit Deleted",
        description: "The subreddit hs been deleted successfully",
      });
      router.push("/");
    },
  });

  return (
    <Button
      className="w-full"
      isLoading={isLoading}
      variant={"destructive"}
      onClick={() => deleteSubreddit()}
    >
      DeleteSubredditButton
    </Button>
  );
};
