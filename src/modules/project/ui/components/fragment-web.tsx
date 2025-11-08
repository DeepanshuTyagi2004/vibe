import { Hint } from "@/components/hint"
import { Button } from "@/components/ui/button"
import { Fragment } from "@/generated/prisma/client"
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"


interface Props {
  fragment: Fragment
}

export const FragmentWeb = ({ fragment }: Props) => {
  
  const [fragmentKey, setFragmentKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const onRefresh = () => {
    setFragmentKey(prev => prev + 1);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(fragment.sandboxUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
    toast.success("Url copied to clipboard");
  }

  return <div className="flex flex-col w-full h-full">
    <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
      <Hint text="Refresh" side="bottom" align="start">
      <Button size="sm" variant="outline" onClick={onRefresh}>
        <RefreshCcwIcon />
        </Button>
        </Hint>
      <Hint text="Click to copy" side="bottom" align="center">
      <Button
        size="sm"
        variant="outline"
        onClick={handleCopy}
        disabled={!fragment.sandboxUrl || copied}
        className="flex-1 justify-start text-start font-normal"
      >
        <span className="truncate">
          {fragment.sandboxUrl}
        </span>
        </Button>
        </Hint>
      <Hint text="Open in a new tab" side="bottom" align="end">
      <Button size="sm" disabled={!fragment.sandboxUrl} variant="outline" onClick={() => {
        if (!fragment.sandboxUrl) return;
        window.open(fragment.sandboxUrl, "_black");
      }}>
        <ExternalLinkIcon />
        </Button>
        </Hint>
    </div>
    <iframe
      key={fragmentKey}
      className="w-full h-full"
      sandbox="allow-form allow-scripts allow-same-origin"
      loading="lazy"
      src={fragment.sandboxUrl}
    />


  </div>
}