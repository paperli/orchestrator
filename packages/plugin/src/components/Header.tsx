/**
 * Header component with navigation tabs
 */

import type { Section } from './App';
import './Header.css';

interface HeaderProps {
  currentSection: Section;
  onSectionChange: (section: Section) => void;
  hasConfig: boolean;
}

export function Header({ currentSection, onSectionChange, hasConfig }: HeaderProps) {
  const tabs: { id: Section; label: string; disabled?: boolean }[] = [
    { id: 'setup', label: 'Setup' },
    { id: 'rules', label: 'Rules', disabled: !hasConfig },
    { id: 'publish', label: 'Publish', disabled: !hasConfig },
  ];

  return (
    <header className="header">
      <div className="header-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${currentSection === tab.id ? 'active' : ''} ${
              tab.disabled ? 'disabled' : ''
            }`}
            onClick={() => !tab.disabled && onSectionChange(tab.id)}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
