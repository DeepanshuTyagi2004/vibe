import { format } from "date-fns";

import { Card } from "@/components/ui/card";
import { Fragment } from "@/generated/prisma/client"
import { MessageRole, MessageType,  } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ChevronRightIcon, Code2Icon } from "lucide-react";


interface UserMessageCardProps{
  content: string;
}

const UserMessageCard = ({content}: UserMessageCardProps) => {
  return <div className="flex justify-end pb-4 pr-2 pl-10">
    <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] wrap-break-words">
      {content}
    </Card>
  </div>
}

interface FragmentCardProps{
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  fragment: Fragment;
}

const FragmentCard = ({fragment, onFragmentClick, isActiveFragment}: FragmentCardProps) => {
  return <button onClick={() => onFragmentClick(fragment)} className={cn(
    "flex items-start text-start bg-muted rounded-lg border gap-2 w-fit p-3 hover:bg-secondary transition-colors",
    isActiveFragment && "bg-primary text-primary-foreground border-primary hover:bg-primary"
  )}>
    <Code2Icon className="size-4 mt-0.5" />
    <div className="flex flex-col flex-1">
      <span className="text-sm font-medium line-clamp-1">
        {fragment.title}
      </span>
      <span className="text-sm">Preview</span>
    </div>
    <div className="flex items-center justify-center mt-0.5">
      <ChevronRightIcon className="size-4"/>
    </div>
  </button>
}

interface AssistantMessageCardProps{
  content: string;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
}

const AssistantMessageCard = ({content, fragment, createdAt, isActiveFragment, onFragmentClick, type}: AssistantMessageCardProps) => {
  return <div className={cn(
    "flex flex-col group px-2 pb-4",
    type == "ERROR" && "text-red-700 dard:text-red-500"
  )}>
    <div className="flex items-center gap-2 pl-2 mb-2">
      <Image
        src="/logo.svg"
        alt="Vibe"
        width={18}
        height={18}
        className="shrink-0"
      />
      <span className="text-sm font-medium">Vibe</span>
      <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">{
        format(createdAt, "HH:mm 'on' MMM dd, yyyy")
      }</span>
    </div>
    <div className="pl-8.5 flex flex-col gap-y-4">
      {content}
      {fragment && type === "RESULT" && 
        (<FragmentCard
          isActiveFragment={isActiveFragment}
          fragment={fragment}
          onFragmentClick={onFragmentClick}
        />)
      }
    </div>
  </div>
}

interface MessageCardProps{
  content: string;
  role: MessageRole;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
}

export const MessageCard = ({content, role, fragment, createdAt, isActiveFragment, onFragmentClick, type} : MessageCardProps) => {
  if (role == "ASSISTANT") {
    return <AssistantMessageCard
      content={content}
      createdAt={createdAt}
      fragment={fragment}
      onFragmentClick={onFragmentClick}
      type={type}
      isActiveFragment={isActiveFragment}
    />
  }
  else {
    return <UserMessageCard
    content={content}
    />
  }
}