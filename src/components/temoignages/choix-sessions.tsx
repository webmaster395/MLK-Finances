"use client";

import { createContext } from "react";

/** Sessions proposées dans les formulaires de témoignage, et celle présélectionnée (« » : en général). */
export type ChoixSessions = { sessions: { id: string; titre: string }[]; parDefaut: string };

export const ContexteSessions = createContext<ChoixSessions>({ sessions: [], parDefaut: "" });
