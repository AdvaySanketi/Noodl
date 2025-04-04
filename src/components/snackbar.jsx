import { useEffect, useState } from "react";

export function Snackbar({ message, onClose, bgColor }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-red-700 text-white p-4 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="container mx-auto text-center">{message}</div>
    </div>
  );
}

export function NoodlSnackbar({ message, onClose, bgColor }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300); 
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-black z-10 text-white p-4 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="container mx-auto text-center">{message}</div>
    </div>
  );
}
