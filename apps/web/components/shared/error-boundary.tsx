"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-sm font-medium">Something went wrong</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              {this.state.error.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={this.reset}
              className="mt-4"
            >
              Try again
            </Button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
