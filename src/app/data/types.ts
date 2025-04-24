export interface MarkerDistance {
  x: string;
  y: string;
  distance: number;
};

export interface MarkerData {
  name: string;
  lat: number;
  lng: number;
};

export type LastRouteType = 'withKruskal' | 'withoutKruskal' | undefined;