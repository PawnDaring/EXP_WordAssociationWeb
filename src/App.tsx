import React, { useState, useEffect } from 'react';
import { Brain, Search, AlertCircle } from 'lucide-react';
import { Graph } from './components/Graph';
import { MetadataSidebar } from './components/MetadataModal';
import { VisualizationControls } from './components/VisualizationControls';
import { wordAssociations } from './wordData';
import { GraphData, WordNode, WordLink } from './types';
import { generateMetadata } from './services/openai';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });
  const [selectedNode, setSelectedNode] = useState<WordNode | null>(null);
  const [nodeMetadata, setNodeMetadata] = useState<Record<string, string[]>>(
    {}
  );
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Visualization settings
  const [keywordSize, setKeywordSize] = useState(12);
  const [associationOpacity, setAssociationOpacity] = useState(0.6);

  const findSharedKeywords = (word1: string, word2: string): string[] => {
    const metadata1 = nodeMetadata[word1] || [];
    const metadata2 = nodeMetadata[word2] || [];
    return metadata1.filter((keyword) => metadata2.includes(keyword));
  };

  const getConnectedWords = (word: string) => {
    const connections: Array<{ word: string; sharedKeywords: string[] }> = [];
    selectedWords.forEach((otherWord) => {
      if (word !== otherWord) {
        const sharedKeywords = findSharedKeywords(word, otherWord);
        if (sharedKeywords.length > 0) {
          connections.push({ word: otherWord, sharedKeywords });
        }
      }
    });
    return connections;
  };

  const generateGraphData = (words: string[]) => {
    const nodes: WordNode[] = [];
    const links: WordLink[] = [];
    const processedPairs = new Set<string>();

    words.forEach((word, index) => {
      nodes.push({
        id: word,
        group: index,
        metadata: nodeMetadata[word] || [],
      });

      const associations = wordAssociations[word] || [];
      associations.forEach((assoc) => {
        nodes.push({
          id: assoc,
          group: index,
          metadata: nodeMetadata[assoc] || [],
        });
        links.push({
          source: word,
          target: assoc,
          value: 1,
          relationship: 'association',
        });
      });

      words.forEach((otherWord) => {
        if (word !== otherWord) {
          const pairKey = [word, otherWord].sort().join('-');
          if (!processedPairs.has(pairKey)) {
            const sharedKeywords = findSharedKeywords(word, otherWord);
            if (sharedKeywords.length > 0) {
              links.push({
                source: word,
                target: otherWord,
                value: 2,
                relationship: `Shared: ${sharedKeywords.join(', ')}`,
                sharedKeywords,
              });
            }
            processedPairs.add(pairKey);
          }
        }
      });
    });

    const uniqueNodes = Array.from(
      new Map(nodes.map((node) => [node.id, node])).values()
    );

    setGraphData({ nodes: uniqueNodes, links });
  };

  useEffect(() => {
    if (selectedWords.length > 0) {
      generateGraphData(selectedWords);
    }
  }, [selectedWords, nodeMetadata]);

  const handleAddWord = async () => {
    if (searchTerm && !selectedWords.includes(searchTerm)) {
      setError(null);
      const newWord = searchTerm.toLowerCase().trim();
      setSelectedWords((prev) => [...prev, newWord]);
      setIsLoading((prev) => ({ ...prev, [newWord]: true }));
      setSearchTerm('');

      try {
        const metadata = await generateMetadata(newWord);
        if (metadata.length > 0) {
          setNodeMetadata((prev) => ({
            ...prev,
            [newWord]: metadata,
          }));
        } else {
          throw new Error('Failed to generate metadata');
        }
      } catch (error) {
        console.error('Error generating metadata:', error);
        setError('Failed to generate metadata.');
        setSelectedWords((prev) => prev.filter((w) => w !== newWord));
      } finally {
        setIsLoading((prev) => ({ ...prev, [newWord]: false }));
      }
    }
  };

  const handleRemoveWord = (word: string) => {
    setSelectedWords(selectedWords.filter((w) => w !== word));
    const newMetadata = { ...nodeMetadata };
    delete newMetadata[word];
    setNodeMetadata(newMetadata);
    if (selectedNode?.id === word) {
      setSelectedNode(null);
    }
  };

  const handleNodeClick = (node: WordNode) => {
    setSelectedNode(node);
  };

  const handleSaveMetadata = (metadata: string[]) => {
    if (selectedNode) {
      setNodeMetadata((prev) => ({
        ...prev,
        [selectedNode.id]: metadata,
      }));
    }
  };


  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">
              Drop a Thought and see how ideas connect!
            </h1>
          </div>
        </div>
      </header>

      <main className="flex h-[calc(100vh-73px)]">
        <div className="flex-1 p-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
                    placeholder="Enter a word..."
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleAddWord}
                    className="absolute right-2 top-2 text-gray-400 hover:text-cyan-400"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
                {error && (
                  <div className="mt-2 flex items-center gap-2 text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedWords.map((word) => (
                <span
                  key={word}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-900 text-cyan-100"
                >
                  {word}
                  {isLoading[word] && (
                    <span className="ml-2 animate-pulse">...</span>
                  )}
                  <button
                    onClick={() => handleRemoveWord(word)}
                    className="ml-2 inline-flex items-center p-0.5 rounded-full text-cyan-200 hover:bg-cyan-800 hover:text-cyan-100 focus:outline-none"
                  >
                    <span className="sr-only">Remove</span>×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 h-[calc(100%-130px)] relative">
            {selectedWords.length > 0 ? (
              <Graph
                data={graphData}
                width={800}
                height={600}
                onNodeClick={handleNodeClick}
                keywordSize={keywordSize}
                associationOpacity={associationOpacity}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Enter words above to explore their associations
              </div>
            )}

            <VisualizationControls
              keywordSize={keywordSize}
              setKeywordSize={setKeywordSize}
              associationOpacity={associationOpacity}
              setAssociationOpacity={setAssociationOpacity}
            />
          </div>
        </div>

        <MetadataSidebar
          word={selectedNode?.id || null}
          metadata={selectedNode ? nodeMetadata[selectedNode.id] || [] : []}
          onSave={handleSaveMetadata}
          connectedWords={
            selectedNode ? getConnectedWords(selectedNode.id) : []
          }
        />
      </main>
    </div>
  );
}

export default App;
