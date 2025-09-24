import "server-only";
import { z } from "zod";

export const GenerateDomainsSchema = z.object({
  prompt: z
    .string()
    .min(3, "Prompt is too short")
    .max(800, "Prompt is too long"),
  tlds: z.array(z.string().regex(/^\.[a-z]{2,10}$/i)).default([".com", ".ai", ".io", ".co", ".app", ".dev"]),
  count: z.number().int().min(3).max(20).default(8),
});

export type GenerateDomainsInput = z.infer<typeof GenerateDomainsSchema>;

export const ImprovePromptSchema = z.object({
  prompt: z
    .string()
    .min(3, "Prompt is too short")
    .max(800, "Prompt is too long"),
});

export type ImprovePromptInput = z.infer<typeof ImprovePromptSchema>;

export type DomainSuggestion = {
  domain: string;
  tld: string;
  reason?: string;
  score?: number; // 0-100 brandability
};

export const DomainSuggestionsResponse = z.object({
  suggestions: z.array(
    z.object({
      domain: z.string(),
      tld: z.string(),
      reason: z.string().optional(),
      score: z.number().min(0).max(100).optional(),
    })
  ),
});

export type DomainSuggestions = z.infer<typeof DomainSuggestionsResponse>;
