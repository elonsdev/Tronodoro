"use client";

import dynamic from "next/dynamic";

const GameComponent = dynamic(() => import("./components/GameComponent.js"), {
  ssr: false,
});

export default function Home() {
  return (
    <main>
      <GameComponent />
    </main>
  );
}
