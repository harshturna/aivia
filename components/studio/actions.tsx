"use client";

import { createContext, useContext } from "react";

/**
 * What a run's outputs can ask of the Studio around them (TICKET-039). The landing's replay
 * renders outputs without a provider, so its outputs offer no actions.
 */
export type StudioActions = {
  /** Turn a still into a short clip in this session. */
  animate?: (still: {
    url: string;
    prompt: string;
    width: number;
    height: number;
  }) => void;
  /** Cut a finished run into one piece (TICKET-040); saving needs an account. */
  cut?: { canSave: boolean; sessionId: string | null };
};

const Context = createContext<StudioActions>({});

export const StudioActionsProvider = Context.Provider;
export const useStudioActions = () => useContext(Context);
