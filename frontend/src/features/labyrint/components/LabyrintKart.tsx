import type { Labyrint } from "../types";
import { ikon } from "./ikoner";
import { gatteKanter, kantNokkel, unikeKanter } from "./kanter";

// Issue #7: tegner labyrinten som et kart med checkpoints og ganger.
type Props = {
  lab: Labyrint;
  rom: string;
  besokt: string[]; // kryss-id-er i rekkefølge, inkludert der man står nå
  naa: string; // nåværende kryss-id eller "MAL"
  lasert: boolean; // true mens Bjarne tenker, da kan man ikke klikke
  onVelg: (tilId: string) => void;
};

const B = 150; // avstand mellom kolonner
const H = 110; // avstand mellom rader
const PAD = 60;

export function LabyrintKart({ lab, rom, besokt, naa, lasert, onVelg }: Props) {
  const bredde = PAD * 2 + (lab.antallLag + 1) * B;
  const hoyde = PAD * 2 + (lab.antallBaner - 1) * H;
  const midtY = PAD + ((lab.antallBaner - 1) * H) / 2;
  const mal = { x: PAD + (lab.antallLag + 1) * B, y: midtY };

  const pos = (id: string) => {
    if (id === "MAL") return mal;
    const k = lab.kryss[id];
    return { x: PAD + k.lag * B, y: PAD + k.bane * H };
  };

  const nesteIder = naa === "MAL" ? [] : [...new Set(lab.kryss[naa].valg.map((v) => v.til))];
  const gattKant = gatteKanter(besokt);
  const kanter = unikeKanter(lab);

  return (
    <svg viewBox={`0 0 ${bredde} ${hoyde}`} style={{ width: "100%", background: "#fffaf3", borderRadius: 16, border: "1px solid #e3c19a" }}>
      {/* Ganger */}
      {kanter.map(({ fra, til }) => {
        const a = pos(fra);
        const b = pos(til);
        const gatt = gattKant.has(kantNokkel(fra, til));
        const mulig = (fra === naa && nesteIder.includes(til)) || (til === naa && nesteIder.includes(fra));
        return (
          <line
            key={kantNokkel(fra, til)}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={gatt ? "#c07322" : mulig ? "#2f9e44" : "#e3d5c3"}
            strokeWidth={gatt ? 8 : mulig ? 5 : 4}
            strokeDasharray={mulig && !gatt ? "8 6" : undefined}
            strokeLinecap="round"
          />
        );
      })}

      {/* Checkpoints */}
      {Object.values(lab.kryss).map((k) => {
        const { x, y } = pos(k.id);
        const erNaa = k.id === naa;
        const erBesokt = besokt.includes(k.id);
        const kanVelges = nesteIder.includes(k.id) && !lasert;
        return (
          <g
            key={k.id}
            onClick={kanVelges ? () => onVelg(k.id) : undefined}
            style={{ cursor: kanVelges ? "pointer" : "default" }}
          >
            <title>{k.stopp ? `${k.stopp.navn} (${k.stopp.minutter} min)` : "Resepsjonen"}</title>
            <circle
              cx={x} cy={y} r={erNaa ? 30 : 26}
              fill={erNaa ? "#c07322" : erBesokt ? "#f1e1cc" : kanVelges ? "#ebfbee" : "#ffffff"}
              stroke={erNaa ? "#6f3d0b" : kanVelges ? "#2f9e44" : "#d5a066"}
              strokeWidth={kanVelges || erNaa ? 4 : 2}
              className={erNaa ? "bjarne-tenker" : undefined}
            />
            <text x={x} y={y + 9} textAnchor="middle" fontSize={26} opacity={erBesokt || kanVelges || erNaa ? 1 : 0.55}>
              {k.stopp ? ikon[k.stopp.type] : "🛎️"}
            </text>
            {erNaa && (
              <text x={x} y={y - 38} textAnchor="middle" fontSize={14} fontWeight={700} fill="#6f3d0b">DU</text>
            )}
          </g>
        );
      })}

      {/* Møterommet */}
      <g>
        <rect x={mal.x - 40} y={mal.y - 32} width={80} height={64} rx={14}
          fill={naa === "MAL" ? "#2f9e44" : "#fff"} stroke="#2f9e44" strokeWidth={3} />
        <text x={mal.x} y={mal.y + 4} textAnchor="middle" fontSize={26}>🚪</text>
        <text x={mal.x} y={mal.y + 52} textAnchor="middle" fontSize={13} fontWeight={700} fill="#2f9e44">
          {rom.length > 18 ? rom.slice(0, 17) + "…" : rom}
        </text>
      </g>
    </svg>
  );
}
