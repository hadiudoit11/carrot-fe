import React, { Fragment, useState } from "react";
import MenuItem from "./menu-item.jsx";
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiCodeView,
  RiMarkPenLine,
  RiDivideLine,
  RiH1,
  RiH2,
  RiParagraph,
  RiListUnordered,
  RiListOrdered,
  RiListCheck2,
  RiCodeBoxLine,
  RiDoubleQuotesL,
  RiDashboardHorizontalLine,
  RiTrelloLine,
  RiFormatClear,
  RiGradienterLine,
  RiArrowGoBackFill,
  RiArrowGoForwardFill,
  RiImageAddLine,

} from "@remixicon/react";
import "@/components/sub/menu/menu-bar.scss";

export default ({ editor }) => {
 

  const items = [
    {
      icon: RiBold,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      icon: RiItalic,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      icon: RiStrikethrough,
      title: "Strike",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike"),
    },
    {
      icon: RiCodeView,
      title: "Code",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive("code"),
    },
    {
      icon: RiMarkPenLine,
      title: "Highlight",
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editor.isActive("Highlight"),
    },
    {
      type: "divider",
    },
    {
      icon: RiH1,
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      icon: RiH2,
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive("heading", { level: 2 }),
    },
    {
      icon: RiParagraph,
      title: "Paragraph",
      action: () => editor.chain().focus().setParagraph().run(),
      isActive: () => editor.isActive("paragraph"),
    },
    {
      icon: RiListUnordered,
      title: "Bullet list",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList"),
    },
    {
      icon: RiListOrdered,
      title: "Ordered list",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList"),
    },
    {
      icon: RiListCheck2,
      title: "Task list",
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: () => editor.isActive("taskList"),
    },
    {
      icon: RiCodeBoxLine,
      title: "Code block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive("codeBlock"),
    },
    {
      type: "divider",
    },
    {
      icon: RiDoubleQuotesL,
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive("blockquote"),
    },
    {
      icon: RiDashboardHorizontalLine,
      title: "Horizontal rule",
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      type: "divider",
    },
    {
      icon: RiGradienterLine,
      title: "Hard break",
      action: () => editor.chain().focus().setHardBreak().run(),
    },
    {
      icon: RiFormatClear,
      title: "Clear format",
      action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
    },
    {
      type: "divider",
    },
    {
      icon: RiArrowGoBackFill,
      title: "Undo",
      action: () => editor.chain().focus().undo().run(),
    },
    {
      icon: RiArrowGoForwardFill,
      title: "Redo",
      action: () => editor.chain().focus().redo().run(),
    },
    {
      icon: RiImageAddLine,
      title: "Add Image",
      action: () => {
        const url = window.prompt("Enter the image URL");
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
    },

  ];

  return (
    <div className="flex items-center bg-green-900 border-b-3 border-black rounded-lg p-1 flex-wrap w-10/12">
      {items.map((item, index) => (
        <Fragment key={index}>
          {item.type === "divider" ? (
            <div className="divider" />
          ) : (
            <MenuItem {...item}>
              <item.icon />
            </MenuItem>
          )}
        </Fragment>
      ))}
      <button 
        className="ml-auto flex items-right text-green-950 font-bold bg-white rounded-lg px-4 py-1"

      >
        Publish
      </button>
      

    </div>
  );
};
