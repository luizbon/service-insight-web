
import axios, { AxiosError } from 'axios';

export interface NetworkErrorHandlerConfig {
  onConnectionError?: (error: Error, errorType: string) => void;
}

class NetworkErrorHandler {
  private static instance: NetworkErrorHandler;
  private onConnectionError?: (error: Error, errorType: string) => void;

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): NetworkErrorHandler {
    if (!NetworkErrorHandler.instance) {
      NetworkErrorHandler.instance = new NetworkErrorHandler();
    }
    return NetworkErrorHandler.instance;
  }

  public configure(config: NetworkErrorHandlerConfig): void {
    // Only update if the callback is provided or explicitly set to undefined
    if (config.onConnectionError !== undefined) {
      this.onConnectionError = config.onConnectionError;
    }
  }
  
  /**
   * Makes an HTTP request using Axios
   * @param url The URL to connect to
   * @param timeout Optional timeout in milliseconds (default: 10000)
   * @returns Promise with the response data
   */
  public async makeRequest(url: string, timeout: number = 10000): Promise<unknown> {
    try {
      const response = await axios.get(url, {
        timeout: timeout,
        headers: {
          'Cache-Control': 'no-cache',  // Prevent caching issues
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
      throw error;
    }
  }

  /**
   * Handles errors from Axios requests
   */
  public handleAxiosError(error: unknown): void {
    let errorType = "NETWORK_ERROR";
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Check for specific Axios error codes
      if (axiosError.code === 'ENOTFOUND') {
        // This is specifically what we want to check for DNS resolution errors
        errorType = "ERR_NAME_NOT_RESOLVED";
      } else if (axiosError.code === 'ECONNREFUSED') {
        errorType = "CONNECTION_REFUSED";
      } else if (axiosError.code === 'ETIMEDOUT') {
        errorType = "CONNECTION_TIMEOUT";
      } else if (axiosError.code === 'ERR_NETWORK') {
        // General network connectivity issues
        errorType = "NETWORK_CONNECTIVITY";
      } else if (axiosError.response) {
        // Server responded with a status code outside of 2xx range
        errorType = `HTTP_ERROR_${axiosError.response.status}`;
      } else if (axiosError.request) {
        // Request made but no response received
        errorType = "NO_RESPONSE";
      }
    }
    
    // Call the error handler callback
    if (this.onConnectionError) {
      this.onConnectionError(error instanceof Error ? error : new Error(String(error)), errorType);
    }
  }

  /**
   * Handles errors from Fetch API for backward compatibility
   * @deprecated Use handleAxiosError instead
   */
  public handleFetchError(error: unknown): void {
    let errorType = "NETWORK_ERROR";
    
    if (error instanceof TypeError) {
      if (error.message.includes("ERR_NAME_NOT_RESOLVED") || 
          error.message.includes("net::ERR_NAME_NOT_RESOLVED")) {
        errorType = "ERR_NAME_NOT_RESOLVED";
      } else if (error.message.includes("Failed to fetch")) {
        errorType = "FAILED_TO_FETCH";
      }
    } else if (error instanceof Error && error.message?.includes("Network request failed")) {
      errorType = "NETWORK_REQUEST_FAILED";
    }
    
    if (this.onConnectionError) {
      this.onConnectionError(error instanceof Error ? error : new Error(String(error)), errorType);
    }
  }
}

export default NetworkErrorHandler;
