import { Component, Input } from '@angular/core';
import { Match } from '../../model';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [],
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.scss'
})
export class MatchesComponent {
@Input() matches: Match[] = [];
}
