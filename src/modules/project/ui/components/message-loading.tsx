import Image from "next/image";
import { useState, useEffect } from "react";

const ShimmerMessages = () => {
  const loadingMessages = [
    "Reading your prompt...",
    "Understanding your request...",
    "Planning the structure...",
    "Writing the base code...",
    "Adding necessary logic...",
    "Optimizing the code...",
    "Integrating components...",
    "Running internal tests...",
    "Finalizing the output...",
    "Preparing your result..."
  ];;

  const [currentLoadingMessageIndex, setCurrentLoadingMessageIndex] = useState(Math.floor(Math.random() * loadingMessages.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLoadingMessageIndex((prev) => ((prev + 1) % loadingMessages.length))
    }, 2000);
    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  return <div className="flex items-center gap-2">
    <span className="text-base text-muted-foreground animate-pulse">
      {loadingMessages[currentLoadingMessageIndex]}
    </span>
  </div>
}

export const MessageLoading = () => {
  return <div className="flex flex-col group px-2 pb-4">
    <div className="flex items-center gap-2 pl-2 mb-2">
      <Image
        src="/logo.svg"
        width={18}
        height={18}
        alt="Vibe"
        className="shrink-0"
      />
      <span className="font-medium text-sm">Vibe</span>
    </div>
    <div className="pl-8.5 flex flex-col gap-y-4">
      <ShimmerMessages />
    </div>
  </div>
}