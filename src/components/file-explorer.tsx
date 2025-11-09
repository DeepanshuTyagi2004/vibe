import { useState, useMemo, useCallback, Fragment } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { Hint } from "./hint";
import { Button } from "./ui/button";
import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { CodeView } from "./code-view";
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "./tree-view";
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { toast } from "sonner";

type FileCollection = { [path: string]: string }

function getLanguageFromExtension(filename: string): string{
  const extenstion = filename.split(".").pop()?.toLocaleLowerCase();
  return extenstion || "text";
}

interface FileBreadcrumbProps{
  filePath: string;
}

const FileBreadcrumb = ({ filePath } : FileBreadcrumbProps) => {
  const pathSegments = filePath.split("/");
  const maxSegments = 4;

  const renderBreadcrumItems = () => {
    console.log(pathSegments)
    if (pathSegments.length <= maxSegments) {
      return pathSegments.map((segment, index) => {
        const isLast = index === pathSegments.length - 1;

        return <Fragment key={index}>
          <BreadcrumbItem>
            {isLast ?
              <BreadcrumbPage className="font-medium">
                {segment}
              </BreadcrumbPage> : <span className="text-muted-foreground">
                {segment}
              </span>
            }
          </BreadcrumbItem>
          {!isLast && <BreadcrumbSeparator />}
        </Fragment>

      })
    } else {
      const firstSegment = pathSegments[0];
      const lastSegment = pathSegments[pathSegments.length - 1];

      return <>
        <BreadcrumbItem>
          <span className="text-muted-foreground">
            {firstSegment}
          </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            <span className="font-medium">
              {lastSegment}
            </span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        
      </>
    }
  };
  return <Breadcrumb>
    <BreadcrumbList>
      {renderBreadcrumItems()}
    </BreadcrumbList>
  </Breadcrumb>
}


interface FileExplorerProps {
  files: FileCollection;
}

export const FileExplorer = ({ files }: FileExplorerProps) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });

  const [copied, setCopied] = useState(false);
  const treeData = useMemo(() => {
    return convertFilesToTreeItems(files);
  }, [files]);

  const handleFileSelect = useCallback((
    filePath: string
  ) => {
    if (files[filePath]) {
      setSelectedFile(filePath);
    }
  }, [files]);

  const handleCopy = useCallback(() => {
    if (selectedFile) {
      navigator.clipboard.writeText(files[selectedFile]);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      toast.success("Code is copied to clipboard");  
    }
    
  }, [selectedFile, files]);

  return <ResizablePanelGroup direction="horizontal">
    <ResizablePanel minSize={30} defaultSize={30} className="bg-sidebar">
      <TreeView
        data={treeData}
        value={selectedFile}
        onSelect={handleFileSelect}
      />
    </ResizablePanel>
    <ResizableHandle className="hover:bg-primary transition-colors" />
    <ResizablePanel defaultSize={70} minSize={50} >
      {
        selectedFile && files[selectedFile] ?
          <div className="w-full h-full flex flex-col">
            <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
              <FileBreadcrumb filePath={selectedFile} />
              <Hint text="Copy to clipboard" side="bottom" align="end">
                <Button size="icon" variant="outline" className="ml-auto" disabled={copied} onClick={handleCopy}>
                  {copied ?<CopyCheckIcon /> : <CopyIcon />}
                </Button>
              </Hint>
            </div>
            <div className="flex-1 overflow-auto">
              <CodeView lang={getLanguageFromExtension(selectedFile)} code={files[selectedFile]} />
            </div>
          </div>
          
            : 
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a file to view it&apos;s content
          </div>
      }
    </ResizablePanel>
  </ResizablePanelGroup>
}