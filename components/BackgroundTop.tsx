import React from "react";

const BackgroundTop: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden">
      {/* Soft vertical gradient */}
      <div className="h-[520px] w-full bg-gradient-to-b from-sky-200/20 via-transparent to-transparent" />

      {/* Radial glow blob */}
      <div
        className="absolute left-1/2 top-2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(closest-side, rgba(56,189,248,0.30), transparent)" }}
      />

      {/* Subtle dot grid overlay */}
      <div className="absolute inset-x-0 top-0 h-[520px] bg-dot-grid opacity-20" />
    </div>
  );
};

export default BackgroundTop;
