import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-primary-dark text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-0 font-bold text-white mb-4">
              <Image src="/images/logo2.png" alt="VL" width={42} height={42} className="rounded-md" />
              <span className="leading-none text-base text-center">Visual<br />Learning</span>
            </div>
            <p className="text-sm">Animated educational videos for Class 9-12 students. Learn visually, learn better.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/courses" className="block hover:text-accent">Courses</Link>
              <Link href="/subscription" className="block hover:text-accent">Pricing</Link>
              <Link href="/auth/signup" className="block hover:text-accent">Get Started</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Legal</h3>
            <div className="space-y-2 text-sm">
              <Link href="/privacy-policy" className="block hover:text-accent">Privacy Policy</Link>
              <Link href="/refund-policy" className="block hover:text-accent">Refund Policy</Link>
              <Link href="/contact" className="block hover:text-accent">Contact Us</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Subjects</h3>
            <div className="space-y-2 text-sm">
              <p>Physics</p><p>Chemistry</p><p>Biology</p><p>Mathematics</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} VisualLearning. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
