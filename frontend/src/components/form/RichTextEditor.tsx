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
            "advlist autolink lists link charmap preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime table code help wordcount",
          ],
          toolbar:
            "undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent | link | removeformat | code",
          branding: false,
          promotion: false,
          skin: "oxide-dark",
          content_css: "dark",
        }}
      />
      {required && <input tabIndex={-1} autoComplete="off" value={value.replace(/<[^>]*>/g, "").trim()} required onChange={() => undefined} className="sr-only" />}
    </>
  );
}
