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
      if (i18n.isInitialized && i18n.hasResourceBundle(i18n.language, 'common')) {
        setIsReady(true);
      } else {
        // Wait for initialization and resource loading
        const handleReady = () => {
          if (i18n.hasResourceBundle(i18n.language, 'common')) {
            setIsReady(true);
          }
        };

        i18n.on('initialized', handleReady);
        i18n.on('loaded', handleReady);
        i18n.on('languageChanged', (lng) => {
          // Check if resources are available for the new language
          if (i18n.hasResourceBundle(lng, 'common')) {
            setIsReady(true);
          } else {
            setIsReady(false);
            // Wait for resources to load
            const loadHandler = () => {
              if (i18n.hasResourceBundle(lng, 'common')) {
                setIsReady(true);
                i18n.off('loaded', loadHandler);
              }
            };
            i18n.on('loaded', loadHandler);
          }
        });
      }
    };

    checkI18nReady();

    return () => {
      i18n.off('initialized');
      i18n.off('loaded');
      i18n.off('languageChanged');
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