import { useState } from 'react';
import { Check, Copy, Link } from 'lucide-react';

import { Button } from './ui/button';
import { Input } from './ui/input';

interface GroupURLShareProps {
  url: string;
  warning?: string | null;
}

export function GroupURLShare({ url, warning }: GroupURLShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  if (!url) return null;

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#004A98]">
        <Link className="h-4 w-4" />
        Link nhóm
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input readOnly value={url} className="bg-white font-mono text-xs" />
        <Button type="button" onClick={handleCopy} className="bg-[#004A98] hover:bg-[#003d7a]">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Đã copy' : 'Copy'}
        </Button>
      </div>
      {warning && <p className="mt-2 text-xs text-amber-700">{warning}</p>}
      <p className="mt-2 text-xs text-blue-700">Dữ liệu nằm trong hash fragment sau dấu #, không dùng query string.</p>
    </div>
  );
}
