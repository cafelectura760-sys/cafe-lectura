import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-20 w-20",
};

export function BrandLogo({ className = "", size = "md" }: BrandLogoProps) {
  return (
    <span className={`brand-logo ${sizeClasses[size]} ${className}`.trim()}>
      <Image
        src="/cafe-lectura-logo.svg"
        alt=""
        width={80}
        height={80}
        className="h-full w-full object-contain"
        aria-hidden="true"
        unoptimized
      />
    </span>
  );
}
