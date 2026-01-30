
export interface UserContext {
  goals: string[];
  supplements: any[];
  wellness: any[];
  completions: any[];
  history: any[];
  profile: any;
}

// Enhanced user context builder for consistent AI prompts
class UserContextBuilder {
  static buildSystemPrompt(userContext: UserContext): string {
    const profile = userContext.profile || {};
    const currentDate = new Date().toLocaleDateString();
    
    return `You are a knowledgeable wellness and biohacking assistant. Today is ${currentDate}.

USER PROFILE:
- Name: ${profile.firstName || 'User'} ${profile.lastName || ''}
- Age: ${profile.age || 'Not specified'}
- Height: ${profile.height || 'Not specified'}
- Weight: ${profile.weight || 'Not specified'}
- Primary Goals: ${profile.goals || 'General wellness'}
- Timezone: ${profile.timezone || 'UTC'}

CURRENT ROUTINE:
- Active Supplements (${userContext.supplements.length}): ${userContext.supplements.map(s => 
  `${s.name} (${s.dosage || 'dosage not specified'}, ${s.timeOfDay || 'timing not specified'})`
).join(', ') || 'None'}

- Active Wellness Activities (${userContext.wellness.length}): ${userContext.wellness.map(w => 
  `${w.name} (${w.duration || 'duration not specified'} min, ${w.timeOfDay || 'timing not specified'})`
).join(', ') || 'None'}

RECENT PERFORMANCE:
- Total History Entries: ${userContext.history.length}
- Recent Adherence Rate: ${this.calculateCompletionRate(userContext)}%
- Last 7 Days Activity: ${this.getRecentActivitySummary(userContext)}

GUIDELINES:
- Always prioritize safety and evidence-based advice
- Be encouraging and supportive
- Provide actionable, specific recommendations
- Consider the user's current routine and goals
- Keep responses concise but informative`;
  }

  static calculateCompletionRate(userContext: UserContext): number {
    if (!userContext.history || userContext.history.length === 0) return 0;
    
    const totalTasks = userContext.supplements.length + userContext.wellness.length;
    if (totalTasks === 0) return 0;
    
    // Calculate completion rate for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentHistory = userContext.history.filter(entry => {
      const entryDate = entry.completedAt instanceof Date 
        ? entry.completedAt 
        : new Date(entry.completedAt);
      return entryDate >= sevenDaysAgo;
    });
    
    const expectedCompletions = totalTasks * 7;
    const actualCompletions = recentHistory.length;
    
    return Math.min(100, Math.round((actualCompletions / expectedCompletions) * 100));
  }

  static getRecentActivitySummary(userContext: UserContext): string {
    if (!userContext.history || userContext.history.length === 0) {
      return "No recent activity recorded";
    }

    const last7Days = userContext.history.filter(entry => {
      const entryDate = entry.completedAt instanceof Date 
        ? entry.completedAt 
        : new Date(entry.completedAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return entryDate >= sevenDaysAgo;
    });

    const supplementCompletions = last7Days.filter(h => h.itemType === 'supplement').length;
    const wellnessCompletions = last7Days.filter(h => h.itemType === 'wellness').length;

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

1. GAPS: Missing supplements that align with their goals
2. OPTIMIZATIONS: Better timing or dosing for existing supplements
3. NEW SUGGESTIONS: Evidence-based additions that could benefit them
4. SAFETY CONSIDERATIONS: Potential interactions or precautions

RESPONSE FORMAT:
Respond in valid JSON format with this exact structure:
{
  "gaps": [
    "Description of supplement gap 1...",
    "Description of supplement gap 2..."
  ],
  "optimizations": [
    "Optimization suggestion 1 for existing supplements...",
    "Optimization suggestion 2 for existing supplements..."
  ],
  "newSuggestions": [
    {
      "name": "Supplement Name",
      "reason": "Why this supplement would benefit the user...",
      "timing": "morning/afternoon/evening",
      "dosage": "Recommended dosage range"
    }
  ]
}

Base all recommendations on current scientific evidence and the user's specific profile and goals.`;
  }

  static buildQuestionResponsePrompt(question: string, userContext: UserContext): string {
    const systemPrompt = this.buildSystemPrompt(userContext);
    
    return `${systemPrompt}

USER QUESTION: "${question}"

TASK: Provide a helpful, personalized response to the user's question.

GUIDELINES FOR RESPONSE:
- Reference their current routine when relevant
- Provide specific, actionable advice
- Include scientific backing when appropriate
- Be encouraging and supportive
- Keep the response conversational but informative
- If the question is about supplements or wellness practices, consider their current routine
- If you need more information to provide a complete answer, ask clarifying questions

Provide a direct, helpful response to their question based on their profile and current wellness routine.`;
  }
}

