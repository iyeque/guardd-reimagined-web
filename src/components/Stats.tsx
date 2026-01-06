
export const Stats = () => {
  const stats = [
    { number: "50K+", label: "Families Helped" },
    { number: "95%", label: "Parents Report Success" },
    { number: "1000+", label: "Educational Resources" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <section className="py-20 px-6 bg-transparent">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Making a Real Difference
          </h2>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto">
            Join thousands of families who have transformed their digital wellness journey with our support
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-200 text-lg">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
