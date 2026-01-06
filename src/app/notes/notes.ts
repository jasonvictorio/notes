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

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.button === 1) {
      event.preventDefault()
      this.isPanning.set(true)
    }
  }

  // TODO: remove "always" listener
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isPanning()) return

    this.offset.update((p) => {
      const newX = p.x + event.movementX
      const newY = p.y + event.movementY
      this.styleBackgroundPosition.set(`${newX}px ${newY}px`)
      this.styleTransform.set(`translate(${newX}px, ${newY}px)`)
      return { x: newX, y: newY }
    })
  }

  // TODO: remove "always" listener
  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    console.log('mouseup', event.button)
    if (event.button === 1) {
      this.isPanning.set(false)
    }
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
