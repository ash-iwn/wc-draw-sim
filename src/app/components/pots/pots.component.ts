import { Component, Input } from '@angular/core';



import { DataService } from '../../data-service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-pots',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatExpansionModule,
    CommonModule,
  ],
  templateUrl: './pots.component.html',
  styleUrl: './pots.component.scss'
})
export class PotsComponent {
 
  @Input() pots: { [key: number]: any[] } = {};

  constructor(private dataService:DataService) {

  }


  


  hasPots(): boolean {
    return this.pots && Object.keys(this.pots).length > 0;
  }
}
