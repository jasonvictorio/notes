import { Component, input, output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MarkdownComponent } from 'ngx-markdown'
import type { Note } from '../notes'

@Component({
  selector: 'app-note',
  templateUrl: './note.html',
  imports: [FormsModule, MarkdownComponent],
})
export class NoteComponent {
  note = input.required<Note>()
  markdownString = signal<string>('')
  update = output<Note>()
  delete = output<Note['id']>()
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

  onDelete() {
    this.delete.emit(this.note().id)
  }
}
