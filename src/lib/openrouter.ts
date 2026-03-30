// import { UserContext } from './gemini'; // Decoupled
// import { getFunctions, httpsCallable } from 'firebase/functions';

export interface UserContext {
    goals: string[];
    supplements: any[];
    wellness: any[];
    completions: any[];
    history: any[];
    memories: any[]; // New memory field
    profile: any;
}

// Define available models
export const OPENROUTER_MODELS = [
    { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nvidia Nemotron 30B (Free)' },
    { id: 'google/gemini-2.0-flash-lite-preview-02-05:free', name: 'Gemini 2.0 Flash Lite (Free)' },
    { id: 'google/gemini-2.0-pro-exp-02-05:free', name: 'Gemini 2.0 Pro Exp (Free)' },
    { id: 'meta-llama/llama-3-8b-instruct:free', name: 'Llama 3 8B Instruct (Free)' },
    { id: 'microsoft/phi-3-mini-128k-instruct:free', name: 'Phi-3 Mini (Free)' },
];

export const DEFAULT_MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';

class UserContextBuilder {
    static buildSystemPrompt(userContext: UserContext): string {
        const profile = userContext.profile || {};
        const currentDate = new Date().toLocaleDateString();

        // Format memories for context
        const memoriesContext = userContext.memories && userContext.memories.length > 0
            ? userContext.memories.map(m => `- ${m.content} (${m.type})`).join('\n')
            : 'No stored memories yet.';

        return `You are a knowledgeable wellness and biohacking assistant. Today is ${currentDate}.

USER PROFILE:
- Name: ${profile.firstName || 'User'}
- Goals: ${profile.goals || 'General wellness'}

IMPORTANT CONTEXT:
${memoriesContext}

CURRENT ROUTINE:
- Supplements: ${userContext.supplements.map((s: any) => s.name).join(', ') || 'None'}
- Wellness: ${userContext.wellness.map((w: any) => w.name).join(', ') || 'None'}

RECENT PERFORMANCE:
- Adherence: ${this.calculateCompletionRate(userContext)}%
- Activity: ${this.getRecentActivitySummary(userContext)}

GUIDELINES:
- **BE CONCISE**: Keep responses short and to the point. Avoid fluff.
- **EXPLAIN WHY**: When making a recommendation, briefly explain the "why" based on the user's specific data (e.g. "Since you have low energy...").
- **EVIDENCE-BASED**: Base advice on science.
- **SUPPORTIVE**: Be encouraging but professional.`;
    }

    static calculateCompletionRate(userContext: UserContext): number {
        if (!userContext.history || userContext.history.length === 0) return 0;

        const totalTasks = userContext.supplements.length + userContext.wellness.length;
        if (totalTasks === 0) return 0;

        // Calculate completion rate for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentHistory = userContext.history.filter((entry: any) => {
            // Handle both Date objects and string/timestamp dates
            const entryDate = entry.completedAt instanceof Date
                ? entry.completedAt
                : new Date(entry.completedAt || entry.date);
            return entryDate >= sevenDaysAgo;
        });

        const expectedCompletions = totalTasks * 7;
        const actualCompletions = recentHistory.length;

        // Cap at 100%
        return Math.min(100, Math.round((actualCompletions / expectedCompletions) * 100));
    }

    static getRecentActivitySummary(userContext: UserContext): string {
        if (!userContext.history || userContext.history.length === 0) {
            return "No recent activity recorded";
        }

        const last7Days = userContext.history.filter((entry: any) => {
            const entryDate = entry.completedAt instanceof Date
                ? entry.completedAt
                : new Date(entry.completedAt || entry.date);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return entryDate >= sevenDaysAgo;
        });

        const supplementCompletions = last7Days.filter((h: any) => h.itemType === 'supplement').length;
        const wellnessCompletions = last7Days.filter((h: any) => h.itemType === 'wellness').length;

        return `${supplementCompletions} supplement completions, ${wellnessCompletions} wellness completions`;
    }

    static buildInsightsPrompt(userContext: UserContext): string {
        const systemPrompt = this.buildSystemPrompt(userContext);
        const adherenceScore = this.calculateCompletionRate(userContext);

        return `${systemPrompt}

TASK: Generate personalized wellness insights and recommendations.

ANALYSIS REQUEST:
Based on the user's current routine and recent performance data, provide:

1. ADHERENCE ANALYSIS: Comment on their ${adherenceScore}% adherence rate
2. KEY INSIGHTS: 3-4 specific observations about their progress and patterns
3. ACTIONABLE RECOMMENDATIONS: 2-3 concrete steps they can take to improve

RESPONSE FORMAT:
Respond in valid JSON format with this exact structure:
{
    "adherenceScore": ${adherenceScore},
    "insights": [
        "Insight 1 about their current progress...",
        "Insight 2 about patterns or trends...",
        "Insight 3 about what's working well...",
        "Insight 4 about areas for improvement..."
    ],
    "recommendations": [
        "Specific recommendation 1...",
        "Specific recommendation 2...",
        "Specific recommendation 3..."
    ]
}

Focus on being encouraging while providing practical, science-based advice tailored to their specific routine and goals.`;
    }

    static buildSupplementRecommendationsPrompt(userContext: UserContext): string {
        const systemPrompt = this.buildSystemPrompt(userContext);

        return `${systemPrompt}

TASK: Analyze the user's current supplement routine and provide evidence-based recommendations.

ANALYSIS REQUEST:
Review their current supplements and profile to identify:

Response must be in valid JSON.
    
    1. GAPS: Missing supplements that align with their goals.
    2. OPTIMIZATIONS: Better timing/dosing.
    3. NEW SUGGESTIONS: Evidence-based additions.
    
    RESPONSE FORMAT:
    {
        "gaps": ["Concise description of gap..."],
        "optimizations": ["Concise optimization..."],
        "newSuggestions": [
            {
                "name": "Supplement Name",
                "reason": "BRIEF explanation referencing their specific goal/routine (e.g. 'To help with your [Goal]').",
                "timing": "morning/afternoon/evening",
                "dosage": "dosage"
            }
        ]
    }
    
    Base recommendations on science and the user's profile. Keep descriptions short.`;
    }


    static buildMemoryExtractionPrompt(userMessage: string, aiResponse: string, existingMemories: any[]): string {
        const memoryContext = existingMemories.map(m => `- ${m.content}`).join('\n');

        return `
    ANALYZE INTERACTION FOR MEMORIES
    
    USER SAID: "${userMessage}"
    AI REPLIED: "${aiResponse}"
    
    EXISTING MEMORIES:
    ${memoryContext || 'None'}
    
    TASK: Identify any NEW, PERMANENT information about the user that should be remembered for future context.
    - User preferences (dietary, scheduling, etc.)
    - Health goals or conditions
    - Personal details (name, age, location)
    - Specific supplement/wellness reactions
    
    RULES:
    - Do NOT duplicate existing memories.
    - Ignore casual conversation or temporary context.
    - focusing on LONG-TERM utility.
    
    RESPONSE FORMAT:
    Respond in valid JSON format:
    {
      "newMemories": [    
        {
          "content": "Concise fact to remember",
          "type": "user_preference|conversation_context|important_fact"
        }
      ]
    }
    
    If nothing new to remember, return {"newMemories": []}.`;
    }

    static buildQuestionResponsePrompt(question: string, userContext: UserContext, history?: { role: 'user' | 'assistant', content: string }[]): string {
        const systemPrompt = this.buildSystemPrompt(userContext);

        let conversationContext = '';
        if (history && history.length > 0) {
            conversationContext = `
PREVIOUS CONVERSATION:
${history.map(msg => `${msg.role === 'user' ? 'USER' : 'AI'}: ${msg.content}`).join('\n')}
`;
        }

        return `${systemPrompt}

${conversationContext}

USER QUESTION: "${question}"

TASK: Provide a helpful, personalized response.

    GUIDELINES:
    - **CONTINUE THE CONVERSATION**: If this is a follow-up, refer to previous context.
    - **BE CONCISE**: Short paragraphs. Bullet points if needed. No long lectures.
    - **PRACTICAL**: Focus on what the user can DO.
    - **EXPLAIN**: Briefly mention *why* a suggestion applies to them.

    Provide a direct response.`;
    }

    static buildInteractionCheckPrompt(supplements: string[]): string {
    return `You are a clinical nutritionist and expert in pharmacology and biohacking.
    
TASK: Analyze the following supplement stack for known interactions, warnings, or synergies based on current medical and nutritional science.
STACK: [${supplements.join(', ')}]

Focus on identifying:
1. WARNINGS: Dangerous combinations, conflicting absorptions (e.g., calcium blocking iron), or overlapping toxicity risks. Use severity levels: 'high', 'medium', or 'low'.
2. SYNERGIES: Supplements that enhance each other's absorption or efficacy (e.g., Vitamin C enhancing iron absorption, Vitamin D + K2).

RESPONSE FORMAT (Strict JSON):
{
  "warnings": [
    { "title": "Supplement A + Supplement B", "description": "Explanation of why they conflict and how to manage it.", "severity": "high|medium|low" }
  ],
  "synergies": [
    { "title": "Supplement C + Supplement D", "description": "Explanation of why they work well together.", "impact": "positive" }
  ]
}

If no significant interactions or synergies exist, return empty arrays. Ensure the output is valid JSON without markdown wrapping.`;
  }
}

