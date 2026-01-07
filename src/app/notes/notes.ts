import { CdkDrag } from '@angular/cdk/drag-drop'
import { isPlatformBrowser } from '@angular/common'
import {
  Component,
  HostListener,
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
}

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
export class NotesComponent {
  notes = signal<Note[]>(dummyNotes)
  isPanning = signal<boolean>(false)
  styleTransform = signal('translate(0px, 0px)')
  styleBackgroundPosition = signal('0px 0px')
  offset = signal({ x: 0, y: 0 })
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

    this.focusedElement = document.activeElement as HTMLElement
    this.focusedElement.blur()
    event.preventDefault()
    this.isPanning.set(true)
    this.abortController = new AbortController()
    const { signal } = this.abortController
    window.addEventListener('mousemove', (e) => this.onMouseMove(e), { signal })
    window.addEventListener('mouseup', (e) => this.onMouseUp(e), { signal })
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isPanning()) return

    this.offset.update((p) => {
      const x = p.x + event.movementX
      const y = p.y + event.movementY
      this.styleBackgroundPosition.set(`${x}px ${y}px`)
      this.styleTransform.set(`translate(${x}px, ${y}px)`)
      return { x, y }
    })
  }

  onMouseUp(event: MouseEvent) {
    if (event.button !== 1) return

    this.isPanning.set(false)
    this.abortController?.abort()
    setTimeout(() => {
      this.focusedElement?.focus()
    }, 0)
  }

  onUpdate(note: Note) {
    this.notes.set(this.notes().map((n) => (n.id !== note.id ? n : note)))
    this.saveToLocalStorage(this.notes())
  }

  onAdd() {
    const newNote = {
      id: nanoid(),
      content: '*empty*',
      x: 75 - this.offset().x,
      y: 75 - this.offset().y,
    }
    this.notes.update((notes) => [...notes, newNote])
  }

  onDelete(noteId: Note['id']) {
    this.notes.update((notes) => notes.filter((n) => n.id !== noteId))
    this.saveToLocalStorage(this.notes())
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
      const notesLocal = JSON.parse(
        localStorage.getItem('notes') || '',
      ) as Note[]
      if (notesLocal.length) {
        this.notes.set(notesLocal)
      }
    })
  }

  saveToLocalStorage(notes: Note[]) {
    this.browserSafe(() => {
      if (!isPlatformBrowser(this.platformId)) return
      localStorage.setItem('notes', JSON.stringify(notes))
    })
  }
}
