import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { CheckCircle, Circle, ArrowRight, X } from 'lucide-react';
import { NeonButton } from '../UI/NeonButton';

export const TutorialChecklist: React.FC = () => {
  const { tutorial, completeTutorial } = useGame();

  // Hide if not active, or if waiting for Step 0 (Modal handles that)
  if (!tutorial.isActive || tutorial.currentStep === 0) return null;

  const steps = [
      { id: 1, label: "Design your first Engine", view: "Engine Lab" },
      { id: 2, label: "Design a Car Prototype", view: "Factory" },
      { id: 3, label: "Start Mass Production", view: "Factory" },
      { id: 4, label: "Make the First Sale", view: "Time (Wait)" },
  ];

  const currentStepIndex = tutorial.currentStep;
  const isAllDone = currentStepIndex > 4;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 bg-slate-900/95 border border-slate-700 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-right duration-500">
      
      {/* Header */}
      <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Strategic Goals
          </h3>
          <span className="text-[10px] text-slate-500">Step {Math.min(4, currentStepIndex)}/4</span>
      </div>

      {/* List */}
      <div className="p-4 space-y-3">
          {steps.map(step => {
              const isCompleted = currentStepIndex > step.id;
              const isCurrent = currentStepIndex === step.id;

              return (
                  <div key={step.id} className={`flex items-start gap-3 transition-colors ${isCompleted ? 'opacity-50' : 'opacity-100'}`}>
                      <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                              <CheckCircle size={16} className="text-emerald-500" />
                          ) : isCurrent ? (
                              <ArrowRight size={16} className="text-blue-400 animate-pulse" />
                          ) : (
                              <Circle size={16} className="text-slate-600" />
                          )}
                      </div>
                      <div className="flex-1">
                          <p className={`text-sm font-medium ${isCompleted ? 'text-slate-500 line-through' : isCurrent ? 'text-white' : 'text-slate-400'}`}>
                              {step.label}
                          </p>
                          {isCurrent && (
                              <p className="text-[10px] text-blue-400 mt-0.5">
                                  Go to: <span className="font-bold uppercase">{step.view}</span>
                              </p>
                          )}
                      </div>
                  </div>
              );
          })}
      </div>

      {/* Completion Action */}
      {isAllDone && (
          <div className="p-4 bg-emerald-900/20 border-t border-emerald-900/50 text-center">
              <p className="text-xs text-emerald-400 mb-3 font-bold">All Objectives Met!</p>
              <NeonButton variant="success" size="sm" onClick={completeTutorial} fullWidth>
                  Claim Reward (+10 Prestige)
              </NeonButton>
          </div>
      )}
    </div>
  );
};