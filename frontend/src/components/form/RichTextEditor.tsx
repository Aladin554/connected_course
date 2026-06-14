import { Editor } from "@tinymce/tinymce-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  height?: number;
  required?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  disabled = false,
  height = 220,
  required = false,
}: RichTextEditorProps) {
  return (
    <>
      <Editor
        apiKey="3cpmmfl6xjoq28sx75olwzo4ps8j52qgea6efpx28fz70i0v"
        disabled={disabled}
        value={value}
        onEditorChange={onChange}
        init={{
          height,
          menubar: false,

          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "table",
            "help",
            "wordcount",
          ],

          toolbar:
            "undo redo | " +
            "blocks fontfamily fontsize | " +
            "bold italic underline strikethrough | " +
            "forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | " +
            "link image table | " +
            "removeformat | code fullscreen",

          toolbar_mode: "sliding",

          branding: false,
          promotion: false,

          skin: "oxide-dark",
          content_css: "dark",

          content_style: `
            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 14px;
              line-height: 1.6;
            }

            ul {
              list-style-type: disc !important;
              padding-left: 24px !important;
              margin: 0.5rem 0 !important;
            }

            ol {
              list-style-type: decimal !important;
              padding-left: 24px !important;
              margin: 0.5rem 0 !important;
            }

            li {
              display: list-item !important;
              margin-bottom: 4px;
            }
          `,

          valid_elements: "*[*]",
          extended_valid_elements: "*[*]",
        }}
      />

      {required && (
        <input
          tabIndex={-1}
          autoComplete="off"
          value={value.replace(/<[^>]*>/g, "").trim()}
          required
          onChange={() => undefined}
          className="sr-only"
        />
      )}
    </>
  );
}