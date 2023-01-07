import { useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { IoMdClose } from "react-icons/io";

const TagInput = ({
  tags,
  setTags,
  disabled,
}: {
  tags: string[];
  setTags: (tags: string[]) => void;
  disabled: boolean;
}) => {
  const [input, setInput] = useState("");
  // const [tags, setTags] = useState<string[]>([]);
  const [isKeyReleased, setIsKeyReleased] = useState(false);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const { key } = e;
    const trimmedInput = input.trim();

    if (key === " " && trimmedInput.length) {
      e.preventDefault();
      !tags.includes(trimmedInput) && setTags([...tags, trimmedInput]);
      setInput("");
    }

    if (key === "Backspace" && !input.length && tags.length && isKeyReleased) {
      e.preventDefault();
      const tagsCopy = [...tags];
      const poppedTag = tagsCopy.pop();

      setTags(tagsCopy);
      setInput(poppedTag || "");
    }

    setIsKeyReleased(false);
  };

  const onKeyUp = () => {
    setIsKeyReleased(true);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInput(value.toLowerCase());
  };

  const deleteTag = (index: number) => {
    setTags(tags.filter((_tag, i) => i !== index));
  };

  return (
    <>
      <label
        htmlFor="tag-input"
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300"
      >
        Tags
      </label>
      <div className="my-2 flex flex-row flex-wrap items-center gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            id={"tag-" + index}
            className="flex items-center justify-center gap-1 rounded-xl bg-blue-600 px-2 py-[1px] text-gray-50 dark:bg-blue-700 dark:text-gray-100"
          >
            {tag}
            <button type="button" onClick={() => deleteTag(index)}>
              <IoMdClose className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </span>
        ))}
      </div>
      <div className="tag-input__container focus:ring-2 focus:ring-blue-600">
        <input
          id="tag-input"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          type="text"
          value={input}
          placeholder="Enter a tag"
          onKeyDown={onKeyDown}
          onChange={onInputChange}
          onKeyUp={onKeyUp}
          disabled={disabled}
        />
      </div>
    </>
  );
};

export default TagInput;
