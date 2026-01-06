import { CdkDrag, type CdkDragEnd, CdkDragHandle } from '@angular/cdk/drag-drop'
import { Component, input, output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MarkdownComponent } from 'ngx-markdown'
import type { Note } from '../notes'

@Component({
  selector: 'app-note',
  templateUrl: './note.html',
  imports: [FormsModule, MarkdownComponent, CdkDragHandle],
  hostDirectives: [
    {
      directive: CdkDrag,
      outputs: ['cdkDragStarted', 'cdkDragEnded'],
    },
  ],
  host: {
    class: 'note',
    '[class.note--edit]': 'isEditing()',
    '[class.note--drag]': 'isDragging()',
    '[style.top.px]': 'note().y',
    '[style.left.px]': 'note().x',
    '(cdkDragStarted)': 'onDragStart()',
    '(cdkDragEnded)': 'onDragEnd($event)',
  },
})
export class NoteComponent {
  note = input.required<Note>()
  markdownString = signal<string>('')
  update = output<Note>()
  delete = output<Note['id']>()
  isEditing = signal<boolean>(false)
  isDragging = signal<boolean>(false)

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

  onDragStart() {
    this.isDragging.set(true)
  }

  onDragEnd(event: CdkDragEnd) {
    const { x, y } = event.distance
    const note = this.note()
    this.update.emit({
      ...note,
      x: note.x + x,
      y: note.y + y,
    })

    event.source.reset()
    this.isDragging.set(false)
  }
}
