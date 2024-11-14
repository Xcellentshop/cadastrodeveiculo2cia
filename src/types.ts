export interface Vehicle {
  id?: string;
  registrationNumber: number;
  plate: string;
  state: string;
  inspectionDate: string;
  brand: string;
  model: string;
  vehicleType: VehicleType;
  hasKey: boolean;
  chassisObservation: string;
  releaseDate: string;
  city: City;
}

export type VehicleType =
  | 'Automóvel'
  | 'Motocicleta'
  | 'Camioneta'
  | 'Caminhonete'
  | 'Caminhão'
  | 'Ônibus'
  | 'Cam. Trator'
  | 'Triciclo'
  | 'Quadriciclo'
  | 'Trator de Rodas'
  | 'Semi-Reboque'
  | 'Motoneta'
  | 'Microônibus'
  | 'Reboque'
  | 'Ciclomotor'
  | 'Utilitário';

export type City = 'Medianeira' | 'SMI' | 'Missal' | 'Itaipulândia' | 'Serranópolis';

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE',
  'TO', 'EX'
];