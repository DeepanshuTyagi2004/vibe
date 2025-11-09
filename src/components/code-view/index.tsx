import "./code-theme.css"

import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import { useEffect } from "react";

interface Props{
  lang: string;
  code: string;
}

export const CodeView = ({ lang, code }: Props) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [code]);
  return <pre className="p-2 bg-transparent border-none rounded-none text-sm m-0">
    <code className={`language-${lang}`}>
      {code}
    </code>
  </pre>
}