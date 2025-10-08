import { Component, Input } from '@angular/core';
import { Match } from '../../model';
import { SimulatorService } from '../../sim-service';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import {MatTableModule} from '@angular/material/table';


@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [
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
      MatCardModule,
      MatTabsModule, 
      MatListModule,
      MatTableModule],
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.scss'
})
export class MatchesComponent {

  constructor(public simService:SimulatorService) {

  }

  groupLetters: string[] = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  groupMatches(group: string): Match[] {
    return this.simService.matches.filter(m => m.group === group);
  }

  getTeamFlag(teamName: string): string {
    const groupTeams = this.simService.getGroups() ? this.simService.groups[this.groupName(teamName)] : [];
    const team = groupTeams.find(t => t.name === teamName);
    return team && team.flag ? team.flag : '🏳️';
  }

  private groupName(teamName: string): string {
    for (const letter of this.groupLetters) {
      if (this.simService.groups[letter] && this.simService.groups[letter].some(t => t.name === teamName)) {
        return letter;
      }
    }
    return '';
  }
}
