interface LandingFooterProps {
  isAuthenticated: boolean;
}

const LandingFooter = ({ isAuthenticated }: LandingFooterProps) => (
  <footer className="bg-[#3f6f3a] text-white">
    <div className="mx-auto w-full px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500">
        <div>
          <p className="font-serif text-3xl tracking-[-0.05em] text-white sm:text-4xl">
            Kitchen Hub
          </p>
          <p className="mt-4 text-sm leading-7 text-white/74 sm:text-base">
            A recipe workspace for saving, editing, and revisiting what you actually cook.
          </p>
        </div>

        <div className="grid gap-6 text-sm text-white/78 sm:grid-cols-3 sm:gap-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/62">
              Product
            </p>
            <div className="mt-3 space-y-2">
              <p>Save recipes</p>
              <p>Edit ingredients</p>
              <p>Generate drafts</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/62">
              Access
            </p>
            <div className="mt-3 space-y-2">
              <p>{isAuthenticated ? "Dashboard available" : "Create an account"}</p>
              <p>{isAuthenticated ? "Add a new recipe" : "Login anytime"}</p>
              <p>Works on desktop and mobile</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/62">
              Status
            </p>
            <div className="mt-3 space-y-2">
              <p>{isAuthenticated ? "You are signed in" : "Ready when you are"}</p>
              <p>Personal recipe collection</p>
              <p>Built for everyday use</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-white/14 pt-5 text-xs tracking-[0.04em] text-white/58 sm:text-sm">
        <p>Kitchen Hub - Recipe Management System</p>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
