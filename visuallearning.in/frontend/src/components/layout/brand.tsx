import Link from "next/link";
import Image from "next/image";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className={`vl-brand${inverse ? " vl-brand-inverse" : ""}`} aria-label="VisualLearning home">
      <span className="vl-brand-mark" aria-hidden="true">
        <Image src="/images/logo2.png" alt="" width={42} height={42} className="vl-brand-logo" priority />
      </span>
      <span>Visual<span className="vl-brand-light">Learning</span></span>
    </Link>
  );
}
