import { useId } from "react";
import { TINCTURES, type Arms, type Attitude, type OrdinaryKind, type Partition } from "./_blazon";

// Desen provizoriu: Vulpea e o siluetă simplă, înlocuibilă ulterior cu MascotV2.

const SHIELD = "M10 10 H190 V120 C190 185 145 222 100 236 C55 222 10 185 10 120 Z";
const INK = "#111";
const GOLD = TINCTURES.aur.hex;

function FieldShapes({ partition, c }: { partition: Partition; c: string[] }) {
  const a = c[0];
  const b = c[1] ?? c[0];
  switch (partition) {
    case "plin":
      return <rect x={0} y={0} width={200} height={240} fill={a} />;
    case "vertical":
      return (
        <>
          <rect x={0} y={0} width={100} height={240} fill={a} />
          <rect x={100} y={0} width={100} height={240} fill={b} />
        </>
      );
    case "orizontal":
      return (
        <>
          <rect x={0} y={0} width={200} height={120} fill={a} />
          <rect x={0} y={120} width={200} height={120} fill={b} />
        </>
      );
    case "diagonal":
      return (
        <>
          <rect x={0} y={0} width={200} height={240} fill={a} />
          <polygon points="0,0 200,240 0,240" fill={b} />
        </>
      );
    case "patratit":
      return (
        <>
          <rect x={0} y={0} width={100} height={120} fill={a} />
          <rect x={100} y={0} width={100} height={120} fill={b} />
          <rect x={0} y={120} width={100} height={120} fill={b} />
          <rect x={100} y={120} width={100} height={120} fill={a} />
        </>
      );
  }
}

function Fox({ attitude, fill }: { attitude: Attitude; fill: string }) {
  const stroke = fill === TINCTURES.negru.hex ? "#9aa0a6" : INK;
  const p = { fill, stroke, strokeWidth: 1.8, strokeLinejoin: "round" as const };
  const rot =
    attitude === "sărind" ? "rotate(-38 50 60)" : attitude === "șezând" ? "rotate(-48 40 70)" : undefined;

  let legs;
  if (attitude === "stând") {
    legs = (
      <>
        <rect x={27} y={60} width={6} height={26} rx={2.5} {...p} />
        <rect x={37} y={60} width={6} height={26} rx={2.5} {...p} />
        <rect x={57} y={60} width={6} height={26} rx={2.5} {...p} />
        <rect x={66} y={60} width={6} height={26} rx={2.5} {...p} />
      </>
    );
  } else if (attitude === "sărind") {
    legs = (
      <>
        <rect x={27} y={60} width={6} height={26} rx={2.5} {...p} />
        <rect x={37} y={60} width={6} height={26} rx={2.5} {...p} />
        <rect x={60} y={62} width={6} height={24} rx={2.5} transform="rotate(-100 63 62)" {...p} />
        <rect x={69} y={62} width={6} height={24} rx={2.5} transform="rotate(-120 72 62)" {...p} />
      </>
    );
  } else {
    legs = (
      <>
        <rect x={22} y={64} width={32} height={7} rx={3} {...p} />
        <rect x={60} y={60} width={6} height={26} rx={2.5} {...p} />
        <rect x={67} y={60} width={6} height={26} rx={2.5} {...p} />
      </>
    );
  }

  return (
    <g transform="translate(100 122) scale(1.35) translate(-50 -55)">
      <g transform={rot}>
        <path d="M22 54 C2 42 -6 66 8 82 C16 74 24 66 26 60 Z" {...p} />
        {legs}
        <ellipse cx={45} cy={55} rx={27} ry={13} {...p} />
        <path d="M64 46 L68 30 L76 42 L84 31 L88 47 L99 58 L80 66 L64 62 Z" {...p} />
        <circle cx={82} cy={50} r={1.6} fill={INK} />
      </g>
    </g>
  );
}

function star(cx: number, cy: number, R: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? R : r;
    pts.push(`${(cx + rad * Math.cos(ang)).toFixed(1)},${(cy + rad * Math.sin(ang)).toFixed(1)}`);
  }
  return pts.join(" ");
}

