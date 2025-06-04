// src/components/main/tip-tap.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { extensions } from '@/tiptapExtensions';
import MenuBar from '@/components/sub/menu/menu-bar';
import '@/components/sub/menu/styles.css';
import { apiPut } from '@/providers/apiRequest';

const Tiptap = ({ initialContent, articleId }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  const editor = useEditor({
    extensions,
    content: initialContent,
    onUpdate: ({ editor }) => {
      saveContent(editor.getJSON());
    },
  });

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent, false); // 'false' to avoid triggering onUpdate during initial set
    }
  }, [editor, initialContent]);

  const saveContent = useCallback(async (content) => {
    setIsSaving(true);
    try {
      await apiPut(`http://localhost:8000/api/v1/article/update/${articleId}/`, {
        body: JSON.stringify(content),
      });
      setLastSavedTime(new Date());
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  }, [articleId]);

  return (
    <div className="flex flex-col h-full">
      {editor && <MenuBar editor={editor} />}
      <div className="flex-1 overflow-auto bg-gray-200">
        <div className="max-w-4xl mx-auto py-8">
          <div className="mb-4">
            {isSaving ? (
              <span>Saving...</span>
            ) : lastSavedTime ? (
              <span>Last saved at {lastSavedTime.toLocaleTimeString()}</span>
            ) : (
              <span>No changes yet</span>
            )}
          </div>
          <EditorContent
            editor={editor}
            className="ProseMirror bg-gray-100 p-4 rounded-md shadow"
          />
        </div>
      </div>
    </div>
  );
};

export default Tiptap;