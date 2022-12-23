import { useContext } from "react";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { ThemeContext } from "@context/ThemeContext";
import MDEditor from "./MdEditor";
import type { ChangeHandler, RefCallBack } from "react-hook-form";

interface EditorProps {
  name: string;
  value: string;
  onChange: (detail: string) => void;
  id: string;
  mrkRef: RefCallBack;
  onBlur: ChangeHandler;
  editorSize?: number;
}

const Editor = ({
  value,
  onChange,
  id,
  name,
  mrkRef,
  onBlur,
  editorSize,
}: EditorProps) => {
  const { theme } = useContext(ThemeContext);

  const onMrkdwnChange = (value: string) => {
    onChange(value);
  };

  return (
    <article className="">
      <label htmlFor="hidden" className="hidden">
        hidden
      </label>
      <textarea
        className="hidden"
        ref={mrkRef}
        name={name}
        value={value}
        onChange={() => null}
        id="hidden"
        cols={0}
        rows={0}
      ></textarea>
      <div data-color-mode={theme}>
        <div className="wmde-markdown-var"> </div>
        <MDEditor
          id={id}
          height={editorSize || 600}
          preview="edit"
          className="bg-white dark:bg-gray-800"
          value={value}
          onBlur={onBlur}
          onChange={(e) => onMrkdwnChange(e || "")}
          title="Editor"
          previewOptions={{
            remarkPlugins: [remarkGfm, remarkBreaks],
            disallowedElements: [
              "button",
              "script",
              "link",
              "input",
              "textarea",
              "submit",
              "reset",
            ],
          }}
        />
      </div>
    </article>
  );
};

export default Editor;