class FirebaseGeminiService {
  private initialized = false;
  private contextBuilder = UserContextBuilder;
  private initializationPromise: Promise<boolean> | null = null;
  private apiKey: string;
  private model = 'gemini-1.5-flash';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<boolean> {
    try {
      if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here') {
        console.warn('⚠️ Gemini API key not configured');
        console.info('💡 To enable AI: Get a free API key from https://aistudio.google.com/app/apikey');
        console.info('💡 Then add it to your .env file as VITE_GEMINI_API_KEY=your-key-here');
        this.initialized = false;
        return false;
      }

      console.log('Testing Gemini API connection...');
      await this.callGeminiAPI('Reply with just the word "ok".');

      this.initialized = true;
      console.log('✅ Gemini API initialized successfully');
      return true;
    } catch (error: any) {
      console.warn('⚠️ Gemini API initialization failed:', error.message);

      if (error.message?.includes('400') || error.message?.includes('INVALID')) {
        console.error('❌ Invalid API key - Check https://aistudio.google.com/app/apikey');
      } else if (error.message?.includes('403')) {
        console.error('❌ API key missing permissions');
      } else if (error.message?.includes('429') || error.message?.includes('QUOTA')) {
        console.error('❌ API quota exceeded');
      }

      this.initialized = false;
      return false;
    }
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here') {
      throw new Error('Gemini API key not configured');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format');
    }

    return data.candidates[0].content.parts[0].text;
  }

  private async callGemini(prompt: string): Promise<string> {
    if (!this.initialized) {
      throw new Error('Gemini API not initialized');
    }

    try {
      return await this.callGeminiAPI(prompt);
    } catch (error: any) {
      console.error('Gemini API call failed:', error);

      if (error.message?.includes('429') || error.message?.includes('QUOTA')) {
        throw new Error('API quota exceeded');
      }
      if (error.message?.includes('400')) {
        throw new Error('Invalid API key');
      }

      throw error;
    }
  }

  async generatePersonalizedSchedule(userContext: UserContext): Promise<any> {
    if (!this.initialized) {
      console.log('Using mock schedule - Firebase AI Logic not available');
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

      const response = await this.callGemini(prompt);
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.warn('Failed to parse Firebase AI Logic response as JSON, using mock data');
        return this.getMockSchedule();
      }
    } catch (error) {
      console.error('Failed to generate personalized schedule:', error);
      return this.getMockSchedule();
    }
  }

  async generateWellnessRoutine(userProfile: any, preferences: any): Promise<any> {
    if (!this.initialized) {
      console.log('Using mock wellness routine - Firebase AI Logic not available');
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

      const response = await this.callGemini(prompt);
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.warn('Failed to parse Firebase AI Logic response as JSON, using mock data');
        return this.getMockWellnessRoutine();
      }
    } catch (error) {
      console.error('Failed to generate wellness routine:', error);
      return this.getMockWellnessRoutine();
    }
  }

  async generateInsights(userContext: UserContext): Promise<any> {
    // Always return mock insights if Firebase AI Logic is not available
    if (!this.initialized) {
      console.log('Using mock insights - Firebase AI Logic not available');
      return this.getMockInsights(userContext);
    }

    try {
      const prompt = this.contextBuilder.buildInsightsPrompt(userContext);
      console.log('Generating AI insights...');
      const response = await this.callGemini(prompt);
      
      try {
        const parsed = JSON.parse(response);
        
        // Validate the response structure
        if (!parsed.adherenceScore && parsed.adherenceScore !== 0) {
          parsed.adherenceScore = this.contextBuilder.calculateCompletionRate(userContext);
        }
        if (!Array.isArray(parsed.insights)) {
          parsed.insights = [];
        }
        if (!Array.isArray(parsed.recommendations)) {
          parsed.recommendations = [];
        }
        
        console.log('AI insights generated successfully:', parsed);
        return parsed;
      } catch (parseError) {
        console.warn('Failed to parse Firebase AI Logic response as JSON, using mock data');
        return this.getMockInsights(userContext);
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
      
      // Check for specific API errors and provide helpful feedback
      if (error.message && error.message.includes('QUOTA_EXCEEDED')) {
        console.warn('Gemini API quota exceeded. Using mock insights. Please check your API usage limits.');
      }
      
      return this.getMockInsights(userContext);
    }
  }

  async generateSupplementRecommendations(userContext: UserContext): Promise<any> {
    if (!this.initialized) {
      console.log('Using mock supplement recommendations - Firebase AI Logic not available');
      return this.getMockSupplementRecommendations(userContext);
    }

    try {
      const prompt = this.contextBuilder.buildSupplementRecommendationsPrompt(userContext);
      console.log('Generating supplement recommendations with AI...');
      const response = await this.callGemini(prompt);
      
      try {
        const parsed = JSON.parse(response);
        
        // Validate and clean the response
        const cleanedResponse = {
          gaps: Array.isArray(parsed.gaps) ? parsed.gaps.filter(gap => gap && typeof gap === 'string') : [],
          optimizations: Array.isArray(parsed.optimizations) ? parsed.optimizations.filter(opt => opt && typeof opt === 'string') : [],
          newSuggestions: Array.isArray(parsed.newSuggestions) ? parsed.newSuggestions.filter(suggestion => 
            suggestion && 
            typeof suggestion === 'object' && 
            suggestion.name && 
            suggestion.reason
          ) : []
        };
        
        console.log('AI recommendations generated successfully:', cleanedResponse);
        return cleanedResponse;
      } catch (parseError) {
        console.warn('Failed to parse Firebase AI Logic response as JSON, using mock data');
        return this.getMockSupplementRecommendations(userContext);
      }
    } catch (error) {
      console.error('Failed to generate supplement recommendations:', error);
      
      // Check for specific API errors
      if (error.message && error.message.includes('QUOTA_EXCEEDED')) {
        console.warn('Gemini API quota exceeded. Using mock recommendations.');
        return this.getMockSupplementRecommendations(userContext);
      }
      
      // For other errors, throw to be handled by the UI
      throw new Error('Unable to generate AI recommendations at this time. Please try again later.');
    }
  }

  async generateTextResponse(prompt: string, context: UserContext): Promise<string> {
    if (!this.initialized) {
      return "AI features are currently unavailable. Please configure your Gemini API key to enable them.";
    }

    try {
      const contextualPrompt = this.contextBuilder.buildQuestionResponsePrompt(prompt, context);
      return await this.callGemini(contextualPrompt);
    } catch (error) {
      console.error('Failed to generate text response:', error);

      if (error.message?.includes('quota')) {
        return "API quota exceeded. Please try again later.";
      }

      return "I'm having trouble processing your request. Please try again later.";
    }
  }

  // Helper methods
  private calculateCompletionRate(userContext: UserContext): number {
    return this.contextBuilder.calculateCompletionRate(userContext);
  }

  private analyzeRecentTrends(userContext: UserContext): string {
    return this.contextBuilder.getRecentActivitySummary(userContext);
  }

  // Enhanced mock data fallbacks with user context awareness
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
    const adherenceScore = this.calculateCompletionRate(userContext);
    const hasSupplements = userContext.supplements.length > 0;
    const hasWellness = userContext.wellness.length > 0;
    const hasHistory = userContext.history.length > 0;
    
    const insights = [];
    const recommendations = [];

    // Generate contextual insights
    if (adherenceScore >= 80) {
      insights.push(`Excellent consistency! Your ${adherenceScore}% adherence rate shows strong commitment to your wellness routine.`);
    } else if (adherenceScore >= 60) {
      insights.push(`Good progress with ${adherenceScore}% adherence. You're building solid habits that will compound over time.`);
    } else if (adherenceScore > 0) {
      insights.push(`Your ${adherenceScore}% adherence rate shows you're getting started. Focus on consistency over perfection.`);
    } else {
      insights.push('You\'re at the beginning of your wellness journey. Every small step counts toward building lasting habits.');
    }

    if (hasSupplements && hasWellness) {
      insights.push('Your balanced approach combining supplements and wellness activities creates a comprehensive health strategy.');
    } else if (hasSupplements) {
      insights.push('Your supplement routine is well-established. Consider adding wellness activities for a more holistic approach.');
    } else if (hasWellness) {
      insights.push('Your focus on wellness activities is excellent for mental and physical health.');
    }

    if (hasHistory) {
      insights.push('Your tracking consistency helps identify patterns and optimize your routine over time.');
    }

    // Generate contextual recommendations
    if (adherenceScore < 70) {
      recommendations.push('Try setting phone reminders or linking new habits to existing daily routines for better consistency.');
    }

    if (hasSupplements) {
      recommendations.push('Consider taking supplements with meals to improve absorption and reduce stomach irritation.');
    }

    if (!hasWellness || userContext.wellness.length < 2) {
      recommendations.push('Adding a brief mindfulness or movement practice could enhance your overall wellness routine.');
    }

    recommendations.push('Track your energy levels and mood to identify which practices have the biggest impact on your well-being.');
    
    return {
      adherenceScore,
      insights: insights.slice(0, 4), // Limit to 4 insights
      recommendations: recommendations.slice(0, 3) // Limit to 3 recommendations
    };
  }

  private getMockSupplementRecommendations(userContext?: UserContext) {
    if (!userContext) {
      return {
        gaps: [],
        optimizations: [],
        newSuggestions: []
      };
    }

    const currentSupplements = userContext.supplements.map(s => s.name.toLowerCase());
    const gaps = [];
    const optimizations = [];
    const newSuggestions = [];

    // Check for common supplement gaps based on what they don't have
    const commonSupplements = [
      { name: 'Vitamin B12', reason: 'Essential for energy production and nervous system health' },
      { name: 'Vitamin D3', reason: 'Important for bone health and immune function' },
      { name: 'Omega-3', reason: 'Supports heart health, brain function, and reduces inflammation' },
      { name: 'Magnesium', reason: 'Supports muscle function, sleep quality, and stress management' },
      { name: 'Probiotics', reason: 'Enhance digestive health and immune function' },
      { name: 'Vitamin K2', reason: 'Works with Vitamin D for bone health and calcium absorption' }
    ];

    commonSupplements.forEach(supplement => {
      const hasThis = currentSupplements.some(current => 
        current.includes(supplement.name.toLowerCase().replace(/[0-9]/g, '').trim()) ||
        supplement.name.toLowerCase().replace(/[0-9]/g, '').trim().includes(current)
      );
      
      if (!hasThis) {
        gaps.push(`Consider adding ${supplement.name} - ${supplement.reason}`);
      }
    });

    // Generate optimizations based on current supplements
    if (currentSupplements.some(s => s.includes('vitamin d'))) {
      optimizations.push('Take Vitamin D with healthy fats (like avocado or nuts) for 30% better absorption');
    }
    
    if (currentSupplements.some(s => s.includes('iron')) && currentSupplements.some(s => s.includes('calcium'))) {
      optimizations.push('Space iron and calcium supplements 2+ hours apart to prevent absorption interference');
    }
    
    if (currentSupplements.some(s => s.includes('magnesium'))) {
      optimizations.push('Consider taking magnesium in the evening to support better sleep quality');
    } else {
      optimizations.push('Consider timing supplements with meals to improve absorption and reduce stomach irritation');
    }

    // Generate new suggestions based on gaps
    if (!currentSupplements.some(s => s.includes('ashwagandha'))) {
      newSuggestions.push({
        name: 'Ashwagandha',
        reason: 'May help reduce stress and improve sleep quality based on your wellness goals',
        timing: 'evening',
        dosage: '300-500mg'
      });
    }

    if (!currentSupplements.some(s => s.includes('omega') || s.includes('fish oil'))) {
      newSuggestions.push({
        name: 'Omega-3 (EPA/DHA)',
        reason: 'Supports heart health, brain function, and reduces inflammation',
        timing: 'morning',
        dosage: '1000-2000mg combined EPA/DHA'
      });
    }

    if (!currentSupplements.some(s => s.includes('coq10') || s.includes('coenzyme'))) {
      newSuggestions.push({
        name: 'Coenzyme Q10',
        reason: 'Supports cellular energy production and cardiovascular health',
        timing: 'morning',
        dosage: '100-200mg'
      });
    }

    return {
      gaps: gaps.slice(0, 3),
      optimizations: optimizations.slice(0, 3),
      newSuggestions: newSuggestions.slice(0, 3)
    };
  }
}

