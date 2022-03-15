import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { PaisSmall, PaisSmallBack, Pais } from '../interfaces/paises.interface';

@Injectable({
  providedIn: 'root'
})
export class PaisesService {

  private _regiones: string[] = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
  private baseUrl: string = 'https://restcountries.com/v3.1';

  constructor(private http: HttpClient) { }

  get regiones() {
    return of(this._regiones);
  }

  getPaisesPorRegion( region: string ): Observable<PaisSmall[]> {
    const url = `${this.baseUrl}/region/${region}?fields=cca3,name`;

    return this.http.get<PaisSmallBack[]>( url )
      .pipe(
        map(
          paises => paises.map( pais => this._transforPaisData( pais ) )
        )
      );
  }

  getPaisPorCode( code: string ): Observable<Pais | null> {
    console.log( code );
    if ( !code ) {
      return of(null);
    }

    const url: string = `${ this.baseUrl }/alpha/${ code }`;
    return this.http.get<Pais[]>( url )
      .pipe(
        map( paisArr => paisArr[0] )
      );
  }

  getPaisPorCodeSmall( code: string ): Observable<PaisSmall> {
    const url: string = `${ this.baseUrl }/alpha/${ code }?fields=cca3,name`;
    return this.http.get<PaisSmallBack>( url )
      .pipe(
        map( paisArr => { 
          return this._transforPaisData( paisArr ) 
        })
      );
  }

  getPaisesPorCodes( codeArr: string[] ): Observable<PaisSmall[]> {
    if ( !codeArr ) {
      return of([]);
    }

    const peticiones: Observable<PaisSmall>[] = [];

    codeArr.forEach( code => {
      peticiones.push( this.getPaisPorCodeSmall( code ) );
    });

    return combineLatest( peticiones )
  }

  _transforPaisData( paisBack:PaisSmallBack): PaisSmall {
    return {
      name: paisBack.name.common,
      code: paisBack.cca3
    } 
  }
}
