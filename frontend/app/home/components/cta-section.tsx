import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-3xl text-center relative z-10">
        <div className="group">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 group-hover:scale-105 transition-transform duration-300">
            Ready to Deploy Your Love Life?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of geeks finding their perfect match. 
            Create your account and start connecting with fellow developers, gamers, and tech enthusiasts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300" asChild>
              <Link href="/signup">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:scale-105 transition-all duration-300" asChild>
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
