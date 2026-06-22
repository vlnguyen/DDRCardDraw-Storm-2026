import { SongCardBase, type SongCardProps } from "./song-card";
import { PersonaSongCard as PersonaSongCardBase } from "./persona-song-card";
import { getContentVariants } from "./variants";

export { SongCardProps };

export function SongCard(p: SongCardProps) {
  const cardImpl = getContentVariants(
    "cardVariant" in p.chart ? p.chart.cardVariant : undefined,
  );
  return <SongCardBase {...p} {...cardImpl} />;
}

export function PersonaSongCard(p: SongCardProps) {
  const cardImpl = getContentVariants(
    "cardVariant" in p.chart ? p.chart.cardVariant : undefined,
  );
  return <PersonaSongCardBase {...p} {...cardImpl} />;
}
