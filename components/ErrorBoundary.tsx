import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('🚨 Error message:', error.message);
    console.error('🚨 Error stack:', error.stack);
    console.error('🚨 Component stack:', errorInfo.componentStack);
    
    // Also log to localStorage for debugging on mobile
    try {
      const errorLog = {
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 500), // Truncate stack
        componentStack: errorInfo.componentStack?.substring(0, 300),
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio,
        visibilityState: document.visibilityState,
      };
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push(errorLog);
      // Keep only last 5 errors
      localStorage.setItem('error_logs', JSON.stringify(existingLogs.slice(-5)));
      console.log('📝 Error logged to localStorage:', errorLog);
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  private handleRetry = () => {
    // Reset error state to re-render children
    this.setState({ hasError: false, error: null });
  };

  private getStoredErrors = (): any[] => {
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch {
      return [];
    }
  };

  private clearErrors = () => {
    localStorage.removeItem('error_logs');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Unknown error';
      const storedErrors = this.getStoredErrors();
      const latestError = storedErrors[storedErrors.length - 1];
      
      return (
        <div className="fixed inset-0 bg-gradient-to-b from-[#1a3a52] to-[#0d1f2d] flex flex-col items-center justify-center p-6 z-[9999] overflow-auto">
          <div className="text-6xl mb-4">🌊</div>
          <h1 className="text-white text-2xl font-display font-bold mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-white/70 text-center mb-4 max-w-xs">
            The app hit a wave! Let's get you back on course.
          </p>
          
          {/* Debug info - tap to expand */}
          <details className="mb-4 max-w-sm w-full">
            <summary className="text-white/50 text-xs text-center cursor-pointer py-2">
              ▶ Tap for error details
            </summary>
            <div className="mt-2 p-3 bg-black/40 rounded-lg text-white/70 text-xs overflow-auto max-h-48 space-y-2">
              <div><strong>Error:</strong> {errorMessage}</div>
              {latestError && (
                <>
                  <div><strong>Screen:</strong> {latestError.screenSize}</div>
                  <div><strong>Device:</strong> {latestError.userAgent?.substring(0, 60)}...</div>
                  <div><strong>URL:</strong> {latestError.url}</div>
                  <div><strong>Time:</strong> {latestError.timestamp}</div>
                  {latestError.componentStack && (
                    <div className="mt-2 text-[10px] text-white/50 break-all">
                      <strong>Component:</strong> {latestError.componentStack.substring(0, 150)}...
                    </div>
                  )}
                </>
              )}
            </div>
          </details>

          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="px-8 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#3E1F07] font-bold rounded-full shadow-lg active:scale-95 transition-transform"
            >
              Try Again
            </button>
            <button
              onClick={this.clearErrors}
              className="px-6 py-3 bg-white/20 text-white font-bold rounded-full shadow-lg active:scale-95 transition-transform text-sm"
            >
              Clear & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

