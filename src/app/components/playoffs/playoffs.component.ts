import { Component, Input } from '@angular/core';
import { PlayoffResults } from '../../model';

@Component({
  selector: 'app-playoffs',
  standalone: true,
  imports: [],
  templateUrl: './playoffs.component.html',
  styleUrl: './playoffs.component.scss'
})
export class PlayoffsComponent {
 @Input() results: PlayoffResults | null = null;
}
