import "server-only";
import { NextRequest } from "next/server";

// AI-specific rate limiting with multiple time windows and progressive penalties
// These are reasonable limits that allow legitimate usage while preventing abuse

interface RateLimitConfig {
  // Per-minute limits (short burst protection)
  perMinute: number;
  // Per-hour limits (sustained usage protection)
  perHour: number;
  // Per-day limits (daily quota)
  perDay: number;
  // Cost weight for this operation (some operations are more expensive)
  costWeight: number;
}

// Rate limit configurations for different AI operations
const AI_RATE_LIMITS: Record<string, RateLimitConfig> = {
  "domains-generate": {
    perMinute: 3,     // 3 domain generations per minute (reasonable for real usage)
    perHour: 20,      // 20 per hour (allows good exploration)
    perDay: 100,      // 100 per day (generous daily limit)
    costWeight: 10,   // High cost operation
  },
  "prompt-improve": {
    perMinute: 5,     // 5 improvements per minute (lighter operation)
    perHour: 30,      // 30 per hour 
    perDay: 150,      // 150 per day
    costWeight: 5,    // Medium cost operation
  },
  "domains-validate": {
    perMinute: 10,    // 10 validations per minute (cheap operation)
    perHour: 100,     // 100 per hour
    perDay: 500,      // 500 per day
    costWeight: 1,    // Low cost operation
  },
};

interface RateLimitBucket {
  // Minute window
  minuteCount: number;
  minuteReset: number;
  
  // Hour window  
  hourCount: number;
  hourReset: number;
  
  // Day window
  dayCount: number;
  dayReset: number;
  
  // Violation tracking for progressive penalties
  violations: number;
  lastViolation: number;
  
  // Total cost accumulator for weighted limiting
  totalCost: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfter: number; // seconds
  limit: {
    current: number;
    max: number;
    window: string; // Which limit was hit
  };
  remaining: {
    minute: number;
    hour: number;
    day: number;
  };
  resetTime: number; // When the current limit resets
  violation?: {
    count: number;
    penalty: number; // Additional seconds to wait
  };
}

// In-memory storage (replace with Redis/database for production)
const rateLimitBuckets = new Map<string, RateLimitBucket>();

// Progressive penalty system - increases delay for repeat violations
function calculateViolationPenalty(violations: number): number {
  if (violations <= 1) return 0;
  if (violations <= 3) return 30; // 30 second penalty
  if (violations <= 5) return 120; // 2 minute penalty
  if (violations <= 10) return 300; // 5 minute penalty
  return 600; // 10 minute penalty for persistent abusers
}

// Clean up old buckets to prevent memory leaks
function cleanupOldBuckets() {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (now > bucket.dayReset + oneDay) {
      rateLimitBuckets.delete(key);
    }
  }
}

