// Import necessary libraries and components
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
import MenuBar from '@/components/sub/menu/menu-bar';
import '@/components/sub/menu/styles.scss';

// Import your custom API request functions
import { apiGet, apiPost, apiPut } from '@/providers/apiRequest'; // Adjust the path as needed

const Tiptap = (props) => {
  // State to store the article ID (UUID)
  const [articleId, setArticleId] = useState<string | null>(null);

  // Refs and states for auto-save functionality
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const [lastSavedContent, setLastSavedContent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Initialize the editor with extensions and configurations
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start typing...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
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
    ],
    content: '',
    editorProps: {
      handleDOMEvents: {
        paste: (view, event) => {
          return handlePaste(event, view);
        },
      },
    },
    onUpdate: ({ editor }) => {
      saveContent();
    },
  });

  // Cleanup function to clear timeout when component unmounts
  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  // Load existing content if articleId is provided
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Assume you get the article ID from props or route parameters
        const articleIdFromProps = props.articleId;
        if (articleIdFromProps) {
          setArticleId(articleIdFromProps);
          const data = await apiGet(`http://localhost:8000/api/v1/articles/${articleIdFromProps}/`);
          const jsonContent = data.body; // Adjusted to match the 'body' field in your serializer

          if (editor && jsonContent) {
            editor.commands.setContent(JSON.parse(jsonContent));
            setLastSavedContent(JSON.parse(jsonContent));
          }
        }
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };

    if (editor) {
      loadContent();
    }
  }, [editor]);

  // Function to handle content saving (auto-save)
  const saveContent = useCallback(() => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(async () => {
      if (editor) {
        const jsonContent = editor.getJSON();

        // Avoid saving if content hasn't changed
        if (JSON.stringify(jsonContent) === JSON.stringify(lastSavedContent)) {
          return;
        }

        setIsSaving(true);

        try {
          let result;
          if (articleId) {
            // Update existing article
            result = await apiPut(`http://localhost:8000/api/v1/articles/update/${articleId}/`, {
              body: JSON.stringify(jsonContent), // Serialize the JSON content to string
            });
          } else {
            // Create new article
            result = await apiPost('http://localhost:8000/api/v1/articles/create/', {
              title: 'Untitled Article', // Provide a default title or get from user input
              description: 'asfasdf', // Provide default or get from user input
              body: JSON.stringify(jsonContent), // Serialize the JSON content to string
              is_archived: false, // Set default value or get from user input
            });
            if (result && result.data && result.data.id) {
              setArticleId(result.data.id);
            }
          }

          if (result) {
            console.log('Content saved successfully:', result);
            setLastSavedContent(jsonContent);
            setLastSavedTime(new Date());
          } else {
            console.error('Failed to save content.');
          }
        } catch (error) {
          console.error('Error saving content:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000); // Adjust debounce delay as needed
  }, [editor, lastSavedContent, articleId]);

  // Function to handle pasted images
  const handlePaste = (event, view) => {
    const editorInstance = view.editor;
    if (!editorInstance || !event.clipboardData) {
      return false;
    }

    const items = event.clipboardData.items;
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          event.preventDefault();

          // Upload image to server and insert URL
          const uploadImage = async (file) => {
            const formData = new FormData();
            formData.append('file', file);

            try {
              const data = await apiPost('http://localhost:8000/api/v1/articles/upload-image/', formData);
              return data.imageUrl;
            } catch (error) {
              console.error('Image upload failed:', error);
              return null;
            }
          };

          (async () => {
            const imageUrl = await uploadImage(file);
            if (imageUrl) {
              editorInstance.chain().focus().setImage({ src: imageUrl }).run();
            }
          })();

          return true; // Indicate that the paste event has been handled
        }
      }
    }

    return false; // Allow other paste events to be handled by default behavior
  };

  // Function to handle image upload from the MenuBar
  const addImage = useCallback(
    (imageUrl) => {
      if (editor) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    },
    [editor]
  );

  return (
    <div className="flex flex-col h-full">
      {editor && <MenuBar editor={editor} addImage={addImage} />}
      <div className="flex-1 overflow-auto bg-gray-200">
        <div className="max-w-4xl mx-auto py-8">
          {/* Status Display */}
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
