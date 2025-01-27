import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete'
import { Observable, ReplaySubject, Subscription } from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  first,
  switchMap,
  take,
  tap,
} from 'rxjs/operators'

export type AutcompleteItem = unknown

@Component({
  selector: 'gn-ui-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  @Input() placeholder: string
  @Input() action: (value: string) => Observable<AutcompleteItem[]>
  @Input() value?: AutcompleteItem
  @Input() clearOnSelection = false
  @Output() itemSelected = new EventEmitter<AutcompleteItem>()
  @Output() inputSubmited = new EventEmitter<string>()
  @ViewChild(MatAutocompleteTrigger) triggerRef: MatAutocompleteTrigger
  @ViewChild(MatAutocomplete) autocomplete: MatAutocomplete
  @ViewChild('searchInput') inputRef: ElementRef<HTMLInputElement>

  searching: boolean
  suggestions$: Observable<AutcompleteItem[]>
  control = new FormControl()
  subscription = new Subscription()
  cancelEnter = true
  selectionSubject = new ReplaySubject<MatAutocompleteSelectedEvent>(1)
  lastInputValue$ = new ReplaySubject<string>(1)

  @Input() displayWithFn: (AutcompleteItem) => string = (item) => item

  ngOnChanges(changes: SimpleChanges): void {
    const { value } = changes
    if (value) {
      const previousTextValue = this.displayWithFn(value.previousValue)
      const currentTextValue = this.displayWithFn(value.currentValue)
      if (previousTextValue !== currentTextValue) {
        this.updateInputValue(value.currentValue)
      }
    }
  }

  ngOnInit(): void {
    this.suggestions$ = this.control.valueChanges.pipe(
      filter((value) => value.length > 2),
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => (this.searching = true)),
      switchMap((value) => this.action(value)),
      finalize(() => (this.searching = false))
    )
    this.subscription = this.control.valueChanges.subscribe((any) => {
      if (any !== '') {
        this.cancelEnter = false
      }
    })
    this.control.valueChanges
      .pipe(filter((value) => typeof value === 'string'))
      .subscribe(this.lastInputValue$)
  }

  ngAfterViewInit(): void {
    this.autocomplete.optionSelected.subscribe(this.selectionSubject)
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

  updateInputValue(value: AutcompleteItem) {
    if (value) {
      this.control.setValue(value)
    }
  }

  clear(): void {
    this.inputRef.nativeElement.value = ''
    this.selectionSubject
      .pipe(take(1))
      .subscribe((selection) => selection && selection.option.deselect())
    this.inputRef.nativeElement.focus()
    this.triggerRef.closePanel()
  }

  handleEnter(any: string) {
    if (!this.cancelEnter) {
      this.inputSubmited.emit(any)
      this.triggerRef.closePanel()
    }
  }
  handleSelection(event: MatAutocompleteSelectedEvent) {
    this.cancelEnter = true
    this.itemSelected.emit(event.option.value)
    if (this.clearOnSelection) {
      this.lastInputValue$.pipe(first()).subscribe((any) => {
        this.inputRef.nativeElement.value = any
      })
    }
  }
}
