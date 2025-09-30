import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss'
})
export class GroupsComponent {
@Input() groups: { [key: string]: any[] } = {};
}
