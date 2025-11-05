"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";


const Page = () => {
  const [value, setValue] = useState("");
  const trpc = useTRPC();
  const project = useMutation(trpc.projects.create.mutationOptions({
    onSuccess: () => {
      toast.success("Message Created!");
    },
    onError: (e) => {
      toast.error("Something went wrong: " + e);
    }
  }))
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-y-4">
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
        <Button disabled={project.isPending} onClick={() =>
          project.mutate({ value: value })}>
          Submit
        </Button>
      </div>
    </div>
  );
}

export default Page;
