"use client";

import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import { formatTimeToNow } from "@/lib/utils";
import { CommentRequest } from "@/lib/validators/comment";
import { Comment, CommentVote, User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { MessageSquare, Trash2 } from "lucide-react"; // Añadido ícono para el botón "Delete"
import { useRouter } from "next/navigation";
import { FC, useRef, useState } from "react";
import CommentVotes from "../CommentVotes";
import { UserAvatar } from "../UserAvatar";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { toast } from "../../hooks/use-toast";
import { useSession } from "next-auth/react";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface PostCommentProps {
  comment: ExtendedComment;
  votesAmt: number;
  currentVote: CommentVote | undefined;
  postId: string;
  isAdmin: boolean; // Nueva prop para saber si el usuario es admin
}

const PostComment: FC<PostCommentProps> = ({
  comment,
  votesAmt,
  currentVote,
  postId,
  isAdmin,
}) => {
  const { data: session } = useSession();
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const commentRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState<string>(`@${comment.author.username} `);
  const router = useRouter();
  useOnClickOutside(commentRef, () => {
    setIsReplying(false);
  });

  const { mutate: postComment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = { postId, text, replyToId };

      const { data } = await axios.patch(
        `/api/subreddit/post/comment/`,
        payload
      );
      return data;
    },
    onError: () => {
      return toast({
        title: "Something went wrong.",
        description: "Comment wasn't created successfully. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setIsReplying(false);
    },
  });

  // Función para eliminar comentarios
  const { mutate: deleteComment, isLoading: isDeleting } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `/api/subreddit/post/comment/delete?id=${comment.id}`
      );
      return data;
    },
    onError: () => {
      return toast({
        title: "Error deleting comment",
        description: "Could not delete comment. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      return toast({
        title: "Comment deleted",
        description: "Your comment has been successfully deleted.",
        variant: "default",
      });
    },
  });

  // Determina la URL base dependiendo del entorno
  const getAudioUrl = (audioUrl: string) => {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://breadit.marcespana.com"
        : "http://localhost:3000";

    return audioUrl.startsWith("http") ? audioUrl : `${baseUrl}${audioUrl}`;
  };

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className="h-6 w-6"
        />
        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>

          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

      {/* Reproductor de audio si el comentario tiene un audio */}
      {comment.audioUrl && (
        <audio controls className="mt-2">
          <source src={getAudioUrl(comment.audioUrl)} type="audio/wav" />
          Your browser does not support the audio element.
        </audio>
      )}

      <div className="flex gap-2 items-center mt-2">
        <CommentVotes
          commentId={comment.id}
          votesAmt={votesAmt}
          currentVote={currentVote}
        />

        {/* Botón para responder */}
        <Button
          onClick={() => {
            if (!session) return router.push("/sign-in");
            setIsReplying(true);
          }}
          variant="ghost"
          size="xs"
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>

        {/* Botón para eliminar comentario */}
        {(session?.user.id === comment.authorId || isAdmin) && (
          <Button
            onClick={() => deleteComment()}
            variant="destructive"
            className="bg-red-400"
            size="xs"
            isLoading={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
        )}
      </div>

      {isReplying && (
        <div className="grid w-full gap-1.5 mt-4">
          <Label htmlFor="comment">Your comment</Label>
          <Textarea
            onFocus={(e) =>
              e.currentTarget.setSelectionRange(
                e.currentTarget.value.length,
                e.currentTarget.value.length
              )
            }
            autoFocus
            id="comment"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            placeholder="What are your thoughts?"
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button
              tabIndex={-1}
              variant="subtle"
              onClick={() => setIsReplying(false)}
            >
              Cancel
            </Button>
            <Button
              isLoading={isLoading}
              onClick={() => {
                if (!input) return;
                postComment({
                  postId,
                  text: input,
                  replyToId: comment.replyToId ?? comment.id,
                });
              }}
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostComment;
