import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import { coverSource } from "../../utils/coverSource";

export function CandidateCover({ image, name }: { image: string; name: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image]);
  return failed || !image.trim() ? (
    <span className="qp-add-cover is-placeholder" role="img" aria-label={name}><ImageOff size="1.6rem" strokeWidth={1.4} /></span>
  ) : (
    <img src={coverSource(image)} alt={name} loading="lazy" decoding="async" className="qp-add-cover" onError={() => setFailed(true)} />
  );
}
