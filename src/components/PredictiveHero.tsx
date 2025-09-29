import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// TypeScript interfaces
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

  const digitalWellnessCluster = clusters.find(c => c.group === 0);
  const otherClusters = clusters.filter(c => c.group !== 0);

  const clusterColors = [
    '#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC',
    '#00ACC1', '#FF7043', '#9E9D24', '#5C6BC0', '#8E24AA',
  ];

  const renderAllClustersView = () => (
    <div className="grid grid-cols-3 gap-8 p-8 items-center">
      <div className="col-span-1 flex justify-center items-center">
        {otherClusters[0] && (
            <button
              key={otherClusters[0].group}
              className="p-6 rounded-2xl shadow-lg text-white font-semibold text-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4"
              style={{ backgroundColor: clusterColors[0] }}
              onClick={() => setSelectedCluster(otherClusters[0])}
            >
              {otherClusters[0].name}
            </button>
        )}
      </div>
      <div className="col-span-1 flex justify-center items-center">
        {digitalWellnessCluster && (
            <button
              key={digitalWellnessCluster.group}
              className="px-8 py-4 rounded-full shadow-lg bg-white text-2xl font-bold text-gray-800 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 border-4 border-blue-500"
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
      <div className="col-span-1 flex justify-center items-center">
        {otherClusters[1] && (
            <button
              key={otherClusters[1].group}
              className="p-6 rounded-2xl shadow-lg text-white font-semibold text-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4"
              style={{ backgroundColor: clusterColors[1] }}
              onClick={() => setSelectedCluster(otherClusters[1])}
            >
              {otherClusters[1].name}
            </button>
        )}
      </div>

      <div className="col-span-1 flex justify-center items-center">
        {otherClusters[2] && (
            <button
              key={otherClusters[2].group}
              className="p-6 rounded-2xl shadow-lg text-white font-semibold text-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4"
              style={{ backgroundColor: clusterColors[2] }}
              onClick={() => setSelectedCluster(otherClusters[2])}
            >
              {otherClusters[2].name}
            </button>
        )}
      </div>
      <div className="relative w-full max-w-2xl mx-auto col-span-1">
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Search for a topic..."
            className="text-xl px-8 py-5 rounded-full shadow-lg border-2 border-gray-200 focus:border-blue-500 bg-transparent transition-all duration-300"
            autoComplete="off"
          />
        </div>
        <div className="col-span-1 flex justify-center items-center">
        {otherClusters[3] && (
            <button
              key={otherClusters[3].group}
              className="p-6 rounded-2xl shadow-lg text-white font-semibold text-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4"
              style={{ backgroundColor: clusterColors[3] }}
              onClick={() => setSelectedCluster(otherClusters[3])}
            >
              {otherClusters[3].name}
            </button>
        )}
      </div>

      <div className="col-span-1 flex justify-center items-center">
        {otherClusters[4] && (
            <button
              key={otherClusters[4].group}
              className="p-6 rounded-2xl shadow-lg text-white font-semibold text-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4"
              style={{ backgroundColor: clusterColors[4] }}
              onClick={() => setSelectedCluster(otherClusters[4])}
            >
              {otherClusters[4].name}
            </button>
        )}
      </div>
      <div className="col-span-1 flex justify-center items-center">
        {otherClusters[5] && (
            <button
              key={otherClusters[5].group}
              className="p-6 rounded-2xl shadow-lg text-white font-semibold text-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4"
              style={{ backgroundColor: clusterColors[5] }}
              onClick={() => setSelectedCluster(otherClusters[5])}
            >
              {otherClusters[5].name}
            </button>
        )}
      </div>
      <div className="col-span-1 flex justify-center items-center">
        {otherClusters[6] && (
            <button
              key={otherClusters[6].group}
              className="p-6 rounded-2xl shadow-lg text-white font-semibold text-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4"
              style={{ backgroundColor: clusterColors[6] }}
              onClick={() => setSelectedCluster(otherClusters[6])}
            >
              {otherClusters[6].name}
            </button>
        )}
      </div>
      <div className="col-span-1 flex justify-center items-center">
        {otherClusters[7] && (
            <button
              key={otherClusters[7].group}
              className="p-6 rounded-2xl shadow-lg text-white font-semibold text-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4"
              style={{ backgroundColor: clusterColors[7] }}
              onClick={() => setSelectedCluster(otherClusters[7])}
            >
              {otherClusters[7].name}
            </button>
        )}
      </div>
      <div className="col-span-1 flex justify-center items-center">
        {otherClusters[8] && (
            <button
              key={otherClusters[8].group}
              className="p-6 rounded-2xl shadow-lg text-white font-semibold text-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4"
              style={{ backgroundColor: clusterColors[8] }}
              onClick={() => setSelectedCluster(otherClusters[8])}
            >
              {otherClusters[8].name}
            </button>
        )}
      </div>
      <div className="col-span-1 flex justify-center items-center">
        {otherClusters[9] && (
            <button
              key={otherClusters[9].group}
              className="p-6 rounded-2xl shadow-lg text-white font-semibold text-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4"
              style={{ backgroundColor: clusterColors[9] }}
              onClick={() => setSelectedCluster(otherClusters[9])}
            >
              {otherClusters[9].name}
            </button>
        )}
      </div>
    </div>
  );

  const renderSingleClusterView = () => {
    if (!selectedCluster) return null;

    const clusterColor = clusterColors[otherClusters.findIndex(c => c.group === selectedCluster.group) % clusterColors.length];

    return (
      <div className="w-full min-h-full p-8 absolute inset-0 pt-24 overflow-y-auto" onClick={() => setSelectedCluster(null)}>
        <h2 className="text-5xl font-bold text-gray-800 mb-12 text-center">{selectedCluster.name}</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {selectedCluster.nodes.map((node) => (
            <button
              key={node.id}
              className="px-5 py-3 rounded-lg shadow-md text-base font-medium transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'white', color: clusterColor, border: `2px solid ${clusterColor}` }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(node);
              }}
            >
              {node.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-[90vh] bg-transparent py-16 relative w-full">
      <div className="w-full max-w-6xl mx-auto text-center">
        {selectedTerm ? (
          (() => {
            const summary = summaryMap[selectedTerm.name];
            return (
              <div
                className="w-screen h-screen bg-black bg-opacity-25 flex items-center justify-center z-30 fixed left-0 top-0"
                onClick={() => {
                  if (selectedTerm?.name === "Digital Wellness") {
                    setSelectedCluster(null);
                  } else {
                    const parentCluster = clusters.find(c => c.nodes.some(n => n.id === selectedTerm.id));
                    setSelectedCluster(parentCluster || null);
                  }
                  setSelectedTerm(null);
                  setInput("");
                }}
              >
                <Card
                  className="p-8 text-left shadow-2xl border-2 border-gray-200 relative z-30 max-w-3xl bg-transparent rounded-2xl"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-3xl font-bold mb-4">{selectedTerm.name}</h3>
                  {summary?.summary ? (
                    <p className="mb-6 text-gray-700 text-lg leading-relaxed">{summary.summary}</p>
                  ) : (
                    <p className="mb-6 text-gray-500 text-lg italic">No summary available for this term.</p>
                  )}
                  {summary?.links && summary.links.length > 0 ? (
                    <div>
                      <h4 className="font-semibold mb-3 text-lg">Related Links:</h4>
                      <ul className="list-disc pl-6 space-y-2">
                        {summary.links.map((l, idx) => (
                          <li key={idx}>
                            <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-lg">{l.title}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No related links.</p>
                  )}
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