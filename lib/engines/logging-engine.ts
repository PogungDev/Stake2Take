import { AgentAction, AgentState, LiveMetrics } from '@/types/app-structure';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  category: 'automation' | 'performance' | 'security' | 'optimization' | 'user';
  message: string;
  details?: Record<string, any>;
  actionId?: string;
  userId?: string;
  duration?: number; // milliseconds
}

export interface PerformanceMetrics {
  totalActions: number;
  successRate: number;
  averageExecutionTime: number;
  totalGasSaved: number;
  totalYieldGenerated: number;
  totalOptimizationGain: number;
  uptime: number; // percentage
  errorRate: number;
}

export interface DecisionLog {
  id: string;
  timestamp: Date;
  engine: 'spending' | 'vault' | 'liquidity' | 'reward' | 'credit';
  decision: string;
  reasoning: string;
  inputData: Record<string, any>;
  outputAction?: AgentAction;
  confidence: number; // 0-1
  executionTime: number; // milliseconds
}

export interface ActivityFeed {
  logs: LogEntry[];
  decisions: DecisionLog[];
  performance: PerformanceMetrics;
  lastUpdated: Date;
}

export class LoggingEngine {
  private logs: LogEntry[] = [];
  private decisions: DecisionLog[] = [];
  private performanceData: PerformanceMetrics = {
    totalActions: 0,
    successRate: 0,
    averageExecutionTime: 0,
    totalGasSaved: 0,
    totalYieldGenerated: 0,
    totalOptimizationGain: 0,
    uptime: 0,
    errorRate: 0
  };

  // Log a general activity
  public log(
    level: LogEntry['level'],
    category: LogEntry['category'],
    message: string,
    details?: Record<string, any>,
    actionId?: string
  ): void {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      category,
      message,
      details,
      actionId
    };

    this.logs.unshift(entry); // Add to beginning for newest first
    
