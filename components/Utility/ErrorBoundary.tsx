
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Trash2, RefreshCw, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleFactoryReset = () => {
    if (window.confirm("CRITICAL WARNING: This will wipe your save game and reset all progress to fix the crash. Are you sure?")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-red-500 font-mono flex flex-col items-center justify-center p-4">
          <div className="max-w-2xl w-full border-2 border-red-600 bg-slate-900/90 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.5)] p-8 relative overflow-hidden">
            
            {/* Scanlines Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(255,0,0,0.02),rgba(255,0,0,0.06))] bg-[length:100%_4px,6px_100%]"></div>

            <div className="flex items-center gap-4 mb-6 border-b border-red-900/50 pb-4">
                <AlertTriangle size={48} className="animate-pulse" />
                <div>
                    <h1 className="text-3xl font-bold tracking-widest uppercase">System Failure</h1>
                    <p className="text-red-400 text-sm uppercase tracking-wider">Critical Process Terminated</p>
                </div>
            </div>

            <div className="bg-black/50 p-4 rounded border border-red-900/30 mb-6 overflow-auto max-h-64">
                <p className="text-xs text-red-300 mb-2 font-bold flex items-center gap-2">
                    <Terminal size={14}/> STACK TRACE:
                </p>
                <code className="text-xs text-red-400 whitespace-pre-wrap break-all">
                    {this.state.error?.toString()}
                    <br/>
                    {this.state.errorInfo?.componentStack}
                </code>
            </div>

            <p className="text-slate-400 mb-8 text-sm">
                The application has encountered a fatal error and cannot continue. 
                This may be due to a corrupted save state or an unexpected logic failure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-600 transition-colors uppercase font-bold tracking-wider text-sm"
                >
                    <RefreshCw size={18} /> Try Reloading
                </button>

                <button 
                    onClick={this.handleFactoryReset}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded border border-red-500 shadow-lg shadow-red-900/20 transition-colors uppercase font-bold tracking-wider text-sm"
                >
                    <Trash2 size={18} /> Emergency Factory Reset
                </button>
            </div>
            
            <div className="mt-6 text-center text-[10px] text-red-900 uppercase">
                Error Code: 0xCRASH_HANDLER_EXCEPTION
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
