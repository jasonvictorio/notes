import { JsonPipe } from '@angular/common'
import { Component, input } from '@angular/core'
import type { Note } from '../notes'

@Component({
  selector: 'app-note',
  templateUrl: './note.html',
  imports: [JsonPipe],
})
export class NoteComponent {
  note = input.required<Note>()
}
