
export const Stats = () => {
  const stats = [
    { number: "50+", label: "Families Helped" },
    { number: "95%", label: "Parents Report Success" },
    { number: "1,000+", label: "Educational Resources" }
  ];

  return (
    <section className="py-20 px-6 bg-transparent">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Real Connection
          </h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            Families report nearly 30% more quality time after reducing digital distractions.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-green-600 dark:text-green-400 mb-2">
                {stat.number}
              </div>
              <div className="text-foreground text-xl font-bold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