class OpenRouterService {
    private contextBuilder = UserContextBuilder;
    private apiKey: string;
    private currentModel = DEFAULT_MODEL;

    constructor() {
        this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    }

    setModel(modelId: string) {
        if (OPENROUTER_MODELS.some(m => m.id === modelId)) {
            this.currentModel = modelId;
            console.log(`Switched to AI model: ${modelId}`);
        } else {
            console.warn(`Invalid model ID: ${modelId}, keeping current model: ${this.currentModel}`);
        }
    }

    getModel() {
        return this.currentModel;
    }

    isAvailable(): boolean {
        // We consider it available if we have a key OR if we are in an environment where functions might work
        // Ideally we check for functions existence, but for now we assume functions might work
        return true;
    }

    private async callOpenRouter(prompt: string): Promise<string> {
        // 1. Try Firebase Function first (Secure way)
        // DISABLED for Free Tier (Spark Plan) users to avoid console errors
        /*
        try {
          const functions = getFunctions();
          const callOpenRouterFunction = httpsCallable(functions, 'callOpenRouter');
          const result: any = await callOpenRouterFunction({
            model: this.currentModel,
            messages: [{ role: 'user', content: prompt }]
          });
          
          if (result.data && result.data.content) {
              return result.data.content;
          }
        } catch (functionError) {
          console.warn('Firebase Function call failed, falling back to direct API call (Dev only)', functionError);
        }
        */

        // 2. Fallback to direct fetch if key is present (Development/Demo only)
        if (!this.apiKey || this.apiKey === 'your-openrouter-api-key-here') {
            const errorMsg = 'OpenRouter API key missing. Please check .env file.';
            console.warn(errorMsg);
            throw new Error(errorMsg);
        }

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "HTTP-Referer": window.location.origin, // Optional, for including your app on openrouter.ai rankings.
                    "X-Title": "BioScend", // Optional. Shows in rankings on openrouter.ai.
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": this.currentModel,
                    "messages": [
                        { "role": "user", "content": prompt }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error: any) {
            console.error('OpenRouter API call failed:', error);
            throw error;
        }
    }

