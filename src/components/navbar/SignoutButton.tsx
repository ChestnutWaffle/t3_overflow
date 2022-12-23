import { Button, Modal } from "flowbite-react";
import React, { useState, useContext } from "react";
import { HiOutlineExclamationCircle, HiLogout } from "react-icons/hi";
import { UserCtx } from "@context/UserContext";
import { signUserOut } from "@utils/firebase";

function SignOutButton() {
  const [showModal, setShowModal] = useState(false);

  const { updateCtx } = useContext(UserCtx);

  const logOut = async () => {
    updateCtx({
      displayName: null,
      email: null,
      emailVerified: null,
      photoURL: null,
      uid: null,
    });
    localStorage.removeItem(
      `firebase:authUser:${process.env.NEXT_PUBLIC_FIREBASE_APIKEY}:[DEFAULT]`
    );
    await signUserOut();

    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        type="button"
        className="flex w-full cursor-pointer flex-row items-center rounded-lg px-4 py-1 text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
        onClick={() => setShowModal(true)}
      >
        <HiLogout className=" mr-3 font-bold" />
        <span>Sign Out</span>
      </button>
      <Modal show={showModal} size="md" popup={true} onClose={closeModal}>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to Sign Out?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={logOut}>
                Yes
              </Button>
              <Button color="gray" onClick={closeModal}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default SignOutButton;
