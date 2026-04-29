import React from 'react';

const Help = () => {
  const [expanded, setExpanded] = React.useState({});

  const toggleFAQ = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const faqs = [
    {
      id: 1,
      question: 'What is the procedure for account registration?',
      answer: 'Simply navigate to the Sign Up page, enter your basic profile information, and complete the email verification. The entire process is designed for speed and security.'
    },
    {
      id: 2,
      question: 'How can I report a new road grievance?',
      answer: 'After logging in, access the Reporting Portal. You will need to provide a clear photo, a brief description, and the precise location on our digital map.'
    },
    {
      id: 3,
      question: 'Where can I monitor the progress of my report?',
      answer: 'Your personal Dashboard contains a comprehensive history of all your reports. You can click on any individual entry to view its live status and history.'
    },
    {
      id: 4,
      question: 'Which categories of road damage are acceptable?',
      answer: 'Our system accepts reports for potholes, structural cracks, fading lane markings, damaged signage, and any other issues affecting road safety and quality.'
    },
    {
      id: 5,
      question: 'How do you protect my privacy and data?',
      answer: 'Data security is our top priority. We use industry-standard encryption protocols and strictly adhere to privacy guidelines to keep your identity and information safe.'
    },
    {
      id: 6,
      question: 'What is the typical timeline for problem resolution?',
      answer: 'The resolution window varies by urgency. High-priority safety hazards are addressed rapidly, while minor repairs are scheduled into local maintenance cycles.'
    }
  ];

  return (
    <div className="help-page">
      <div className="page-header">
        <h1>Help & Support</h1>
        <p>Find answers to frequently asked questions</p>
      </div>

      <div className="help-container">
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map(faq => (
              <div key={faq.id} className="faq-item">
                <h3 onClick={() => toggleFAQ(faq.id)} className="faq-question">
                  {faq.question}
                  <span className="faq-toggle">{expanded[faq.id] ? '−' : '+'}</span>
                </h3>
                {expanded[faq.id] && (
                  <p className="faq-answer">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="help-section">
          <h2>Still Need Help?</h2>
          <p>Our support team is ready to assist you. Please <a href="/contact">contact us</a> for any further assistance.</p>
        </section>
      </div>
    </div>
  );
};

export default Help;
