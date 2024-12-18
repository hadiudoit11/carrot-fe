// src/tiptapExtensions.ts
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import ImageResize from 'tiptap-extension-resize-image';
import History from '@tiptap/extension-history';

export const extensions = [
  Document,
  Paragraph,
  Text,
  Bold,
  Placeholder.configure({ placeholder: 'Start typing...' }),
  TextAlign.configure(),
  Table.configure(),
  TableRow,
  TableCell,
  TableHeader,
  Highlight,
  TaskList,
  TaskItem,
  CharacterCount.configure({ limit: 10000 }),
  Link,
  Image,
  ImageResize,
  History, // Add the History extension
];