import { useContext } from "react";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { ThemeContext } from "@context/ThemeContext";
import MdPreview from "./MdPreview";

type PreviewProps = {
  mrkdwnVal: string;
};

const Preview = ({ mrkdwnVal }: PreviewProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <article className="format-sm format format-blue -z-10 max-w-none rounded-lg dark:format-invert ">
      <div data-color-mode={theme}>
        <div className="wmde-markdown-var"> </div>
        <MdPreview
          linkTarget={"_blank"}
          className="bg-transparent"
          source={mrkdwnVal}
          remarkPlugins={[remarkGfm, remarkBreaks]}
          disallowedElements={[
            "button",
            "script",
            "link",
            "input",
            "textarea",
            "submit",
            "reset",
          ]}
        />
      </div>
    </article>
  );
};

export default Preview;
