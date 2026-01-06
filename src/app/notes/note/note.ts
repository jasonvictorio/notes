import { CdkDrag, type CdkDragEnd, CdkDragHandle } from '@angular/cdk/drag-drop'
import {
  Component,
  type ElementRef,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core'
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
  textarea = viewChild<ElementRef<HTMLTextAreaElement>>('textarea')
  markdown = viewChild<MarkdownComponent>('markdown')
  markdownRect = signal({ width: 0, height: 0 })

  constructor() {
    effect(() => {
      if (!this.isEditing() || !this.markdown()) return
      this.onShowTextarea()
    })
  }

  onShowTextarea() {
    const markdownRect =
      this.markdown()?.element.nativeElement.getBoundingClientRect()
    this.markdownRect.set({
      width: markdownRect?.width || 0,
      height: markdownRect?.height || 0,
    })
  }

  onTextareaChange() {
    const textareaElement = this.textarea()?.nativeElement
    if (!textareaElement) return
    const width = Math.max(
      this.markdownRect().width,
      textareaElement.scrollWidth,
      textareaElement.clientWidth,
    )
    const height = Math.max(
      this.markdownRect().height,
      textareaElement.scrollHeight,
      textareaElement.clientHeight,
    )
    textareaElement.style.width = `${width}px`
    textareaElement.style.height = `${height}px`
    textareaElement.focus()
  }

  onEdit() {
    this.isEditing.set(true)
    const content = this.note().content
    this.markdownString.set(content)
    setTimeout(() => {
      this.onTextareaChange()
    }, 0)
  }

  onSave() {
    this.isEditing.set(false)
    const updatedNote = {
      ...this.note(),
      content: this.markdownString().trim(),
    }
    this.update.emit(updatedNote)
  }

  onCancel() {
    this.isEditing.set(false)
    this.markdownString.set('')
  }

  onDelete() {
    this.delete.emit(this.note().id)
  }

  onMousedown() {
    this.isDragging.set(true)
  }

  onMouseup() {
    this.isDragging.set(false)
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