// Main rate limiting function
export function checkAIRateLimit(
  req: NextRequest,
  operation: string
): RateLimitResult {
  // Clean up periodically (every ~1000 requests)
  if (Math.random() < 0.001) {
    cleanupOldBuckets();
  }

  const config = AI_RATE_LIMITS[operation];
  if (!config) {
    throw new Error(`Unknown AI operation: ${operation}`);
  }

  // Generate unique key for this IP + operation
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    || req.headers.get("x-real-ip") 
    || req.headers.get("cf-connecting-ip") // Cloudflare
    || "unknown";
  
  const key = `ai:${ip}:${operation}`;
  const now = Date.now();

  // Get or create bucket
  let bucket = rateLimitBuckets.get(key);
  if (!bucket) {
    bucket = {
      minuteCount: 0,
      minuteReset: now + 60_000, // 1 minute
      hourCount: 0,
      hourReset: now + 3_600_000, // 1 hour
      dayCount: 0,
      dayReset: now + 86_400_000, // 1 day
      violations: 0,
      lastViolation: 0,
      totalCost: 0,
    };
    rateLimitBuckets.set(key, bucket);
  }

  // Reset windows that have expired
  if (now > bucket.minuteReset) {
    bucket.minuteCount = 0;
    bucket.minuteReset = now + 60_000;
  }
  
  if (now > bucket.hourReset) {
    bucket.hourCount = 0;
    bucket.hourReset = now + 3_600_000;
  }
  
  if (now > bucket.dayReset) {
    bucket.dayCount = 0;
    bucket.dayReset = now + 86_400_000;
    bucket.totalCost = 0;
    // Reset violations on new day
    bucket.violations = Math.max(0, bucket.violations - 2);
  }

  // Check if user is in violation cooldown
  const violationPenalty = calculateViolationPenalty(bucket.violations);
  const violationCooldown = bucket.lastViolation + (violationPenalty * 1000);
  if (now < violationCooldown) {
    return {
      allowed: false,
      retryAfter: Math.ceil((violationCooldown - now) / 1000),
      limit: {
        current: bucket.violations,
        max: 0,
        window: "violation_penalty"
      },
      remaining: {
        minute: Math.max(0, config.perMinute - bucket.minuteCount),
        hour: Math.max(0, config.perHour - bucket.hourCount),
        day: Math.max(0, config.perDay - bucket.dayCount),
      },
      resetTime: violationCooldown,
      violation: {
        count: bucket.violations,
        penalty: violationPenalty
      }
    };
  }

  // Check limits in order of strictness
  let hitLimit = false;
  let limitWindow = "";
  let current = 0;
  let max = 0;
  let resetTime = 0;

  // Check minute limit
  if (bucket.minuteCount >= config.perMinute) {
    hitLimit = true;
    limitWindow = "minute";
    current = bucket.minuteCount;
    max = config.perMinute;
    resetTime = bucket.minuteReset;
  }
  // Check hour limit  
  else if (bucket.hourCount >= config.perHour) {
    hitLimit = true;
    limitWindow = "hour";
    current = bucket.hourCount;
    max = config.perHour;
    resetTime = bucket.hourReset;
  }
  // Check day limit
  else if (bucket.dayCount >= config.perDay) {
    hitLimit = true;
    limitWindow = "day";
    current = bucket.dayCount;
    max = config.perDay;
    resetTime = bucket.dayReset;
  }

  if (hitLimit) {
    // Increment violation counter
    bucket.violations++;
    bucket.lastViolation = now;
    
    return {
      allowed: false,
      retryAfter: Math.ceil((resetTime - now) / 1000),
      limit: {
        current,
        max,
        window: limitWindow
      },
      remaining: {
        minute: Math.max(0, config.perMinute - bucket.minuteCount),
        hour: Math.max(0, config.perHour - bucket.hourCount),
        day: Math.max(0, config.perDay - bucket.dayCount),
      },
      resetTime,
      violation: bucket.violations > 1 ? {
        count: bucket.violations,
        penalty: violationPenalty
      } : undefined
    };
  }

  // Request is allowed - increment counters
  bucket.minuteCount++;
  bucket.hourCount++;
  bucket.dayCount++;
  bucket.totalCost += config.costWeight;

  return {
    allowed: true,
    retryAfter: 0,
    limit: {
      current: bucket.minuteCount,
      max: config.perMinute,
      window: "minute"
    },
    remaining: {
      minute: Math.max(0, config.perMinute - bucket.minuteCount),
      hour: Math.max(0, config.perHour - bucket.hourCount),
      day: Math.max(0, config.perDay - bucket.dayCount),
    },
    resetTime: bucket.minuteReset
  };
}

// Helper function to get current usage stats (for monitoring)
export function getAIUsageStats(ip: string, operation: string) {
  const key = `ai:${ip}:${operation}`;
  const bucket = rateLimitBuckets.get(key);
  
  if (!bucket) {
    return null;
  }

  const config = AI_RATE_LIMITS[operation];
  return {
    usage: {
      minute: { current: bucket.minuteCount, max: config.perMinute },
      hour: { current: bucket.hourCount, max: config.perHour },
      day: { current: bucket.dayCount, max: config.perDay },
    },
    violations: bucket.violations,
    totalCost: bucket.totalCost,
  };
}

// Helper to format user-friendly rate limit messages
export function formatRateLimitMessage(result: RateLimitResult): string {
  if (result.allowed) {
    return `Request successful. ${result.remaining.minute} requests remaining this minute.`;
  }

  const timeUnit = result.limit.window === "minute" ? "minute" : 
                   result.limit.window === "hour" ? "hour" : "day";
  
  let message = `Rate limit exceeded. You've made ${result.limit.current} requests this ${timeUnit} ` +
                `(limit: ${result.limit.max}). Please try again in ${result.retryAfter} seconds.`;

  if (result.violation && result.violation.count > 1) {
    message += ` Additional ${result.violation.penalty}s penalty applied for repeated violations.`;
  }

  return message;
}

// Export rate limit configs for reference
export const AI_OPERATION_LIMITS = AI_RATE_LIMITS;