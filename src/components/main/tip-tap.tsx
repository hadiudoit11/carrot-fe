
import { useEditor, EditorContent, getHTMLFromFragment } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count'
import Highlight from '@tiptap/extension-highlight'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import MenuBar from '@/components/sub/menu/menu-bar';
import Image from '@tiptap/extension-image';
import ImageResize from 'tiptap-extension-resize-image';
import '@/components/sub/menu/styles.scss'
import { useState } from 'react';

const Tiptap = () => {
  const [isSaving, setIsSaving] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Placeholder.configure({
        placeholder: 'Start typing...',
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Highlight,
      TaskList,
      TaskItem,
      CharacterCount.configure({
        limit: 10000,
      }),
      
      Link,
      Bold,
      Italic,
      Underline,
      Image,
      ImageResize
    ],
    content: '<p>Hello World!</p>',
    onUpdate: ({editor}) => {
      handleAutoSave(editor.getHTML());
    },
  });

  return (
    <div className="flex justify-center items-center border-3 border-black rounded-lg text-black flex-col h-screen">
    {editor && <MenuBar editor={editor} />}
    <div className="flex flex-1 w-3/4">
      <EditorContent
        editor={editor}
        className="mt-8 flex-1 overflow-x-hidden overflow-y-auto px-10 p-8 touch-auto bg-white"
      />
    </div>
  </div>
  );
};

export default Tiptap;
