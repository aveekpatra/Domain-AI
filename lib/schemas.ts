import "server-only";
import { z } from "zod";
import { validateDomainPrompt } from "./promptSecurity";

export const GenerateDomainsSchema = z.object({
  prompt: z
    .string()
    .min(3, "Prompt is too short")
    .max(800, "Prompt is too long")
    .refine((prompt) => {
      const validation = validateDomainPrompt(prompt);
      return validation.isValid;
    }, {
      message: "Prompt contains potentially harmful content or is not domain-related"
    }),
  tlds: z.array(z.string().regex(/^\.[a-z]{2,10}$/i)).default([".com", ".ai", ".io", ".co", ".app", ".dev"]),
  count: z.number().int().min(3).max(20).default(8),
});

export type GenerateDomainsInput = z.infer<typeof GenerateDomainsSchema>;

export const ImprovePromptSchema = z.object({
  prompt: z
    .string()
    .min(3, "Prompt is too short")
    .max(800, "Prompt is too long")
    .refine((prompt) => {
      const validation = validateDomainPrompt(prompt);
      return validation.isValid;
    }, {
      message: "Prompt contains potentially harmful content or is not domain-related"
    }),
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
      available: z.boolean().optional(),
      price: z.string().optional(),
      registrar: z.string().optional(),
    })
  ),
});

export type DomainSuggestions = z.infer<typeof DomainSuggestionsResponse>;

export const ValidateDomainSchema = z.object({
  domain: z.string().regex(/^[a-z0-9-]+\.[a-z]{2,}$/i, "Invalid domain"),
});

export type ValidateDomainInput = z.infer<typeof ValidateDomainSchema>;
