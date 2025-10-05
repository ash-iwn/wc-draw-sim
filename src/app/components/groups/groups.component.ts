import { Component, Input } from '@angular/core';
import { DataService } from '../../data-service';
import { Data } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss'
})
export class GroupsComponent {
@Input() groups: { [key: string]: any[] } = {};


constructor(public dataService:DataService) {

}
}
