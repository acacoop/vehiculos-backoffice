import type { Section as SectionType, SubSection } from "./data";
import "./PolicySection.css";

interface PolicySectionProps {
  section: SectionType;
}

interface PolicySubSectionProps {
  subSection: SubSection;
}

export function PolicySubSection({ subSection }: PolicySubSectionProps) {
  return (
    <div className="policy-subsection">
      <h3>
        {subSection.id} {subSection.title}
      </h3>
      <p>{subSection.content}</p>
    </div>
  );
}

export function PolicySection({ section }: PolicySectionProps) {
  return (
    <section className="policy-section">
      <h2>
        {section.id}. {section.title}
      </h2>

      {section.content && (
        <div className="policy-section-content">
          {section.content.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}

      {section.subSections?.map((subSection) => (
        <PolicySubSection key={subSection.id} subSection={subSection} />
      ))}
    </section>
  );
}
