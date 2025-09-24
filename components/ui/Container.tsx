import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ as: Tag = "div", className = "", ...props }) => {
  const classes = ["mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className]
    .filter(Boolean)
    .join(" ");
  return <Tag className={classes} {...props} />;
};

export default Container;
