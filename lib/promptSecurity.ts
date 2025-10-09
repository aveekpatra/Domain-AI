import "server-only";

// Security patterns for prompt injection detection
const INJECTION_PATTERNS = [
  // Direct instruction manipulation
  /ignore\s+(all\s+)?(previous|above|prior)\s+instructions?/i,
  /forget\s+(all\s+)?(previous|above|prior)\s+(instructions?|context)/i,
  /disregard\s+(all\s+)?(previous|above|prior)\s+(instructions?|context)/i,
  /override\s+(all\s+)?(previous|above|prior)\s+(instructions?|context)/i,
  
  // Role confusion attempts
  /you\s+are\s+(now\s+)?(?:a\s+)?(?:helpful\s+)?(?:assistant|chatbot|ai|gpt|claude|model)/i,
  /(?:act|behave|pretend)\s+(?:as|like)\s+(?:a\s+)?(?:different|new|another)/i,
  /(?:your\s+)?(?:new\s+)?(?:role|task|job)\s+is\s+(?:to|now)/i,
  /(?:from\s+now\s+on|starting\s+now),?\s*you\s+(?:are|will|should|must)/i,
  
  // System prompt extraction attempts  
  /(?:show|tell|give|reveal|display)\s+me\s+(?:your\s+)?(?:system\s+)?(?:prompt|instructions?)/i,
  /(?:what\s+(?:are|is)\s+your\s+)?(?:system\s+)?(?:prompt|instructions?)/i,
  /(?:repeat|echo|print)\s+(?:your\s+)?(?:system\s+)?(?:prompt|instructions?)/i,
  
  // Context breaking attempts
  /---+\s*(?:end|stop|break|new)\s*(?:prompt|context|instructions?)?/i,
  /\*\*\*+\s*(?:end|stop|break|new)\s*(?:prompt|context|instructions?)?/i,
  /####+\s*(?:end|stop|break|new)\s*(?:prompt|context|instructions?)?/i,
  /(?:end\s+of\s+(?:prompt|context|instructions?))/i,
  
  // Special tokens and delimiters
  /<\|(?:endoftext|im_start|im_end|system|user|assistant)\|>/i,
  /\[(?:SYSTEM|USER|ASSISTANT|END|START|BREAK)\]/i,
  /```\s*(?:system|prompt|instructions?)/i,
  
  // Task redefinition
  /(?:instead|rather\s+than).*(?:generate|create|suggest)\s+domains?/i,
  /(?:don'?t|do\s+not)\s+(?:generate|create|suggest)\s+domains?/i,
  /(?:your\s+)?(?:actual|real|true)\s+(?:task|job|purpose)\s+is/i,
  
  // Output format manipulation
  /(?:output|return|give|provide)\s+(?:only|just)\s+(?:the\s+)?(?:following|this)/i,
  /(?:format|structure)\s+(?:your\s+)?(?:response|output)\s+as/i,
  /(?:respond|answer)\s+(?:with|in)\s+(?:the\s+)?(?:format|style)\s+of/i,
  
  // Jailbreak attempts
  /(?:jailbreak|bypass|circumvent|hack)\s+(?:your\s+)?(?:restrictions?|limitations?|safety)/i,
  /(?:ignore|bypass|override)\s+(?:your\s+)?(?:safety|ethical?)\s+(?:guidelines?|rules?|constraints?)/i,
  
  // Developer mode requests
  /(?:developer|debug|admin|root)\s+mode/i,
  /(?:enable|activate|turn\s+on)\s+(?:developer|debug|admin)\s+mode/i,
  
  // Base64/encoding attempts (common in advanced injections)
  /base64|decode|encode|hex|ascii|utf-?8/i,
  
  // Hypothetical scenarios (often used to bypass restrictions)
  /(?:imagine|suppose|pretend|let'?s\s+say)\s+(?:that\s+)?(?:you|i)\s+(?:are|were|can|could)/i,
  
  // Direct commands to change behavior
  /(?:you\s+)?(?:must|should|will|shall)\s+(?:now|always|only)/i,
  /(?:from\s+now\s+on|going\s+forward),?\s*(?:you\s+)?(?:will|must|should)/i
];

// Suspicious phrases that might indicate injection attempts
const SUSPICIOUS_PHRASES = [
  "system prompt",
  "ignore instructions", 
  "forget everything",
  "disregard context",
  "new instructions",
  "role playing",
  "act as",
  "pretend to be",
  "you are now",
  "override",
  "jailbreak",
  "bypass restrictions",
  "developer mode",
  "admin access"
];

// Words that should be allowed in domain context but might trigger false positives
// Currently unused but kept for future enhancement
// const DOMAIN_CONTEXT_ALLOWLIST = [
//   "ignore", "forget", "override", "bypass", "hack", "break", // Might appear in business descriptions
//   "system", "admin", "developer", "debug", "root", // Common in tech business names
//   "assistant", "ai", "bot", "chatbot", "gpt" // AI-related businesses are valid
// ];

export interface SecurityCheckResult {
  isSecure: boolean;
  confidence: number; // 0-1, how confident we are in the assessment
  violations: string[];
  sanitizedPrompt?: string;
  risk: "low" | "medium" | "high";
}

/**
 * Comprehensive prompt injection detection and prevention
 */
export function checkPromptSecurity(prompt: string): SecurityCheckResult {
  const violations: string[] = [];
  let confidence = 0.0; // Start at 0 and increase with violations
  let risk: "low" | "medium" | "high" = "low";
  
  // Normalize input for analysis
  const normalizedPrompt = prompt.toLowerCase().trim();
  
  // Check for direct pattern matches
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(prompt)) {
      violations.push(`Detected injection pattern: ${pattern.source}`);
      risk = "high";
      confidence = Math.min(confidence + 0.4, 1.0);
    }
  }
  
  // Check for suspicious phrase combinations
  const suspiciousPhraseCount = SUSPICIOUS_PHRASES.filter(phrase => 
    normalizedPrompt.includes(phrase.toLowerCase())
  ).length;
  
  if (suspiciousPhraseCount >= 3) {
    violations.push("Multiple suspicious phrases detected");
    risk = "high";
    confidence = Math.min(confidence + 0.25, 1.0);
  } else if (suspiciousPhraseCount >= 2) {
    violations.push("Some suspicious phrases detected");
    risk = risk === "high" ? "high" : "medium";
    confidence = Math.min(confidence + 0.15, 1.0);
  }
  
  // Check for unusual structure patterns
  if (hasUnusualStructure(prompt)) {
    violations.push("Unusual prompt structure detected");
    risk = risk === "high" ? "high" : "medium";
    confidence = Math.min(confidence + 0.1, 1.0);
  }
  
  // Check for excessive special characters (often used in injections)
  if (hasExcessiveSpecialChars(prompt)) {
    violations.push("Excessive special characters detected");
    risk = risk === "high" ? "high" : "medium";
    confidence = Math.min(confidence + 0.1, 1.0);
  }
  
  // Check for role confusion indicators
  if (hasRoleConfusion(prompt)) {
    violations.push("Potential role confusion attempt detected");
    risk = "high";
    confidence = Math.min(confidence + 0.25, 1.0);
  }
  
  // Check for context breaking attempts
  if (hasContextBreaking(prompt)) {
    violations.push("Context breaking attempt detected");
    risk = "high";
    confidence = Math.min(confidence + 0.25, 1.0);
  }
  
  // Domain-specific validation (only if no high-risk violations already found)
  if (!isDomainRelated(prompt) && risk !== "high") {
    violations.push("Prompt appears unrelated to domain generation");
    risk = "medium";
    confidence = Math.min(confidence + 0.2, 1.0);
  }
  
  const isSecure = violations.length === 0;
  
  return {
    isSecure,
    confidence,
    violations,
    sanitizedPrompt: isSecure ? undefined : sanitizePrompt(prompt),
    risk
  };
}

/**
 * Sanitize a prompt by removing potentially harmful content
 */
function sanitizePrompt(prompt: string): string {
  let sanitized = prompt;
  
  // Remove common injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REMOVED]");
  }
  
  // Remove excessive special character sequences
  sanitized = sanitized.replace(/[^\w\s.,!?()-]{3,}/g, " ");
  
  // Remove potential delimiters
  sanitized = sanitized.replace(/---+|####+|\*\*\*+/g, " ");
  
  // Remove base64-like patterns
  sanitized = sanitized.replace(/[A-Za-z0-9+/]{20,}={0,2}/g, "[ENCODED_CONTENT]");
  
  // Clean up whitespace
  sanitized = sanitized.replace(/\s+/g, " ").trim();
  
  return sanitized;
}

/**
 * Check if prompt has unusual structural patterns
 */
function hasUnusualStructure(prompt: string): boolean {
  // Check for unusual delimiter patterns
  if (/---+|####+|\*\*\*+|={3,}/.test(prompt)) return true;
  
  // Check for unusual bracketed content
  if (/\[(?:SYSTEM|USER|ASSISTANT|END|START|BREAK|IGNORE)\]/i.test(prompt)) return true;
  
  // Check for XML-like tags common in injections
  if (/<\/?(?:system|user|assistant|prompt|instruction)/i.test(prompt)) return true;
  
  // Check for code block markers
  if (/```\s*(?:system|prompt|instruction)/i.test(prompt)) return true;
  
  return false;
}

