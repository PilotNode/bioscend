import React, { useState } from 'react';
import { Activity, Plus, X, AlertTriangle, Sparkles, Search, CheckCircle2 } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { useApp } from '../contexts/AppContext';

const InteractionChecker: React.FC = () => {
  const { checkInteractions } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [stack, setStack] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<{ warnings: any[], synergies: any[] } | null>(null);

  const handleAddSupplement = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim() && !stack.includes(searchInput.trim())) {
      setStack([...stack, searchInput.trim()]);
      setSearchInput('');
      setResults(null); // Clear previous results when stack changes
    }
  };

  const handleRemoveSupplement = (itemToRemove: string) => {
    setStack(stack.filter(item => item !== itemToRemove));
    setResults(null); // Clear previous results when stack changes
  };

  const handleScan = async () => {
    if (stack.length < 2) return;
    setIsScanning(true);
    setResults(null);
    try {
      const data = await checkInteractions(stack);
      setResults(data);
    } catch (error) {
      console.error("Error scanning interactions:", error);
      // In a real app we might show a toast here
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Activity className="w-6 h-6 mr-2 text-primary-500" />
          Interaction Checker
        </h1>
        <p className="text-gray-400 mt-1">Check your supplement stack for synergies and conflicts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interaction Builder Area */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">Build Your Stack</h2>
            
            <form onSubmit={handleAddSupplement} className="flex gap-2 mb-6">
              <div className="flex-1">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g., Iron, Calcium, Ashwagandha"
                  icon={<Search className="w-5 h-5" />}
                />
              </div>
              <Button type="submit" variant="secondary" disabled={!searchInput.trim()}>
                <Plus className="w-5 h-5" />
              </Button>
            </form>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400">Current Stack ({stack.length})</h3>
              <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-surface-raised rounded-xl border border-surface-overlay">
                {stack.length === 0 ? (
                  <p className="text-sm text-gray-500 italic w-full text-center my-auto">
                    Add at least two supplements to check interactions.
                  </p>
                ) : (
                  stack.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-2 bg-surface-elevated border border-primary-500/30 text-white px-3 py-1.5 rounded-full text-sm"
                    >
                      <span>{item}</span>
                      <button 
                        onClick={() => handleRemoveSupplement(item)}
                        className="text-gray-400 hover:text-white transition-colors ml-1 focus:outline-none"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-8">
              <Button 
                onClick={handleScan} 
                className="w-full text-lg shadow-glow" 
                size="lg" 
                loading={isScanning}
                disabled={stack.length < 2 || isScanning}
              >
                Scan for Interactions
              </Button>
              {stack.length < 2 && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Need at least 2 supplements to scan
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Results Area */}
        <div>
          {results ? (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-semibold text-white mb-4">Scan Results</h2>
              
              {results.warnings.length === 0 && results.synergies.length === 0 ? (
                <Card className="border-green-500/30 bg-green-500/5 flex items-center p-6">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mr-4" />
                  <div>
                    <h3 className="text-white font-medium text-lg">Clear to go!</h3>
                    <p className="text-gray-400 text-sm mt-1">No major interactions or conflicts found in this stack.</p>
                  </div>
                </Card>
              ) : null}

              {results.warnings.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-error flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" /> Warnings
                  </h3>
                  {results.warnings.map((warning, index) => (
                    <Card key={index} className="border-error/30 bg-error/5 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
                      <div className="pl-3">
                        <h4 className="text-white font-medium mb-1">{warning.title}</h4>
                        <p className="text-sm text-gray-300">{warning.description}</p>
                        {warning.severity && (
                          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-error/20 text-error capitalize border border-error/20">
                            {warning.severity} Severity
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {results.synergies.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="text-sm font-medium text-primary-400 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" /> Synergies
                  </h3>
                  {results.synergies.map((synergy, index) => (
                    <Card key={index} className="border-primary-500/30 bg-primary-500/5 relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>
                       <div className="pl-3">
                        <h4 className="text-white font-medium mb-1">{synergy.title}</h4>
                        <p className="text-sm text-gray-300">{synergy.description}</p>
                        <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 capitalize border border-primary-500/20">
                          {synergy.impact || "Positive"} Synergy
                        </span>
                       </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-surface-overlay rounded-2xl">
              <div className="text-center w-full max-w-sm">
                <Activity className="w-16 h-16 text-surface-overlay mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400">Scan Results will appear here</h3>
                <p className="text-sm text-gray-500 mt-2">Add supplements and run a scan to see how they interact.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractionChecker;
