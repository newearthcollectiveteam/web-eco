"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Home } from "lucide-react";

interface BackButtonProps {
  href?: string;
  label?: string;
}

export function BackButton({
  href = "/admin",
  label = "Back to Hub",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="fixed bottom-6 left-6 z-50 shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl"
      aria-label={label}
    >
      <Home className="mr-2 h-5 w-5" />
      {label}
    </Button>
  );
}
