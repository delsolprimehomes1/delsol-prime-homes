import { useEffect, useState } from 'react';

type BreakpointKey = 'mobile' | 'tablet' | 'desktop';

interface BreakpointValues {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
}

const breakpoints = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
} as const;

export function useResponsiveLayout(): BreakpointValues {
  const [breakpointValues, setBreakpointValues] = useState<BreakpointValues>({
    mobile: false,
    tablet: false,
    desktop: true, // Default to desktop for SSR
  });

  useEffect(() => {
    const mediaQueries: Record<BreakpointKey, MediaQueryList> = {
      mobile: window.matchMedia(breakpoints.mobile),
      tablet: window.matchMedia(breakpoints.tablet),
      desktop: window.matchMedia(breakpoints.desktop),
    };

    const updateBreakpoints = () => {
      setBreakpointValues({
        mobile: mediaQueries.mobile.matches,
        tablet: mediaQueries.tablet.matches,
        desktop: mediaQueries.desktop.matches,
      });
    };

    // Set initial values
    updateBreakpoints();

    // Add listeners
    Object.values(mediaQueries).forEach((mq) => {
      mq.addEventListener('change', updateBreakpoints);
    });

    // Cleanup
    return () => {
      Object.values(mediaQueries).forEach((mq) => {
        mq.removeEventListener('change', updateBreakpoints);
      });
    };
  }, []);

  return breakpointValues;
}

export function useIsMobile(): boolean {
  const { mobile } = useResponsiveLayout();
  return mobile;
}

export function useIsTablet(): boolean {
  const { tablet } = useResponsiveLayout();
  return tablet;
}

export function useIsDesktop(): boolean {
  const { desktop } = useResponsiveLayout();
  return desktop;
}