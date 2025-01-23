'use client';

import { Provider } from 'react-redux';
import {store} from './store';
import {HeroUIProvider} from "@heroui/react";


export function RootProvider({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider><Provider store={store}>{children}</Provider></HeroUIProvider>;
}
