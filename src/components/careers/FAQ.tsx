const faqs = [
  {
    question: "How does Euman AI work?",
    answer:
      "Euman AI is an AI-powered recruitment platform to connect software engineers, subject matter experts, and other professionals to their dream jobs. We match candidates through a combination of manual matching processes and candidate-initiated applications. Our system automatically matches your skillset with companies looking to hire, or you can search our job board and apply for roles you think are a good fit for you. Once you apply to a job and get certified, you get added to our talent pool and opportunities will come to you.",
  },
  {
    question: "What are the benefits?",
    answer:
      "We have your back with lots of competitive benefits like a Coding chair, Laptop credit, Healthcare insurance, Fast speed Wifi, Physical or Mental Health Costs, and Unlimited Udemy courses & books. The benefits only apply to full-time talent.",
  },
  {
    question: "What happens after I pass the certification process?",
    answer:
      "Once certified, your profile is included in our certified talent pool for role matching. We recommend candidates in our talent pool when customers want to hire, based on direct data coming from your performance. You’ll be considered for open opportunities that align with your certified skills. Certification does not guarantee hiring, but it opens the door to multiple possible opportunities.",
  },
];

export default function FAQ() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>
        <div className="mt-12">
          {faqs.map((faq) => (
            <div key={faq.question} className="mb-8">
              <h3 className="text-xl font-semibold">{faq.question}</h3>
              <p className="mt-2 text-lg text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
