import Markdown from 'react-markdown';

export const MarkdownContent = ({ textMarkdown }: { textMarkdown: string }) => {
  return (
    <Markdown
      components={{
        a: ({ node, ...props }) => (
          <a {...props} target="_blank">
            {props.children}
          </a>
        ),
      }}
    >
      {textMarkdown}
    </Markdown>
  );
};