function Crest({ kind }: { kind: "stea" | "coroană" | "carte" }) {
  const p = { fill: GOLD, stroke: "#8a6d00", strokeWidth: 2, strokeLinejoin: "round" as const };
  if (kind === "stea") return <polygon points={star(100, -22, 24, 10)} {...p} />;
  if (kind === "coroană") return <polygon points="72,6 72,-20 86,-6 100,-28 114,-6 128,-20 128,6" {...p} />;
  return (
    <>
      <path d="M100 6 C85 -8 65 -8 48 -2 L48 -30 C65 -36 85 -36 100 -24 Z" {...p} />
      <path d="M100 6 C115 -8 135 -8 152 -2 L152 -30 C135 -36 115 -36 100 -24 Z" {...p} />
    </>
  );
}

function Supporters({ kind }: { kind: "lauri" | "stindarde" }) {
  if (kind === "lauri") {
    const leaves = [];
    for (const side of [-1, 1]) {
      for (let i = 0; i <= 7; i++) {
        const t = i / 7;
        const y = 40 + t * 180;
        const x = side === -1 ? -10 - 16 * Math.sin(t * Math.PI) : 210 + 16 * Math.sin(t * Math.PI);
        leaves.push(
          <ellipse
            key={`${side}${i}`}
            cx={x}
            cy={y}
            rx={10}
            ry={4.5}
            transform={`rotate(${side * (35 + t * 40)} ${x} ${y})`}
            fill={TINCTURES.verde.hex}
            stroke={INK}
            strokeWidth={1}
          />,
        );
      }
    }
    return <>{leaves}</>;
  }
  return (
    <>
      {[-1, 1].map((side) => {
        const x = side === -1 ? -14 : 214;
        const dir = side === -1 ? -1 : 1;
        return (
          <g key={side}>
            <rect x={x - 2} y={20} width={4} height={215} fill="#6b4f2a" stroke={INK} strokeWidth={1} />
            <polygon
              points={`${x},26 ${x + dir * 28},38 ${x},52`}
              fill={TINCTURES.rosu.hex}
              stroke={INK}
              strokeWidth={1}
            />
          </g>
        );
      })}
    </>
  );
}

export function Stema({ arms, width = 280 }: { arms: Arms; width?: number }) {
  const id = useId().replace(/:/g, "");
  const hex = (t: keyof typeof TINCTURES) => TINCTURES[t].hex;
  const ord = (k: OrdinaryKind) => arms.ordinaries?.find((o) => o.kind === k)?.tincture;
  const bordura = ord("bordura");
  const crucea = ord("crucea");
  const capul = ord("capul");
  const motto = arms.motto;

  return (
    <svg
      viewBox="-40 -50 280 340"
      width={width}
      height={(width * 340) / 280}
      style={{ maxWidth: "100%", height: "auto" }}
      role="img"
      aria-label="Stema EiC"
    >
      <defs>
        <clipPath id={`${id}-c`}>
          <path d={SHIELD} />
        </clipPath>
      </defs>

      {arms.supporters && <Supporters kind={arms.supporters} />}
      {arms.crest && <Crest kind={arms.crest} />}

      <g clipPath={`url(#${id}-c)`}>
        <FieldShapes partition={arms.field.partition} c={arms.field.tinctures.map(hex)} />
        {crucea && (
          <>
            <rect x={88} y={0} width={24} height={240} fill={hex(crucea)} stroke={INK} strokeWidth={1.2} />
            <rect x={0} y={82} width={200} height={24} fill={hex(crucea)} stroke={INK} strokeWidth={1.2} />
            <rect x={89} y={83} width={22} height={22} fill={hex(crucea)} />
          </>
        )}
        {capul && <rect x={0} y={0} width={200} height={56} fill={hex(capul)} stroke={INK} strokeWidth={1.2} />}
        {bordura && (
          <>
            <path d={SHIELD} fill="none" stroke={INK} strokeWidth={30} />
            <path d={SHIELD} fill="none" stroke={hex(bordura)} strokeWidth={27} />
          </>
        )}
      </g>
      <path d={SHIELD} fill="none" stroke={INK} strokeWidth={3} />

      <Fox attitude={arms.charge.attitude} fill={hex(arms.charge.tincture)} />

      {motto && (
        <>
          <path
            d="M-10 250 Q100 266 210 250 L222 268 L210 286 Q100 270 -10 286 L-22 268 Z"
            fill={hex("argint")}
            stroke={INK}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <text
            x={100}
            y={273}
            textAnchor="middle"
            fontSize={13}
            fontFamily="Georgia, serif"
            fill={INK}
            textLength={Math.min(motto.length * 7, 190)}
            lengthAdjust="spacingAndGlyphs"
          >
            {motto}
          </text>
        </>
      )}
    </svg>
  );
}
