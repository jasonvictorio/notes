import { Component, HostListener, signal } from '@angular/core'
import { nanoid } from 'nanoid'
import { NoteComponent } from './note/note'

export type Note = {
  id: string // nanoid
  content: string // markdown string
  x: number
  y: number
}

const dummyNotes: Note[] = [
  {
    id: 'V1StGXR8_Z5jdHi6B-myT',
    content: '# First Note\n- Okayish **Signal-based** Todo app\n- new line',
    x: 100,
    y: 100,
  },
  {
    id: '6f_dfX89-Z0Pq_L49mX2b',
    content: '## Reminders\nFinish this project.',
    x: 200,
    y: 200,
  },
  {
    id: 'p7L_kM32_j9vR_N12pY5q',
    content: '### Code Snippet\n```typescript\nconst count = signal(0);\n```',
    x: 300,
    y: 300,
  },
  {
    id: 'kL0_mN45_p2xZ_Q98tW1v',
    content: 'Another one',
    x: 400,
    y: 400,
  },
]

@Component({
  selector: 'app-notes',
  imports: [NoteComponent],
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

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.button !== 1) return

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
  }

  onUpdate(note: Note) {
    this.notes.update((notes) =>
      notes.map((n) => (n.id !== note.id ? n : note)),
    )
  }

  onAdd() {
    const newNote = { id: nanoid(), content: '', x: 75, y: 75 }
    this.notes.update((notes) => [...notes, newNote])
  }

  onDelete(noteId: Note['id']) {
    this.notes.update((notes) => notes.filter((n) => n.id !== noteId))
  }
}
