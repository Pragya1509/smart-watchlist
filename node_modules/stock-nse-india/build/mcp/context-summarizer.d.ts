import OpenAI from 'openai';
export interface ContextSummary {
    summary: string;
    keyPoints: string[];
    importantStocks: string[];
    importantIndices: string[];
    userPreferences: Record<string, any>;
    timestamp: string;
    originalMessageCount: number;
}
export interface ContextWindowConfig {
    maxTokens: number;
    reservedTokens: number;
    summarizationThreshold: number;
    minMessagesToSummarize: number;
    summaryCompressionRatio: number;
}
export interface TokenCountResult {
    totalTokens: number;
    messageTokens: number[];
    systemPromptTokens: number;
    estimatedResponseTokens: number;
}
export declare class ContextSummarizer {
    private openai;
    private config;
    constructor(openai: OpenAI, config?: Partial<ContextWindowConfig>);
    /**
     * Estimate token count for a message (rough approximation)
     */
    private estimateTokenCount;
    /**
     * Count tokens for a conversation
     */
    countTokens(messages: any[], systemPrompt: string): TokenCountResult;
    /**
     * Check if context needs summarization
     */
    needsSummarization(messages: any[], systemPrompt: string): boolean;
    /**
     * Extract key information from messages for summarization
     */
    private extractKeyInformation;
    /**
     * Create a context summary using AI
     */
    createContextSummary(messages: any[]): Promise<ContextSummary>;
    /**
     * Optimize context by selecting most relevant messages
     */
    optimizeContext(messages: any[], systemPrompt: string, maxTokens: number): Promise<{
        selectedMessages: any[];
        summary?: ContextSummary;
        wasSummarized: boolean;
    }>;
    /**
     * Create summarized context when too much history
     */
    private createSummarizedContext;
    /**
     * Get optimal context for a conversation
     */
    getOptimalContext(messages: any[], systemPrompt: string, maxTokens?: number): Promise<{
        messages: any[];
        summary?: ContextSummary;
        wasSummarized: boolean;
        tokenCount: TokenCountResult;
    }>;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<ContextWindowConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): ContextWindowConfig;
}
//# sourceMappingURL=context-summarizer.d.ts.map