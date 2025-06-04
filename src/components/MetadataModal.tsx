import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { generateMetadata } from '../services/openai';

interface MetadataSidebarProps {
  word: string | null;
  metadata: string[];
  onSave: (metadata: string[]) => void;
  connectedWords?: Array<{ word: string; sharedKeywords: string[] }>;
}

export const MetadataSidebar: React.FC<MetadataSidebarProps> = ({
  word,
  metadata,
  onSave,
  connectedWords = []
}) => {
  const [keywords, setKeywords] = useState<string>(metadata.join(', '));
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setKeywords(metadata.join(', '));
  }, [word, metadata]);

  const handleSave = () => {
    const newMetadata = keywords
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0);
    onSave(newMetadata);
  };

  const handleRegenerateMetadata = async () => {
    if (!word) return;
    
    setIsGenerating(true);
    try {
      const newMetadata = await generateMetadata(word);
      if (newMetadata.length > 0) {
        setKeywords(newMetadata.join(', '));
        onSave(newMetadata);
      }
    } catch (error) {
      console.error('Error regenerating metadata:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!word) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 p-6">
        <p className="text-gray-400">Select a node to edit its metadata</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">Metadata for "{word}"</h2>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-200">
            Keywords (comma-separated)
          </label>
          <button
            onClick={handleRegenerateMetadata}
            disabled={isGenerating}
            className="flex items-center space-x-1 px-2 py-1 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
        <textarea
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 mb-2"
          rows={4}
          placeholder="Enter keywords separated by commas..."
        />
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500"
        >
          Save
        </button>
      </div>

      {connectedWords.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Connected Words</h3>
          <div className="space-y-3">
            {connectedWords.map(({ word: connectedWord, sharedKeywords }) => (
              <div key={connectedWord} className="bg-gray-700 rounded-lg p-3">
                <div className="text-cyan-400 font-medium">{connectedWord}</div>
                <div className="text-sm text-gray-300 mt-1">
                  Shared keywords: {sharedKeywords.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};