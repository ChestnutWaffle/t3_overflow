import Link from "next/link";

export default function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="my-2 flex flex-row flex-wrap items-center justify-between gap-2">
      {tags.map((tag, index) => (
        <Link
          href={`/tags/${tag}`}
          key={index}
          id={"tag-" + index}
          className="flex cursor-pointer items-center justify-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-sm text-gray-50 dark:bg-blue-700 dark:text-gray-100"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}

type TagItemProps = {
  tag: {
    name: string;
    count: number;
  };
};

export const TagItem = ({ tag }: TagItemProps) => {
  return (
    <Link
      href={`/tags/${tag.name}`}
      className="px-auto flex flex-row items-center justify-between gap-3 rounded-md bg-gray-100 py-2 px-4 shadow-md hover:scale-[1.01] hover:shadow-lg dark:bg-slate-800 dark:shadow-black/40"
    >
      <span
        id={tag.name}
        className="flex cursor-pointer items-center justify-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-base text-gray-50 dark:bg-blue-700 dark:text-gray-100"
      >
        {tag.name}
      </span>
      <span className="text-right text-sm">
        {tag.count} question{tag.count === 1 ? "" : "s"} asked
      </span>
    </Link>
  );
};

export const TagSkeleton = () => {
  return (
    <div className="px-auto flex flex-row items-center justify-between gap-3 rounded-md bg-gray-100 py-3 px-4 shadow-md hover:scale-[1.01] hover:shadow-lg dark:bg-slate-800 dark:shadow-black/40">
      <div className="h-8 w-12 animate-pulse rounded-md bg-gray-200 dark:bg-gray-600" />
      <div className="h-8 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-gray-600" />
    </div>
  );
};
