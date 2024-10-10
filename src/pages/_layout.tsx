import React from "react";

interface Props {
  children: React.ReactNode;
}

export function AppLayout({ children }: Props) {
  return (
    <main
      className="flex flex-col overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900"
      style={{ minHeight: "calc(100vh - 65px)" }}
    >
      <div className="container p-4 md:px-auto md:px-6 md:py-8 flex-1">
        {children}
      </div>
    </main>
  );
}
