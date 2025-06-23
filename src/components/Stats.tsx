
export const Stats = () => {
  const stats = [
    { number: "10M+", label: "Threats Blocked Daily" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "500+", label: "Enterprise Clients" },
    { number: "<1min", label: "Response Time" }
  ];

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-300 text-lg">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
