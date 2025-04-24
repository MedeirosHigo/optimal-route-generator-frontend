import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DistanceService {
  private API_KEY = '5b3ce3597851110001cf624898539e0d7be1485c911af477c1c9a591';
  private URL_API = 'https://api.openrouteservice.org/v2/matrix/driving-car';

  constructor(private http: HttpClient) { }

  getDistance(coodinates: number[][]): Observable<any> {
    const body = {
      locations: coodinates,
      metrics: ['distance'],
      units: 'km'
    };
    return this.http.post(this.URL_API, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.API_KEY
      }
    }).pipe(map((response: any) => response.distances));
  }
}
