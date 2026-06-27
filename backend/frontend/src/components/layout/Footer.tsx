import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center gap-1 text-text-light text-sm">
        <span>Made with</span>
        <Heart className="w-4 h-4 fill-primary text-primary" />
        <span>SparkDates &copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
