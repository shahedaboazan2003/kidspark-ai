const ChildCardSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <div
    className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 animate-fade-slide-up opacity-0"
    style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
  >
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 rounded-2xl bg-muted animate-pulse mb-4" />
      <div className="h-5 w-24 bg-muted rounded-md animate-pulse mb-2" />
      <div className="h-3 w-16 bg-muted rounded-md animate-pulse mb-2" />
      <div className="h-5 w-28 bg-muted rounded-full animate-pulse" />
      <div className="flex gap-2 mt-5 w-full">
        <div className="flex-1 h-10 bg-muted rounded-xl animate-pulse" />
        <div className="flex-1 h-10 bg-muted rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
);

export default ChildCardSkeleton;
