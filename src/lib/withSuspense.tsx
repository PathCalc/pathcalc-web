import { ComponentType, ReactNode, Suspense } from 'react';

export const withSuspense = <P extends object>(
  Component: ComponentType<P>,
  fallback: ReactNode = <div>Loading...</div>,
): ComponentType<P> => {
  const ComponentWithSuspense = (props: P) => {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  };

  ComponentWithSuspense.displayName = `withSuspense(${Component.displayName || Component.name})`;

  return ComponentWithSuspense;
};
