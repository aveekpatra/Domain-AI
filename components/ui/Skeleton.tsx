import React from "react";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  rounded?: string;
};

const Skeleton: React.FC<SkeletonProps> = ({ className = "", rounded = "rounded-lg", ...props }) => {
  return (
    <div
      className={["relative overflow-hidden bg-slate-200/70", rounded, className].join(" ")}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
};

export default Skeleton;
