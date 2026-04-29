import React from 'react';

const Help = () => {
  const [expanded, setExpanded] = React.useState({});

  const toggleFAQ = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const faqs = [
    {
      id: 1,
      question: 'How do I register for an account?',
      answer: 'Click Register, fill in your details (name, mobile, email, password), and click Register. It only takes a minute!'
    },
    {
      id: 2,
      question: 'How do I submit a complaint?',
      answer: 'Log in, go to Submit Complaint, upload a photo, describe the issue, select severity level, and click Submit.'
    },
    {
      id: 3,
      question: 'How do I track my complaint status?',
      answer: 'Go to your Dashboard and click on any complaint to see its current status and all updates.'
    },
    {
      id: 4,
      question: 'What types of road issues can I report?',
      answer: 'You can report potholes, cracks, broken markings, damaged signs, poor drainage, street light issues, and any other road infrastructure problems.'
    },
    {
      id: 5,
      question: 'Is my personal information secure?',
      answer: 'Yes, all your data is encrypted and secure. We never share your information with unauthorized parties.'
    },
    {
      id: 6,
      question: 'How long does it take to resolve a complaint?',
      answer: 'Resolution time depends on severity: High - 7-15 days, Medium - 15-30 days. You\'ll receive updates throughout the process.'
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
