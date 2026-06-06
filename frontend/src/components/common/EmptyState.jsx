import React from "react";
import { Inbox } from "lucide-react";
import Button from "../ui/Button";

export default function EmptyState({
  title = "No data found",
  description = "There are no items to display at the moment.",
  icon: Icon = Inbox,
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
      <div className="p-3 bg-white rounded-full shadow-sm text-gray-400 mb-4 border border-gray-100">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-5">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
}
