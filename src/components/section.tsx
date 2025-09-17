type Props = {
  id?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function Section({ id, title, subtitle, children }: Props) {
  return (
    <section id={id} className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        {title ? (
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        ) : null}
        {subtitle ? (
          <p className="mt-1 max-w-3xl text-gray-600">{subtitle}</p>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
