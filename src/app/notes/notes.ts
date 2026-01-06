import { Component, HostListener, signal } from '@angular/core'
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
    const notes = this.notes()
    const noteIndex = notes.findIndex((n) => n.id === note.id)
    const newNotes = [
      ...notes.slice(0, noteIndex),
      ...notes.slice(noteIndex + 1),
      note,
    ]
    this.notes.set(newNotes)
    this.saveNotes()
  }

  onAdd() {
    const newNote = { id: nanoid(), content: '*empty*', x: 75, y: 75 }
    this.notes.update((notes) => [...notes, newNote])
  }

  onDelete(noteId: Note['id']) {
    this.notes.update((notes) => notes.filter((n) => n.id !== noteId))
  }
}
