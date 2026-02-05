import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
          <h1 className="text-4xl font-bold mb-4 text-red-500">Something went wrong</h1>
          <p className="text-gray-300 mb-8 max-w-md text-center">
            We apologize for the inconvenience. The application has encountered an unexpected error.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600"
          >
            Reload Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
