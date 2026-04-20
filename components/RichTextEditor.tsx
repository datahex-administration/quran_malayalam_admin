'use client';

import { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import {
  FiBold, FiItalic, FiUnderline, FiLink, FiImage,
  FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiList, FiCode,
} from 'react-icons/fi';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/**
 * Outer wrapper — renders a skeleton during SSR/hydration,
 * then swaps to the real editor after mount (client-only).
 * This prevents any TipTap code from running on the server.
 */
export default function RichTextEditor(props: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="border border-gray-300 rounded-lg min-h-[260px] bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading editor...</p>
      </div>
    );
  }

  return <EditorInner {...props} />;
}

/**
 * Inner component — only ever rendered in the browser.
 * Safe to call useEditor here.
 */
function EditorInner({ content, onChange, placeholder }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none min-h-[200px] px-4 py-3',
        'data-placeholder': placeholder || 'Write your content here...',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    setShowImageInput(false);
  }, [editor, imageUrl]);

  if (!editor) return null;

  const toolbarBtn = (
    active: boolean,
    onClick: () => void,
    children: React.ReactNode,
    title: string
  ) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-green-100 text-green-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200">
        {/* Headings */}
        <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-gray-300">
          {([1, 2, 3] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              title={`Heading ${level}`}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                editor.isActive('heading', { level })
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              H{level}
            </button>
          ))}
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            title="Paragraph"
            className={`px-2 py-1 text-xs rounded transition-colors ${
              editor.isActive('paragraph')
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            P
          </button>
        </div>

        {/* Text formatting */}
        <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-gray-300">
          {toolbarBtn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <FiBold className="w-4 h-4" />, 'Bold')}
          {toolbarBtn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <FiItalic className="w-4 h-4" />, 'Italic')}
          {toolbarBtn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), <FiUnderline className="w-4 h-4" />, 'Underline')}
          {toolbarBtn(editor.isActive('code'), () => editor.chain().focus().toggleCode().run(), <FiCode className="w-4 h-4" />, 'Inline Code')}
        </div>

        {/* Text alignment */}
        <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-gray-300">
          {toolbarBtn(editor.isActive({ textAlign: 'left' }), () => editor.chain().focus().setTextAlign('left').run(), <FiAlignLeft className="w-4 h-4" />, 'Align Left')}
          {toolbarBtn(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), <FiAlignCenter className="w-4 h-4" />, 'Align Center')}
          {toolbarBtn(editor.isActive({ textAlign: 'right' }), () => editor.chain().focus().setTextAlign('right').run(), <FiAlignRight className="w-4 h-4" />, 'Align Right')}
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-gray-300">
          {toolbarBtn(
            editor.isActive('bulletList'),
            () => editor.chain().focus().toggleBulletList().run(),
            <FiList className="w-4 h-4" />,
            'Bullet List'
          )}
          {toolbarBtn(
            editor.isActive('orderedList'),
            () => editor.chain().focus().toggleOrderedList().run(),
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>,
            'Ordered List'
          )}
        </div>

        {/* Link */}
        <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-gray-300">
          {toolbarBtn(
            editor.isActive('link'),
            () => {
              if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run();
              } else {
                setShowImageInput(false);
                setShowLinkInput((v) => !v);
              }
            },
            <FiLink className="w-4 h-4" />,
            'Link'
          )}
        </div>

        {/* Image */}
        <div className="flex items-center gap-0.5">
          {toolbarBtn(
            false,
            () => {
              setShowLinkInput(false);
              setShowImageInput((v) => !v);
            },
            <FiImage className="w-4 h-4" />,
            'Insert Image'
          )}
        </div>
      </div>

      {/* Link input popup */}
      {showLinkInput && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border-b border-blue-200">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setLink(); } }}
            placeholder="Enter URL and press Enter..."
            className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <button type="button" onClick={setLink} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Apply</button>
          <button type="button" onClick={() => setShowLinkInput(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
        </div>
      )}

      {/* Image URL input popup */}
      {showImageInput && (
        <div className="flex items-center gap-2 p-2 bg-green-50 border-b border-green-200">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
            placeholder="Enter image URL and press Enter..."
            className="flex-1 px-3 py-1.5 text-sm border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            autoFocus
          />
          <button type="button" onClick={addImage} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700">Insert</button>
          <button type="button" onClick={() => setShowImageInput(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
        </div>
      )}

      {/* Editor content area */}
      <EditorContent editor={editor} />
    </div>
  );
}
