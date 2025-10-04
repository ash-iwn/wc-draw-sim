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
@Component({
  selector: 'app-qualifiers',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatOptionModule],
  templateUrl: './qualifiers.component.html',
  styleUrl: './qualifiers.component.scss'
})
export class QualifiersComponent implements OnInit {
  private subs = new Subscription();
  private initializing = true; // <-- new guard
  UefaQualifiersForm!: FormGroup;
  AfcQualifiersForm!: FormGroup;
  CafQualifiersForm!: FormGroup;
  
  UefaGroupLetters = 'ABCDEFGHIJKL'.split(''); 
  AfcGroupLetters = 'AB'.split('');
  CafGroupLetters = 'ABCDEFGHI'.split(''); 
  
  UefaTeamNames: Team[] = [];
  AfcTeamNames: Team[] = [];
  CafTeamNames: Team[] = [];

  selectedAfcRunner: Team | null = null;
  selectedCafRunners: Team[] | null = null;
  cafPlayoffForm!: FormGroup;

  CafIcTeam: Team | null = null;        // selected Team object for IC select

  // teams grouped by letter for easier access in template
  UefaGroupedTeams: Record<string, Team[]> = {};
  AfcGroupedTeams: Record<string, Team[]> = {};
  CafGroupedTeams: Record<string, Team[]> = {};

  // add this map to remember which positions should be locked
  private lockedCafPositions: Record<string, { pos1: boolean; pos2: boolean }> = {};

