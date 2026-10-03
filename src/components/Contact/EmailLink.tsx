'use client';

import useTypewriter from '@/lib/useTypewriter';

// Validates the first half of an email address.
const validateText = (text: string) => {
  // NOTE: Passes RFC 5322 but not tested on google's standard.
  const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))$/;
  return re.test(text) || text.length === 0;
};

const messages = [
  'trush081',
];

const EmailLink = ({ loopMessage = false }: { loopMessage?: boolean }) => {
  const { message, pause, resume } = useTypewriter(messages, loopMessage);
  const isValid = validateText(message);

  return (
    <div
      className="inline-container"
      style={isValid ? {} : { color: 'red' }}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <a href={isValid ? `mailto:${message}@gmail.com` : ''}>
        <span>{message}</span>
        <span>@gmail.com</span>
      </a>
    </div>
  );
};

export default EmailLink;
