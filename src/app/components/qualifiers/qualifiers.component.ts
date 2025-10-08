import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ValidatorFn, AbstractControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../data-service';
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
// Add MatExpansionModule to your imports array or standalone imports
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
],

  templateUrl: './qualifiers.component.html',
  styleUrls: ['./qualifiers.component.scss']
})
export class QualifiersComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  private initializing = true; // <-- new guard
  UefaQualifiersForm!: FormGroup;
  AfcQualifiersForm!: FormGroup;
  CafQualifiersForm!: FormGroup;
  ConcacafQualifiersForm!: FormGroup;
  
  UefaGroupLetters = 'ABCDEFGHIJKL'.split(''); 
  AfcGroupLetters = 'AB'.split('');
  CafGroupLetters = 'ABCDEFGHI'.split('');
  ConcacafGroupLetters = 'ABC'.split('');
  
  UefaTeamNames: Team[] = [];
  AfcTeamNames: Team[] = [];
  CafTeamNames: Team[] = [];
  ConcacafTeamNames: Team[] = [];

  selectedAfcRunner: Team | null = null;
  selectedCafRunners: Team[] | null = null;

  // new: array bound to the multi-select (keeps selection order)
  selectedConcacafRunners: Team[] = [];
  cafPlayoffForm!: FormGroup;

  CafIcTeam: Team | null = null;        // selected Team object for IC select

  // teams grouped by letter for easier access in template
  UefaGroupedTeams: Record<string, Team[]> = {};
  AfcGroupedTeams: Record<string, Team[]> = {};
  CafGroupedTeams: Record<string, Team[]> = {};
  ConcacafGroupedTeams: Record<string, Team[]> = {};

  // add this map to remember which positions should be locked
  private lockedCafPositions: Record<string, { pos1: boolean; pos2: boolean }> = {};
  private lockedConcacafPositions: Record<string, { pos1: boolean; pos2: boolean }> = {};


  constructor(private fb: FormBuilder, public dataService: DataService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.initializing = true; // start guarded init

    this.UefaTeamNames = this.dataService.ALL_TEAMS_DATA
      .filter(val => val.confederation === 'UEFA');

    this.AfcTeamNames = this.dataService.ALL_TEAMS_DATA
      .filter(val => val.confederation === 'AFC');

    this.CafTeamNames = this.dataService.ALL_TEAMS_DATA
      .filter(val => val.confederation === 'CAF');

    this.ConcacafTeamNames = this.dataService.ALL_TEAMS_DATA
      .filter(val => val.confederation === 'CONCACAF' && val.host !== true);

   
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



    // build a FormGroup per letter with pos1 & pos2 controls
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
      // match qualified teams by name (QUALIFIED_TEAMS may not have qGroup set yet)
      const qualifiedNames = this.dataService.QUALIFIED_TEAMS
        .filter(t => t.confederation === 'CAF')
        .map(t => t.name);
      const qualifiedInGroup = options.filter(o => qualifiedNames.includes(o.name));
 
      // default slots
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
        // ensure the qualified team is included (as pos1) and pick another available for pos2
        first = qualifiedInGroup[0].name;
        const other = options.find(o => o.name !== first)?.name ?? '';
        second = other;
        lockPos1 = true;
      }
 
      CafControls['group' + letter] = this.fb.group({
        pos1: [first, Validators.required],
        pos2: [second, Validators.required]
      }, { validators: [this.positionsDistinctValidator()] });

      // remember locks to apply after the form is created
      this.lockedCafPositions['group' + letter] = { pos1: lockPos1, pos2: lockPos2 };
    });

    this.ConcacafGroupLetters.forEach(letter => {
      const options = this.ConcacafGroupedTeams[letter] || [];
      // match qualified teams by name (QUALIFIED_TEAMS may not have qGroup set yet)
      const qualifiedNames = this.dataService.QUALIFIED_TEAMS
        .filter(t => t.confederation === 'CONCACAF' && t.host !== true)
        .map(t => t.name);
      const qualifiedInGroup = options.filter(o => qualifiedNames.includes(o.name));
 
      // default slots
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
        // ensure the qualified team is included (as pos1) and pick another available for pos2
        first = qualifiedInGroup[0].name;
        const other = options.find(o => o.name !== first)?.name ?? '';
        second = other;
        lockPos1 = true;
      }
 
      ConcacafControls['group' + letter] = this.fb.group({
        pos1: [first, Validators.required],
        pos2: [second, Validators.required]
      }, { validators: [this.positionsDistinctValidator()] });

      // remember locks to apply after the form is created
      this.lockedConcacafPositions['group' + letter] = { pos1: lockPos1, pos2: lockPos2 };
    });
 
    this.UefaQualifiersForm = this.fb.group(UefaControls);
    this.AfcQualifiersForm = this.fb.group(AfcControls);
    this.CafQualifiersForm = this.fb.group(CafControls);
    this.ConcacafQualifiersForm = this.fb.group(ConcacafControls);
 
    // apply the disabled state for any locked CAF positions so they cannot be changed
    Object.keys(this.lockedCafPositions).forEach(groupName => {
      const locks = this.lockedCafPositions[groupName];
      const group = this.CafQualifiersForm.get(groupName) as FormGroup | null;
      if (!group) { return; }
      if (locks.pos1) { group.get('pos1')?.disable({ emitEvent: false }); }
      if (locks.pos2) { group.get('pos2')?.disable({ emitEvent: false }); }
    });
    // make sure locks/defaults re-apply if QUALIFIED_TEAMS was updated earlier/later
    // (call once now to ensure any late-populated QUALIFIED_TEAMS are enforced)
    this.applyCafLocks();


    // apply the disabled state for any locked CAF positions so they cannot be changed
    Object.keys(this.lockedConcacafPositions).forEach(groupName => {
      const locks = this.lockedConcacafPositions[groupName];
      const group = this.ConcacafQualifiersForm.get(groupName) as FormGroup | null;
      if (!group) { return; }
      if (locks.pos1) { group.get('pos1')?.disable({ emitEvent: false }); }
      if (locks.pos2) { group.get('pos2')?.disable({ emitEvent: false }); }
    });
    // make sure locks/defaults re-apply if QUALIFIED_TEAMS was updated earlier/later
    // (call once now to ensure any late-populated QUALIFIED_TEAMS are enforced)
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
          // prefer the first option that's not the excluded one
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
    wireUpPair(this.ConcacafQualifiersForm, this.ConcacafGroupLetters, this.ConcacafGroupedTeams)

    const defaults = this.cafPos2List.map(t => t.name).filter(Boolean).slice(0, 4);
    while (defaults.length < 4) { defaults.push(''); }

    this.cafPlayoffForm = this.fb.group({
      runner0: [defaults[0], Validators.required],
      runner1: [defaults[1], Validators.required],
      runner2: [defaults[2], Validators.required],
      runner3: [defaults[3], Validators.required],
    }, { validators: [this.uniqueRunnersValidator()] });

   

    if (this.UefaQualifiersForm.valid) {
      this.processUefaSelections(this.UefaQualifiersForm.value);
    }

    const initialAfcPos2 = this.afcPos2List; // getter will populate selectedAfcRunner
    if (this.AfcQualifiersForm.valid) {
      // ensure selectedAfcRunner is set (afcPos2List already called above)
      this.selectedAfcRunner = initialAfcPos2[0] ?? this.selectedAfcRunner;
      this.processAfcSelections(this.AfcQualifiersForm.value);
    }

    const initialConcacafPos2 = this.concacafPos2List;
    if (this.ConcacafQualifiersForm.valid) {
      // default selectedConcacafRunners to first two available pos2 teams
      this.selectedConcacafRunners = [initialConcacafPos2[0], initialConcacafPos2[1]].filter(Boolean) as Team[];
      // ensure interconf list and any downstream processing run with the defaults
      const a = this.selectedConcacafRunners[0] ?? null;
      const b = this.selectedConcacafRunners[1] ?? null;
      this.setInterconfTeamForConcacaf(a, b);
      // run concacaf processing if desired (use processConcacafSelections if implemented)
      if (typeof this.processConcacafSelections === 'function') {
        this.processConcacafSelections(this.ConcacafQualifiersForm.value);
      }
    }

   

   
    Promise.resolve().then(() => {
      try {
        this.refreshCafPlayoff();      // set cafPlayoffForm values (emitEvent:false inside)
        this.refreshCafIcSelection();  // sets CafIcTeam and calls processCafSelections()
        // ensure CONCACAF playoff defaults are computed after CD/options exist
        this.refreshConcacafPlayoff();
        this.cdr.detectChanges();
      } finally {
        // allow subscriptions to react from now on
        this.initializing = false;
      }
    });

    this.subs.add(
      this.UefaQualifiersForm.valueChanges.subscribe(val => {
        if (this.UefaQualifiersForm.valid) {
          this.processUefaSelections(val);
        } else {
          // keep UI/state consistent (remove previous UEFA entries if partially changed)
          this.dataService.resetConfederationQualifiedTeams('UEFA');
        }
      })
    );

    this.subs.add(
      this.AfcQualifiersForm.valueChanges.subscribe(val => {
    // Update AFC runner if needed
    if (!this.afcPos2List.some(t => t.name === this.selectedAfcRunner?.name)) {
      this.selectedAfcRunner = this.afcPos2List[0] ?? null;
      this.setInterconfTeamForAFC(this.selectedAfcRunner);
    }

    // Now process selections once
    if (this.AfcQualifiersForm.valid) {
      this.processAfcSelections(val);
    } else {
      this.dataService.resetConfederationQualifiedTeams('AFC');
    }
  })
    );

    this.subs.add(
      this.CafQualifiersForm.valueChanges.subscribe(val => {
        this.refreshCafPlayoff();
       
        if(this.CafQualifiersForm.valid) {
          this.processCafSelections(val);
        } else {
          this.dataService.resetConfederationQualifiedTeams('CAF');
        }
      })
    )

    // keep concacaf playoff picks in sync when group pos2s change
    this.subs.add(
      this.ConcacafQualifiersForm.valueChanges.subscribe(val => {
        if (this.initializing) { return; }
        // recompute the 2 selected CONCACAF runners from pos2 values
        this.refreshConcacafPlayoff();
        if (this.ConcacafQualifiersForm.valid) {
          this.processConcacafSelections(val);
        } else {
          this.dataService.resetConfederationQualifiedTeams('CONCACAF');
        }
      })
    );

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

  // -------------------------
  // UEFA methods
  // -------------------------
  private processUefaSelections(res: any): void {
    this.dataService.resetConfederationQualifiedTeams('UEFA');

    // add group winners to qualified teams, runners-up to playoff teams
    Object.keys(res).forEach(key => {
      const teams = res[key];
      this.addQualifiedTeam(this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos1) as Team);
      this.addPlayoffTeam(this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos2) as Team);
    });

    // add nations league playoff teams if not already qualified or in playoffs.
    let count = 0;
    let index = 0;
    while (count < 4 && index < this.dataService.UEFA_NATIONS_LEAGUE_PRIORITY.length) {
      let team = this.dataService.UEFA_NATIONS_LEAGUE_PRIORITY[index];

      if (team && (!this.dataService.QUALIFIED_TEAMS.find(t => t.name === team) && !this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === team) && !this.dataService.PROJECTED_QUALIFIERS.find(qt => qt.name === team))) {
        this.dataService.UEFA_PLAYOFF_TEAMS.push(this.dataService.ALL_TEAMS_DATA.find(at => at.name === team) as Team);
        count++;
      }
      index++;
    }
  }

  // -------------------------
  // AFC methods
  // -------------------------
  get afcPos2List(): Team[] {
    if (!this.AfcQualifiersForm) { return []; }
    const names = this.AfcGroupLetters
      .map(letter => this.AfcQualifiersForm.get('group' + letter + '.pos2')?.value)
      .filter((n): n is string => !!n);
    return names
      .map(name => this.dataService.ALL_TEAMS_DATA.find(t => t.name === name))
      .filter((t): t is Team => !!t);
  }

  private processAfcSelections(res: any): void {
    this.dataService.resetConfederationQualifiedTeams('AFC');

    Object.keys(res).forEach(key => {
      const teams = res[key];
      this.addQualifiedTeam(this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos1) as Team);
    });

    if (this.selectedAfcRunner) {
      let val = Object.assign({},this.selectedAfcRunner );
      val.playoffSlot = 'AFC playoff winner';
      this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS.push(val);
    }
  }

  // called from the AFC select in the template
  onAfcRunnerChange(selected?: Team | null): void {
    this.selectedAfcRunner = selected ?? null;

    // keep INTERCONTINENTAL_PLAYOFF_TEAMS consistent (idempotent)
    this.setInterconfTeamForAFC(this.selectedAfcRunner);

    // run same processing as submit so other state updates occur immediately
    if (this.AfcQualifiersForm) {
      this.processAfcSelections(this.AfcQualifiersForm.value);
    }
  }

  // idempotent setter for AFC interconf entry (mirrors CAF helper pattern)
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



  // -------------------------
  // CAF methods
  // -------------------------


  private refreshCafPlayoff(): void {
    if (!this.cafPlayoffForm) { return; }

    // ensure runner controls are enabled so we can set values
    ['runner0','runner1','runner2','runner3'].forEach(k => {
      const ctrl = this.cafPlayoffForm.get(k);
      if (ctrl && ctrl.disabled) { ctrl.enable({ emitEvent: false }); }
    });

    // take first 4 pos2 names (pad with empty strings)
    const names = this.cafPos2List.map(t => t.name).filter(Boolean).slice(0, 4);
    while (names.length < 4) { names.push(''); }

    // set values without emitting to avoid subscription loops; we'll update dependent state explicitly
    this.cafPlayoffForm.setValue({
      runner0: names[0],
      runner1: names[1],
      runner2: names[2],
      runner3: names[3],
    }, { emitEvent: false });

    // update IC selection and any dependent state
    this.refreshCafIcSelection();
  }

  
  isCafOptionDisabled(name: string, index: number): boolean {
    if (!this.cafPlayoffForm) { return false; }
    const values = Object.values(this.cafPlayoffForm.value || {});
    return values.some((v, i) => i !== index && v === name);
  }
 
  get cafPos2List(): Team[] {
    if (!this.CafQualifiersForm) { return []; }
    const teamNames = this.CafGroupLetters
      .map(letter => this.CafQualifiersForm.get('group' + letter + '.pos2')?.value)
      .filter((n): n is string => !!n);
    return teamNames
     .map(name => this.dataService.ALL_TEAMS_DATA.find(t => t.name === name))
     .filter((t): t is Team => !!t);
  }

  get CafPlayoffTeamList(): Team[] {
    if (!this.cafPlayoffForm) { return []; }

    const list = Object.values(this.cafPlayoffForm.value || {});
    return (list as string[])
      .map(name => this.dataService.ALL_TEAMS_DATA.find(t => t.name === name))
      .filter((t): t is Team => !!t);

  }

  uniqueRunnersValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      const vals = Object.values(group.value || {}).filter(v => !!v);
      const set = new Set(vals);
      return set.size === vals.length ? null : { duplicates: true };
    };
  }

  onCafIcChange(selected?: Team | null): void {
    this.CafIcTeam = selected ?? null;
    this.setInterconfTeamForCAF(this.CafIcTeam);
    if (this.CafQualifiersForm) {
      this.processCafSelections(this.CafQualifiersForm.value);
    }
  }

  private refreshCafIcSelection(): void {
    const list = this.CafPlayoffTeamList;
    // no options -> clear selection and interconf entry
    if (!list || list.length === 0) {
      this.CafIcTeam = null;
      this.setInterconfTeamForCAF(undefined);
      this.cdr.detectChanges();
      return;
    }

    // defer until after change detection so mat-select options exist
    Promise.resolve().then(() => {
      const first = list[0];
      // avoid redundant work if already set to the same team
      if (this.CafIcTeam && this.CafIcTeam.name === first.name) {
        return;
      }

      this.CafIcTeam = first;
      // keep INTERCONTINENTAL_PLAYOFF_TEAMS in sync
      this.setInterconfTeamForCAF(this.CafIcTeam);

      // now that IC selection is set, process CAF selections to update projected qualifiers
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

    // remove existing if no new team provided
    if (!t || !t.name) {
      if (existingIndex >= 0) { teams.splice(existingIndex, 1); }
      return;
    }

    // no change needed
    if (existing && existing.name === t.name) { return; }

    const entry: Team = { ...t, playoffSlot: 'CAF playoff winner' };
    if (existingIndex >= 0) {
      teams.splice(existingIndex, 1, entry);
    } else {
      teams.push(entry);
    }
  }

  private processCafSelections(res: any): void {
    // clear previous CAF entries
    this.dataService.resetConfederationQualifiedTeams('CAF');

    // add group winners (pos1) as projected qualifiers
    Object.keys(res || {}).forEach(key => {
      const teams = res[key];
      const found = this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos1);
      if (found) { this.addQualifiedTeam(found); }
    });

    // ensure INTERCONTINENTAL_PLAYOFF_TEAMS reflects the current CAF IC selection
    this.setInterconfTeamForCAF(this.CafIcTeam);
  }

  // -------------------------
  // CONCACAF methods
  // -------------------------

  get concacafPos2List(): Team[] {
    if (!this.ConcacafQualifiersForm) { return []; }

    let teamNames:string[] = this.ConcacafGroupLetters
      .map(letter => this.ConcacafQualifiersForm.get('group' + letter + '.pos2')?.value);

    let res:Team[] = [];

    teamNames.forEach(team => {
      res.push(this.dataService.ALL_TEAMS_DATA.find(t=> t.name === team) as Team);
    })

    // do not mutate selection from getter; refreshConcacafPlayoff will set defaults
    return res;
  }

 
  
  private processConcacafSelections(res: any): void {
    this.dataService.resetConfederationQualifiedTeams('CONCACAF');

    Object.keys(res || {}).forEach(key => {
      const teams = res[key];
      const found = this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos1);
      if (found) { this.addQualifiedTeam(found); }
    });

    // use the multi-select array for interconf slots (up to 2)
    const a = this.selectedConcacafRunners[0] ?? null;
    const b = this.selectedConcacafRunners[1] ?? null;
    this.setInterconfTeamForConcacaf(a, b);

    console.log('Projected Qualifiers', this.dataService.PROJECTED_QUALIFIERS);
    console.log('Projected UEFA Playoff Teams', this.dataService.UEFA_PLAYOFF_TEAMS);
    console.log('Projected Interconfederation Playoff teams', this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS);
  }

    // idempotent setter for two CONCACAF interconf playoff entries (keeps 2 slots)
  private setInterconfTeamForConcacaf(a?: Team | null, b?: Team | null): void {
    const teams = this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS;
    // remove any non-qualified CONCACAF entries first
    for (let i = teams.length - 1; i >= 0; i--) {
      if (teams[i].confederation === 'CONCACAF' && !(teams[i] as any).qualified) {
        teams.splice(i, 1);
      }
    }

    const upsert = (t?: Team | null, slot?: string) => {
      if (!t || !t.name) { return; }
      const existing = teams.find(x => x.confederation === 'CONCACAF' && x.name === t.name);
      if (existing) {
        // keep slot updated if needed
        (existing as any).playoffSlot = slot;
        return;
      }
      teams.push({ ...t, playoffSlot: slot });
    };

    upsert(a, 'CONCACAF playoff slot 1');
    upsert(b, 'CONCACAF playoff slot 2');
  }

  
  onConcacafRunnersClosed(): void {
    console.log('closed');
    const selected = this.selectedConcacafRunners || [];

    // If only one team is selected, automatically add a second team
    if (selected.length === 1 && this.concacafPos2List.length > 1) {
      const secondTeam = this.concacafPos2List.find(t => t !== selected[0]);
      if (secondTeam) {
        this.selectedConcacafRunners = [selected[0], secondTeam];
      } else {
        this.selectedConcacafRunners = [selected[0]];
      }
    } else if (selected.length === 0 || selected.length >2) {
      // accept up to two selections if less than 2 or more than 2 are selected
      this.selectedConcacafRunners = selected.slice(0, 2);
    }

    // Ensure uniqueness: if duplicate names selected, pick an alternate for the second slot
    if (
      this.selectedConcacafRunners.length === 2 &&
      this.selectedConcacafRunners[0]?.name === this.selectedConcacafRunners[1]?.name
    ) {
      console.log( 'selected ', this.selectedConcacafRunners[0]?.name, this.selectedConcacafRunners[1]?.name)
      const alt = this.concacafPos2List.find(
        t => t.name !== this.selectedConcacafRunners[0].name
      ) ?? null;
      if (alt) {
        this.selectedConcacafRunners[1] = alt;
      } else {
        this.selectedConcacafRunners = [this.selectedConcacafRunners[0]];
      }
      this.selectedConcacafRunners = this.selectedConcacafRunners.filter(Boolean) as Team[];
    }

   
    // Set interconf teams
    const a = this.selectedConcacafRunners[0] ?? null;
    const b = this.selectedConcacafRunners[1] ?? null;
    this.setInterconfTeamForConcacaf(a, b);

    // Process selections
    if (this.ConcacafQualifiersForm && typeof this.processConcacafSelections === 'function') {
      this.processConcacafSelections(this.ConcacafQualifiersForm.value);
    }
  }

  // minimal refresh for CONCACAF runner picks: pick first two pos2 teams and sync interconf list
  private refreshConcacafPlayoff(): void {
    if (!this.ConcacafQualifiersForm) { return; }
    const opts = this.concacafPos2List;
    const first = opts[0] ?? null;
    const second = opts[1] ?? null;
    this.selectedConcacafRunners = [first, second].filter(Boolean) as Team[];
    const a = this.selectedConcacafRunners[0] ?? null;
    const b = this.selectedConcacafRunners[1] ?? null;
    this.setInterconfTeamForConcacaf(a, b);
  }
 
   // -------------------------
   // common helpers (new)
   // -------------------------
   private getQualifiedNames(conf: string, includeHosts = false): string[] {
    return this.dataService.QUALIFIED_TEAMS
      .filter(t => t.confederation === conf && (includeHosts ? true : t.host !== true))
      .map(t => t.name);
  }

  // idempotent single-team upsert into INTERCONTINENTAL_PLAYOFF_TEAMS
  private safeUpsertInterconfTeam(conf: string, team?: Team | null, slot?: string) {
    const list = this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS;
    // remove non-qualified existing entries for this conf and same slot semantics will be handled by caller
    const existingIndex = list.findIndex(t => t.confederation === conf && !(t as any).qualified && t.playoffSlot === slot);
    if (!team || !team.name) {
      if (existingIndex >= 0) list.splice(existingIndex, 1);
      return;
    }
    if (existingIndex >= 0 && list[existingIndex].name === team.name) return;
    const entry = { ...team, confederation: conf, playoffSlot: slot } as Team;
    if (existingIndex >= 0) list.splice(existingIndex, 1, entry);
    else list.push(entry);
  }

  // safe: ignore falsy or unmatched teams — add to PROJECTED_QUALIFIERS (idempotent)
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

  // compare function for mat-select compareWith
  compareTeams = (t1: Team | null, t2: Team | null): boolean => {
    if (t1 === t2) { return true; }
    if (!t1 || !t2) { return false; }
    return t1.name === t2.name;
  }

   // Generic "apply locks" pattern for a confederation:
   // - enable controls first
   // - place qualified team names into pos controls if missing
   // - disable controls that contain qualified names
   private applyLocksForConf(conf: string, form: FormGroup | undefined, groupLetters: string[], groupedTeams: Record<string, Team[]>, posControls = ['pos1','pos2']) {
     if (!form) { return; }
     const qualifiedNames = this.getQualifiedNames(conf);

     // if none qualified: enable all and exit
     if (!qualifiedNames || qualifiedNames.length === 0) {
       groupLetters.forEach(letter => {
         const group = form.get('group' + letter) as FormGroup | null;
         if (!group) { return; }
         posControls.forEach(p => group.get(p)?.enable({ emitEvent: false }));
       });
       return;
     }

     groupLetters.forEach(letter => {
       const group = form.get('group' + letter) as FormGroup | null;
       if (!group) { return; }
       const options = groupedTeams[letter] || [];
       const qualInThisGroup = options.filter(o => qualifiedNames.includes(o.name)).map(o => o.name);

       // enable both controls first so we can set values
       const p1 = group.get(posControls[0]);
       const p2 = group.get(posControls[1]);
       p1?.enable({ emitEvent: false });
       p2?.enable({ emitEvent: false });

       if (qualInThisGroup.length > 0) {
         qualInThisGroup.forEach(qname => {
           const v1 = p1?.value;
           const v2 = p2?.value;
           if (v1 !== qname && v2 !== qname) {
             if (!p1?.disabled) { p1?.setValue(qname, { emitEvent: false }); }
             else if (!p2?.disabled) { p2?.setValue(qname, { emitEvent: false }); }
           }
         });

         if (p1 && qualInThisGroup.includes(p1.value)) { p1.disable({ emitEvent: false }); }
         if (p2 && qualInThisGroup.includes(p2.value)) { p2.disable({ emitEvent: false }); }
       } else {
         p1?.enable({ emitEvent: false });
         p2?.enable({ emitEvent: false });
       }
     });
   }

   // -------------------------
   // wrappers for each confederation (call the generic helper)
   // -------------------------
   public applyUefaLocks(): void {
     this.applyLocksForConf('UEFA', this.UefaQualifiersForm, this.UefaGroupLetters, this.UefaGroupedTeams);
   }

   public applyAfcLocks(): void {
     this.applyLocksForConf('AFC', this.AfcQualifiersForm, this.AfcGroupLetters, this.AfcGroupedTeams);
   }

   public applyCafLocks(): void {
     this.applyLocksForConf('CAF', this.CafQualifiersForm, this.CafGroupLetters, this.CafGroupedTeams);
     // follow up: recompute derived CAF state
     this.refreshCafPlayoff();
   }

   public applyConcacafLocks(): void {
     this.applyLocksForConf('CONCACAF', this.ConcacafQualifiersForm, this.ConcacafGroupLetters, this.ConcacafGroupedTeams);
     this.refreshConcacafPlayoff();
   }

}