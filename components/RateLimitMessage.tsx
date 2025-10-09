import React from "react";
import { ExclamationTriangleIcon, ClockIcon } from "@heroicons/react/24/outline";

interface RateLimitError {
  error: string;
  message: string;
  retryAfter: number;
  limit: {
    current: number;
    max: number;
    window: string;
  };
  remaining: {
    minute: number;
    hour: number;
    day: number;
  };
}

interface RateLimitMessageProps {
  error: RateLimitError;
  onRetry?: () => void;
  className?: string;
}

export default function RateLimitMessage({ 
  error, 
  onRetry, 
  className = "" 
}: RateLimitMessageProps) {
  const [timeLeft, setTimeLeft] = React.useState(error.retryAfter);

  React.useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "Now available";
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getWindowLabel = (window: string): string => {
    switch (window) {
      case "minute": return "per minute";
      case "hour": return "per hour"; 
      case "day": return "per day";
      case "violation_penalty": return "violation penalty";
      default: return window;
    }
  };

  const getSeverityColor = (window: string): string => {
    switch (window) {
      case "minute": return "text-yellow-600 [html[data-theme='dark']_&]:text-yellow-400";
      case "hour": return "text-orange-600 [html[data-theme='dark']_&]:text-orange-400";
      case "day": return "text-red-600 [html[data-theme='dark']_&]:text-red-400";
      case "violation_penalty": return "text-red-700 [html[data-theme='dark']_&]:text-red-300";
      default: return "text-slate-600 [html[data-theme='dark']_&]:text-slate-400";
    }
  };

  const getBorderColor = (window: string): string => {
    switch (window) {
      case "minute": return "border-yellow-200 [html[data-theme='dark']_&]:border-yellow-700";
      case "hour": return "border-orange-200 [html[data-theme='dark']_&]:border-orange-700";
      case "day": return "border-red-200 [html[data-theme='dark']_&]:border-red-700";
      case "violation_penalty": return "border-red-300 [html[data-theme='dark']_&]:border-red-600";
      default: return "border-slate-200 [html[data-theme='dark']_&]:border-slate-700";
    }
  };

  const getBackgroundColor = (window: string): string => {
    switch (window) {
      case "minute": return "bg-yellow-50 [html[data-theme='dark']_&]:bg-yellow-900/20";
      case "hour": return "bg-orange-50 [html[data-theme='dark']_&]:bg-orange-900/20";
      case "day": return "bg-red-50 [html[data-theme='dark']_&]:bg-red-900/20";
      case "violation_penalty": return "bg-red-100 [html[data-theme='dark']_&]:bg-red-900/30";
      default: return "bg-slate-50 [html[data-theme='dark']_&]:bg-slate-800";
    }
  };

  return (
    <div className={`rounded-xl border ${getBorderColor(error.limit.window)} ${getBackgroundColor(error.limit.window)} p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className={`h-5 w-5 ${getSeverityColor(error.limit.window)} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-sm ${getSeverityColor(error.limit.window)}`}>
            Rate Limit Reached
          </h3>
          <p className="mt-1 text-sm text-slate-700 [html[data-theme='dark']_&]:text-slate-300">
            {error.message}
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600 [html[data-theme='dark']_&]:text-slate-400">
                Try again in: <span className="font-medium">{formatTime(timeLeft)}</span>
              </span>
            </div>

            <div className="text-slate-600 [html[data-theme='dark']_&]:text-slate-400">
              Limit: <span className="font-medium">
                {error.limit.current}/{error.limit.max} {getWindowLabel(error.limit.window)}
              </span>
            </div>
          </div>

          {error.remaining && (
            <div className="mt-3 pt-3 border-t border-slate-200 [html[data-theme='dark']_&]:border-slate-600">
              <h4 className="text-xs font-medium text-slate-700 [html[data-theme='dark']_&]:text-slate-300 mb-2">
                Remaining requests:
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                    {error.remaining.minute}
                  </div>
                  <div className="text-slate-500">this minute</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                    {error.remaining.hour}
                  </div>
                  <div className="text-slate-500">this hour</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                    {error.remaining.day}
                  </div>
                  <div className="text-slate-500">today</div>
                </div>
              </div>
            </div>
          )}

          {timeLeft <= 0 && onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 transition-colors [html[data-theme='dark']_&]:bg-slate-100 [html[data-theme='dark']_&]:text-slate-900 [html[data-theme='dark']_&]:hover:bg-slate-200"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to check if an error is a rate limit error
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error != null && 
         typeof error === 'object' && 
         'error' in error && (error as RateLimitError).error === 'AI rate limit exceeded' &&
         'retryAfter' in error && (error as RateLimitError).retryAfter !== undefined &&
         'limit' in error && (error as RateLimitError).limit !== undefined &&
         'remaining' in error && (error as RateLimitError).remaining !== undefined;
}