import { ChangeDetectionStrategy } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatIconModule } from '@angular/material/icon'
import { By } from '@angular/platform-browser'
import { of } from 'rxjs'

import { AutocompleteComponent } from './autocomplete.component'

describe('AutocompleteComponent', () => {
  let component: AutocompleteComponent
  let fixture: ComponentFixture<AutocompleteComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatAutocompleteModule, ReactiveFormsModule, MatIconModule],
      declarations: [AutocompleteComponent],
    })
      .overrideComponent(AutocompleteComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default },
      })
      .compileComponents()
  })

  beforeEach(() => {
    jest.useFakeTimers()
    fixture = TestBed.createComponent(AutocompleteComponent)
    component = fixture.componentInstance
    component.action = jest.fn(() => of(['aa', 'bb', 'cc']))
  })

  it('should create', () => {
    fixture.detectChanges()
    expect(component).toBeTruthy()
  })

  describe('suggestions', () => {
    let emitted
    let sub
    beforeEach(() => {
      fixture.detectChanges()
      emitted = null
      sub = component.suggestions$.subscribe((e) => (emitted = e))
    })
    afterEach(() => {
      sub.unsubscribe()
    })
    describe('when writing text over 2 chars', () => {
      beforeEach(() => {
        component.inputRef.nativeElement.value = 'bla'
        component.inputRef.nativeElement.dispatchEvent(new InputEvent('input'))
      })
      it('calls the action given as input after debounce', () => {
        jest.runOnlyPendingTimers()
        expect(component.action).toHaveBeenCalledWith('bla')
      })
      it('emits suggestions', () => {
        jest.runOnlyPendingTimers()
        expect(emitted).toEqual(['aa', 'bb', 'cc'])
      })
    })
    describe('when writing text with 2 chars or less', () => {
      beforeEach(() => {
        component.inputRef.nativeElement.value = 'bl'
        component.inputRef.nativeElement.dispatchEvent(new InputEvent('input'))
      })
      it('does not call the action given as input after debounce', () => {
        jest.runOnlyPendingTimers()
        expect(component.action).not.toHaveBeenCalled()
      })
      it('does not emit', () => {
        jest.runOnlyPendingTimers()
        expect(emitted).toEqual(null)
      })
    })
  })

  describe('clear button', () => {
    beforeEach(() => {
      fixture.detectChanges()
    })
    describe('when input is empty', () => {
      beforeEach(() => {
        component.inputRef.nativeElement.value = ''
        component.inputRef.nativeElement.dispatchEvent(new InputEvent('input'))
        fixture.detectChanges()
      })
      it('is not visible', () => {
        expect(fixture.debugElement.query(By.css('.clear-btn'))).toBeNull()
      })
    })
    describe('when input is not empty', () => {
      let button
      beforeEach(() => {
        component.inputRef.nativeElement.value = 'blar'
        component.inputRef.nativeElement.dispatchEvent(new InputEvent('input'))
        component.triggerRef.closePanel = jest.fn()
        fixture.detectChanges()
        button = fixture.debugElement.query(By.css('.clear-btn'))
      })
      it('is visible', () => {
        expect(button).not.toBeNull()
      })
      it('resets the text input', () => {
        button.nativeElement.click()
        expect(component.inputRef.nativeElement.value).toBe('')
      })
      it('sets the text input of the focus', () => {
        button.nativeElement.click()
        expect(document.activeElement).toBe(component.inputRef.nativeElement)
      })
      it('closes the autocomplete panel', () => {
        button.nativeElement.click()
        expect(component.triggerRef.closePanel).toHaveBeenCalled()
      })
    })
  })

  describe('@Input() value', () => {
    let anyEmitted
    describe('when set', () => {
      beforeEach(() => {
        const simpleChanges: any = {
          value: {
            previousValue: undefined,
            currentValue: { title: 'hello' },
          },
        }
        component.displayWithFn = (item) => item?.title
        component.inputSubmited.subscribe((event) => (anyEmitted = event))
        component.ngOnChanges(simpleChanges)
      })
      it('set control value', () => {
        expect(component.control.value).toEqual({ title: 'hello' })
      })
    })
    describe('when changed', () => {
      beforeEach(() => {
        const simpleChanges: any = {
          value: {
            previousValue: { title: 'hello' },
            currentValue: { title: 'good bye' },
          },
        }
        component.displayWithFn = (item) => item?.title
        component.inputSubmited.subscribe((event) => (anyEmitted = event))
        component.ngOnChanges(simpleChanges)
      })
      it('set control value', () => {
        expect(component.control.value).toEqual({ title: 'good bye' })
      })
    })
    describe('when ref changed but same text', () => {
      let anyEmitted
      beforeEach(() => {
        const simpleChanges: any = {
          value: {
            previousValue: { title: 'good bye' },
            currentValue: { title: 'good bye' },
          },
        }
        component.displayWithFn = (item) => item?.title
        component.inputSubmited.subscribe((event) => (anyEmitted = event))
        component.ngOnChanges(simpleChanges)
      })
      it('does not set control value', () => {
        expect(component.control.value).toBeNull()
      })
      it('does not emit any value', () => {
        expect(anyEmitted).toBeUndefined()
      })
    })
    describe('when not set on init (firstChange == true)', () => {
      beforeEach(() => {
        component.inputSubmited.subscribe((event) => (anyEmitted = event))
        const simpleChanges: any = {
          value: {
            firstChange: true,
            previousValue: undefined,
            currentValue: null,
          },
        }
        component.ngOnChanges(simpleChanges)
      })
      it('does not set control value', () => {
        expect(component.control.value).toEqual(null)
      })
    })
  })

  describe('#handleSelection', () => {
    let selectionEmitted
    const selectionEvent: any = {
      option: {
        value: 'first',
      },
    }
    describe('when true', () => {
      beforeEach(() => {
        component.clearOnSelection = true
        component.itemSelected.subscribe((event) => (selectionEmitted = event))
        fixture.detectChanges()
        component.handleSelection(selectionEvent)
      })
      it('set cancelEnter to true', () => {
        expect(component.cancelEnter).toBe(true)
      })
      it('emits selection event', () => {
        expect(selectionEmitted).toEqual('first')
      })
      describe('if clear on selection', () => {
        it('set input value to last entered text', () => {
          component.control.setValue('second')
          component.handleSelection(selectionEvent)
          expect(component.inputRef.nativeElement.value).toEqual('second')
          component.control.setValue({ title: 'third' })
          component.handleSelection(selectionEvent)
          expect(component.inputRef.nativeElement.value).toEqual('second')
        })
      })
    })
  })

  afterEach(() => {
    jest.clearAllTimers()
  })
})
