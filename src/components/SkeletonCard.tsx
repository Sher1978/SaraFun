import React from 'react';

export default function SkeletonCard() {
    return (
        <div className="relative flex-shrink-0 w-44 p-4 rounded-2xl bg-tg-secondary/40 border border-tg-hint/10 animate-pulse">
            <div className="flex justify-between items-start mb-4">
                {/* Avatar Shimmer */}
                <div className="w-10 h-10 rounded-full bg-tg-hint/20" />
                {/* ABCD Shimmer */}
                <div className="w-10 h-10 rounded bg-tg-hint/20" />
            </div>

            {/* Title Shimmer */}
            <div className="h-4 w-3/4 bg-tg-hint/20 rounded mb-2" />
            {/* Subtitle Shimmer */}
            <div className="h-3 w-1/2 bg-tg-hint/20 rounded mb-4" />

            <div className="flex justify-between items-center">
                <div className="h-5 w-12 bg-tg-hint/20 rounded" />
                <div className="h-5 w-8 bg-tg-hint/20 rounded" />
            </div>

            {/* Button Shimmer */}
            <div className="h-9 w-full bg-tg-hint/10 rounded-lg mt-4" />
        </div>
    );
}
