import Image from "next/image";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/euman-logo.png"
      alt="Euman AI Logo"
      className={className}
      width={137}
      height={32}
      priority
    />
  );
}
