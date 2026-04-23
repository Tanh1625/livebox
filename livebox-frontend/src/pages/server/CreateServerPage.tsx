import React from 'react';
import { CreateServerScreen } from '../../features/server/components/CreateServerScreen';

/**
 * CreateServerPage renders the CreateServerScreen modal overlay
 * on top of whatever background content is beneath it.
 * The modal itself handles the full-screen fixed overlay.
 */
export const CreateServerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <CreateServerScreen />
    </div>
  );
};