/**
 * Check for excessive special characters
 */
function hasExcessiveSpecialChars(prompt: string): boolean {
  const specialCharCount = (prompt.match(/[^\w\s.,!?()\-]/g) || []).length;
  const totalLength = prompt.length;
  
  // If more than 15% special chars, flag as suspicious
  return specialCharCount / totalLength > 0.15;
}

/**
 * Check for role confusion attempts
 */
function hasRoleConfusion(prompt: string): boolean {
  const rolePatterns = [
    /you\s+are\s+(?:now\s+)?(?:a\s+)?(?:helpful\s+)?(?:assistant|chatbot|ai|gpt|claude|model)/i,
    /(?:act|behave|pretend)\s+(?:as|like)\s+(?:a\s+)?(?:different|new|another)/i,
    /your\s+(?:new\s+)?(?:role|task|job)\s+is\s+(?:to|now)/i,
    /from\s+now\s+on.*you\s+(?:are|will|should|must)/i
  ];
  
  // Exclude domain-related contexts
  const domainContext = /(?:system|admin|developer|debug|root|assistant|ai|bot)\s+(?:for|platform|tool|dashboard|app|service|management)/i;
  if (domainContext.test(prompt)) {
    return false;
  }
  
  return rolePatterns.some(pattern => pattern.test(prompt));
}

