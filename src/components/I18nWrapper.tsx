import React, { useState, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

interface I18nWrapperProps {
  children: React.ReactNode;
}

export const I18nWrapper: React.FC<I18nWrapperProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkI18nReady = () => {
      if (i18n.isInitialized) {
        setIsReady(true);
      } else {
        // Wait for initialization
        i18n.on('initialized', () => {
          setIsReady(true);
        });
      }
    };

    checkI18nReady();

    return () => {
      i18n.off('initialized');
    };
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};