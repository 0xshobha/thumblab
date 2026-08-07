import { WarningCircle } from "@phosphor-icons/react";

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="inline-error" role="alert">
      <WarningCircle size={16} weight="fill" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
