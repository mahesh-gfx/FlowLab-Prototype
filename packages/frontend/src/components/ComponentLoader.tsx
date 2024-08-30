import React, { Suspense, useMemo } from "react";
import icons from "./icons"; // Import the icons object
import { IconProps } from "./icons";

type IconNames = keyof typeof icons;

interface IconLoaderProps extends IconProps {
  iconName: IconNames;
  fontSize?: "inherit" | "large" | "medium" | "small" | string;
  color?: string;
}

const IconLoader: React.FC<IconLoaderProps> = ({
  iconName,
  color,
  fontSize,
}) => {
  // Memoize the LazyIcon component
  const LazyIcon = useMemo(() => {
    const IconComponent = icons[iconName];
    if (!IconComponent) {
      throw new Error(`Icon "${iconName}" not found`);
    }
    return React.lazy(() =>
      Promise.resolve({ default: IconComponent })
    ) as React.FC<IconProps>;
  }, [iconName]); // Depend on iconName to recreate the component when the icon changes

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyIcon color={color} fontSize={fontSize} />
    </Suspense>
  );
};

export default IconLoader;
