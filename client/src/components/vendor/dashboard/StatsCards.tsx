'use client';

interface StatCard {
  title: string;
  value: number | string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'stable';
  };
}

interface StatsCardsProps {
  cards: StatCard[];
}

export function StatsCards({ cards }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="
            bg-[rgba(224,219,255,0.42)]
            border border-[rgba(0,0,0,0.29)]
            rounded-[15px]
            shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
            opacity-50
            p-6
            min-h-[178px]
            flex flex-col justify-center items-center
          "
        >
          <h3 className="text-2xl font-normal text-black font-poppins text-center">
            {card.title}
          </h3>
          <p className="mt-4 text-[32px] font-bold text-[#539dda] font-inter">
            {card.value}
          </p>
          {card.trend && (
            <p className={`
              mt-2 text-sm font-medium
              ${card.trend.direction === 'up' ? 'text-green-600' :
                card.trend.direction === 'down' ? 'text-red-600' : 'text-slate-600'}
            `}>
              {card.trend.direction === 'up' && '▲ '}
              {card.trend.direction === 'down' && '▼ '}
              {card.trend.direction === 'stable' && '◀ '}
              {card.trend.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// Dashboard-specific stats cards
export function DashboardStatsCards({
  totalLeads,
  quotesApproved,
  bookedEvents,
  unviewedInquiries
}: {
  totalLeads: number;
  quotesApproved: number;
  bookedEvents: number;
  unviewedInquiries: number;
}) {
  const cards: StatCard[] = [
    { title: 'Total Leads', value: totalLeads },
    { title: 'Quotes Approved', value: quotesApproved },
    { title: 'Booked Events', value: bookedEvents },
    { title: 'Unviewed Inquiries', value: unviewedInquiries },
  ];

  return <StatsCards cards={cards} />;
}

// Analytics-specific stats cards
export function AnalyticsStatsCards({
  profileViews,
  conversionRate,
  repeatClients,
}: {
  profileViews: number;
  conversionRate: string;
  repeatClients: string;
}) {
  const cards: StatCard[] = [
    {
      title: 'Profile Views',
      value: profileViews.toLocaleString(),
      trend: { value: '12% from last period', direction: 'up' }
    },
    {
      title: 'Inquiry Conversation Rate',
      value: conversionRate,
      trend: { value: 'Stable', direction: 'stable' }
    },
    {
      title: 'Repeat Clients',
      value: repeatClients,
      trend: { value: '4% from last period', direction: 'up' }
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="
            bg-[rgba(224,219,255,0.42)]
            border border-[rgba(0,0,0,0.29)]
            rounded-[15px]
            shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
            opacity-50
            p-6
            min-h-[120px]
            flex flex-col justify-center items-center
          "
        >
          <h3 className="text-xl font-normal text-black font-poppins text-center">
            {card.title}
          </h3>
          <p className="mt-2 text-[28px] font-bold text-[#539dda] font-inter">
            {card.value}
          </p>
          {card.trend && (
            <p className={`
              mt-1 text-sm font-medium
              ${card.trend.direction === 'up' ? 'text-green-600' :
                card.trend.direction === 'down' ? 'text-red-600' : 'text-slate-600'}
            `}>
              {card.trend.direction === 'up' && '▲ '}
              {card.trend.direction === 'down' && '▼ '}
              {card.trend.direction === 'stable' && '◀ '}
              {card.trend.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
