import { Component, signal } from '@angular/core'
import { NoteComponent } from './note/note'

export type Note = {
  id: string // nanoid
  content: string // markdown string
  isEditing: boolean
}

const dummyNotes: Note[] = [
  {
    id: 'V1StGXR8_Z5jdHi6B-myT',
    content: '# First Note\n- Okayish **Signal-based** Todo app\n- new line',
    isEditing: false,
  },
  {
    id: '6f_dfX89-Z0Pq_L49mX2b',
    content: '## Reminders\nFinish this project.',
    isEditing: false,
  },
  {
    id: 'p7L_kM32_j9vR_N12pY5q',
    content: '### Code Snippet\n```typescript\nconst count = signal(0);\n```',
    isEditing: false,
  },
  {
    id: 'kL0_mN45_p2xZ_Q98tW1v',
    content: 'Another one',
    isEditing: false,
  },
]

@Component({
  selector: 'app-notes',
  imports: [NoteComponent],
  templateUrl: './notes.html',
  styleUrl: './notes.scss',
})
export class NotesComponent {
  notes = signal<Note[]>(dummyNotes)
}
