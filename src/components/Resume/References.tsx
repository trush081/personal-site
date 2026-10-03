import Link from 'next/link';

const References = () => (
  <div className="references">
    <div className="link-to" id="references" />
    <div className="title">
      <Link href="/contact">
        <h3>Further information is available upon request</h3>
      </Link>
    </div>
  </div>
);

export default References;
