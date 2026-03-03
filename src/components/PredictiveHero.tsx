import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWellness } from "@/context/WellnessContext";
import { useTheme } from "@/context/useTheme";
import { motion, AnimatePresence } from "framer-motion";

interface NodeTerm {
  id: string;
  name: string;
  group: number;
  summary?: string;
  links?: { title: string; url: string }[];
}

interface Cluster {
  group: number;
  name: string;
  nodes: NodeTerm[];
}

interface Summary {
  summary?: string;
  links?: { title: string; url: string }[];
}

const PredictiveHero: React.FC = () => {
  const { mode } = useWellness();
  const { theme } = useTheme();
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<NodeTerm[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<NodeTerm | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [summaryMap, setSummaryMap] = useState<Record<string, Summary>>({});

  // Data loading
  useEffect(() => {
    async function fetchData() {
      const [dataRes, summariesRes] = await Promise.all([
        fetch("/digital-wellness-data.json"),
        fetch("/digital-wellness-summaries.json"),
      ]);
      const dataJson = await dataRes.json();
      const nodes: NodeTerm[] = Array.isArray(dataJson.nodes) ? dataJson.nodes : [];
      setClusters(
        Object.values(
          nodes.reduce((acc, node) => {
            if (!acc[node.group]) acc[node.group] = { group: node.group, name: node.name, nodes: [] };
            acc[node.group].nodes.push(node);
            return acc;
          }, {} as Record<number, Cluster>)
        )
      );
      const summariesRaw = await summariesRes.json();
      let summaryMap: Record<string, Summary> = {};
      if (summariesRaw && typeof summariesRaw === 'object' && !Array.isArray(summariesRaw)) {
        summaryMap = Object.fromEntries(
          Object.entries(summariesRaw).map(([name, s]) => {
            const entry = s as { summary?: string; links?: { title: string; url: string }[] };
            return [name, { summary: entry.summary, links: entry.links }];
          })
        );
      } else if (Array.isArray(summariesRaw)) {
        summaryMap = Object.fromEntries(
          summariesRaw.map((s) => [s.id, { summary: s.summary, links: s.links }])
        );
      }
      setSummaryMap(summaryMap);
    }
    fetchData();
  }, []);

  const allNodeTerms: NodeTerm[] = React.useMemo(() => {
    return clusters.flatMap((c) => c.nodes);
  }, [clusters]);

  useEffect(() => {
    if (input.length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const filtered = allNodeTerms.filter((t) =>
      typeof t.name === 'string' && t.name.toLowerCase().includes(input.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 8));
    setShowDropdown(filtered.length > 0);
    setHighlighted(-1);
  }, [input, allNodeTerms]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setSelectedCluster(null);
    const match = allNodeTerms.find((t) => t.name.toLowerCase() === value.trim().toLowerCase());
    if (match) {
      setSelectedTerm(match);
    } else {
      setSelectedTerm(null);
    }
  };

  const handleSelect = (term: NodeTerm) => {
    setInput(term.name);
    setSelectedTerm(term);
    setSelectedCluster(null);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0) {
      handleSelect(suggestions[highlighted]);
    }
  };

  // Filter clusters based on mode
  const filteredClusters = React.useMemo(() => {
    if (mode === 'child') {
      return clusters.filter(c => [0, 2, 3, 9, 10].includes(c.group));
    } else if (mode === 'parent') {
      return clusters.filter(c => [0, 1, 4, 5, 6, 7, 8].includes(c.group));
    }
    return clusters; // 'family' mode shows all
  }, [clusters, mode]);

  const digitalWellnessCluster = filteredClusters.find(c => c.group === 0);
  const otherClusters = filteredClusters.filter(c => c.group !== 0);

  // Updated color palette: slightly darker for light mode, vibrant for dark mode
  const clusterColors = [
    'var(--chart-1, #0891b2)', 
    'var(--chart-2, #059669)', 
    'var(--chart-3, #7c3aed)', 
    '#db2777', 
    '#2563eb', 
    '#4f46e5', 
    '#9333ea', 
    '#0d9488', 
    '#e11d48', 
    '#0284c7', 
  ];

  const getClusterColor = (idx: number) => {
    // High-contrast legible colors for light mode (Darker tones)
    const lightColors = ['#0891b2', '#059669', '#7c3aed', '#db2777', '#2563eb', '#4f46e5', '#9333ea', '#0d9488', '#e11d48', '#0284c7'];
    // Vibrant, high-visibility colors for dark mode (Brighter tones)
    const darkColors = ['#22d3ee', '#34d399', '#a78bfa', '#f472b6', '#60a5fa', '#818cf8', '#c084fc', '#2dd4bf', '#fb7185', '#38bdf8'];
    
    const isDark = theme === 'dark' || mode === 'child';
    return isDark ? darkColors[idx % 10] : lightColors[idx % 10];
  };

  const renderAllClustersView = () => (
    <div className="flex flex-col gap-12 p-8 max-w-7xl mx-auto">
      {/* Search Input in its own row/center */}
      <div className="w-full">
        <div className="relative w-full max-w-3xl mx-auto">
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={`Search for a ${mode === 'child' ? 'game or topic' : 'resource'}...`}
            className="text-2xl px-10 py-8 rounded-full shadow-[0_0_40px_rgba(79,209,197,0.2)] border-2 border-[#4FD1C5]/30 focus:border-[#4FD1C5] focus:shadow-[0_0_60px_rgba(79,209,197,0.4)] bg-white/40 dark:bg-black/40 backdrop-blur-md transition-all duration-300 text-foreground placeholder:text-muted-foreground font-bold"
            autoComplete="off"
          />
          {showDropdown && suggestions.length > 0 && (
             <div className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-slate-900 border border-border rounded-3xl shadow-2xl z-50 overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={s.id}
                    className={cn(
                      "w-full text-left px-8 py-4 hover:bg-muted transition-colors text-lg font-bold text-foreground",
                      highlighted === i && "bg-muted"
                    )}
                    onClick={() => handleSelect(s)}
                  >
                    {s.name}
                  </button>
                ))}
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-1 lg:col-span-1 flex justify-center items-center">
          {otherClusters[0] && (
              <button
                key={otherClusters[0].group}
                className="w-full h-full min-h-[90px] p-4 rounded-[1.5rem] shadow-lg border-2 border-white/10 text-foreground font-black text-lg transition-all duration-300 hover:scale-105 backdrop-blur-md bg-white/5 dark:bg-black/20 flex items-center justify-center text-center"
                style={{ borderColor: getClusterColor(0), color: getClusterColor(0) }}
                onClick={() => setSelectedCluster(otherClusters[0])}
              >
                {otherClusters[0].name}
              </button>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2 flex justify-center items-center">
          {digitalWellnessCluster && (
              <button
                key={digitalWellnessCluster.group}
                className="w-full py-6 px-6 rounded-[2rem] shadow-[0_0_40px_rgba(79,209,197,0.3)] bg-gradient-to-br from-[#4FD1C5] to-[#38B2AC] text-white text-2xl font-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(79,209,197,0.5)] focus:outline-none ring-offset-background focus:ring-4 focus:ring-[#4FD1C5] border-2 border-white/30 flex items-center justify-center text-center"
                onClick={() => {
                  const digitalWellnessTerm = allNodeTerms.find(t => t.name === "Digital Wellness");
                  if (digitalWellnessTerm) {
                    setSelectedTerm(digitalWellnessTerm);
                  }
                }}
              >
                {digitalWellnessCluster.name}
              </button>
          )}
        </div>

        <div className="col-span-1 lg:col-span-1 flex justify-center items-center">
          {otherClusters[1] && (
              <button
                key={otherClusters[1].group}
                className="w-full h-full min-h-[90px] p-4 rounded-[1.5rem] shadow-lg border-2 border-white/10 text-foreground font-black text-lg transition-all duration-300 hover:scale-105 backdrop-blur-md bg-white/5 dark:bg-black/20 flex items-center justify-center text-center"
                style={{ borderColor: getClusterColor(1), color: getClusterColor(1) }}
                onClick={() => setSelectedCluster(otherClusters[1])}
              >
                {otherClusters[1].name}
              </button>
          )}
        </div>

        {otherClusters.slice(2).map((cluster, idx) => (
           <div key={cluster.group} className="col-span-1 flex justify-center items-center">
              <button
                className="w-full h-full min-h-[90px] p-4 rounded-[1.5rem] shadow-lg border-2 border-white/10 text-foreground font-black text-lg transition-all duration-300 hover:scale-105 backdrop-blur-md bg-white/5 dark:bg-black/20 flex items-center justify-center text-center"
                style={{ borderColor: getClusterColor(idx + 2), color: getClusterColor(idx + 2) }}
                onClick={() => setSelectedCluster(cluster)}
              >
                {cluster.name}
              </button>
           </div>
        ))}
      </div>
    </div>
  );

  const renderSingleClusterView = () => {
    if (!selectedCluster) return null;

    const clusterIdx = otherClusters.findIndex(c => c.group === selectedCluster.group);
    const clusterColor = getClusterColor(clusterIdx === -1 ? 0 : clusterIdx);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full py-12 px-8 z-20 backdrop-blur-xl bg-white/20 dark:bg-black/20 rounded-[4rem] border-2 border-border"
      >
        <button 
          className="mb-8 hover:underline flex items-center gap-3 mx-auto font-black text-xl transition-colors"
          style={{ color: clusterColor }}
          onClick={() => setSelectedCluster(null)}
        >
          <span className="text-2xl">←</span> Back to All Topics
        </button>
        <h2 className="text-4xl md:text-6xl font-black mb-12 text-center drop-shadow-md tracking-tighter" style={{ color: clusterColor }}>{selectedCluster.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {selectedCluster.nodes.map((node) => (
            <button
              key={node.id}
              className="px-6 py-4 rounded-[1.2rem] shadow-md text-lg font-black transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 backdrop-blur-md bg-white/60 dark:bg-black/40 border-2 flex items-center justify-center text-center leading-tight"
              style={{ color: clusterColor, borderColor: `${clusterColor}80` }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(node);
              }}
            >
              {node.name}
            </button>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-[90vh] bg-transparent py-16 relative w-full overflow-hidden">
      <div className="w-full max-w-6xl mx-auto text-center relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           key={mode}
           className="mb-12"
        >
          <h1 className="text-6xl md:text-7xl font-black text-foreground mb-4 tracking-tighter">
             {mode === 'child' ? 'Explore the Digital World! 🚀' : mode === 'parent' ? 'Family Protection Hub' : 'Digital Wellness Reimagined'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
             {mode === 'child' ? 'Learn how to stay safe and have fun online with our interactive guide.' : mode === 'parent' ? 'Expert tools and resources to manage your family\'s digital life safely.' : 'A modern, immersive approach to family digital well-being and safety.'}
          </p>
        </motion.div>

        {selectedTerm ? (
          (() => {
            const summary = summaryMap[selectedTerm.name];
            return (
              <div
                className="w-screen h-screen bg-black/60 flex items-center justify-center z-[100] fixed left-0 top-0 backdrop-blur-md"
                onClick={() => {
                  setSelectedTerm(null);
                  setInput("");
                }}
              >
                <Card
                  className="p-10 text-left shadow-2xl border-2 border-[#4FD1C5]/30 relative z-[101] max-w-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] text-foreground max-h-[90vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-4xl font-black mb-6 text-foreground tracking-tight">{selectedTerm.name}</h3>
                  {summary?.summary ? (
                    <p className="mb-8 text-foreground text-xl leading-relaxed font-medium">{summary.summary}</p>
                  ) : (
                    <p className="mb-8 text-muted-foreground text-xl italic font-medium">Detailed information for this topic is coming soon!</p>
                  )}
                  {summary?.links && summary.links.length > 0 ? (
                    <div>
                      <h4 className="font-bold mb-4 text-xl text-foreground">Next Steps:</h4>
                      <ul className="space-y-3">
                        {summary.links.map((l, idx) => (
                          <li key={idx}>
                            <a 
                              href={l.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="hover:opacity-80 font-bold text-lg flex items-center gap-2 transition-colors"
                              style={{ color: getClusterColor(0) }}
                            >
                               <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getClusterColor(0) }} /> {l.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                       <p className="font-bold" style={{ color: getClusterColor(0) }}>Ask the Wellness Companion for more tips on this!</p>
                    </div>
                  )}
                  <button 
                    className="absolute top-6 right-6 text-muted-foreground hover:text-foreground p-2"
                    onClick={() => setSelectedTerm(null)}
                  >
                    ✕
                  </button>
                </Card>
              </div>
            );
          })()
        ) : selectedCluster ? (
          renderSingleClusterView()
        ) : (
          renderAllClustersView()
        )}
      </div>
    </section>
  );
};

export default PredictiveHero;