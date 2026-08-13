import * as React from 'react';
export interface BaseWidgetProps {
  onRemoveWidget?: (widgetId: string) => void;
}
export interface DashboardWidgetItem {
  id: string;
  title: string;
  description: string;
  element: React.ComponentType<BaseWidgetProps>;
}

export interface DashboardWidgetProps {
  widgets: DashboardWidgetItem[];
  onRemoveWidget?: (widgetId: string) => void;
}

export function DashboardWidget(props: DashboardWidgetProps) {
  return (
    <div className="flex flex-row gap-4 flex-wrap">
      {props.widgets.map((widget, index) => (
        <div className="border border-gray-300 rounded-xl shadow p-3" key={index}>
          <widget.element  onRemoveWidget={props.onRemoveWidget} />
        </div>
      ))}
    </div>
  );
}
