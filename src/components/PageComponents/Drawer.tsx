import type { Dispatch, SetStateAction } from "react";

interface DrawerProps {
  children: JSX.Element;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const Drawer = ({ children, isOpen, setIsOpen }: DrawerProps) => {
  return (
    <div
      className={
        "content-part z-15 fixed inset-0 top-[60px] w-screen transform overflow-hidden bg-gray-900 bg-opacity-25 ease-in-out lg:hidden " +
        (isOpen
          ? " translate-x-0 opacity-100 transition-opacity duration-200  "
          : " delay-50 -translate-x-full opacity-0 transition-all  ")
      }
    >
      <section
        className={
          " delay-50 absolute left-0 h-full max-w-lg transform shadow-xl transition-all duration-200 ease-in-out  " +
          (isOpen ? " translate-x-0 " : " -translate-x-full ")
        }
      >
        <div className="content-part relative flex max-w-lg flex-col">
          {children}
        </div>
      </section>
      <section
        className="content-part w-screen cursor-pointer"
        onClick={() => setIsOpen(false)}
      ></section>
    </div>
  );
};

export default Drawer;
