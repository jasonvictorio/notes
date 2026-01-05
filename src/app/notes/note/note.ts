import { JsonPipe } from '@angular/common'
import { Component, input, output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import type { Note } from '../notes'

@Component({
  selector: 'app-note',
  templateUrl: './note.html',
  imports: [JsonPipe, FormsModule],
})
export class NoteComponent {
  note = input.required<Note>()
  markdownString = signal<string>('')
  update = output<Note>()
  isEditing = signal<boolean>(false)

  onEdit() {
    this.isEditing.set(true)
    const content = this.note().content
    this.markdownString.set(content)
  }

  onSave() {
    this.isEditing.set(false)
    const updatedNote = { ...this.note(), content: this.markdownString() }
    this.update.emit(updatedNote)
  }

  onCancel() {
    this.isEditing.set(false)
    this.markdownString.set('')
  }
}
