"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { MessagesContainer } from "../components/messages-container";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma/client";

interface Props {
  projectId: string
}

export const ProjectView = ({ projectId }: Props) => {
  // const trpc = useTRPC();

  // const { data: project } = useSuspenseQuery(trpc.projects.getOne.queryOptions({
  //   id: projectId
  // }));

  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  

  return <div className="h-screen">
    <ResizablePanelGroup direction="horizontal" >
      <ResizablePanel
        minSize={20}
        defaultSize={35}
        className="flex flex-col min-h-0"
      >
        <Suspense fallback={<p>Loading messages...</p>}>
          <MessagesContainer
            projectId={projectId}
            activeFragment={activeFragment}
            setActiveFragment={setActiveFragment}
          />
          </Suspense>
      </ResizablePanel>
      <ResizableHandle withHandle/>
      <ResizablePanel
        minSize={50}
        defaultSize={65}
      >
        TODO: Show project preview
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>

}