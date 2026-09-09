import React from 'react';
import { Tag } from 'lucide-react';

const TagBadge = ({ tag, onClick, className = '' }) => {
  if (!tag) return null;

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
        tag.color || 'text-zinc-400 bg-zinc-800 border-zinc-700'
      } ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
    >
      <span>#{tag.label}</span>
    </span>
  );
};

export default TagBadge;