    // Keep only last 100 logs for performance
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }

    // Auto-log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[VaultMaster ${level.toUpperCase()}] ${category}: ${message}`, details);
    }
  }

  // Log an agent decision with full transparency
  public logDecision(
    engine: DecisionLog['engine'],
    decision: string,
    reasoning: string,
    inputData: Record<string, any>,
    confidence: number,
    outputAction?: AgentAction,
    executionTime: number = 0
  ): string {
    const decisionLog: DecisionLog = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      engine,
      decision,
      reasoning,
      inputData,
      outputAction,
      confidence: Math.round(confidence * 100) / 100,
      executionTime
    };

    this.decisions.unshift(decisionLog);
    
    // Keep only last 50 decisions
    if (this.decisions.length > 50) {
      this.decisions = this.decisions.slice(0, 50);
    }

    // Also create a regular log entry
    this.log(
      'info',
      'automation',
      `${engine.charAt(0).toUpperCase() + engine.slice(1)} Engine: ${decision}`,
      {
        reasoning,
        confidence,
        executionTime,
        hasAction: !!outputAction
      },
      outputAction?.id
    );

    return decisionLog.id;
  }

  // Log action execution
  public logActionExecution(action: AgentAction, success: boolean, executionTime?: number): void {
    const level = success ? 'success' : 'error';
    const message = success 
      ? `✅ ${action.type.charAt(0).toUpperCase() + action.type.slice(1)} completed: $${action.amount}`
      : `❌ ${action.type.charAt(0).toUpperCase() + action.type.slice(1)} failed: $${action.amount}`;

    this.log(
      level,
      'automation',
      message,
      {
        actionType: action.type,
        amount: action.amount,
        token: action.token,
        reason: action.reason,
        executionTime,
        gasUsed: action.gasUsedUSD,
        optimizationGain: action.optimizationGain
      },
      action.id
    );

    // Update performance metrics
    this.updatePerformanceMetrics(action, success, executionTime);
  }

  // Log performance insights
  public logPerformanceInsight(insight: string, metrics: Record<string, number>): void {
    this.log(
      'info',
      'performance',
      `📊 Performance Insight: ${insight}`,
      metrics
    );
  }

  // Log security events
  public logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', details?: Record<string, any>): void {
    const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info';
    
    this.log(
      level,
      'security',
      `🔒 Security Event: ${event}`,
      { severity, ...details }
    );
  }

  // Log optimization achievements
  public logOptimization(optimization: string, benefit: number, details?: Record<string, any>): void {
    this.log(
      'success',
      'optimization',
      `⚡ Optimization: ${optimization} (+$${benefit.toFixed(2)})`,
      { benefit, ...details }
    );
  }

  // Update performance metrics
  private updatePerformanceMetrics(action: AgentAction, success: boolean, executionTime?: number): void {
    this.performanceData.totalActions++;
    
    if (success) {
      const successfulActions = this.logs.filter(log => log.level === 'success' && log.category === 'automation').length;
      this.performanceData.successRate = (successfulActions / this.performanceData.totalActions) * 100;
    }

    if (executionTime) {
      const totalTime = this.performanceData.averageExecutionTime * (this.performanceData.totalActions - 1) + executionTime;
      this.performanceData.averageExecutionTime = totalTime / this.performanceData.totalActions;
    }

    if (action.gasUsedUSD) {
      this.performanceData.totalGasSaved += action.gasUsedUSD;
    }

    if (action.optimizationGain) {
      this.performanceData.totalOptimizationGain += action.optimizationGain;
    }

    // Calculate error rate
    const errorActions = this.logs.filter(log => log.level === 'error' && log.category === 'automation').length;
    this.performanceData.errorRate = (errorActions / this.performanceData.totalActions) * 100;

    // Round metrics
    this.performanceData.successRate = Math.round(this.performanceData.successRate * 10) / 10;
    this.performanceData.averageExecutionTime = Math.round(this.performanceData.averageExecutionTime);
    this.performanceData.totalGasSaved = Math.round(this.performanceData.totalGasSaved * 100) / 100;
    this.performanceData.totalOptimizationGain = Math.round(this.performanceData.totalOptimizationGain * 100) / 100;
    this.performanceData.errorRate = Math.round(this.performanceData.errorRate * 10) / 10;
  }

  // Get activity feed
  public getActivityFeed(): ActivityFeed {
    return {
      logs: this.logs,
      decisions: this.decisions,
      performance: this.performanceData,
      lastUpdated: new Date()
    };
  }

  // Get filtered logs
  public getLogsByCategory(category: LogEntry['category']): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  public getLogsByLevel(level: LogEntry['level']): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  public getDecisionsByEngine(engine: DecisionLog['engine']): DecisionLog[] {
    return this.decisions.filter(decision => decision.engine === engine);
  }

  // Get performance summary
  public getPerformanceSummary(): {
    summary: string;
    metrics: PerformanceMetrics;
    insights: string[];
  } {
    const metrics = this.performanceData;
    const insights: string[] = [];

    // Generate insights
    if (metrics.successRate > 95) {
      insights.push("🎯 Excellent success rate - automation is performing optimally");
    } else if (metrics.successRate > 85) {
      insights.push("✅ Good success rate - minor optimizations possible");
    } else {
      insights.push("⚠️ Success rate below target - review failed actions");
    }

    if (metrics.averageExecutionTime < 2000) {
      insights.push("⚡ Fast execution times - efficient automation");
    } else if (metrics.averageExecutionTime < 5000) {
      insights.push("🔄 Moderate execution times - acceptable performance");
    } else {
      insights.push("🐌 Slow execution times - optimization needed");
    }

    if (metrics.totalOptimizationGain > 100) {
      insights.push("💰 Significant optimization gains achieved");
    } else if (metrics.totalOptimizationGain > 10) {
      insights.push("📈 Moderate optimization gains - good progress");
    }

    const summary = `${metrics.totalActions} actions executed with ${metrics.successRate}% success rate. Total optimization gain: $${metrics.totalOptimizationGain}.`;

    return {
      summary,
      metrics,
      insights
    };
  }

  // Clear old logs (for maintenance)
  public clearOldLogs(daysToKeep: number = 7): void {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    this.logs = this.logs.filter(log => log.timestamp > cutoffDate);
    this.decisions = this.decisions.filter(decision => decision.timestamp > cutoffDate);
    
    this.log('info', 'user', `🧹 Cleared logs older than ${daysToKeep} days`);
  }

  // Export logs for analysis
  public exportLogs(): {
    logs: LogEntry[];
    decisions: DecisionLog[];
    performance: PerformanceMetrics;
    exportDate: Date;
  } {
    return {
      logs: this.logs,
      decisions: this.decisions,
      performance: this.performanceData,
      exportDate: new Date()
    };
  }
}
