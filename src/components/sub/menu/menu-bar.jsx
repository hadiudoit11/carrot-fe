import React from 'react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaUndo,
  FaRedo,
  FaLink,
  FaUnlink,
  FaImage,
} from 'react-icons/fa';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const headingLevels = [1, 2, 3, 4, 5, 6];

  return (
    <div className="menu-bar flex flex-wrap bg-gray-100 border-b border-gray-300 px-4 py-2 items-center">
      {/* Undo and Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="mr-2 p-2"
      >
        <FaUndo />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="mr-2 p-2"
      >
        <FaRedo />
      </button>

      {/* Formatting Buttons */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`mr-2 p-2 ${editor.isActive('bold') ? 'is-active' : ''}`}
      >
        <FaBold />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`mr-2 p-2 ${editor.isActive('italic') ? 'is-active' : ''}`}
      >
        <FaItalic />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`mr-2 p-2 ${editor.isActive('underline') ? 'is-active' : ''}`}
      >
        <FaUnderline />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`mr-2 p-2 ${editor.isActive('strike') ? 'is-active' : ''}`}
      >
        <FaStrikethrough />
      </button>

      {/* Heading Levels */}
      <select
        onChange={(e) => {
          const level = e.target.value;
          if (level === 'paragraph') {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().toggleHeading({ level: Number(level) }).run();
          }
        }}
        value={
          editor.isActive('heading', { level: 1 })
            ? '1'
            : editor.isActive('heading', { level: 2 })
            ? '2'
            : editor.isActive('heading', { level: 3 })
            ? '3'
            : editor.isActive('heading', { level: 4 })
            ? '4'
            : editor.isActive('heading', { level: 5 })
            ? '5'
            : editor.isActive('heading', { level: 6 })
            ? '6'
            : 'paragraph'
        }
        className="mr-2 p-1 border border-gray-300 rounded"
      >
        <option value="paragraph">Normal text</option>
        {headingLevels.map((level) => (
          <option key={level} value={level}>
            Heading {level}
          </option>
        ))}
      </select>

      {/* Text Alignment */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`mr-2 p-2 ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
      >
        <FaAlignLeft />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`mr-2 p-2 ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
      >
        <FaAlignCenter />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`mr-2 p-2 ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
      >
        <FaAlignRight />
      </button>

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`mr-2 p-2 ${editor.isActive('bulletList') ? 'is-active' : ''}`}
      >
        <FaListUl />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`mr-2 p-2 ${editor.isActive('orderedList') ? 'is-active' : ''}`}
      >
        <FaListOl />
      </button>

      {/* Blockquote */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`mr-2 p-2 ${editor.isActive('blockquote') ? 'is-active' : ''}`}
      >
        <FaQuoteLeft />
      </button>

      {/* Insert Link */}
      <button
        onClick={() => {
          const url = prompt('Enter URL');
          if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }
        }}
        className={`mr-2 p-2 ${editor.isActive('link') ? 'is-active' : ''}`}
      >
        <FaLink />
      </button>
      <button
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive('link')}
        className="mr-2 p-2"
      >
        <FaUnlink />
      </button>

      {/* Insert Image */}
      <button
        onClick={() => {
          const url = prompt('Enter image URL');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        className="mr-2 p-2"
      >
        <FaImage />
      </button>
    </div>
  );
};

export default MenuBar;
