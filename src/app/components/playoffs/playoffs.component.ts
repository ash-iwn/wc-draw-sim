import { Component, Input } from '@angular/core';
import { PlayoffResults } from '../../model';
import { PlayoffSimulatorService } from '../../playoff-simulator.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAccordion } from '@angular/material/expansion';
import {MatCardModule} from '@angular/material/card';
import { SimulatorService } from '../../sim-service';

@Component({
  selector: 'app-playoffs',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatExpansionModule,MatButtonModule,MatFormFieldModule, MatSelectModule, MatOptionModule],
  templateUrl: './playoffs.component.html',
  styleUrl: './playoffs.component.scss'
})
export class PlayoffsComponent {

  constructor(public simService: SimulatorService, public playoffService: PlayoffSimulatorService) {}

  
 
}
