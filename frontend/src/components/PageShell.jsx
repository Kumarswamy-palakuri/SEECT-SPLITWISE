import Navbar from "./Navbar";

const PageShell = ({ children }) => (
  <div className="min-h-screen bg-[#f6f7fb]">
    <Navbar />
    <main className="mx-auto max-w-6xl px-3 pb-24 pt-4 sm:px-4 sm:py-8">{children}</main>
  </div>
);

export default PageShell;
