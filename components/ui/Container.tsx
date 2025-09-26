import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ as: Tag = "div", className = "", ...props }) => {
  const classes = ["mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className]
    .filter(Boolean)
    .join(" ");
  const Component = Tag as React.ElementType;
  return <Component className={classes} {...props} />;
};

export default Container;
