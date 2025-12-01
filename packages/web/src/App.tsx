/**
 * Main App Component
 * Handles routing for TV and Phone views
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TVDisplay } from './pages/TVDisplay';
import { PhoneController } from './pages/PhoneController';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/tv/:sessionId" element={<TVDisplay />} />
        <Route path="/phone/:sessionId" element={<PhoneController />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function Home() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      textAlign: 'center',
    }}>
      <h1 style={{ margin: '0 0 16px 0', fontSize: '32px' }}>
        Multiscreen Orchestrator
      </h1>
      <p style={{ margin: '0 0 32px 0', color: '#666', maxWidth: '500px' }}>
        Create multi-device prototypes in Figma and test them in real-time
        across TV and mobile devices.
      </p>
      <div style={{
        padding: '16px 24px',
        background: '#f5f5f5',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#666',
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>To get started:</strong>
        </p>
        <ol style={{
          margin: 0,
          padding: '0 0 0 20px',
          textAlign: 'left',
        }}>
          <li>Open the Multiscreen Orchestrator plugin in Figma</li>
          <li>Configure your TV and Phone prototypes</li>
          <li>Create cross-device interaction rules</li>
          <li>Publish to get your session URLs</li>
        </ol>
      </div>
    </div>
  );
}
