import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ValidatorFn, AbstractControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data-service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Team } from '../../model';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FooterComponent } from "../footer/footer.component";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDividerModule } from '@angular/material/divider';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-qualifiers',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
    DragDropModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './qualifiers.component.html',
  styleUrls: ['./qualifiers.component.scss']
})
export class QualifiersComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  UefaQualifiersForm!: FormGroup;
  AfcQualifiersForm!: FormGroup;
  CafQualifiersForm!: FormGroup;
  ConcacafQualifiersForm!: FormGroup;
  CafPlayoffTeamList: Team[] = [];
  ConcacafPlayoffTeamList: Team[] = [];
  AfcPlayoffTeamList: Team[] = [];
  UefaGroupLetters = 'ABCDEFGHIJKL'.split('');
  AfcGroupLetters = 'AB'.split('');
  CafGroupLetters = 'ABCDEFGHI'.split('');
  ConcacafGroupLetters = 'ABC'.split('');
  UefaTeamNames: Team[] = [];
  AfcTeamNames: Team[] = [];
  CafTeamNames: Team[] = [];
  ConcacafTeamNames: Team[] = [];
  selectedAfcRunner: Team | null = null;
  selectedConcacafRunners: Team[] = [];
  cafPlayoffForm!: FormGroup;
  CafIcTeam: Team | null = null;
  UefaGroupedTeams: Record<string, Team[]> = {};
  AfcGroupedTeams: Record<string, Team[]> = {};
  CafGroupedTeams: Record<string, Team[]> = {};
  ConcacafGroupedTeams: Record<string, Team[]> = {};
  private lockedCafPositions: Record<string, { pos1: boolean; pos2: boolean }> = {};
  private lockedConcacafPositions: Record<string, { pos1: boolean; pos2: boolean }> = {};
  private previousGroupState: Record<string, Team[]> = {};

  constructor(private fb: FormBuilder, public dataService: DataService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.UefaTeamNames = this.dataService.ALL_TEAMS_DATA.filter(val => val.confederation === 'UEFA');
    this.AfcTeamNames = this.dataService.ALL_TEAMS_DATA.filter(val => val.confederation === 'AFC');
    this.CafTeamNames = this.dataService.ALL_TEAMS_DATA.filter(val => val.confederation === 'CAF');
    this.ConcacafTeamNames = this.dataService.ALL_TEAMS_DATA.filter(val => val.confederation === 'CONCACAF' && val.host !== true);

    this.UefaGroupLetters.forEach(letter => {
      this.UefaGroupedTeams[letter] = this.UefaTeamNames.filter(t => t.qGroup === letter);
    });
    this.AfcGroupLetters.forEach(letter => {
      this.AfcGroupedTeams[letter] = this.AfcTeamNames.filter(t => t.qGroup === letter);
    });
    this.CafGroupLetters.forEach(letter => {
      this.CafGroupedTeams[letter] = this.CafTeamNames.filter(t => t.qGroup === letter);
    });
    this.ConcacafGroupLetters.forEach(letter => {
      this.ConcacafGroupedTeams[letter] = this.ConcacafTeamNames.filter(t => t.qGroup === letter);
    });

    const UefaControls: Record<string, any> = {};
    const AfcControls: Record<string, any> = {};
    const CafControls: Record<string, any> = {};
    const ConcacafControls: Record<string, any> = {};

    this.UefaGroupLetters.forEach(letter => {
      const options = this.UefaGroupedTeams[letter] || [];
      const first = options[0]?.name ?? '';
      const second = options[1]?.name ?? '';
      UefaControls['group' + letter] = this.fb.group({
        pos1: [first, Validators.required],
        pos2: [second, Validators.required]
      }, { validators: [this.positionsDistinctValidator()] });
    });

    this.AfcGroupLetters.forEach(letter => {
      const options = this.AfcGroupedTeams[letter] || [];
      const first = options[0]?.name ?? '';
      const second = options[1]?.name ?? '';
      AfcControls['group' + letter] = this.fb.group({
        pos1: [first, Validators.required],
        pos2: [second, Validators.required]
      }, { validators: [this.positionsDistinctValidator()] });
    });

    this.CafGroupLetters.forEach(letter => {
      const options = this.CafGroupedTeams[letter] || [];
      const qualifiedNames = this.dataService.QUALIFIED_TEAMS.filter(t => t.confederation === 'CAF').map(t => t.name);
      const qualifiedInGroup = options.filter(o => qualifiedNames.includes(o.name));
      let first = options[0]?.name ?? '';
      let second = options[1]?.name ?? '';
      let lockPos1 = false;
      let lockPos2 = false;
      if (qualifiedInGroup.length >= 2) {
        first = qualifiedInGroup[0].name;
        second = qualifiedInGroup[1].name;
        lockPos1 = true;
        lockPos2 = true;
      } else if (qualifiedInGroup.length === 1) {
        first = qualifiedInGroup[0].name;
        const other = options.find(o => o.name !== first)?.name ?? '';
        second = other;
        lockPos1 = true;
      }
      CafControls['group' + letter] = this.fb.group({
        pos1: [first, Validators.required],
        pos2: [second, Validators.required]
      }, { validators: [this.positionsDistinctValidator()] });
      this.lockedCafPositions['group' + letter] = { pos1: lockPos1, pos2: lockPos2 };
    });

    this.ConcacafGroupLetters.forEach(letter => {
      const options = this.ConcacafGroupedTeams[letter] || [];
      const qualifiedNames = this.dataService.QUALIFIED_TEAMS.filter(t => t.confederation === 'CONCACAF' && t.host !== true).map(t => t.name);
      const qualifiedInGroup = options.filter(o => qualifiedNames.includes(o.name));
      let first = options[0]?.name ?? '';
      let second = options[1]?.name ?? '';
      let lockPos1 = false;
      let lockPos2 = false;
      if (qualifiedInGroup.length >= 2) {
        first = qualifiedInGroup[0].name;
        second = qualifiedInGroup[1].name;
        lockPos1 = true;
        lockPos2 = true;
      } else if (qualifiedInGroup.length === 1) {
        first = qualifiedInGroup[0].name;
        const other = options.find(o => o.name !== first)?.name ?? '';
        second = other;
        lockPos1 = true;
      }
      ConcacafControls['group' + letter] = this.fb.group({
        pos1: [first, Validators.required],
        pos2: [second, Validators.required]
      }, { validators: [this.positionsDistinctValidator()] });
      this.lockedConcacafPositions['group' + letter] = { pos1: lockPos1, pos2: lockPos2 };
    });

    this.UefaQualifiersForm = this.fb.group(UefaControls);
    this.AfcQualifiersForm = this.fb.group(AfcControls);
    this.CafQualifiersForm = this.fb.group(CafControls);
    this.ConcacafQualifiersForm = this.fb.group(ConcacafControls);

    Object.keys(this.lockedCafPositions).forEach(groupName => {
      const locks = this.lockedCafPositions[groupName];
      const group = this.CafQualifiersForm.get('group' + groupName) as FormGroup | null;
      if (!group) { return; }
      if (locks.pos1) { group.get('pos1')?.disable({ emitEvent: false }); }
      if (locks.pos2) { group.get('pos2')?.disable({ emitEvent: false }); }
    });
    this.applyCafLocks();

    Object.keys(this.lockedConcacafPositions).forEach(groupName => {
      const locks = this.lockedConcacafPositions[groupName];
      const group = this.ConcacafQualifiersForm.get('group' + groupName) as FormGroup | null;
      if (!group) { return; }
      if (locks.pos1) { group.get('pos1')?.disable({ emitEvent: false }); }
      if (locks.pos2) { group.get('pos2')?.disable({ emitEvent: false }); }
    });
    this.applyConcacafLocks();

    const wireUpPair = (form: FormGroup, letters: string[], grouped: Record<string, Team[]>) => {
      letters.forEach(letter => {
        const groupName = 'group' + letter;
        const group = form.get(groupName) as FormGroup | null;
        if (!group) { return; }
        const pos1 = group.get('pos1')!;
        const pos2 = group.get('pos2')!;
        const pickAlternate = (excluded: string) => {
          const opts = grouped[letter] || [];
          return opts.find(o => o.name !== excluded)?.name ?? '';
        };
        this.subs.add(pos1.valueChanges.subscribe(val => {
          const other = pos2.value;
          if (!val) { return; }
          if (val === other) {
            const alt = pickAlternate(val);
            pos2.setValue(alt, { emitEvent: false });
            group.updateValueAndValidity({ onlySelf: true, emitEvent: false });
          }
        }));
        this.subs.add(pos2.valueChanges.subscribe(val => {
          const other = pos1.value;
          if (!val) { return; }
          if (val === other) {
            const alt = pickAlternate(val);
            pos1.setValue(alt, { emitEvent: false });
            group.updateValueAndValidity({ onlySelf: true, emitEvent: false });
          }
        }));
      });
    };

    wireUpPair(this.UefaQualifiersForm, this.UefaGroupLetters, this.UefaGroupedTeams);
    wireUpPair(this.AfcQualifiersForm, this.AfcGroupLetters, this.AfcGroupedTeams);
    wireUpPair(this.CafQualifiersForm, this.CafGroupLetters, this.CafGroupedTeams);
    wireUpPair(this.ConcacafQualifiersForm, this.ConcacafGroupLetters, this.ConcacafGroupedTeams);

    this.updatePlayoffTeamList(this.AfcGroupLetters, this.AfcGroupedTeams, this.AfcPlayoffTeamList);
    this.updatePlayoffTeamList(this.ConcacafGroupLetters, this.ConcacafGroupedTeams, this.ConcacafPlayoffTeamList);
    this.updatePlayoffTeamList(this.CafGroupLetters, this.CafGroupedTeams, this.CafPlayoffTeamList);

    const defaults = this.CafPlayoffTeamList.map(t => t.name).filter(Boolean).slice(0, 4);
    while (defaults.length < 4) { defaults.push(''); }
    this.cafPlayoffForm = this.fb.group({
      runner0: [defaults[0], Validators.required],
      runner1: [defaults[1], Validators.required],
      runner2: [defaults[2], Validators.required],
      runner3: [defaults[3], Validators.required],
    }, { validators: [this.uniqueRunnersValidator()] });

    this.selectedAfcRunner = this.AfcPlayoffTeamList[0] ?? null;
    this.selectedConcacafRunners = [
      this.ConcacafPlayoffTeamList[0],
      this.ConcacafPlayoffTeamList[1]
    ].filter((t): t is Team => !!t && !!t.name);

    if (this.UefaQualifiersForm.valid) {
      this.processUefaSelections(this.UefaQualifiersForm.value);
    }

    const initialAfcPos2 = this.afcPos2List;
    if (this.AfcQualifiersForm.valid) {
      this.selectedAfcRunner = initialAfcPos2[0] ?? this.selectedAfcRunner;
      this.processAfcSelections(this.AfcQualifiersForm.value);
    }

    const initialConcacafPos2 = this.concacafPos2List;
    if (this.ConcacafQualifiersForm.valid) {
      this.selectedConcacafRunners = [initialConcacafPos2[0], initialConcacafPos2[1]].filter(Boolean) as Team[];
      const a = this.selectedConcacafRunners[0] ?? null;
      const b = this.selectedConcacafRunners[1] ?? null;
      this.setInterconfTeamForConcacaf(a, b);
      if (typeof this.processConcacafSelections === 'function') {
        this.processConcacafSelections(this.ConcacafQualifiersForm.value);
      }
    }

    Promise.resolve().then(() => {
      //this.refreshCafPlayoff();
      this.refreshCafIcSelection();
      //this.refreshConcacafPlayoff();
      this.cdr.detectChanges();
    });

    this.subs.add(
      this.cafPlayoffForm.valueChanges.subscribe(() => {
        this.refreshCafIcSelection();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // validators / small helpers
  positionsDistinctValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      const pos1 = group.get('pos1')?.value;
      const pos2 = group.get('pos2')?.value;
      if (!pos1 || !pos2) {
        return { positionsMissing: true };
      }
      return pos1 === pos2 ? { positionsSame: true } : null;
    };
  }

  uniqueRunnersValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      const vals = Object.values(group.value || {}).filter(v => !!v);
      const set = new Set(vals);
      return set.size === vals.length ? null : { duplicates: true };
    };
  }

  // UEFA methods
  onUefaDrop(event: CdkDragDrop<Team[]>, letter: string) {
     this.onGroupDrop(
      event,
      this.UefaGroupedTeams,
      this.UefaQualifiersForm,
      'UEFA',
      this.UefaGroupLetters,
      letter,
      this.processUefaSelections.bind(this),
    );
  }

  private processUefaSelections(res: any): void {
    this.dataService.resetConfederationQualifiedTeams('UEFA');
    Object.keys(res).forEach(key => {
      const teams = res[key];
      this.addQualifiedTeam(this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos1) as Team);
      this.addPlayoffTeam(this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos2) as Team);
    });
    let count = 0;
    let index = 0;
    while (count < 4 && index < this.dataService.UEFA_NATIONS_LEAGUE_PRIORITY.length) {
      let team = this.dataService.UEFA_NATIONS_LEAGUE_PRIORITY[index];
      if (
        team &&
        (!this.dataService.QUALIFIED_TEAMS.find(t => t.name === team) &&
          !this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === team) &&
          !this.dataService.PROJECTED_QUALIFIERS.find(qt => qt.name === team)
        )
      ) {
        let t: Team = this.dataService.ALL_TEAMS_DATA.find(at => at.name === team) as Team;
        t.nl = true;
        this.dataService.UEFA_PLAYOFF_TEAMS.push(t);
        count++;
      }
      index++;
    }
  }

  // AFC methods
  get afcPos2List(): Team[] {
    if (!this.AfcQualifiersForm) { return []; }
    const names = this.AfcGroupLetters
      .map(letter => this.AfcQualifiersForm.get('group' + letter + '.pos2')?.value)
      .filter((n): n is string => !!n);
    return names
      .map(name => this.dataService.ALL_TEAMS_DATA.find(t => t.name === name))
      .filter((t): t is Team => !!t);
  }

  onAfcDrop(event: CdkDragDrop<Team[]>, letter: string) {
    this.onGroupDrop(
      event,
      this.AfcGroupedTeams,
      this.AfcQualifiersForm,
      'AFC',
      this.AfcGroupLetters,
      letter,
      this.processAfcSelections.bind(this),
      () => {
        this.updatePlayoffTeamList(this.AfcGroupLetters, this.AfcGroupedTeams, this.AfcPlayoffTeamList);
        this.selectedAfcRunner = this.AfcPlayoffTeamList[0] ?? null;
        this.setInterconfTeamForAFC(this.selectedAfcRunner);
      }
    );
  }

  onAfcIcDrop(event: CdkDragDrop<Team[]>) {
    moveItemInArray(this.AfcPlayoffTeamList, event.previousIndex, event.currentIndex);
    this.selectedAfcRunner = this.AfcPlayoffTeamList[0];
    this.setInterconfTeamForAFC(this.selectedAfcRunner);
    this.cdr.detectChanges();
  }

  private processAfcSelections(res: any): void {
    this.dataService.resetConfederationQualifiedTeams('AFC');
    Object.keys(res).forEach(key => {
      const teams = res[key];
      this.addQualifiedTeam(this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos1) as Team);
    });
    if (this.selectedAfcRunner) {
      let val = Object.assign({}, this.selectedAfcRunner);
      val.playoffSlot = 'AFC playoff winner';
      this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS.push(val);
    }
  }

  onAfcRunnerChange(selected?: Team | null): void {
    this.selectedAfcRunner = selected ?? null;
    this.setInterconfTeamForAFC(this.selectedAfcRunner);
    if (this.AfcQualifiersForm) {
      this.processAfcSelections(this.AfcQualifiersForm.value);
    }
  }

  private setInterconfTeamForAFC(t?: Team | null) {
    const teams = this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS;
    const existingIndex = teams.findIndex(team => team.confederation === 'AFC' && team.qualified !== true);
    const existing = existingIndex >= 0 ? teams[existingIndex] : undefined;
    if (!t || !t.name) {
      if (existingIndex >= 0) teams.splice(existingIndex, 1);
      return;
    }
    if (existing && existing.name === t.name) return;
    const entry: Team = { ...t, playoffSlot: 'AFC playoff winner' };
    if (existingIndex >= 0) teams.splice(existingIndex, 1, entry);
    else teams.push(entry);
  }

  // CAF methods
  onCafDrop(event: CdkDragDrop<Team[]>, letter: string) {
    this.onGroupDrop(
      event,
      this.CafGroupedTeams,
      this.CafQualifiersForm,
      'CAF',
      this.CafGroupLetters,
      letter,
      this.processCafSelections.bind(this),
      () => {
        this.updatePlayoffTeamList(this.CafGroupLetters, this.CafGroupedTeams, this.CafPlayoffTeamList);
        for (let i = 0; i < 4; i++) {
          this.cafPlayoffForm.get('runner' + i)?.setValue(this.CafPlayoffTeamList[i]?.name ?? '');
        }
        this.refreshCafIcSelection();
      }
    );
  }


  onCafIcDrop(event: CdkDragDrop<Team[]>) {
    moveItemInArray(this.CafPlayoffTeamList, event.previousIndex, event.currentIndex);
    this.CafIcTeam = this.CafPlayoffTeamList[0];
    this.setInterconfTeamForCAF(this.CafIcTeam);
    this.cdr.detectChanges();
  }

  private processCafSelections(res: any): void {
    this.dataService.resetConfederationQualifiedTeams('CAF');
    Object.keys(res || {}).forEach(key => {
      const teams = res[key];
      const found = this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos1);
      if (found) { this.addQualifiedTeam(found); }
    });
    this.setInterconfTeamForCAF(this.CafIcTeam);
  }

  private refreshCafIcSelection(): void {
    const list = this.CafPlayoffTeamList;
    if (!list || list.length === 0) {
      this.CafIcTeam = null;
      this.setInterconfTeamForCAF(undefined);
      this.cdr.detectChanges();
      return;
    }
    Promise.resolve().then(() => {
      const first = list[0];
      if (this.CafIcTeam && this.CafIcTeam.name === first.name) {
        return;
      }
      this.CafIcTeam = first;
      this.setInterconfTeamForCAF(this.CafIcTeam);
      if (this.CafQualifiersForm) {
        this.processCafSelections(this.CafQualifiersForm.value);
      }
      this.cdr.detectChanges();
    });
  }

  private setInterconfTeamForCAF(t?: Team | null): void {
    const teams = this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS;
    const existingIndex = teams.findIndex(team => team.confederation === 'CAF' && !(team as any).qualified);
    const existing = existingIndex >= 0 ? teams[existingIndex] : undefined;
    if (!t || !t.name) {
      if (existingIndex >= 0) { teams.splice(existingIndex, 1); }
      return;
    }
    if (existing && existing.name === t.name) { return; }
    const entry: Team = { ...t, playoffSlot: 'CAF playoff winner' };
    if (existingIndex >= 0) {
      teams.splice(existingIndex, 1, entry);
    } else {
      teams.push(entry);
    }
  }

  onCafPlayoffDrop(event: CdkDragDrop<Team[]>) {
    const group = this.CafPlayoffTeamList;
    const targetIdx = event.currentIndex;
    const firstQualifiedIdx = group.findIndex(t => t.qualified);

    if (firstQualifiedIdx !== -1 && targetIdx < firstQualifiedIdx) {
      moveItemInArray(group, event.currentIndex, event.previousIndex);
      this.cdr.detectChanges(); // Force UI update
      return;
    }

    moveItemInArray(group, event.previousIndex, event.currentIndex);

    for (let i = 0; i < 4; i++) {
      this.cafPlayoffForm.get('runner' + i)?.setValue(group[i].name);
    }
    if (!group.slice(0, 4).some(t => t.name === this.CafIcTeam?.name)) {
      this.CafIcTeam = group[0];
      this.onCafIcChange(this.CafIcTeam);
    }
  }

  onCafIcChange(selected?: Team | null): void {
    this.CafIcTeam = selected ?? null;
    this.setInterconfTeamForCAF(this.CafIcTeam);
    if (this.CafQualifiersForm) {
      this.processCafSelections(this.CafQualifiersForm.value);
    }
  }

  // CONCACAF methods
  get concacafPos2List(): Team[] {
    if (!this.ConcacafQualifiersForm) { return []; }
    let teamNames: string[] = this.ConcacafGroupLetters
      .map(letter => this.ConcacafQualifiersForm.get('group' + letter + '.pos2')?.value);
    let res: Team[] = [];
    teamNames.forEach(team => {
      res.push(this.dataService.ALL_TEAMS_DATA.find(t => t.name === team) as Team);
    });
    return res;
  }

  onConcacafDrop(event: CdkDragDrop<Team[]>, letter: string) {
    this.onGroupDrop(
      event,
      this.ConcacafGroupedTeams,
      this.ConcacafQualifiersForm,
      'CONCACAF',
      this.ConcacafGroupLetters,
      letter,
      this.processConcacafSelections.bind(this),
      () => {
        this.updatePlayoffTeamList(this.ConcacafGroupLetters, this.ConcacafGroupedTeams, this.ConcacafPlayoffTeamList);
        this.selectedConcacafRunners = [
          this.ConcacafPlayoffTeamList[0],
          this.ConcacafPlayoffTeamList[1]
        ].filter((t): t is Team => !!t && !!t.name);
        this.setInterconfTeamForConcacaf(this.selectedConcacafRunners[0], this.selectedConcacafRunners[1]);
      }
    );
  }

  onConcacafIcDrop(event: CdkDragDrop<Team[]>) {
    moveItemInArray(this.ConcacafPlayoffTeamList, event.previousIndex, event.currentIndex);
    this.selectedConcacafRunners = [
      this.ConcacafPlayoffTeamList[0],
      this.ConcacafPlayoffTeamList[1]
    ].filter((t): t is Team => !!t && !!t.name);
    this.setInterconfTeamForConcacaf(this.selectedConcacafRunners[0], this.selectedConcacafRunners[1]);
    this.cdr.detectChanges();
  }

  onConcacafRunnersClosed(): void {
    const selected = this.selectedConcacafRunners || [];
    if (selected.length === 1 && this.ConcacafPlayoffTeamList.length > 1) {
      const secondTeam = this.ConcacafPlayoffTeamList.find(t => t !== selected[0]);
      if (secondTeam) {
        this.selectedConcacafRunners = [selected[0], secondTeam];
      } else {
        this.selectedConcacafRunners = [selected[0]];
      }
    } else if (selected.length === 0 || selected.length > 2) {
      this.selectedConcacafRunners = selected.slice(0, 2);
    }
    if (
      this.selectedConcacafRunners.length === 2 &&
      this.selectedConcacafRunners[0]?.name === this.selectedConcacafRunners[1]?.name
    ) {
      const alt = this.ConcacafPlayoffTeamList.find(
        t => t.name !== this.selectedConcacafRunners[0].name
      ) ?? null;
      if (alt) {
        this.selectedConcacafRunners[1] = alt;
      } else {
        this.selectedConcacafRunners = [this.selectedConcacafRunners[0]];
      }
      this.selectedConcacafRunners = this.selectedConcacafRunners.filter((t): t is Team => !!t && !!t.name);
    }
    const a = this.selectedConcacafRunners[0] ?? null;
    const b = this.selectedConcacafRunners[1] ?? null;
    this.setInterconfTeamForConcacaf(a, b);
    if (this.ConcacafQualifiersForm && typeof this.processConcacafSelections === 'function') {
      this.processConcacafSelections(this.ConcacafQualifiersForm.value);
    }
  }

  private processConcacafSelections(res: any): void {
    this.dataService.resetConfederationQualifiedTeams('CONCACAF');
    Object.keys(res || {}).forEach(key => {
      const teams = res[key];
      const found = this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos1);
      if (found) { this.addQualifiedTeam(found); }
    });
    const a = this.selectedConcacafRunners[0] ?? null;
    const b = this.selectedConcacafRunners[1] ?? null;
    this.setInterconfTeamForConcacaf(a, b);
  }

  private setInterconfTeamForConcacaf(a?: Team | null, b?: Team | null): void {
    const teams = this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS;
    for (let i = teams.length - 1; i >= 0; i--) {
      if (teams[i].confederation === 'CONCACAF' && !(teams[i] as any).qualified) {
        teams.splice(i, 1);
      }
    }
    const upsert = (t?: Team | null, slot?: string) => {
      if (!t || !t.name) { return; }
      const existing = teams.find(x => x.confederation === 'CONCACAF' && x.name === t.name);
      if (existing) {
        (existing as any).playoffSlot = slot;
        return;
      }
      teams.push({ ...t, playoffSlot: slot });
    };
    upsert(a, 'CONCACAF playoff slot 1');
    upsert(b, 'CONCACAF playoff slot 2');
  }

  // common helpers
  private getQualifiedNames(conf: string, includeHosts = false): string[] {
    return this.dataService.QUALIFIED_TEAMS
      .filter(t => t.confederation === conf && (includeHosts ? true : t.host !== true))
      .map(t => t.name);
  }

  addQualifiedTeam(t?: Team | null) {
    if (!t || !t.name) { return; }
    const exists = this.dataService.PROJECTED_QUALIFIERS.find(team => team.name === t.name);
    if (!exists) {
      this.dataService.PROJECTED_QUALIFIERS.push(t);
    }
  }

  addPlayoffTeam(t?: Team | null) {
    if (!t || !t.name) { return; }
    const exists = this.dataService.UEFA_PLAYOFF_TEAMS.find(team => team.name === t.name);
    if (!exists) {
      this.dataService.UEFA_PLAYOFF_TEAMS.push(t);
    }
  }

  compareTeams = (t1: Team | null, t2: Team | null): boolean => {
    if (t1 === t2) { return true; }
    if (!t1 || !t2) { return false; }
    return t1.name === t2.name;
  }


  updatePlayoffTeamList(groupLetters: string[], groupedTeams: Record<string, Team[]>, targetList: Team[]) {
    const teams = groupLetters
      .map(letter => groupedTeams[letter][1])
      .filter((t): t is Team => !!t && !!t.name);
    targetList.length = 0;
    targetList.push(...teams);
  }

  private applyLocksForConf(
    conf: string,
    form: FormGroup | undefined,
    groupLetters: string[],
    groupedTeams: Record<string, Team[]>,
    posControls = ['pos1', 'pos2']
  ) {
    if (!form) { return; }
    const qualifiedNames = this.dataService.QUALIFIED_TEAMS
      .filter(t => t.confederation === conf && t.host !== true)
      .map(t => t.name);
    groupLetters.forEach(letter => {
      const group = form.get('group' + letter) as FormGroup | null;
      if (!group) { return; }
      const options = groupedTeams[letter] || [];
      options.forEach(team => (team as any).locked = false);
      const qualInThisGroup = options.filter(o => qualifiedNames.includes(o.name)).map(o => o.name);
      posControls.forEach((p, idx) => {
        const control = group.get(p);
        control?.enable({ emitEvent: false });
        if (qualInThisGroup.length > idx) {
          const qname = qualInThisGroup[idx];
          const team = options.find(o => o.name === qname);
          if (team) (team as any).locked = true;
          if (control && control.value === qname) control.disable({ emitEvent: false });
        }
      });
    });
  }

  onGroupDrop(
    event: CdkDragDrop<Team[]>,
    groupedTeams: Record<string, Team[]>,
    qualifiersForm: FormGroup,
    conf: string,
    groupLetters: string[],
    letter: string,
    processSelections: (value: any) => void,
    updatePlayoffList?: () => void
  ) {
    const group = groupedTeams[letter];
    const targetIdx = event.currentIndex;
    const firstQualifiedIdx = group.findIndex(t => t.qualified);

    if (firstQualifiedIdx !== -1 && targetIdx <= firstQualifiedIdx) {
      groupedTeams[letter] = [...this.previousGroupState[`${conf}_${letter}`]];
      this.cdr.detectChanges();
      return;
    }

    if (group[event.previousIndex].qualified) {
      groupedTeams[letter] = [...this.previousGroupState[`${conf}_${letter}`]];
      this.cdr.detectChanges();
      return;
    }

    moveItemInArray(group, event.previousIndex, event.currentIndex);

    const groupForm = qualifiersForm.get('group' + letter);
    if (groupForm) {
      groupForm.get('pos1')?.setValue(group[0].name);
      groupForm.get('pos2')?.setValue(group[1].name);
    }

    if (updatePlayoffList) {
      updatePlayoffList();
    }
    processSelections(qualifiersForm.value);
  }


  // Generic drag started handler for all confederations
  onDragStarted(groupedTeams: Record<string, Team[]>, conf: string, letter: string) {
    this.previousGroupState[`${conf}_${letter}`] = [...groupedTeams[letter]];
  }



  public applyUefaLocks(): void {
    this.applyLocksForConf('UEFA', this.UefaQualifiersForm, this.UefaGroupLetters, this.UefaGroupedTeams);
  }

  public applyAfcLocks(): void {
    this.applyLocksForConf('AFC', this.AfcQualifiersForm, this.AfcGroupLetters, this.AfcGroupedTeams);
  }

  public applyCafLocks(): void {
    this.applyLocksForConf('CAF', this.CafQualifiersForm, this.CafGroupLetters, this.CafGroupedTeams);
    //this.refreshCafPlayoff();
  }

  public applyConcacafLocks(): void {
    this.applyLocksForConf('CONCACAF', this.ConcacafQualifiersForm, this.ConcacafGroupLetters, this.ConcacafGroupedTeams);
    //this.refreshConcacafPlayoff();
  }

  trackByTeam(index: number, team: Team) {
    return team.name;
  }
}