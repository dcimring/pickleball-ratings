export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full w-full animate-fade-in">
      {children}
    </div>
  );
}
