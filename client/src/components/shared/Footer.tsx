import Link from 'next/link';
import { Calendar } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-slate-900">DAM Events</span>
            </Link>
            <p className="mt-4 text-sm text-slate-600">
              Connecting event planners with pre-vetted vendors offering complete event packages.
              Plan your perfect event in hours, not weeks.
            </p>
          </div>

          {/* For Planners */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">For Planners</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/planner/browse"
                  className="text-sm text-slate-600 hover:text-primary-600"
                >
                  Browse Packages
                </Link>
              </li>
              <li>
                <Link
                  href="/planner/dashboard"
                  className="text-sm text-slate-600 hover:text-primary-600"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm text-slate-600 hover:text-primary-600">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">For Vendors</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/vendor" className="text-sm text-slate-600 hover:text-primary-600">
                  List Your Venue
                </Link>
              </li>
              <li>
                <Link
                  href="/vendor/dashboard"
                  className="text-sm text-slate-600 hover:text-primary-600"
                >
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm text-slate-600 hover:text-primary-600">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8">
          <p className="text-center text-sm text-slate-600">
            © {new Date().getFullYear()} DAM Event Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
