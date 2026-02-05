import React, { useRef, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Button } from '../UI/Button';
import { Save, Trash2, Download, Upload, X, Bug, FileJson, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { saveGame, resetGame, exportSave, importSave, debugForceYear } = useGame();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state to handle the "Are you sure?" confirmation button logic
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    saveGame();
    alert("Game saved successfully to Local Storage!");
  };

  const handleDownloadSave = () => {
      const data = exportSave();
      if (!data) {
          alert("Failed to generate save data.");
          return;
      }
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `auto_tycoon_backup_${new Date().toISOString().split('T')[0]}.json`; // Format: auto_tycoon_backup_2023-10-27.json
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const handleTriggerUpload = () => {
      fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          if (event.target?.result) {
              const content = event.target.result as string;
              const success = importSave(content);
              
              if (success) {
                  // Alert blocks thread, ensuring file read is done and user acknowledges
                  alert("Backup restored successfully! Press OK to restart.");
                  window.location.reload();
              } else {
                  alert("Failed to import save file. It may be corrupted or from an incompatible version.");
              }
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-md flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                System Options
            </h2>
            <button 
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
            
            {/* Quick Actions */}
            <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Save size={14} /> Quick Save
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                    The game auto-saves every 4 weeks. Use this to force a save point immediately.
                </p>
                <Button onClick={handleSave} className="w-full flex items-center justify-center gap-2">
                    <Save size={16} /> Save to Browser Storage
                </Button>
            </div>

            {/* Data Management */}
            <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <FileJson size={14} /> Data Management
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                    Download a backup file to transfer your save to another device.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" onClick={handleDownloadSave} className="flex items-center justify-center gap-2 text-xs">
                        <Download size={16} /> Backup (.json)
                    </Button>
                    
                    <Button variant="secondary" onClick={handleTriggerUpload} className="flex items-center justify-center gap-2 text-xs">
                        <Upload size={16} /> Restore Save
                    </Button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onClick={(e) => (e.currentTarget.value = '')}
                        onChange={handleFileUpload} 
                        accept=".json" 
                        className="hidden" 
                    />
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-900/10 p-4 rounded border border-red-900/30">
                <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <AlertTriangle size={14} /> Danger Zone
                </h3>
                
                {/* Reset */}
                <div className="mb-4 pb-4 border-b border-red-900/20">
                    <p className="text-xs text-slate-400 mb-2">
                        Corrupted save? Glitched state? Wipe all data and start fresh.
                    </p>
                    <button 
                        type="button"
                        className={`w-full font-bold py-3 px-4 rounded flex items-center justify-center gap-2 transition-all duration-200 shadow-lg ${
                            isConfirmingReset 
                                ? "bg-red-950 text-red-500 border-2 border-red-500 animate-pulse" 
                                : "bg-red-600 hover:bg-red-700 text-white border border-red-500 hover:shadow-red-500/20"
                        }`}
                        onClick={() => {
                            if (isConfirmingReset) {
                                resetGame(); 
                            } else {
                                setIsConfirmingReset(true); 
                            }
                        }}
                        onMouseLeave={() => setIsConfirmingReset(false)}
                    >
                        {isConfirmingReset ? (
                            <>
                                <Trash2 size={20} />
                                CONFIRM WIPE? (Click again)
                            </>
                        ) : (
                            <>
                                <Trash2 size={20} />
                                Factory Reset (Wipe Data)
                            </>
                        )}
                    </button>
                </div>

                {/* Debug */}
                <div>
                    <Button 
                        variant="secondary" 
                        onClick={() => { debugForceYear(); onClose(); }} 
                        className="w-full flex items-center justify-center gap-2 text-xs opacity-50 hover:opacity-100"
                    >
                        <Bug size={14} /> [DEBUG] Force Year +1
                    </Button>
                </div>
            </div>
        </div>

        <div className="bg-slate-950 py-2 text-center text-[10px] text-slate-600 border-t border-slate-800">
            Auto Tycoon Build v1.0.0
        </div>
      </div>
    </div>
  );
};