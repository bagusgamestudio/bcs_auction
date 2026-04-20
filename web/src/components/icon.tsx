import { icons } from "lucide-react";

export type IconName = keyof typeof icons;

const Icon = ({
  name,
  color,
  size,
  className,
}: {
  name: IconName;
  color?: string;
  size?: number;
  className?: string;
}) => {
  const LucideIcon = icons[name];
  return <LucideIcon color={color} size={size} className={className} />;
};

export default Icon;
