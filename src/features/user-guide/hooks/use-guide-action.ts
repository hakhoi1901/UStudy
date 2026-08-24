import { useEffect, useRef } from 'react';
import { useUserGuide } from '../context/guide-context';
import type { GuideActionId } from '../types';

export function useGuideAction(actionId: GuideActionId, handler: () => void | Promise<void>): void {
  const { registerAction } = useUserGuide();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => registerAction(actionId, () => handlerRef.current()), [actionId, registerAction]);
}
