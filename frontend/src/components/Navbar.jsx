import { BarChart3, PlusCircle } from "lucide-react";
import { NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }) =>
  `inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
    isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100"
  }`;

const bottomNavLinkClass = ({ isActive }) =>
  `my-2 flex h-12 flex-1 flex-col items-center justify-center gap-1 rounded-md text-xs font-bold transition ${
    isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-500"
  }`;

const Navbar = () => {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:py-4">
        <div>
          <h1 className="text-lg font-bold text-slate-950 sm:text-xl">Expense Splitter</h1>
          <p className="text-xs font-medium text-slate-500 sm:text-sm">Shared group expense tracker</p>
        </div>

        <nav className="hidden items-center gap-2 sm:flex">
          <NavLink to="/dashboard" className={navLinkClass}>
            <PlusCircle size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/summary" className={navLinkClass}>
            <BarChart3 size={18} />
            Summary
          </NavLink>
        </nav>
      </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-slate-200 bg-white/95 px-3 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">
        <NavLink to="/dashboard" className={bottomNavLinkClass}>
          <PlusCircle size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/summary" className={bottomNavLinkClass}>
          <BarChart3 size={20} />
          Summary
        </NavLink>
      </nav>
    </>
  );
};

export default Navbar;
