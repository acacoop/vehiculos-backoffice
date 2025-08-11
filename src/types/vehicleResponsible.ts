export interface VehicleResponsible {
  id: string;
  startDate: string;
  endDate: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    dni: number;
    email: string;
    active: boolean;
  };
  vehicle: {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
    imgUrl?: string;
    currentResponsible?: string;
  };
}
