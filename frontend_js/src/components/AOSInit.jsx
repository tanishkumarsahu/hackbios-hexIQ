'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function AOSInit() {
  useEffect(() => {
    AOS.init({
      duration: 250,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
      offset: 0, // Changed from 250 to 0 so elements animate immediately when in viewport
      delay: 0,
      disable: false,
      startEvent: 'DOMContentLoaded',
      initClassName: 'aos-init',
      animatedClassName: 'aos-animate',
      useClassNames: false,
      disableMutationObserver: false,
      debounceDelay: 50,
      throttleDelay: 99,
      anchorPlacement: 'top-center', // Changed from 'top-bottom' to trigger animations earlier
    });

    // Refresh AOS on route changes and force immediate refresh
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  }, []);

  return null;
}
