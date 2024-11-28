import Markdown from 'react-markdown';

export const MarkdownContent = ({ textMarkdown }: { textMarkdown: string }) => {
  return (
    <Markdown
      components={{
        h1: ({ node, ...props }) => (
          <h2 {...props} className="text-lg font-bold">
            {props.children}
          </h2>
        ),
        h2: ({ node, ...props }) => (
          <h3 {...props} className="text-md font-bold">
            {props.children}
          </h3>
        ),
        h3: ({ node, ...props }) => (
          <h4 {...props} className="text-sm font-bold">
            {props.children}
          </h4>
        ),
        p: ({ node, ...props }) => (
          <p {...props} className="text-sm">
            {props.children}
          </p>
        ),
        a: ({ node, ...props }) => (
          <a {...props} className="text-[#C72335]" target="_blank">
            {props.children}
          </a>
        ),
      }}
    >
      {textMarkdown}
    </Markdown>
  );
};
