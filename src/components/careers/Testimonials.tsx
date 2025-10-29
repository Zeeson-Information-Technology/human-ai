const testimonials = [
  {
    name: "Mark Esposito",
    title: "PhD, Harvard",
    quote:
      "One of the best firm for data management, data science and human data. Excellent team, excellent ethos and just great folks to work with !",
  },
  {
    name: "Zack Michaelson",
    title: "PhD, NYU",
    quote:
      "Having worked in AI and tech consulting for decades, I'm really impressed by how they are able to close deals with the top clients and retain them through relationship management. They are delivering work that would be the dream of their much larger competitors. It's a testament to being on to a new model for delivering expert-driven tech consulting. Amazing how they've been able to build it so successfully and quickly! Great job Ali, Neet, and team!",
  },
  {
    name: "Muhammad A",
    title: "Developer",
    quote:
      "Eumanai has changed my life. Ever since I discover them and sign up, they have provided me with 5 different software engineering opportunities. I am forever grateful for them.",
  },
  {
    name: "Amisha Parkhe",
    title: "Developer",
    quote:
      "I was honestly surprised by how seamless the whole process was. No unnecessary steps, no confusion—just clear communication and solid support all the way through.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Hear from Eumanai talent
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-2xl border bg-gray-50 p-6"
            >
              <p className="text-lg text-gray-700">{testimonial.quote}</p>
              <div className="mt-6 flex items-center">
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}