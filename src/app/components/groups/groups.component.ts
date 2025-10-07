import { Component, Input } from '@angular/core';
import { Team } from '../../model';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { SimulatorService } from '../../sim-service';
import {MatTableModule} from '@angular/material/table';
@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  standalone: true,
  imports: [MatCardModule, NgFor, NgIf, CommonModule, MatTableModule], 
})
export class GroupsComponent {

  constructor(public simService:SimulatorService) {}
  groupLetters: string[] = ['A','B','C','D','E','F','G','H','I','J','K','L'];
}