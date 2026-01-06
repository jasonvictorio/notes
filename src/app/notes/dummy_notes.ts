import type { Note } from './notes'

export const dummyNotes: Note[] = [
  {
    id: 'nVOfgeCSOxtAGIccF4ob1',
    content: '"*" for *underline*\n\n"~" for ~~highlight~~',
    x: 720,
    y: -18,
  },
  {
    id: 'VSqLYLmK4dBE36W84Xx3w',
    content:
      "## ~~Types~~\n### infer type from array\n```typescript\nconst myArray = [{...}]\nexport type myType = (typeof myArray)[number]\n```  \n&nbsp;\n  \n### get object property type\n```typescript\ndelete = output<User['id']>();\n```",
    x: 124,
    y: 573,
  },
  {
    id: '7ws251rIJKEoPXvKbrsaD',
    content: 'Unordered list\n- milk\n- bread\n- eggs\n- beans',
    x: 106,
    y: 90,
  },
  {
    id: '6rMr5thh67HwTBfoA8PiT',
    content:
      '### *Top 5 Guy Ritchie*\n1.  Snatch\n2. Rock n rolla\n3.    Lock, stock\n4. The Gentlemen\n5. UNCLE',
    x: 270,
    y: 249,
  },
  {
    id: '1dF3Mc53MMPI5cuLSa-6q',
    content: 'red to delete  \ngreen to edit  \nyellow to save',
    x: 409,
    y: 66,
  },
  {
    id: 'KGp7BtEUwkMNjOo6Efx6l',
    content: 'Use middle click to move canvas\n\nUse **header** to move notes',
    x: 363,
    y: -21,
  },
  {
    id: '1VdNP4dBJOrivkDAHMn_1',
    content: '##### everything else, markdown syntax applies',
    x: 661,
    y: 84,
  },
  {
    id: 'QKDubIlcaD0qb0zA5BSnn',
    content: '--  \n|  \n|',
    x: 329,
    y: -63,
  },
  {
    id: 's0sPL51eqwXK3uhidVseV',
    content: '* ** * *****',
    x: 1344,
    y: 238,
  },
  {
    id: 'ZCL-56erq4EtXlTPd1z-2',
    content: '|   \n|',
    x: 686,
    y: -15,
  },
  {
    id: 'KBcni4ly-ZtnHJ9qTILL1',
    content:
      "## ~~Signals~~\n### input\n```typescript\n@Input({ required: true }) username!: string\nusername = input.required()\n````\n&nbsp;\n### output\n```typescript\n@Output() myOutput = new EventEmitter<MyOutputType>()\noutput = output<MyOutputType>()\n```\n&nbsp;\n\n### two way binding *custom ngModel*\n```typescript\n@Input() value: string;\n@Output() valueChange = new EventEmitter<string>();\n\nvalue = model(''); // Creates a writable signal that parent can bind to\n```",
    x: 620,
    y: 252,
  },
]
