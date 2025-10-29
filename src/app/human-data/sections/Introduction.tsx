export default function Introduction() {
  return (
    <div className="prose prose-slate max-w-none">
      <p>
        This guide outlines the human-in-the-loop process we use at Eumanai to
        produce high-quality human data for fine-tuning, post-training
        alignment, and evaluation. Our goals are two-fold:
      </p>
      <ol>
        <li>
          Describe how we source, vet, train, and manage expert contributors
          across Africa and the diaspora to deliver global-grade outcomes.
        </li>
        <li>
          Provide leaders with a practical checklist for selecting and
          evaluating data vendors.
        </li>
      </ol>
      <p>
        Eumanai operates an Africa-first network of experts — domain
        specialists, linguists, and annotators — organized into pods with peer
        review and QA loops. Parts of this platform are available via API; fully
        managed programs are scoped in a short call.
      </p>
    </div>
  );
}
