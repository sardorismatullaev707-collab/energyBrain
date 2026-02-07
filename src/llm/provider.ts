// LLM Provider abstraction for agent reasoning

export interface LLMProvider {
  /**
   * Complete a prompt and return response
   * @param prompt The input prompt
   * @param schema Optional JSON schema for structured output
   * @returns Response string (typically JSON)
   */
  complete(prompt: string, schema?: unknown): Promise<string>;
  
  /**
   * Provider name for logging
   */
  name: string;
}

export interface LLMConfig {
  temperature?: number;
  maxTokens?: number;
  seed?: number;
}
