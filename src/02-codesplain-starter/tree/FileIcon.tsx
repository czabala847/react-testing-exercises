import "@exuanbo/file-icons-js/dist/css/file-icons.css"
import icons from "@exuanbo/file-icons-js/dist/js/file-icons"
import classNames from "classnames"
import { useEffect, useState } from "react"

interface FileIconProps {
  readonly name: string;
  readonly className?: string;
}

function FileIcon({ name, className }: FileIconProps) {
  const [klass, setKlass] = useState("");

  useEffect(() => {
    icons
      .getClass(name)
      .then((k) => setKlass(k))
      .catch(() => null);
  }, [name]);

  if (!klass) {
    return null;
  }

  return (
    <i
      role="img"
      aria-label={name}
      className={classNames(className, klass)}
    ></i>
  );
}

export default FileIcon;
