import { ReactNode } from "react";

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-6 rounded-2xl border-2 border-zinc-200 bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-2">
        {title}
      </h3>
      <p className="text-zinc-600">
        {description}
      </p>
    </div>
  );
}
