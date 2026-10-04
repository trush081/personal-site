import type { ComponentType } from 'react';

// Internal apps: pages that live inside the dashboard at /dashboard/apps/<slug>.
// To build one, create a component (e.g. src/apps/notes/Notes.tsx) and register it
// here under the same slug as its entry in Manage -> Apps. Access is checked before
// the component renders, using the app's visibility and grants.
const internalApps: Record<string, ComponentType> = {
  // notes: Notes,
};

export default internalApps;
