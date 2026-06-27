import { BRAND } from "@/lib/branding"

export function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-background border-t">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">{BRAND.name}</h3>
            <p className="text-sm text-muted-foreground">
              A dating platform built by geeks, for geeks. Find your coding partner, gaming buddy, or tech soulmate.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Team</h3>
            <p className="text-sm text-muted-foreground">
              Developed by <span className="font-medium">Abdelhamid Bouazi</span> and <span className="font-medium">Abdessalam Mounach</span> as part of the 42 School curriculum.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Tech Stack</h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Frontend:</span> Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons
              <br />
              <span className="font-medium">Backend:</span> .NET, ASP.NET Core, Entity Framework Core, C#, RESTful API
            </p>
          </div>
        </div>
        <div className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {BRAND.name}. 42 School Project.</p>
        </div>
      </div>
    </footer>
  )
}
