import './style.css';
import './tailwind.css';

import React from 'react';

export function LayoutDefault({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-dvh max-h-dvh overflow-y-hidden max-w-screen items-stretch font-montserrat">
      {children}
    </div>
  );
}
