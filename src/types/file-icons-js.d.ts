declare module "@exuanbo/file-icons-js/dist/js/file-icons" {
  interface FileIcons {
    getClass(name: string): Promise<string>;
  }

  const icons: FileIcons;
  export default icons;
}

declare module "@exuanbo/file-icons-js/dist/css/file-icons.css";