import React from 'react';
import { Settings } from 'lucide-react';

interface VisualizationControlsProps {
  keywordSize: number;
  setKeywordSize: (size: number) => void;
  associationOpacity: number;
  setAssociationOpacity: (opacity: number) => void;
}

export const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  keywordSize,
  setKeywordSize,
  associationOpacity,
  setAssociationOpacity,
}) => {
  return (
    <div className="absolute bottom-6 right-6 bg-gray-800 border border-gray-700 rounded-lg p-4 w-72">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-cyan-400" />
        <h3 className="text-white font-semibold">Visualization Settings</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Keyword Size: {keywordSize}px
          </label>
          <input
            type="range"
            min="8"
            max="24"
            value={keywordSize}
            onChange={(e) => setKeywordSize(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Association Opacity: {Math.round(associationOpacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={associationOpacity * 100}
            onChange={(e) => setAssociationOpacity(Number(e.target.value) / 100)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

      </div>
    </div>
  );
};