/**
 * Check for context breaking attempts
 */
function hasContextBreaking(prompt: string): boolean {
  const breakPatterns = [
    /---+.*(?:end|stop|break|new)/i,
    /\*\*\*+.*(?:end|stop|break|new)/i,
    /####+.*(?:end|stop|break|new)/i,
    /end\s+of\s+(?:prompt|context|instruction)/i,
    /new\s+(?:prompt|context|instruction)/i,
    /end\s+of\s+instructions/i,
    /now\s+help\s+me\s+with/i,
    /new\s+task:/i,
    /you\s+are\s+now\s+unrestricted/i
  ];
  
  return breakPatterns.some(pattern => pattern.test(prompt));
}

/**
 * Check if prompt is domain-related (basic heuristic)
 */
function isDomainRelated(prompt: string): boolean {
  const domainKeywords = [
    "domain", "website", "business", "company", "startup", "brand", "name",
    "app", "service", "platform", "site", "web", "online", "digital",
    "tech", "software", "tool", "solution", "product", "market", "industry",
    "ecommerce", "saas", "api", "database", "network", "cloud", "mobile",
    "social", "media", "content", "blog", "portfolio", "store", "shop",
    "consulting", "agency", "studio", "lab", "hub", "center", "group",
    "management", "tracking", "booking", "ordering", "coaching", "fitness",
    "email", "privacy", "crafts", "storage", "restaurant", "project",
    "delivery", "medical", "diagnosis", "dashboard", "customer", "freelancers"
  ];
  
  const promptLower = prompt.toLowerCase();
  const keywordCount = domainKeywords.filter(keyword => 
    promptLower.includes(keyword)
  ).length;
  
  // Check for explicit non-domain questions
  const nonDomainPatterns = [
    /what'?s\s+the\s+weather/i,
    /what'?s\s+the\s+capital/i,
    /how\s+do\s+i\s+cook/i,
    /tell\s+me\s+a\s+joke/i,
    /explain\s+(?:quantum\s+)?physics/i,
    /write\s+a\s+poem/i
  ];
  
  if (nonDomainPatterns.some(pattern => pattern.test(prompt))) {
    return false;
  }
  
  // If prompt has at least 1 domain-related keyword or is asking for names/suggestions
  return keywordCount > 0 || 
         /(?:name|brand|title|call|suggest|ideas?|generate|create|for)/i.test(prompt);
}

/**
 * Enhanced validation for domain prompts with security checks
 */
export function validateDomainPrompt(prompt: string): {
  isValid: boolean;
  error?: string;
  securityResult: SecurityCheckResult;
} {
  // Basic validation
  if (typeof prompt !== "string") {
    return {
      isValid: false,
      error: "Prompt is required and must be a string",
      securityResult: {
        isSecure: false,
        confidence: 1.0,
        violations: ["Invalid input type"],
        risk: "high"
      }
    };
  }
  
  const trimmed = prompt.trim();
  
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: "Prompt is too short (minimum 3 characters)",
      securityResult: {
        isSecure: true,
        confidence: 0.0,
        violations: [],
        risk: "low"
      }
    };
  }
  
  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: "Prompt is too short (minimum 3 characters)",
      securityResult: {
        isSecure: true,
        confidence: 0.0,
        violations: [],
        risk: "low"
      }
    };
  }
  
  if (trimmed.length > 800) {
    return {
      isValid: false,
      error: "Prompt is too long (maximum 800 characters)",
      securityResult: {
        isSecure: false,
        confidence: 0.8,
        violations: ["Excessive length may indicate injection attempt"],
        risk: "medium"
      }
    };
  }
  
  // Security validation
  const securityResult = checkPromptSecurity(trimmed);
  
  if (!securityResult.isSecure) {
    return {
      isValid: false,
      error: "Prompt contains potentially harmful content",
      securityResult
    };
  }
  
  return {
    isValid: true,
    securityResult
  };
}

/**
 * Rate limiting helper for security events
 */
export function logSecurityViolation(
  ip: string | undefined,
  userAgent: string | undefined,
  violations: string[],
  prompt: string
): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn("[SECURITY] Prompt injection attempt detected", {
      ip: ip?.substring(0, 10) + "...", // Partial IP for privacy
      userAgent: userAgent?.substring(0, 50) + "...", // Partial UA
      violations,
      promptLength: prompt.length,
      timestamp: new Date().toISOString()
    });
  }
  
  // In production, you might want to:
  // - Log to security monitoring system
  // - Increment abuse counters
  // - Trigger additional rate limiting
  // - Send alerts for repeated attempts
}