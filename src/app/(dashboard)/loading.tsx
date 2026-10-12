import { SkeletonCard } from "@/components/ui/SkeletonCard";

export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-4">
      {Array.from({ length: 3 }, (_, index) => (
        <SkeletonCard key={index} layout="row" />
      ))}
    </div>
  );
}
