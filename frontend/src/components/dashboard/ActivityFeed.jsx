import React from 'react';
import { Activity, MessageSquare, FileEdit, UserCheck, History } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../common/Card';

export function ActivityFeed({ activities }) {
  const getIcon = (type) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
      case 'member':
        return <UserCheck className="w-3.5 h-3.5 text-emerald-500" />;
      case 'version':
        return <History className="w-3.5 h-3.5 text-amber-500" />;
      case 'document':
      default:
        return <FileEdit className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />;
    }
  };

  return (
    <Card className="border-forest-100 dark:border-forest-900/60">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-forest-600 dark:text-forest-400" />
          Recent Team Activity
        </CardTitle>
        <span className="text-[11px] text-content-light-secondary">Live Audit Trail</span>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {activities.map((item) => (
          <div key={item.id} className="flex items-start gap-3 text-xs">
            <div className="mt-0.5 p-1.5 rounded-lg bg-surface-light-subtle dark:bg-forest-900/40">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-content-light-primary dark:text-content-dark-primary font-medium leading-snug">
                <span className="font-semibold">{item.user}</span> {item.action}{' '}
                <span className="text-forest-700 dark:text-forest-300 font-medium">"{item.target}"</span>
              </p>
              <span className="text-[10px] text-content-light-muted block mt-0.5">{item.timestamp}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default ActivityFeed;
