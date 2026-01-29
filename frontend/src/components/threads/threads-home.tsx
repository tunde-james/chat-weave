'use client';

import Link from 'next/link';

const ThreadsHomePage = () => {
  return (
    <div className="">
      <Link href="/threads/new">Add New Thread</Link>
    </div>
  );
};

export default ThreadsHomePage;
