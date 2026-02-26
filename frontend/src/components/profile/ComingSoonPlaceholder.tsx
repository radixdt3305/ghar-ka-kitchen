import { Clock } from "lucide-react";

const sectionLabels: Record<string, string> = {
  address: "Address",
  orders: "Orders",
  wishlist: "Wishlist",
  reviews: "Reviews",
};

interface ComingSoonPlaceholderProps {
  section: string;
}

export function ComingSoonPlaceholder({ section }: ComingSoonPlaceholderProps) {
  const label = sectionLabels[section] ?? section;

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Clock className="h-16 w-16 text-orange-300" />
      <h2 className="mt-4 text-xl font-semibold text-gray-600">Coming Soon</h2>
      <p className="mt-2 text-sm text-gray-400">
        The {label} feature is under development.
      </p>
    </div>
  );
}
