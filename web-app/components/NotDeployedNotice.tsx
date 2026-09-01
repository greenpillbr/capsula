/** Shown when a community enables a feature whose contract is not deployed yet. */
export function NotDeployedNotice({ message }: { message: string }) {
  return (
    <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
      {message}
    </p>
  );
}
