import { CdkDrag } from '@angular/cdk/drag-drop'
import { isPlatformBrowser } from '@angular/common'
import {
  Component,
  HostListener,
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

export type Offset = { x: number; y: number }

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

  ngOnInit() {
    this.fetchFromLocalStorage()
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

  updateStyleOffset({ x, y }: Offset) {
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

  onAdd() {
    const newNote = {
      id: nanoid(),
      content: '*empty*',
      x: 75 - this.position().x,
      y: 75 - this.position().y,
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
      ) as Offset
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

  savePosition(offset: Offset) {
    this.browserSafe(() => {
      localStorage.setItem('position', JSON.stringify(offset))
    })
  }

  ngOnDestroy() {
    this.abortController?.abort()
    this.abortController = undefined
  }
}
