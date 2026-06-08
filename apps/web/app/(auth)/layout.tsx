export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-primary p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-5 text-primary-foreground"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold text-primary-foreground">
            EAP
          </span>
        </div>

        <div className="space-y-4">
          <blockquote className="text-2xl font-medium leading-snug text-primary-foreground">
            "Ship faster, stay aligned, and hit every deadline. All in one
            place."
          </blockquote>
          <p className="text-sm text-primary-foreground/70">
            Trusted by teams who ship.
          </p>
        </div>

        <div className="flex gap-6">
          {[
            { label: "Projects", value: "2k+" },
            { label: "Teams", value: "400+" },
            { label: "Tasks done", value: "180k+" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xl font-bold text-primary-foreground">
                {value}
              </p>
              <p className="text-xs text-primary-foreground/60">{label}</p>
            </div>
          ))}
        </div>

        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}