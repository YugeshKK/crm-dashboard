import * as React from 'react';

export interface DashboardWidgetItem<TElement extends React.ReactNode = React.JSX.Element> {
  id: string;
  title: string;
  description: string;
  element: TElement;
}

export interface DashboardWidgetProps<TElement extends React.ReactNode = React.JSX.Element> {
  widgets: DashboardWidgetItem<TElement>[];
}

export function DashboardWidget<TElement extends React.ReactNode = React.JSX.Element>(props: DashboardWidgetProps<TElement>) {
  return (
    <div className="flex flex-row gap-4 flex-wrap">
      {props.widgets.map((widget, index) => (
        <div className="border border-gray-300 rounded shadow p-2" key={index}>
          {widget.element}
        </div>
      ))}
    </div>
  );
}
