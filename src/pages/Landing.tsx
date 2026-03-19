import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity,
    Brain,
    ChevronRight,
    TrendingUp,
    Zap,
    Shield,
    User
} from 'lucide-react';

const Landing: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-surface-base text-gray-100 font-sans selection:bg-primary-500/30">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-surface-base/80 backdrop-blur-md border-b border-white/5 safe-area-pt">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                BioScend
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => navigate('/onboarding')}
                                className="px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary-500/10 to-transparent blur-3xl -z-10 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
                        <span className="flex w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                        <span className="text-sm text-gray-300">AI-Powered Wellness Tracking</span>
                    </div>

                    <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 animate-fade-in-up delay-100">
                        Elevate Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-500">
                            Biology & Mind
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-10 animate-fade-in-up delay-200">
                        The intelligent companion for your supplement stacks, wellness routines, and longevity goals. comprehensive tracking meets AI insights.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up delay-300">
                        <button
                            onClick={() => navigate('/onboarding')}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-surface-base font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl shadow-white/10 flex items-center justify-center group"
                        >
                            Start Your Journey
                            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-8 py-4 bg-surface-raised border border-white/10 text-white font-medium rounded-xl hover:bg-surface-raised/80 transition-all flex items-center justify-center"
                        >
                            Existing Member
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-24 bg-surface-base relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
                            Intelligence meets Intuition
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            BioScend doesn't just track data; it helps you understand it. Experience a new level of insight into your daily wellness.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Brain className="w-6 h-6 text-primary-400" />}
                            title="AI Insights"
                            description="Gemini-powered analysis of your routines, offering personalized recommendations to optimize your stack."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-6 h-6 text-secondary-400" />}
                            title="Smart Analytics"
                            description="Visualize your progress with beautiful, reactive charts that show correlation between your habits and wellness."
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-amber-400" />}
                            title="Routine Optimization"
                            description="Get suggestions on timing and dosage to maximize the efficacy of your supplements and habits."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-emerald-400" />}
                            title="Privacy First"
                            description="Your health data is sensitive. We ensure local-first options and secure cloud synchronization."
                        />
                        <FeatureCard
                            icon={<Activity className="w-6 h-6 text-rose-400" />}
                            title="Holistic Tracking"
                            description="Track supplements, wellness activities, sleep, and mood in one unified, cohesive interface."
                        />
                        <FeatureCard
                            icon={<User className="w-6 h-6 text-indigo-400" />}
                            title="Personalized Plans"
                            description="Create custom protocols tailored to your specific biology and longevity goals."
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-surface-base">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-md flex items-center justify-center opacity-75">
                            <Activity className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-semibold text-gray-400">BioScend</span>
                    </div>
                    <p>&copy; {new Date().getFullYear()} BioScend. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="p-6 rounded-2xl bg-surface-raised border border-white/5 hover:border-white/10 transition-all hover:bg-surface-raised/80 group">
        <div className="w-12 h-12 rounded-lg bg-surface-base flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/5">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed">
            {description}
        </p>
    </div>
);

export default Landing;
