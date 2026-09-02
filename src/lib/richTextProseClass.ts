/**
 * Shared Tailwind prose classes for rendering Tiptap rich-text content consistently
 * across both the admin Tiptap editor and frontend renderers (e.g. blog post pages).
 */
export const RICH_TEXT_PROSE_CLASS =
  'prose prose-sm md:prose-base max-w-none outline-none text-slate-800 leading-relaxed ' +
  '[&_h1]:text-2xl md:[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-inherit [&_h1]:mt-6 [&_h1]:mb-3 ' +
  '[&_h2]:text-xl md:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-inherit [&_h2]:mt-5 [&_h2]:mb-2.5 ' +
  '[&_h3]:text-lg md:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-inherit [&_h3]:mt-4 [&_h3]:mb-2 ' +
  '[&_h4]:text-base md:[&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-inherit [&_h4]:mt-3 [&_h4]:mb-1.5 ' +
  '[&_h5]:text-sm md:[&_h5]:text-base [&_h5]:font-bold [&_h5]:text-inherit [&_h5]:mt-2.5 [&_h5]:mb-1 ' +
  '[&_h6]:text-xs md:[&_h6]:text-sm [&_h6]:font-bold [&_h6]:text-inherit [&_h6]:mt-2 [&_h6]:mb-1 ' +
  '[&_p]:mb-3 [&_p]:leading-relaxed ' +
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium hover:[&_a]:text-[#DB9E30] ' +
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul>li]:mb-1 ' +
  '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol>li]:mb-1 ' +
  '[&_blockquote]:border-l-4 [&_blockquote]:border-[#DB9E30] [&_blockquote]:pl-4 [&_blockquote]:text-slate-600 [&_blockquote]:italic [&_blockquote]:my-4 ' +
  '[&_pre]:bg-slate-900 [&_pre]:text-white [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4 ' +
  '[&_pre_code]:bg-transparent [&_pre_code]:text-inherit ' +
  '[&_u]:underline [&_u]:underline-offset-2 ' +
  '[&_mark]:rounded-sm [&_mark]:px-1 [&_mark]:py-0.5 ' +
  '[&_hr]:border-slate-200 [&_hr]:my-6 ' +
  '[&_img]:rounded-xl [&_img]:max-w-full [&_img]:h-auto [&_img]:my-4 ' +
  '[&_span]:inline ' +
  '[&_div]:my-1';
