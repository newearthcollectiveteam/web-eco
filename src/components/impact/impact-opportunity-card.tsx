import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface ImpactOpportunityCardProps {
  title: string;
  partnerName: string;
  partnerLogo?: string;
  location: string;
  description: string;
  status: "active" | "coming-soon" | "completed";
  href: string;
}

const statusConfig = {
  active: {
    label: "Active",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  "coming-soon": {
    label: "Coming Soon",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  completed: {
    label: "Completed",
    className: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
  },
};

export function ImpactOpportunityCard({
  title,
  partnerName,
  partnerLogo,
  location,
  description,
  status,
  href,
}: ImpactOpportunityCardProps) {
  const statusInfo = statusConfig[status];
  const isCompleted = status === "completed";

  return (
    <Link href={href} className="group block">
      {/* Large Image/Logo Card */}
      <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-xl bg-white transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-[#facf39]/20">
        {partnerLogo ? (
          <Image
            src={partnerLogo}
            alt={partnerName}
            fill
            className="object-contain p-8"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#facf39]/20 to-[#22c55e]/20">
            <span className="text-4xl font-bold text-[#facf39]">
              {partnerName.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <Badge
        className={`${statusInfo.className} mb-3 border text-xs font-semibold`}
      >
        {statusInfo.label}
      </Badge>

      {/* Title */}
      <h3
        className={`mb-3 text-xl font-bold uppercase tracking-wide ${
          isCompleted ? "text-neutral-400" : "text-white"
        }`}
        style={{ fontFamily: "Bourton, sans-serif" }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={`mb-4 text-base leading-relaxed ${
          isCompleted ? "text-neutral-500" : "text-neutral-300"
        }`}
      >
        {description}
      </p>

      {/* CTA Button */}
      <span
        className={`inline-flex items-center rounded-md border px-4 py-2 text-sm font-semibold transition-all ${
          isCompleted
            ? "border-neutral-700 text-neutral-500"
            : "border-[#facf39]/50 bg-[#facf39]/10 text-[#facf39] group-hover:bg-[#facf39]/20"
        }`}
      >
        Learn more
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
