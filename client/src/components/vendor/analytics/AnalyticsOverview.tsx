'use client';

import { ServiceType } from '@/types';
import { AnalyticsStatsCards } from '@/components/vendor/dashboard/StatsCards';
import { EngagementChart } from './EngagementChart';
import { EventTypeBreakdown } from './EventTypeBreakdown';
import { TopKeywords } from './TopKeywords';

interface AnalyticsOverviewProps {
  serviceType: ServiceType;
}

export function AnalyticsOverview({ serviceType }: AnalyticsOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Page Title */}
      <h1 className="text-4xl font-normal text-black font-poppins">
        Analytics Overview
      </h1>

      {/* Stats Cards */}
      <AnalyticsStatsCards
        profileViews={1248}
        conversionRate="3.6%"
        repeatClients="22%"
      />

      {/* Engagement Chart */}
      <EngagementChart />

      {/* Bottom Section: Event Breakdown + Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EventTypeBreakdown />
        <TopKeywords serviceType={serviceType} />
      </div>
    </div>
  );
}
