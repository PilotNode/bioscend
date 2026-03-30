import React, { useState } from 'react';
import {
  FlaskConical, Plus, X, AlertTriangle, Sparkles,
  Search, CheckCircle2, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { useApp } from '../contexts/AppContext';

// ─── Interaction Checker Tool ─────────────────────────────────────────────────

const InteractionCheckerTool: React.FC = () => {
  const { state, checkInteractions } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [stack, setStack] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<{ warnings: any[]; synergies: any[] } | null>(null);
  const [autoScanBadge, setAutoScanBadge] = useState<string | null>(null);

  const handleAddSupplement = (e: React.FormEvent) => {
    e.preventDefault();
    const val = searchInput.trim();
    if (val && !stack.includes(val)) {
      setStack(prev => [...prev, val]);
      setSearchInput('');
      setResults(null);
    }
  };

  const handleRemove = (item: string) => {
    setStack(prev => prev.filter(s => s !== item));
    setResults(null);
  };

  const handleAutoScan = () => {
    const names = state.supplements.map((s: any) => s.name).filter(Boolean);
    if (names.length === 0) return;
    setStack(names);
    setResults(null);
    setAutoScanBadge(`Loaded ${names.length} supplement${names.length > 1 ? 's' : ''} from your profile`);
    setTimeout(() => setAutoScanBadge(null), 3000);
  };

  const handleScan = async () => {
    if (stack.length < 2) return;
    setIsScanning(true);
    setResults(null);
    try {
      const data = await checkInteractions(stack);
      setResults(data);
    } catch (err) {
      console.error('Interaction scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Builder */}
      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Build Your Stack</h3>
            {state.supplements.length > 0 && (
              <button
                onClick={handleAutoScan}
                className="flex items-center space-x-1.5 text-xs font-medium text-primary-400 hover:text-primary-300 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 rounded-lg px-3 py-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Auto-scan my stack</span>
              </button>
            )}
          </div>

          {autoScanBadge && (
            <div className="mb-4 flex items-center space-x-2 text-xs text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{autoScanBadge}</span>
            </div>
          )}

          <form onSubmit={handleAddSupplement} className="flex gap-2 mb-4">
            <div className="flex-1">
              <Input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="e.g., Iron, Calcium, Ashwagandha"
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <Button type="submit" variant="secondary" disabled={!searchInput.trim()}>
              <Plus className="w-5 h-5" />
            </Button>
          </form>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-400">Current Stack ({stack.length})</p>
            <div className="flex flex-wrap gap-2 min-h-[56px] p-3 bg-surface-raised rounded-xl border border-surface-overlay">
              {stack.length === 0 ? (
                <p className="text-sm text-gray-500 italic w-full text-center my-auto">
                  Add supplements manually or auto-scan your profile.
                </p>
              ) : (
                stack.map((item, i) => (
                  <span
                    key={i}
                    className="flex items-center space-x-1.5 bg-surface-elevated border border-primary-500/30 text-white px-3 py-1 rounded-full text-sm"
                  >
                    <span>{item}</span>
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-gray-400 hover:text-white transition-colors ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="mt-5">
            <Button
              onClick={handleScan}
              className="w-full shadow-glow"
              size="lg"
              loading={isScanning}
              disabled={stack.length < 2 || isScanning}
            >
              Scan for Interactions
            </Button>
            {stack.length < 2 && (
              <p className="text-xs text-center text-gray-500 mt-2">Need at least 2 supplements</p>
            )}
          </div>
        </Card>
      </div>

      {/* Results */}
      <div>
        {results ? (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-semibold text-white">Scan Results</h3>

            {results.warnings.length === 0 && results.synergies.length === 0 && (
              <Card className="border-green-500/30 bg-green-500/5 flex items-center p-5">
                <CheckCircle2 className="w-7 h-7 text-green-500 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium">Clear to go!</h4>
                  <p className="text-gray-400 text-sm mt-0.5">No major interactions found in this stack.</p>
                </div>
              </Card>
            )}

            {results.warnings.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-error flex items-center uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Warnings
                </p>
                {results.warnings.map((w, i) => (
                  <Card key={i} className="border-error/30 bg-error/5 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-error rounded-l-xl" />
                    <div className="pl-3">
                      <h4 className="text-white font-medium mb-1">{w.title}</h4>
                      <p className="text-sm text-gray-300">{w.description}</p>
                      {w.severity && (
                        <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-error/20 text-error capitalize border border-error/20">
                          {w.severity} Severity
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {results.synergies.length > 0 && (
              <div className="space-y-3 mt-4">
                <p className="text-xs font-semibold text-primary-400 flex items-center uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Synergies
                </p>
                {results.synergies.map((s, i) => (
                  <Card key={i} className="border-primary-500/30 bg-primary-500/5 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-l-xl" />
                    <div className="pl-3">
                      <h4 className="text-white font-medium mb-1">{s.title}</h4>
                      <p className="text-sm text-gray-300">{s.description}</p>
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 capitalize border border-primary-500/20">
                        {s.impact || 'Positive'} Synergy
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-surface-overlay rounded-2xl min-h-[280px]">
            <div className="text-center w-full max-w-xs">
              <FlaskConical className="w-14 h-14 text-surface-overlay mx-auto mb-4" />
              <h3 className="text-base font-medium text-gray-400">Results will appear here</h3>
              <p className="text-sm text-gray-500 mt-2">Build your stack and run a scan.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Tool Card Wrapper (expandable section) ───────────────────────────────────

interface ToolSectionProps {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const ToolSection: React.FC<ToolSectionProps> = ({
  icon: Icon,
  title,
  description,
  badge,
  badgeColor = 'bg-primary-500/20 text-primary-400 border-primary-500/20',
  defaultOpen = false,
  children
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-surface-elevated rounded-2xl border border-surface-raised overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-surface-raised/50 transition-colors group"
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/20 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-400" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-white">{title}</h3>
              {badge && (
                <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-0.5">{description}</p>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors flex-shrink-0" />
        }
      </button>

      {open && (
        <div className="border-t border-surface-raised p-5">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Analysis Page ────────────────────────────────────────────────────────────

const Analysis: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <span>Analysis</span>
        </h1>
        <p className="text-gray-400 mt-1">AI-powered tools to understand and optimise your supplement stack.</p>
      </div>

      {/* Tools */}
      <div className="space-y-4">
        <ToolSection
          icon={AlertTriangle}
          title="Interaction Checker"
          description="Detect conflicts and synergies within your supplement stack."
          badge="AI"
          defaultOpen
        >
          <InteractionCheckerTool />
        </ToolSection>

        {/* Placeholder for future tools — easy to extend */}
        <div className="bg-surface-elevated/50 rounded-2xl border border-dashed border-surface-raised p-5 flex items-center space-x-4 opacity-50">
          <div className="w-10 h-10 bg-surface-raised rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400">More tools coming soon</h3>
            <p className="text-xs text-gray-500 mt-0.5">Bioavailability analysis, timing optimiser, and more.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
