import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Calendar,
  Search,
  MessageSquare,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            {/* Left Column - Content */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700 w-fit">
                <Sparkles className="h-4 w-4" />
                Event Planning Made Simple
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Find Your Perfect Event Package in{' '}
                <span className="text-primary-600">Minutes</span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                Stop wasting 15+ hours coordinating vendors. Browse complete event packages from
                pre-vetted vendors—venue, catering, and entertainment all in one place.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/signup?role=planner">
                    <Calendar className="mr-2 h-5 w-5" />
                    Plan Your Event
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/signup?role=vendor">List Your Venue</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-4 border-t border-slate-200 pt-8">
                <div>
                  <div className="text-3xl font-bold text-slate-900">20+</div>
                  <div className="mt-1 text-sm text-slate-600">Verified Vendors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">&lt;24h</div>
                  <div className="mt-1 text-sm text-slate-600">Response Time</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">25%</div>
                  <div className="mt-1 text-sm text-slate-600">Booking Rate</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative lg:flex lg:items-center">
              <div className="relative mx-auto w-full max-w-lg">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary-400 to-accent-400 opacity-20 blur-3xl" />
                <Card variant="elevated" className="relative">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-primary-100 p-3">
                          <Search className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">1. Browse Packages</h3>
                          <p className="mt-1 text-sm text-slate-600">
                            Search complete event packages matching your budget and needs
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-secondary-100 p-3">
                          <MessageSquare className="h-6 w-6 text-secondary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">2. Request Quotes</h3>
                          <p className="mt-1 text-sm text-slate-600">
                            Get proposals from multiple vendors within 24-48 hours
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-accent-100 p-3">
                          <CheckCircle className="h-6 w-6 text-accent-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">3. Book Your Event</h3>
                          <p className="mt-1 text-sm text-slate-600">
                            Compare offers and book your perfect event package
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Why Choose DAM Events?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Everything you need to plan successful events, all in one platform
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card>
              <CardContent className="p-6">
                <div className="rounded-lg bg-primary-100 p-3 w-fit">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Save 15+ Hours</h3>
                <p className="mt-2 text-slate-600">
                  Reduce event planning time from weeks to hours. Find everything you need in one
                  place.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card>
              <CardContent className="p-6">
                <div className="rounded-lg bg-secondary-100 p-3 w-fit">
                  <CheckCircle className="h-6 w-6 text-secondary-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Pre-Vetted Vendors</h3>
                <p className="mt-2 text-slate-600">
                  Work with verified, quality vendors who have been carefully reviewed by our team.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card>
              <CardContent className="p-6">
                <div className="rounded-lg bg-accent-100 p-3 w-fit">
                  <DollarSign className="h-6 w-6 text-accent-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Transparent Pricing</h3>
                <p className="mt-2 text-slate-600">
                  See pricing ranges upfront. Compare multiple quotes and find the best value.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card>
              <CardContent className="p-6">
                <div className="rounded-lg bg-primary-100 p-3 w-fit">
                  <MessageSquare className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Unified Messaging</h3>
                <p className="mt-2 text-slate-600">
                  Communicate with all vendors in one place. No more scattered text messages and
                  emails.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card>
              <CardContent className="p-6">
                <div className="rounded-lg bg-secondary-100 p-3 w-fit">
                  <Users className="h-6 w-6 text-secondary-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Complete Packages</h3>
                <p className="mt-2 text-slate-600">
                  Get venue, catering, and entertainment from one vendor. Simplified coordination.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card>
              <CardContent className="p-6">
                <div className="rounded-lg bg-accent-100 p-3 w-fit">
                  <Calendar className="h-6 w-6 text-accent-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Fast Response</h3>
                <p className="mt-2 text-slate-600">
                  Vendors respond within 24 hours. Get quotes quickly and move forward faster.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Plan Your Next Event?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join hundreds of event planners who have simplified their planning process
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup?role=planner">
                <Calendar className="mr-2 h-5 w-5" />
                Start Planning
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white text-primary-600 hover:bg-primary-50"
              asChild
            >
              <Link href="/planner/browse">Browse Packages</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
