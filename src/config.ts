import { ImmutableObject } from 'jimu-core';

export interface Config {
  useApostrophe: boolean;
  fontSize: number;
  predefinedScales: number[];
}

export type IMConfig = ImmutableObject<Config>;