    async generatePersonalizedSchedule(userContext: UserContext): Promise<any> {
        if (!this.isAvailable()) {
            return this.getMockSchedule();
        }

        try {
            const systemPrompt = this.contextBuilder.buildSystemPrompt(userContext);
            const prompt = `${systemPrompt}

TASK: Create an optimal daily schedule for the user's supplements and wellness activities.

SCHEDULING REQUIREMENTS:
- Consider supplement absorption and interactions
- Optimize for circadian rhythm
- Account for meal timing
- Balance energy levels throughout the day
- Respect user's current timing preferences when possible

RESPONSE FORMAT:
Respond in valid JSON format with this exact structure:
{
  "morning": [
    {"time": "07:00", "task": "Task name", "type": "supplement|wellness", "reasoning": "Why this timing is optimal"}
  ],
  "afternoon": [
    {"time": "12:00", "task": "Task name", "type": "supplement|wellness", "reasoning": "Why this timing is optimal"}
  ],
  "evening": [
    {"time": "19:00", "task": "Task name", "type": "supplement|wellness", "reasoning": "Why this timing is optimal"}
  ]
}

Create an optimized schedule based on their current routine.`;

            const response = await this.callOpenRouter(prompt);
            const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                return JSON.parse(cleanedResponse);
            } catch (parseError) {
                console.warn('Failed to parse OpenRouter response as JSON, using mock data');
                return this.getMockSchedule();
            }
        } catch (error) {
            console.error('Failed to generate personalized schedule:', error);
            return this.getMockSchedule();
        }
    }

    async generateWellnessRoutine(userProfile: any, preferences: any): Promise<any> {
        if (!this.isAvailable()) {
            return this.getMockWellnessRoutine();
        }

        try {
            const prompt = `You are a wellness expert creating personalized routines.

USER PROFILE:
- Age: ${userProfile.age || 'Not specified'}
- Goals: ${userProfile.goals || 'General wellness'}
- Current Activities: ${preferences.currentActivities || 'None specified'}
- Available Time: ${preferences.availableTime || '30 minutes per day'}
- Fitness Level: ${preferences.fitnessLevel || 'Beginner'}

TASK: Design a comprehensive wellness routine with morning, midday, and evening components.

RESPONSE FORMAT:
Respond in valid JSON format with this exact structure:
{
  "routine": [
    {
      "name": "Routine Name",
      "activities": ["Activity 1", "Activity 2", "Activity 3"],
      "duration": 15,
      "timeOfDay": "morning|afternoon|evening",
      "benefits": "Description of benefits"
    }
  ]
}

Focus on evidence-based practices that can be easily integrated into daily life.`;

            const response = await this.callOpenRouter(prompt);
            const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                return JSON.parse(cleanedResponse);
            } catch (parseError) {
                console.warn('Failed to parse OpenRouter response as JSON, using mock data');
                return this.getMockWellnessRoutine();
            }
        } catch (error) {
            console.error('Failed to generate wellness routine:', error);
            return this.getMockWellnessRoutine();
        }
    }

    async generateInsights(userContext: UserContext): Promise<any> {
        if (!this.isAvailable()) {
            return this.getMockInsights(userContext);
        }

        try {
            const prompt = this.contextBuilder.buildInsightsPrompt(userContext);
            console.log('Generating AI insights...');
            const response = await this.callOpenRouter(prompt);
            const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const parsed = JSON.parse(cleanedResponse);
                // Validate
                if (!parsed.adherenceScore && parsed.adherenceScore !== 0) {
                    parsed.adherenceScore = this.contextBuilder.calculateCompletionRate(userContext);
                }
                if (!Array.isArray(parsed.insights)) parsed.insights = [];
                if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];
                return parsed;
            } catch (parseError) {
                console.warn('Failed to parse OpenRouter response as JSON, using mock data');
                return this.getMockInsights(userContext);
            }
        } catch (error) {
            console.error('Failed to generate insights:', error);
            return this.getMockInsights(userContext);
        }
    }

    async checkSupplementInteractions(supplements: string[]): Promise<any> {
        if (!supplements || supplements.length < 2) {
            return { warnings: [], synergies: [] };
        }

        if (!this.isAvailable()) {
            console.log('Using mock interaction data - AI not available');
            return this.getMockInteractions(supplements);
        }

        try {
            const prompt = this.contextBuilder.buildInteractionCheckPrompt(supplements);
            console.log('Generating supplement interaction analysis with OpenRouter...');
            const response = await this.callOpenRouter(prompt);
            const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const parsed = JSON.parse(cleanedResponse);
                return {
                    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
                    synergies: Array.isArray(parsed.synergies) ? parsed.synergies : []
                };
            } catch (parseError) {
                console.warn('Failed to parse response as JSON for interactions, using mock data');
                return this.getMockInteractions(supplements);
            }
        } catch (error) {
            console.error('Failed to analyze supplement interactions:', error);
            return this.getMockInteractions(supplements);
        }
    }

    async generateSupplementRecommendations(userContext: UserContext): Promise<any> {
        if (!this.isAvailable()) {
            return this.getMockSupplementRecommendations();
        }

        try {
            const prompt = this.contextBuilder.buildSupplementRecommendationsPrompt(userContext);
            console.log('Generating supplement recommendations with AI...');
            const response = await this.callOpenRouter(prompt);
            const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const parsed = JSON.parse(cleanedResponse);
                return {
                    gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
                    optimizations: Array.isArray(parsed.optimizations) ? parsed.optimizations : [],
                    newSuggestions: Array.isArray(parsed.newSuggestions) ? parsed.newSuggestions : []
                };
            } catch (parseError) {
                console.warn('Failed to parse OpenRouter response as JSON, using mock data');
                return this.getMockSupplementRecommendations();
            }
        } catch (error) {
            console.error('Failed to generate supplement recommendations:', error);
            return this.getMockSupplementRecommendations();
        }
    }

    async generateTextResponse(prompt: string, context: UserContext, history?: { role: 'user' | 'assistant', content: string }[]): Promise<string> {
        if (!this.isAvailable()) {
            return "AI features are currently unavailable. Please configure your API key.";
        }

        try {
            const contextualPrompt = this.contextBuilder.buildQuestionResponsePrompt(prompt, context, history);
            return await this.callOpenRouter(contextualPrompt);
        } catch (error) {
            console.error('Failed to generate text response:', error);
            return "I'm having trouble processing your request. Please try again later.";
        }
    }

    async extractNewMemories(userMessage: string, aiResponse: string, existingMemories: any[]): Promise<any[]> {
        if (!this.isAvailable()) return [];

        try {
            const prompt = this.contextBuilder.buildMemoryExtractionPrompt(userMessage, aiResponse, existingMemories);
            // Use a cheaper/faster model for this background task if possible, or just the current one
            const response = await this.callOpenRouter(prompt);
            const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const parsed = JSON.parse(cleanedResponse);
                return Array.isArray(parsed.newMemories) ? parsed.newMemories : [];
            } catch (parseError) {
                console.warn('Failed to parse memory extraction response', parseError);
                return [];
            }
        } catch (error) {
            console.error('Failed to extract memories:', error);
            return [];
        }
    }

    // --- Mock Data Helpers (Duplicated from Gemini for standalone) ---
    private getMockSchedule() {
        return {
            morning: [
                { time: '07:00', task: 'Vitamin D3', type: 'supplement', reasoning: 'Best absorbed in morning with fats from breakfast' },
                { time: '07:30', task: 'Morning Meditation', type: 'wellness', reasoning: 'Sets positive tone for the day and improves focus' }
            ],
            afternoon: [
                { time: '12:00', task: 'Omega-3', type: 'supplement', reasoning: 'With lunch for optimal absorption and reduced fishy aftertaste' }
            ],
            evening: [
                { time: '19:00', task: 'Magnesium', type: 'supplement', reasoning: 'Promotes relaxation and better sleep quality' },
                { time: '20:00', task: 'Journaling', type: 'wellness', reasoning: 'Reflection and stress relief before bedtime' }
            ]
        };
    }

    private getMockWellnessRoutine() {
        return {
            routine: [
                {
                    name: 'Morning Energizer',
                    activities: ['5-minute deep breathing', 'Dynamic stretching', 'Hydration check'],
                    duration: 15,
                    timeOfDay: 'morning',
                    benefits: 'Increases energy, improves circulation, and sets a positive tone for the day'
                },
                {
                    name: 'Midday Reset',
                    activities: ['2-minute meditation', 'Posture check', 'Stress assessment'],
                    duration: 5,
                    timeOfDay: 'afternoon',
                    benefits: 'Reduces stress, improves posture, and boosts afternoon productivity'
                },
                {
                    name: 'Evening Wind-down',
                    activities: ['Gratitude journaling', 'Progressive muscle relaxation', 'Tomorrow planning'],
                    duration: 20,
                    timeOfDay: 'evening',
                    benefits: 'Promotes better sleep, reduces anxiety, and improves mental clarity'
                }
            ]
        };
    }

    private getMockInsights(userContext: UserContext) {
        const adherenceScore = this.contextBuilder.calculateCompletionRate(userContext);
        const insights = ['Excellent consistency!', 'Good progress with adherence.'];
        const recommendations = ['Try setting phone reminders.', 'Track your energy levels.'];

        return {
            adherenceScore,
            insights: insights.slice(0, 4),
            recommendations: recommendations.slice(0, 3)
        };
    }

    private getMockSupplementRecommendations() {
        return {
            gaps: ['Consider adding Vitamin D3'],
            optimizations: ['Take Magnesium in the evening'],
            newSuggestions: [{ name: 'Ashwagandha', reason: 'Stress reduction', timing: 'evening', dosage: '300mg' }]
        };
    }

    private getMockInteractions(supplements: string[]) {
        const lowerSupps = supplements.map(s => s.toLowerCase());
        const warnings = [];
        const synergies = [];

        if (lowerSupps.some(s => s.includes('iron')) && lowerSupps.some(s => s.includes('calcium'))) {
            warnings.push({
                title: "Iron + Calcium",
                description: "Calcium has been shown to inhibit the absorption of iron. It is recommended to separate their intake by at least 2 hours.",
                severity: "medium"
            });
        }

        if (lowerSupps.some(s => s.includes('zinc')) && lowerSupps.some(s => s.includes('copper'))) {
            warnings.push({
                title: "Zinc + Copper",
                description: "High doses of zinc can interfere with copper absorption. Often they are taken together in a specific ratio or separated if doses are high.",
                severity: "low"
            });
        }

        if (lowerSupps.some(s => s.includes('iron')) && lowerSupps.some(s => s.includes('vitamin c'))) {
            synergies.push({
                title: "Iron + Vitamin C",
                description: "Vitamin C significantly enhances the absorption of non-heme iron. Taking these together is highly beneficial.",
                impact: "positive"
            });
        }

        if (lowerSupps.some(s => s.includes('vitamin d')) && (lowerSupps.some(s => s.includes('vitamin k')) || lowerSupps.some(s => s.includes('calcium')))) {
            synergies.push({
                title: "Vitamin D + K2/Calcium",
                description: "Vitamin D enhances calcium absorption, and Vitamin K2 directs that calcium into bones rather than arteries. This is an excellent synergy for bone and heart health.",
                impact: "positive"
            });
        }

        return { warnings, synergies };
    }
}

// Export singleton
export const openRouterService = new OpenRouterService();
