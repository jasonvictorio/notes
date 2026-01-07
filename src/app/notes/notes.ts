import { CdkDrag } from '@angular/cdk/drag-drop'
import { isPlatformBrowser } from '@angular/common'
import {
  Component,
  ElementRef,
  HostListener,
  NgZone,
  type OnDestroy,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core'
import { nanoid } from 'nanoid'
import { dummyNotes } from './dummy_notes'
import { NoteComponent } from './note/note'

export type Note = {
  id: string
  content: string
  x: number
  y: number
  z: number
}

export type Position = { x: number; y: number }

@Component({
  selector: 'app-notes',
  imports: [NoteComponent, CdkDrag],
  templateUrl: './notes.html',
  host: {
    class: 'notes',
    '[class.notes--panning]': 'isPanning()',
    '[style.background-position]': 'styleBackgroundPosition()',
  },
})
export class NotesComponent implements OnDestroy {
  notes = signal<Note[]>([])
  isPanning = signal<boolean>(false)
  styleTransform = signal('translate(0px, 0px)')
  styleBackgroundPosition = signal('0px 0px')
  position = signal({ x: 0, y: 0 })
  abortController?: AbortController
  focusedElement?: HTMLElement
  platformId = inject(PLATFORM_ID)
  isBrowser = computed(() => isPlatformBrowser(this.platformId))
  hostElement = inject(ElementRef)
  lastTouchPosition = signal<Position | null>(null)
  rafId = signal<number>(0)
  ngZone = inject(NgZone)
  isDragging = signal(false)

  ngOnInit() {
    this.fetchFromLocalStorage()
  }

  @HostListener('dblclick', ['$event'])
  onDoubleClick(event: MouseEvent) {
    if (event.target !== this.hostElement.nativeElement) return
    this.onAdd({ x: event.x - 50, y: event.y - 100 })
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.button !== 1) return

    event.preventDefault()
    if (!(event.target instanceof HTMLTextAreaElement)) {
      this.focusedElement = document.activeElement as HTMLElement
      this.focusedElement.blur()
    }
    this.isPanning.set(true)
    this.abortController = new AbortController()
    const { signal } = this.abortController
    window.addEventListener('mousemove', (e) => this.onMouseMove(e), { signal })
    window.addEventListener('mouseup', () => this.onMouseUp(), { signal })
  }

  onMouseMove(event: MouseEvent) {
    this.position.update((p) => {
      const x = p.x + event.movementX
      const y = p.y + event.movementY
      this.updateStyleOffset({ x, y })
      return { x, y }
    })
  }

  updateStyleOffset({ x, y }: Position) {
    this.styleBackgroundPosition.set(`${x}px ${y}px`)
    this.styleTransform.set(`translate(${x}px, ${y}px)`)
  }

  onMouseUp() {
    this.isPanning.set(false)
    this.abortController?.abort()
    this.abortController = undefined
    setTimeout(() => {
      this.focusedElement?.focus()
    }, 0)
    this.savePosition(this.position())
  }

  onUpdate(note: Note) {
    this.notes.set(
      this.notes().map((n) =>
        n.id !== note.id
          ? { ...n, z: n.z >= note.z ? n.z - 1 : n.z }
          : { ...note, z: this.notes().length },
      ),
    )
    this.saveNotes(this.notes())
  }

  onAdd({ x, y }: Position = { x: 75, y: 75 }) {
    const newNote = {
      id: nanoid(),
      content: '*empty*',
      x: x - this.position().x,
      y: y - this.position().y,
      z: this.notes().length,
    }
    this.notes.update((notes) => [...notes, newNote])
  }

  onDelete(noteId: Note['id']) {
    this.notes.update((notes) => notes.filter((n) => n.id !== noteId))
    this.saveNotes(this.notes())
  }

  browserSafe(fn: () => void) {
    if (!isPlatformBrowser(this.platformId)) return
    try {
      fn()
    } catch (e) {
      console.error(e)
    }
  }

  fetchFromLocalStorage() {
    this.browserSafe(() => {
      const offsetLocal = JSON.parse(
        localStorage.getItem('position') || '0',
      ) as Position
      const notesLocal = JSON.parse(
        localStorage.getItem('notes') || '[]',
      ) as Note[]
      this.notes.set(notesLocal.length ? notesLocal : dummyNotes)
      this.position.set(offsetLocal.x ? offsetLocal : { x: 0, y: 0 })
      this.updateStyleOffset(this.position())
    })
  }

  saveNotes(notes: Note[]) {
    this.browserSafe(() => {
      localStorage.setItem('notes', JSON.stringify(notes))
    })
  }

  savePosition(offset: Position) {
    this.browserSafe(() => {
      localStorage.setItem('position', JSON.stringify(offset))
    })
  }

  ngOnDestroy() {
    this.abortController?.abort()
    this.abortController = undefined
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (event.touches.length !== 1) return

    const touch = event.touches[0]
    this.lastTouchPosition.set({ x: touch.clientX, y: touch.clientY })
    this.isPanning.set(true)

    this.abortController = new AbortController()
    const { signal } = this.abortController
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('touchmove', (e) => this.onTouchMove(e), {
        signal,
        passive: false,
      })
      window.addEventListener('touchend', () => this.onTouchEnd(), { signal })
      window.addEventListener('touchcancel', () => this.onTouchEnd(), {
        signal,
      })
    })
  }

  onTouchMove(event: TouchEvent) {
    if (event.touches.length !== 1 || !this.lastTouchPosition()) return
    if (this.isDragging()) return

    event.preventDefault()
    const touch = event.touches[0]
    const movementX = touch.clientX - (this.lastTouchPosition()?.x ?? 0)
    const movementY = touch.clientY - (this.lastTouchPosition()?.y ?? 0)

    if (!this.rafId()) {
      this.rafId.set(
        requestAnimationFrame(() => {
          this.position.update((p) => {
            const x = p.x + movementX
            const y = p.y + movementY
            this.updateStyleOffset({ x, y })
            return { x, y }
          })
          this.rafId.set(0)
        }),
      )
    }

    this.lastTouchPosition.set({ x: touch.clientX, y: touch.clientY })
  }

  onTouchEnd() {
    this.ngZone.run(() => {
      this.lastTouchPosition.set(null)
      this.onMouseUp()
    })

    if (this.rafId) {
      cancelAnimationFrame(this.rafId())
      this.rafId.set(0)
    }
  }
}
