/**
 * API Routes
 * REST endpoints for configuration management
 */

import type { Express, Request, Response } from 'express';
import type { SessionManager } from './session-manager.js';
import { validateConfig } from '@orchestrator/shared/schemas';
import type { PrototypeConfig, PublishResponse } from '@orchestrator/shared';

export function setupRoutes(app: Express, sessionManager: SessionManager): void {
  /**
   * POST /api/config
   * Publish a new prototype configuration
   */
  app.post('/api/config', (req: Request, res: Response) => {
    try {
      const config: PrototypeConfig = req.body;

      // Validate configuration
      const validation = validateConfig(config);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid configuration',
          details: validation.error,
        });
      }

      // Create session
      const session = sessionManager.createSession(config);

      // Generate URLs
      const baseUrl = process.env.WEB_URL || `http://localhost:3000`;
      const tvUrl = `${baseUrl}/tv/${session.id}`;
      const phoneUrl = `${baseUrl}/phone/${session.id}`;

      const response: PublishResponse = {
        success: true,
        configId: session.id,
        tvUrl,
        phoneUrl,
        publishedAt: session.createdAt.toISOString(),
      };

      console.log(`✅ Published config for "${config.fileName}" as session ${session.id}`);
      res.json(response);
    } catch (error) {
      console.error('Error publishing config:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  });

  /**
   * GET /api/config/:sessionId
   * Get configuration for a session
   */
  app.get('/api/config/:sessionId', (req: Request, res: Response) => {
    const { sessionId } = req.params;

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    res.json({
      success: true,
      config: session.config,
      deviceCount: session.devices.size,
      createdAt: session.createdAt,
    });
  });

  /**
   * GET /api/sessions
   * Get all active sessions (for debugging/monitoring)
   */
  app.get('/api/sessions', (req: Request, res: Response) => {
    const stats = sessionManager.getStats();
    res.json(stats);
  });

  /**
   * DELETE /api/config/:sessionId
   * Delete a session
   */
  app.delete('/api/config/:sessionId', (req: Request, res: Response) => {
    const { sessionId } = req.params;

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    // Close all WebSocket connections
    session.devices.forEach(device => {
      device.ws.close();
    });

    res.json({
      success: true,
      message: 'Session deleted',
    });
  });
}
