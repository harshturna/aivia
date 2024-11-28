declare global {
  interface Window {
    lynq: {
      track(eventName: string, properties?: Record<string, any>): void;
    };
  }
}

export {};
