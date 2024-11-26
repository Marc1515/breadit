"use client";

import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/use-toast";
import { CommentRequest } from "@/lib/validators/comment";

import { useCustomToasts } from "@/hooks/use-custom-toasts";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { FC, useState, useRef } from "react";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

interface CreateCommentProps {
  postId: string;
  replyToId?: string;
}

const CreateComment: FC<CreateCommentProps> = ({ postId, replyToId }) => {
  const [input, setInput] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const audioRef = useRef<MediaRecorder | null>(null);
  const router = useRouter();
  const { loginToast } = useCustomToasts();

  const { mutate: comment, isLoading } = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await axios.post(
        "/api/subreddit/post/comment/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return data;
    },

    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Something went wrong.",
        description: "Comment wasn't created successfully. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setInput("");
      setAudioFile(null);
      setAudioURL(null);
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioRef.current = recorder;

      recorder.ondataavailable = (e) => {
        const audioBlob = e.data;
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        setAudioFile(new File([audioBlob], "audio.wav", { type: "audio/wav" }));
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error during audio recording:", err);
    }
  };

  const stopRecording = () => {
    audioRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("text", input);
    formData.append("postId", postId);
    if (replyToId) formData.append("replyToId", replyToId);
    if (audioFile) formData.append("audio", audioFile);

    comment(formData);
  };

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Your comment</Label>
      <div className="mt-2">
        <Textarea
          id="comment"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder="What are your thoughts?"
        />
        <div className="mt-2">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className="btn"
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
          {audioURL && <audio controls src={audioURL} className="mt-2"></audio>}
        </div>
        <div className="mt-2 flex justify-end">
          <Button
            isLoading={isLoading}
            disabled={input.length === 0 && !audioFile}
            onClick={handleSubmit}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
