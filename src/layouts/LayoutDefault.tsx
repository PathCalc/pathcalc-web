import './style.css';
import './tailwind.css';

import React from 'react';

export default function LayoutDefault({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col h-screen w-screen items-stretch">{children}</div>;
}