// Create service instance
export const firebaseGeminiService = new FirebaseGeminiService();

// Enhanced mock service for development/fallback
export const mockGeminiService = {
  async generatePersonalizedSchedule(userContext: UserContext) {
    return {
      morning: [
        { time: '07:00', task: 'Vitamin D3', type: 'supplement', reasoning: 'Best absorbed in morning with fats' },
        { time: '07:30', task: 'Morning Meditation', type: 'wellness', reasoning: 'Sets positive tone for the day' }
      ],
      afternoon: [
        { time: '12:00', task: 'Omega-3', type: 'supplement', reasoning: 'With lunch for optimal absorption' }
      ],
      evening: [
        { time: '19:00', task: 'Magnesium', type: 'supplement', reasoning: 'Promotes relaxation and sleep' },
        { time: '20:00', task: 'Journaling', type: 'wellness', reasoning: 'Reflection and stress relief' }
      ]
    };
  },

  async generateWellnessRoutine(userProfile: any, preferences: any) {
    return {
      routine: [
        {
          name: 'Morning Energizer',
          activities: ['5-minute breathing', 'Stretching', 'Hydration'],
          duration: 15,
          timeOfDay: 'morning'
        }
      ]
    };
  },

  async generateInsights(userContext: UserContext) {
    const adherenceScore = UserContextBuilder.calculateCompletionRate(userContext);
    
    return {
      adherenceScore,
      insights: [
        'Your supplement adherence has improved by 15% this week',
        'Consider adding a midday wellness check-in for better consistency',
        'Your evening routine shows the highest completion rate'
      ],
      recommendations: [
        'Try taking your Omega-3 with a meal for better absorption',
        'Your stress levels might benefit from an additional breathing exercise'
      ]
    };
  },

  async generateSupplementRecommendations(userContext: UserContext) {
    return {
      gaps: ['Consider adding Vitamin B12 for energy support'],
      optimizations: ['Take Vitamin D with healthy fats for better absorption'],
      newSuggestions: [
        {
          name: 'Ashwagandha',
          reason: 'May help with stress management',
          timing: 'evening',
          dosage: '300-500mg'
        }
      ]
    };
  },

  async generateTextResponse(prompt: string, context: UserContext) {
    return "Based on your current routine, I recommend taking your new supplement with breakfast for optimal absorption.";
  }
};

// Export the main service (will use Firebase AI Logic when available, fallback to mock)
export const geminiService = firebaseGeminiService;