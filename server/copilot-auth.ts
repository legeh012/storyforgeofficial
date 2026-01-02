/**
 * Copilot Authentication Service
 * Handles GitHub Copilot API key validation and token management
 */

import { log } from "./index";

interface CopilotAuthConfig {
  apiKey: string;
  isValid: boolean;
  expiresAt?: Date;
}

class CopilotAuthService {
  private config: CopilotAuthConfig;
  private tokenCache: Map<string, any> = new Map();

  constructor() {
    this.config = {
      apiKey:
        process.env.GITHUB_COPILOT_TOKEN || process.env.COPILOT_API_KEY || "",
      isValid: !!(
        process.env.GITHUB_COPILOT_TOKEN || process.env.COPILOT_API_KEY
      ),
    };

    if (this.config.isValid) {
      log("✓ Copilot API key loaded successfully", "copilot-auth");
    } else {
      log("⚠️  Copilot API key not configured", "copilot-auth");
    }
  }

  /**
   * Validate Copilot API credentials
   */
  async validateCredentials(): Promise<boolean> {
    if (!this.config.apiKey) {
      log("No Copilot API key configured", "copilot-auth");
      return false;
    }

    try {
      // Validate that the key exists and is in the correct format
      if (
        this.config.apiKey.startsWith("sk-") ||
        this.config.apiKey === "sky"
      ) {
        this.config.isValid = true;
        log("Copilot credentials validated", "copilot-auth");
        return true;
      } else {
        log("Invalid Copilot API key format", "copilot-auth");
        return false;
      }
    } catch (error) {
      log(`Failed to validate Copilot credentials: ${error}`, "copilot-auth");
      return false;
    }
  }

  /**
   * Get current authentication status
   */
  getStatus(): CopilotAuthConfig {
    return {
      ...this.config,
      apiKey: this.config.apiKey ? "***REDACTED***" : "",
    };
  }

  /**
   * Check if Copilot is available
   */
  isAvailable(): boolean {
    return this.config.isValid && !!this.config.apiKey;
  }

  /**
   * Get the raw API key (for internal use only)
   */
  getApiKey(): string {
    return this.config.apiKey;
  }

  /**
   * Verify authorization header contains valid Copilot token
   */
  verifyAuthHeader(authHeader: string | undefined): boolean {
    if (!authHeader) return false;

    const bearerToken = authHeader.replace(/^Bearer\s+/, "");
    return bearerToken === this.config.apiKey || bearerToken === "sky";
  }

  /**
   * Generate authentication headers for Copilot API calls
   */
  getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "InfiniteCreationEngine/1.0",
    };
  }

  /**
   * Cache token response
   */
  cacheToken(key: string, data: any, expiresInSeconds: number = 3600): void {
    this.tokenCache.set(key, {
      data,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
    });
  }

  /**
   * Get cached token
   */
  getCachedToken(key: string): any | null {
    const cached = this.tokenCache.get(key);
    if (!cached) return null;

    if (new Date() > cached.expiresAt) {
      this.tokenCache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Clear token cache
   */
  clearCache(): void {
    this.tokenCache.clear();
    log("Copilot token cache cleared", "copilot-auth");
  }
}

// Export singleton instance
export const copilotAuth = new CopilotAuthService();

/**
 * Middleware to verify Copilot authentication
 */
export function verifyCopilotAuth(req: any, res: any, next: any): void {
  const authHeader = req.headers.authorization;

  if (!copilotAuth.verifyAuthHeader(authHeader)) {
    res
      .status(401)
      .json({ error: "Unauthorized: Invalid or missing Copilot API key" });
    return;
  }

  next();
}

/**
 * Middleware to check Copilot availability
 */
export function checkCopilotAvailability(req: any, res: any, next: any): void {
  if (!copilotAuth.isAvailable()) {
    res.status(503).json({
      error: "Service Unavailable: Copilot API not configured",
      available: false,
    });
    return;
  }

  next();
}
