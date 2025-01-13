'use client';

import { Provider } from 'react-redux';
import {store} from './store';
import {NextUIProvider} from "@nextui-org/react";


export function RootProvider({ children }: { children: React.ReactNode }) {
  return <NextUIProvider><Provider store={store}>{children}</Provider></NextUIProvider>;
}
