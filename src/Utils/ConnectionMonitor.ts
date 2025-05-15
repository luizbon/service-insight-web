import NetworkErrorHandler from "./NetworkErrorHandler";

class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private isMonitoring: boolean = false;
  private pingInterval: number | null = null;
  private serviceUrl: string | null = null;

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }

  /**
   * Start monitoring connectivity to the service
   * @param serviceUrl The URL of the service to monitor
   * @param intervalMs Interval in milliseconds between pings (default 30000ms)
   */
  public startMonitoring(serviceUrl: string, intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      this.stopMonitoring();
    }

    this.serviceUrl = serviceUrl;
    this.isMonitoring = true;

    // Initial check
    this.pingService();

    // Set up regular checks
    this.pingInterval = window.setInterval(() => {
      this.pingService();
    }, intervalMs);
  }

  public stopMonitoring(): void {
    if (this.pingInterval !== null) {
      window.clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.isMonitoring = false;
    this.serviceUrl = null;
  }

  private async pingService(): Promise<void> {
    if (!this.serviceUrl) return;

    try {
      await fetch(this.serviceUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      // If we get here, connection is working
      return;
    } catch (error: any) {
      // Let the NetworkErrorHandler deal with the error
      NetworkErrorHandler.getInstance().handleFetchError(error);
    }
  }
}

export default ConnectionMonitor;