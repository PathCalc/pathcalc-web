import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC } from 'react';

export const Wrapper: FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
};

const queryClient = new QueryClient();
function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
