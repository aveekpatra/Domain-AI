"use client";

import React from "react";

export default function Home({
  preloaded,
}: {
  preloaded?: unknown;
}) {
  const [numbers, setNumbers] = React.useState<number[]>([1, 2, 3]);
  const addNumber = () => setNumbers((ns) => [...ns, Math.floor(Math.random() * 10)]);

  return (
    <>
      <div className="flex flex-col gap-4 bg-slate-200 dark:bg-slate-800 p-4 rounded-md">
        <h2 className="text-xl font-bold">Client-loaded demo data</h2>
        <code>
          <pre>{JSON.stringify({ preloaded, numbers }, null, 2)}</pre>
        </code>
      </div>
      <button
        className="bg-foreground text-background px-4 py-2 rounded-md mx-auto"
        onClick={addNumber}
      >
        Add a random number
      </button>
    </>
  );
}
