export interface InstrumentData {
  name: string;
  description?: string;
  file: string;
}

export interface KitData {
  name: string;
  instruments: InstrumentData[];
}
