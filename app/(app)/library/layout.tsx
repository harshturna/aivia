/** The library and its lightbox slot (design §6): an asset opens over the grid. */
export default function LibraryLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
