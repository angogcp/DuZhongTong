'use client';

interface BlockNode {
  type: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  children?: BlockNode[];
  level?: number;
  format?: string;
  url?: string;
}

function renderInline(node: BlockNode): React.ReactNode {
  if (node.type === 'text') {
    let el: React.ReactNode = node.text || '';
    if (node.bold) el = <strong>{el}</strong>;
    if (node.italic) el = <em>{el}</em>;
    if (node.underline) el = <u>{el}</u>;
    if (node.strikethrough) el = <s>{el}</s>;
    return el;
  }
  if (node.type === 'link' && node.url) {
    return (
      <a href={node.url} target="_blank" rel="noopener noreferrer">
        {(node.children || []).map((c, i) => <span key={i}>{renderInline(c)}</span>)}
      </a>
    );
  }
  return node.text || '';
}

function renderBlock(block: BlockNode, index: number): React.ReactNode {
  const children = (block.children || []).map((child, i) => (
    <span key={i}>{renderInline(child)}</span>
  ));

  switch (block.type) {
    case 'paragraph':
      return <p key={index}>{children}</p>;
    case 'heading': {
      const level = block.level || 2;
      const Tag = `h${level}` as any;
      return <Tag key={index}>{children}</Tag>;
    }
    case 'list': {
      const Tag = block.format === 'ordered' ? 'ol' : 'ul';
      return (
        <Tag key={index}>
          {(block.children || []).map((item, i) => (
            <li key={i}>
              {(item.children || []).map((c, j) => (
                <span key={j}>{renderInline(c)}</span>
              ))}
            </li>
          ))}
        </Tag>
      );
    }
    case 'quote':
      return <blockquote key={index}>{children}</blockquote>;
    default:
      return <p key={index}>{children}</p>;
  }
}

interface BlockRendererProps {
  blocks: BlockNode[] | null | undefined;
  fallback?: string;
}

export default function BlockRenderer({ blocks, fallback }: BlockRendererProps) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return fallback ? <p>{fallback}</p> : null;
  }

  return <>{blocks.map((block, i) => renderBlock(block, i))}</>;
}