  constructor(private fb: FormBuilder, private dataService: DataService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.initializing = true; // start guarded init

    this.UefaTeamNames = this.dataService.ALL_TEAMS_DATA
      .filter(val => val.confederation === 'UEFA');

    this.AfcTeamNames = this.dataService.ALL_TEAMS_DATA
      .filter(val => val.confederation === 'AFC');

    this.CafTeamNames = this.dataService.ALL_TEAMS_DATA
      .filter(val => val.confederation === 'CAF');

    this.UefaGroupLetters.forEach(letter => {
      this.UefaGroupedTeams[letter] = this.UefaTeamNames.filter(t => t.qGroup === letter);
    });

     this.AfcGroupLetters.forEach(letter => {
      this.AfcGroupedTeams[letter] = this.AfcTeamNames.filter(t => t.qGroup === letter);
    });

     this.CafGroupLetters.forEach(letter => {
      this.CafGroupedTeams[letter] = this.CafTeamNames.filter(t => t.qGroup === letter);
    });


    // build a FormGroup per letter with pos1 & pos2 controls
    const UefaControls: Record<string, any> = {};
    const AfcControls: Record<string, any> = {};
    const CafControls: Record<string, any> = {};
    
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
 
    this.UefaQualifiersForm = this.fb.group(UefaControls);
    this.AfcQualifiersForm = this.fb.group(AfcControls);
    this.CafQualifiersForm = this.fb.group(CafControls);
 
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

    const defaults = this.cafPos2List.map(t => t.name).filter(Boolean).slice(0, 4);
    while (defaults.length < 4) { defaults.push(''); }

    this.cafPlayoffForm = this.fb.group({
      runner0: [defaults[0], Validators.required],
      runner1: [defaults[1], Validators.required],
      runner2: [defaults[2], Validators.required],
      runner3: [defaults[3], Validators.required],
    }, { validators: [this.uniqueRunnersValidator()] });

    // remove synchronous duplicate refresh calls here (we'll run them once, in the microtask below)

    this.subs.add(this.cafPlayoffForm.valueChanges.subscribe(() => {
      // if validator fails you can show messages or auto-correct here
    }));

    if (this.UefaQualifiersForm.valid) {
      this.processUefaSelections(this.UefaQualifiersForm.value);
    }

    const initialAfcPos2 = this.afcPos2List; // getter will populate selectedAfcRunner
    if (this.AfcQualifiersForm.valid) {
      // ensure selectedAfcRunner is set (afcPos2List already called above)
      this.selectedAfcRunner = initialAfcPos2[0] ?? this.selectedAfcRunner;
      this.processAfcSelections(this.AfcQualifiersForm.value);
    }

    const initialCafPos2 = this.cafPos2List;
    // don't call processCafSelections here synchronously; defer to the single microtask below

   
    Promise.resolve().then(() => {
      try {
        this.refreshCafPlayoff();      // set cafPlayoffForm values (emitEvent:false inside)
        this.refreshCafIcSelection();  // sets CafIcTeam and calls processCafSelections()      
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

    this.subs.add(
      this.cafPlayoffForm.valueChanges.subscribe(val => {
        if(this.cafPlayoffForm.valid) {
          const list = this.CafPlayoffTeamList;
          // refresh default selection reactively whenever the 4 playoff picks change
          this.refreshCafIcSelection();
        
         }
       })
     )

    
    

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
      this.dataService.UEFA_PLAYOFF_TEAMS.push(this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos2) as Team);
    });

    // add nations league playoff teams if not already qualified or in playoffs.
    let count = 0;
    let index = 0;
    while (count < 4 && index < this.dataService.UEFA_NATIONS_LEAGUE_PRIORITY.length) {
      let team = this.dataService.UEFA_NATIONS_LEAGUE_PRIORITY[index];

      if (team && (!this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === team) || this.dataService.UEFA_PLAYOFF_TEAMS.length > 0) && !this.dataService.QUALIFIED_TEAMS.find(qt => qt.name === team)) {
        this.dataService.UEFA_PLAYOFF_TEAMS.push(this.dataService.ALL_TEAMS_DATA.find(at => at.name === team) as Team);
        count++;
      }
      index++;
    }
  }

  public applyUefaLocks(): void {
    if (!this.UefaQualifiersForm) { return; }
    const qualifiedNames = this.dataService.QUALIFIED_TEAMS
      .filter(t => t.confederation === 'UEFA')
      .map(t => t.name);
    if (!qualifiedNames.length) {
      // enable all controls if none qualified
      this.UefaGroupLetters.forEach(letter => {
        const g = this.UefaQualifiersForm.get('group' + letter) as FormGroup | null;
        if (g) { g.get('pos1')?.enable({ emitEvent: false }); g.get('pos2')?.enable({ emitEvent: false }); }
      });
      return;
    }

    this.UefaGroupLetters.forEach(letter => {
      const group = this.UefaQualifiersForm.get('group' + letter) as FormGroup | null;
      if (!group) { return; }
      const options = this.UefaGroupedTeams[letter] || [];
      const qualInThisGroup = options.filter(o => qualifiedNames.includes(o.name)).map(o => o.name);

      // enable both first, then set/lock where needed
      const p1 = group.get('pos1'); const p2 = group.get('pos2');
      p1?.enable({ emitEvent: false }); p2?.enable({ emitEvent: false });

      qualInThisGroup.forEach(qname => {
        const v1 = p1?.value; const v2 = p2?.value;
        if (v1 !== qname && v2 !== qname) {
          if (!p1?.disabled) { p1?.setValue(qname, { emitEvent: false }); }
          else if (!p2?.disabled) { p2?.setValue(qname, { emitEvent: false }); }
        }
      });

      if (p1 && qualInThisGroup.includes(p1.value)) { p1.disable({ emitEvent: false }); }
      if (p2 && qualInThisGroup.includes(p2.value)) { p2.disable({ emitEvent: false }); }
    });
  }

  // -------------------------
  // AFC methods
  // -------------------------
  get afcPos2List(): Team[] {
    if (!this.AfcQualifiersForm) { return []; }

    let teamNames:string[] = this.AfcGroupLetters
      .map(letter => this.AfcQualifiersForm.get('group' + letter + '.pos2')?.value);

    let res:Team[] = [];

    teamNames.forEach(team => {
      res.push(this.dataService.ALL_TEAMS_DATA.find(t=> t.name === team) as Team);
    })

    this.selectedAfcRunner = res[0];

    return res;
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

  isCafOptionDisabled(name: string, index: number): boolean {
    if (!this.cafPlayoffForm) { return false; }

    const values = Object.values(this.cafPlayoffForm.value || {});
    return values.some((v, i) => i !== index && v === name);
  }

  get cafPlayoffSelections(): string[] {
    return this.cafPlayoffForm ? Object.values(this.cafPlayoffForm.value) as string[] : [];
  }


  private processCafSelections(res: any): void {
    // clear previous CAF entries
    this.dataService.resetConfederationQualifiedTeams('CAF');

    // add group winners (pos1) as qualified
    Object.keys(res).forEach(key => {
      const teams = res[key];
      const found = this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos1);
      if (found) {
        this.addQualifiedTeam(found);
      }
    });

    // ensure INTERCONTINENTAL_PLAYOFF_TEAMS reflects the current CAF IC selection
    this.setInterconfTeamForCAF(this.CafIcTeam);
  }

  // ensure Interconfederation select default follows a refreshed playoff list
  private refreshCafPlayoff(): void {
     if (!this.cafPlayoffForm) { return; }
     const names = this.cafPos2List.map(t => t.name).filter(Boolean).slice(0, 4);
     while (names.length < 4) { names.push(''); }
     // update values without emitting events to avoid loops
     this.cafPlayoffForm.setValue({
       runner0: names[0],
       runner1: names[1],
       runner2: names[2],
       runner3: names[3],
     }, { emitEvent: false });

     // ensure CafIcTeam default follows the refreshed playoff list and update view
     this.refreshCafIcSelection();
    };

  // called from the template when the user changes the IC dropdown
  onCafIcChange(selected?: Team | null): void {
    // update local selection
    this.CafIcTeam = selected ?? null;
    // ensure INTERCONTINENTAL_PLAYOFF_TEAMS reflects the new selection
    this.setInterconfTeamForCAF(this.CafIcTeam);
    // run the same CAF processing logic so state is consistent
    if (this.CafQualifiersForm) {
      this.processCafSelections(this.CafQualifiersForm.value);
    }
  }

  // ensure Interconfederation select defaults to the first available playoff team
  private refreshCafIcSelection(): void {
    const list = this.CafPlayoffTeamList;
    // if there is no available playoff team, clear selection
    if (!list || list.length === 0) {
      this.CafIcTeam = null;
      this.cdr.detectChanges();
      return;
    }

    // set after current CD cycle so mat-select sees the options
    Promise.resolve().then(() => {
      const first = list[0];
      this.CafIcTeam = first;
      this.cdr.detectChanges();
      // make sure the interconf list is up-to-date for initial state
      this.setInterconfTeamForCAF(this.CafIcTeam);
      // now that the IC selection exists, process CAF selections
      this.processCafSelections(this.CafQualifiersForm.value);
    });
  }

  // Re-apply CAF defaults & locks based on current dataService.QUALIFIED_TEAMS
  public applyCafLocks(): void {
    if (!this.CafQualifiersForm) { return; }

    // get qualified CAF team names (exit early if none)
    const qualifiedNames = this.dataService.QUALIFIED_TEAMS
      .filter(t => t.confederation === 'CAF')
      .map(t => t.name);

    if (!qualifiedNames || qualifiedNames.length === 0) {
      // ensure all controls are enabled if nothing qualified
      this.CafGroupLetters.forEach(letter => {
        const group = this.CafQualifiersForm.get('group' + letter) as FormGroup | null;
        if (!group) { return; }
        group.get('pos1')?.enable({ emitEvent: false });
        group.get('pos2')?.enable({ emitEvent: false });
      });
      return;
    }

    // For every CAF group: enable controls first, then apply locks only for matching qualified names
    this.CafGroupLetters.forEach(letter => {
      const groupName = 'group' + letter;
      const group = this.CafQualifiersForm.get(groupName) as FormGroup | null;
      if (!group) { return; }

      const options = this.CafGroupedTeams[letter] || [];
      const qualInThisGroup = options
        .filter(o => qualifiedNames.includes(o.name))
        .map(o => o.name);

      // ensure controls are enabled before evaluation (so we can set values)
      const p1 = group.get('pos1');
      const p2 = group.get('pos2');
      p1?.enable({ emitEvent: false });
      p2?.enable({ emitEvent: false });

      // If there are qualified teams for this group, ensure they're placed and locked
      if (qualInThisGroup.length > 0) {
        qualInThisGroup.forEach(qname => {
          const v1 = p1?.value;
          const v2 = p2?.value;
          // if qualified team not already in pos1/pos2, put it into the first available slot
          if (v1 !== qname && v2 !== qname) {
            if (!p1?.disabled) {
              p1?.setValue(qname, { emitEvent: false });
            } else if (!p2?.disabled) {
              p2?.setValue(qname, { emitEvent: false });
            }
          }
        });

        // disable only the control(s) that actually contain a qualified team
        if (p1 && qualInThisGroup.includes(p1.value)) { p1.disable({ emitEvent: false }); }
        if (p2 && qualInThisGroup.includes(p2.value)) { p2.disable({ emitEvent: false }); }
      } else {
        // nothing qualified for this group — leave both enabled
        p1?.enable({ emitEvent: false });
        p2?.enable({ emitEvent: false });
      }
    });

    // refresh dependent state (playoff picks / ic selection)
    if (typeof this.refreshCafPlayoff === 'function') {
      this.refreshCafPlayoff();
    } else {
      // if you used the inline function name earlier, call the method you have
      // this.refreshCafPlayoff();
    }
  }

  // idempotent: ensure a single CAF interconf team exists and only update when it actually changes
  private setInterconfTeamForCAF(t?: Team | null) {
    const teams = this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS;
    const existingIndex = teams.findIndex(team => team.confederation === 'CAF' && team.qualified !== true);
    const existing = existingIndex >= 0 ? teams[existingIndex] : undefined;

    // If no new team provided -> remove existing CAF interconf entry if present
    if (!t || !t.name) {
      if (existingIndex >= 0) {
        teams.splice(existingIndex, 1);
      }
      return;
    }

    // If existing entry already matches the requested team, do nothing
    if (existing && existing.name === t.name) {
      return;
    }

    // Prepare an entry to insert/replace
    const entry: Team = { ...t, playoffSlot: 'CAF playoff winner' };

    if (existingIndex >= 0) {
      // replace the existing CAF entry
      teams.splice(existingIndex, 1, entry);
    } else {
      // add new CAF entry
      teams.push(entry);
    }
  }

  // -------------------------
  // common helpers
  // -------------------------
  // safe: ignore falsy or unmatched teams
  addQualifiedTeam(t?: Team | null) {
    if (!t || !t.name) { return; }
    const exists = this.dataService.QUALIFIED_TEAMS.find(team => team.name === t.name);
    if (!exists) {
      this.dataService.QUALIFIED_TEAMS.push(t);
    }
  }

  compareTeams = (t1: Team | null, t2: Team | null): boolean => {
    if (t1 === t2) { return true; }
    if (!t1 || !t2) { return false; }
    return t1.name === t2.name;
  }
}