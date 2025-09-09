import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'card' | 'text' | 'avatar' | 'button';
  lines?: number;
}

export function SkeletonLoader({ className, variant = 'card', lines = 1 }: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse rounded-md bg-gradient-to-r from-muted via-muted/50 to-muted";
  
  if (variant === 'card') {
    return (
      <div className={cn("space-y-4 p-6 border rounded-lg bg-card/50 backdrop-blur-sm", className)}>
        <div className="flex space-x-2">
          <div className={cn(baseClasses, "h-6 w-16")} />
          <div className={cn(baseClasses, "h-6 w-20")} />
        </div>
        <div className={cn(baseClasses, "h-6 w-3/4")} />
        <div className={cn(baseClasses, "h-4 w-full")} />
        <div className={cn(baseClasses, "h-4 w-2/3")} />
        <div className="flex justify-between items-center pt-2">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={cn(baseClasses, "h-5 w-12")} />
            ))}
          </div>
          <div className={cn(baseClasses, "h-8 w-24")} />
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn("space-y-2", className)}>
        {[...Array(lines)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              baseClasses, 
              "h-4",
              i === lines - 1 ? "w-2/3" : "w-full"
            )} 
          />
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return <div className={cn(baseClasses, "rounded-full h-10 w-10", className)} />;
  }

  if (variant === 'button') {
    return <div className={cn(baseClasses, "h-10 w-24", className)} />;
  }

  return <div className={cn(baseClasses, "h-4 w-full", className)} />;
}