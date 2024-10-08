"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/Button";

interface DeletePostButtonProps {
  postId?: string;
}

export const DeletePostButton = ({ postId }: DeletePostButtonProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const deletePost = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/subreddit/post/delete/${postId}`);
      alert("Post deleted succesfully");
      router.push("/");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      className={`text-red-600 hover:text-red-800 ${
        isDeleting ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={deletePost}
      disabled={isDeleting}
    >
      DeletePostButton
    </Button>
  );
};
