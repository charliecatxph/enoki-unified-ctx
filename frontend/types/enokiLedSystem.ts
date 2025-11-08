export interface EnokiPhysicalLED {
  ledUq: string;
  enokiLEDSystemId: string;
  color: string;
  idx: number;
  teacherId?: string;
  teacher?: {
    id: string;
    name: string;
    email: string;
    enokiAcct: any;
  };
}

export interface EnokiLEDSystem {
  deviceSID: string;
  name: string;
  installedAt: string;
  institutionId: string;
  institution?: {
    id: string;
    name: string;
  };
  currentState: number;
  physicalLeds: EnokiPhysicalLED[];
}
