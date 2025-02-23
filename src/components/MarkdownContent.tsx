import Markdown from 'react-markdown';

export const MarkdownContent = ({ textMarkdown }: { textMarkdown: string }) => {
  return (
    <Markdown
      components={{
        a: ({ node, ...props }) => {
          const isLocalLink = props.href?.startsWith('/');
          return (
            <a {...props} target={isLocalLink ? '_self' : '_blank'}>
              {props.children}
            </a>
          );
        },
      }}
      urlTransform={(url) => {
        if (url.startsWith('/')) {
          const baseUrl = import.meta.env.BASE_URL;
          return baseUrl.endsWith('/') ? baseUrl + url.slice(1) : baseUrl + url;
        }
        return url;
      }}
    >
      {textMarkdown}
    </Markdown>
  );
};
