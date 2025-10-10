import { openRouterChat } from "../ai";

// Mock the AI SDK
jest.mock("ai", () => ({
  generateText: jest.fn(),
}));

jest.mock("@openrouter/ai-sdk-provider", () => ({
  createOpenRouter: jest.fn(() => (modelName) => modelName),
}));

import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const mockGenerateText = generateText as jest.MockedFunction<
  typeof generateText
>;
const mockCreateOpenRouter = createOpenRouter as jest.MockedFunction<
  typeof createOpenRouter
>;

describe("openRouterChat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default successful response
    mockGenerateText.mockResolvedValue({
      text: "AI generated response",
      object: undefined,
      usage: { promptTokens: 10, completionTokens: 5 },
      finishReason: "stop",
      warnings: undefined,
    });

    // Mock createOpenRouter to return a function
    mockCreateOpenRouter.mockReturnValue((modelName) => modelName);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("successful requests", () => {
    it("should make successful API call with required parameters", async () => {
      const config = {
        apiKey: "test-api-key",
        siteUrl: "https://example.com",
        appTitle: "Test App",
      };

      const messages = [
        { role: "system" as const, content: "You are a helpful assistant" },
        { role: "user" as const, content: "Hello" },
      ];

      const result = await openRouterChat({ messages, config });

      expect(mockCreateOpenRouter).toHaveBeenCalledWith({
        apiKey: "test-api-key",
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://example.com",
          "X-Title": "Test App",
        },
      });

      expect(mockGenerateText).toHaveBeenCalledTimes(1);
      expect(mockGenerateText).toHaveBeenCalledWith({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant" },
          { role: "user", content: "Hello" },
        ],
      });

      expect(result).toEqual({ text: "AI generated response" });
    });

    it("should use custom model when provided", async () => {
      const config = {
        apiKey: "test-api-key",
        model: "gpt-4",
      };

      await openRouterChat({
        messages: [{ role: "user", content: "test" }],
        config,
      });

      expect(mockGenerateText).toHaveBeenCalledWith({
        model: "gpt-4",
        messages: [{ role: "user", content: "test" }],
      });
    });

    it("should include JSON output format when requested", async () => {
      const config = { apiKey: "test-api-key" };

      mockGenerateText.mockResolvedValue({
        text: "",
        object: { result: "test" },
        usage: { promptTokens: 10, completionTokens: 5 },
        finishReason: "stop",
        warnings: undefined,
      });

      await openRouterChat({
        messages: [{ role: "user", content: "test" }],
        config,
        responseFormatJson: true,
      });

      expect(mockGenerateText).toHaveBeenCalledWith({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: "test" }],
        output: "object",
      });
    });

    it("should handle environment variable model override", async () => {
      const originalEnv = process.env.OPENROUTER_MODEL;
      process.env.OPENROUTER_MODEL = "claude-2";

      const config = { apiKey: "test-api-key" };

      await openRouterChat({
        messages: [{ role: "user", content: "test" }],
        config,
      });

      expect(mockGenerateText).toHaveBeenCalledWith({
        model: "claude-2",
        messages: [{ role: "user", content: "test" }],
      });

      // Restore original env
      process.env.OPENROUTER_MODEL = originalEnv;
    });

    it("should handle optional headers correctly", async () => {
      const config = { apiKey: "test-api-key" }; // No siteUrl or appTitle

      await openRouterChat({
        messages: [{ role: "user", content: "test" }],
        config,
      });

      expect(mockCreateOpenRouter).toHaveBeenCalledWith({
        apiKey: "test-api-key",
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {},
      });
    });
  });

  describe("error handling", () => {
    it("should throw error when API key is missing", async () => {
      const config = { apiKey: "" };

      await expect(
        openRouterChat({
          messages: [{ role: "user", content: "test" }],
          config,
        }),
      ).rejects.toThrow("Missing OPENROUTER_API_KEY");
    });

    it("should handle AI SDK errors", async () => {
      mockGenerateText.mockRejectedValue(new Error("AI SDK error"));

      const config = { apiKey: "test-key" };

      await expect(
        openRouterChat({
          messages: [{ role: "user", content: "test" }],
          config,
        }),
      ).rejects.toThrow("AI error: AI SDK error");
    });

    it("should handle empty response content", async () => {
      mockGenerateText.mockResolvedValue({
        text: "",
        object: undefined,
        usage: { promptTokens: 10, completionTokens: 0 },
        finishReason: "stop",
        warnings: undefined,
      });

      const config = { apiKey: "test-api-key" };

      await expect(
        openRouterChat({
          messages: [{ role: "user", content: "test" }],
          config,
        }),
      ).rejects.toThrow("AI returned empty response");
    });

    it("should handle unknown errors", async () => {
      mockGenerateText.mockRejectedValue("Unknown error");

      const config = { apiKey: "test-api-key" };

      await expect(
        openRouterChat({
          messages: [{ role: "user", content: "test" }],
          config,
        }),
      ).rejects.toThrow("AI error: Unknown error occurred");
    });
  });

  describe("development mode logging", () => {
    it("should log in development mode", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const config = { apiKey: "test-api-key" };

      await openRouterChat({
        messages: [{ role: "user", content: "test" }],
        config,
      });

      // Console logs are mocked in jest.setup.js, so we can check they were called
      expect(console.log).toHaveBeenCalledWith(
        "[ai] request",
        expect.objectContaining({
          model: expect.any(String),
          messages: 1,
          json: false,
        }),
      );
      expect(console.log).toHaveBeenCalledWith("[ai] response status", 200);

      process.env.NODE_ENV = originalEnv;
    });

    it("should not log in production mode", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const config = { apiKey: "test-api-key" };

      await openRouterChat({
        messages: [{ role: "user", content: "test" }],
        config,
      });

      expect(console.log).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("JSON response handling", () => {
    it("should handle JSON object responses", async () => {
      const config = { apiKey: "test-api-key" };

      mockGenerateText.mockResolvedValue({
        text: "",
        object: { suggestions: [{ domain: "test", tld: ".com" }] },
        usage: { promptTokens: 10, completionTokens: 5 },
        finishReason: "stop",
        warnings: undefined,
      });

      const result = await openRouterChat({
        messages: [{ role: "user", content: "test" }],
        config,
        responseFormatJson: true,
      });

      expect(result.text).toBe(
        '{"suggestions":[{"domain":"test","tld":".com"}]}',
      );
    });
  });
});
