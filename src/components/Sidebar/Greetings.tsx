'use client';

import useTypewriter from '@/lib/useTypewriter';

const messages = [
  'Hi.',
  'Hello.',
  'Hola.',
  'Good morning.',
  'Or afternoon.',
  'Or evening.',
  'Or maybe night.',
  'Whatever time of day,',
  'Enjoy looking at my site.',
  'Thanks for stopping by,',
];

// Rendered as a <span> (styled as a block) since it lives inside a <p>.
const Greetings = ({ loopMessage = false }: { loopMessage?: boolean }) => {
  const { message } = useTypewriter(messages, loopMessage);

  return (
    <span className="inline-container">
      <span>{message} I am glad you&apos;re here!</span>
    </span>
  );
};

export default Greetings;
