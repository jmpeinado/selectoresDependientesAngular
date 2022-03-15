import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaisesService } from '../../services/paises.service';
import { PaisSmall } from '../../interfaces/paises.interface';
import { switchMap, tap } from 'rxjs';

interface Pais {
  nombre: string;
  id: number;
}

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styles: [
  ]
})
export class SelectorComponent implements OnInit {

  miForm: FormGroup = this.fb.group({
    region: [ '', Validators.required ],
    pais: [ '', Validators.required ],
    frontera: [ '', Validators.required ]
  });

  regiones: string[] = [];
  paises: PaisSmall[] = [];
  fronteras: PaisSmall[] = [];
  cargando: boolean = false;

  constructor(private fb: FormBuilder,
              private servicePaises: PaisesService) { }

  ngOnInit(): void {
    this.servicePaises.regiones.subscribe( regiones => {
      // Cargo las regiones
      this.regiones = regiones;
      
      // Cambio de region
      this.miForm.get('region')?.valueChanges
        .pipe(
          tap( ( _ ) => {
            this.miForm.get('pais')?.reset('');
            this.cargando = true;
          }),
          switchMap( region => this.servicePaises.getPaisesPorRegion( region ) )
        )
        .subscribe( paises => {
              this.paises = paises;
              this.cargando = false;
        });

      // Cambio de pais
      this.miForm.get('pais')?.valueChanges
        .pipe(
          tap( ( _ ) => {
            this.miForm.get('frontera')?.reset('');
            this.cargando = true;
          }),
          switchMap( paisCode => this.servicePaises.getPaisPorCode( paisCode ) ),
          switchMap( pais => this.servicePaises.getPaisesPorCodes( pais?.borders! ) )
        )
        .subscribe( paises =>  {
          console.log( paises );
          this.fronteras = paises;
          this.cargando = false;
        })
    });
  }

  guardar() {
    console.log('Guardando ...');
  }


}
