import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-12 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* Hero Skeleton */}
      <div className="bg-[#fbf0e4] rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 border border-amber-100">
        <div className="space-y-4 w-full lg:w-1/2">
          <Skeleton className="h-12 w-3/4 bg-amber-200/50" />
          <Skeleton className="h-6 w-full bg-amber-200/40" />
          <Skeleton className="h-6 w-4/5 bg-amber-200/40" />
          <Skeleton className="h-12 w-36 rounded-full bg-amber-300/60 mt-4" />
        </div>
        <div className="w-full lg:w-1/2 aspect-[4/3] max-w-md lg:max-w-none">
          <Skeleton className="w-full h-full rounded-3xl bg-amber-200/50" />
        </div>
      </div>

      {/* Product Section Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64 bg-gray-200" />
          <Skeleton className="h-5 w-20 bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-3xl p-4 space-y-4">
              <Skeleton className="aspect-square w-full rounded-2xl bg-gray-100" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3 bg-gray-200" />
                <Skeleton className="h-5 w-4/5 bg-gray-200" />
                <Skeleton className="h-4 w-full bg-gray-100" />
              </div>
              <Skeleton className="h-9 w-full rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

