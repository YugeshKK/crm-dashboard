import * as React from 'react';
import RevenueTrendWidget from './RevenueTrendWidget';

export interface DashboardWidgetProps {
  widgets: React.ReactNode[];
}

export function DashboardWidget (props: DashboardWidgetProps) {

  return (
    <div className="flex flex-row gap-4 flex-wrap">
      {props.widgets.map((widget, index) => (
        <div className="border border-gray-300 rounded shadow p-2" key={index}>{widget}</div>
      ))}
    </div>
  );
}
