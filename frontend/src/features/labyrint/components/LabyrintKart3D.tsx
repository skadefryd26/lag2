import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Labyrint, StoppType } from "../types";
import { gatteKanter, kantNokkel, unikeKanter } from "./kanter";

// Issue #12: labyrinten som et lite 3D-kontor. Figuren går mellom checkpointene.
type Props = {
  lab: Labyrint;
  rom: string;
  besokt: string[];
  naa: string;
  lasert: boolean;
  onVelg: (tilId: string) => void;
};

const AVSTAND_X = 4;
const AVSTAND_Z = 3.5;

const farge = {
  gulv: "#efe3d0",
  gang: "#d9c4a5",
  gatt: "#c07322",
  mulig: "#2f9e44",
  vegg: "#f7efe4",
};

// ---------- Modeller for hvert checkpoint (bare enkle former) ----------

function Kaffemaskin({ god }: { god: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.6]} />
        <meshStandardMaterial color={god ? "#5b3a1e" : "#8c8c8c"} />
      </mesh>
      <mesh position={[0, 0.95, 0.31]}>
        <boxGeometry args={[0.5, 0.25, 0.02]} />
        <meshStandardMaterial color={god ? "#40c057" : "#fa5252"} emissive={god ? "#40c057" : "#fa5252"} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 0.35, 0.38]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.2, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Fruktskal() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 12]} />
        <meshStandardMaterial color="#a0785a" />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.45, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#e9ecef" side={THREE.DoubleSide} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos(i * 2.1) * 0.18, 0.9, Math.sin(i * 2.1) * 0.18]} rotation={[0, i, Math.PI / 3]} castShadow>
          <capsuleGeometry args={[0.07, 0.35, 4, 8]} />
          <meshStandardMaterial color="#fcc419" />
        </mesh>
      ))}
      <mesh position={[0.05, 0.98, -0.05]} castShadow>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#e03131" />
      </mesh>
    </group>
  );
}

function Toalett() {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.22, 0.5, 20]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.7, -0.3]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1.5, -0.3]}>
        <boxGeometry args={[0.5, 0.3, 0.02]} />
        <meshStandardMaterial color="#228be6" />
      </mesh>
    </group>
  );
}

function Trapp() {
  return (
    <group position={[-0.6, 0, 0]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[i * 0.3, (0.3 + i * 0.3) / 2, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3 + i * 0.3, 1]} />
          <meshStandardMaterial color="#adb5bd" />
        </mesh>
      ))}
    </group>
  );
}

function Heis() {
  return (
    <group>
      <mesh position={[0, 1, -0.2]} castShadow>
        <boxGeometry args={[1.1, 2, 0.4]} />
        <meshStandardMaterial color="#868e96" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.9, 0.01]}>
        <boxGeometry args={[0.8, 1.7, 0.02]} />
        <meshStandardMaterial color="#ced4da" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.65, 1, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#fab005" emissive="#fab005" />
      </mesh>
    </group>
  );
}

function Skilt() {
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
        <meshStandardMaterial color="#6f3d0b" />
      </mesh>
      <mesh position={[0.25, 1.1, 0]} castShadow>
        <boxGeometry args={[0.6, 0.25, 0.05]} />
        <meshStandardMaterial color="#c07322" />
      </mesh>
      <mesh position={[-0.2, 0.85, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.2, 0.05]} />
        <meshStandardMaterial color="#d5a066" />
      </mesh>
    </group>
  );
}

function Resepsjon() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.6, 1, 0.6]} />
        <meshStandardMaterial color="#8a4d10" />
      </mesh>
      <mesh position={[0.4, 1.08, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.15, 16]} />
        <meshStandardMaterial color="#fab005" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Modell({ type }: { type?: StoppType }) {
  switch (type) {
    case "kaffe-god": return <Kaffemaskin god />;
    case "kaffe-darlig": return <Kaffemaskin god={false} />;
    case "frukt": return <Fruktskal />;
    case "toalett": return <Toalett />;
    case "trapp": return <Trapp />;
    case "heis": return <Heis />;
    case "gang": return <Skilt />;
    default: return <Resepsjon />;
  }
}

// ---------- Figuren ----------

function Figur({ mal, kameraMal }: { mal: THREE.Vector3; kameraMal: React.MutableRefObject<THREE.Vector3> }) {
  const ref = useRef<THREE.Group>(null);
  const [startPos] = useState(() => mal.toArray());
  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const før = g.position.clone();
    g.position.lerp(mal, Math.min(1, dt * 2.2));
    const fart = før.distanceTo(g.position) / Math.max(dt, 0.001);
    // Hopp litt når den går, pust når den står
    g.position.y = fart > 0.2 ? Math.abs(Math.sin(state.clock.elapsedTime * 12)) * 0.25 : 0;
    if (fart > 0.2) {
      const retning = mal.clone().sub(før);
      g.rotation.y = Math.atan2(retning.x, retning.z);
    }
    kameraMal.current.lerp(g.position, Math.min(1, dt * 2));
  });
  return (
    <group ref={ref} position={startPos}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.5, 4, 12]} />
        <meshStandardMaterial color="#1c7ed6" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial color="#ffd8a8" />
      </mesh>
      {/* Kaffekopp i hånda, selvfølgelig */}
      <mesh position={[0.32, 0.65, 0.1]} castShadow>
        <cylinderGeometry args={[0.07, 0.06, 0.15, 12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <Html position={[0, 1.75, 0]} center distanceFactor={10} zIndexRange={[10, 0]}>
        <div style={{ background: "#c07322", color: "white", padding: "2px 8px", borderRadius: 8, fontWeight: 700, fontFamily: "Fredoka", whiteSpace: "nowrap" }}>DU</div>
      </Html>
    </group>
  );
}

function KameraFolger({ mal }: { mal: React.MutableRefObject<THREE.Vector3> }) {
  const controls = useRef<React.ElementRef<typeof OrbitControls>>(null);
  useFrame(() => {
    if (controls.current) {
      controls.current.target.copy(mal.current);
      controls.current.update();
    }
  });
  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      minDistance={6}
      maxDistance={30}
      maxPolarAngle={Math.PI / 2.3}
    />
  );
}

// ---------- Selve scenen ----------

function Ring({ farge: f, puls }: { farge: string; puls?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current && puls) ref.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 4) * 0.08);
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <ringGeometry args={[0.95, 1.15, 40]} />
      <meshStandardMaterial color={f} emissive={f} emissiveIntensity={0.4} />
    </mesh>
  );
}

function Scene({ lab, rom, besokt, naa, lasert, onVelg }: Props) {
  const midt = (lab.antallBaner - 1) / 2;
  const pos = (id: string) => {
    if (id === "MAL") return new THREE.Vector3((lab.antallLag + 1) * AVSTAND_X, 0, 0);
    const k = lab.kryss[id];
    return new THREE.Vector3(k.lag * AVSTAND_X, 0, (k.bane - midt) * AVSTAND_Z);
  };

  const kameraMal = useRef(pos(naa));
  const [hover, setHover] = useState<string | null>(null);

  const nesteIder = naa === "MAL" ? [] : [...new Set(lab.kryss[naa].valg.map((v) => v.til))];
  const gattKant = gatteKanter(besokt);
  const kanter = useMemo(() => unikeKanter(lab), [lab]);

  const bredde = (lab.antallLag + 2) * AVSTAND_X;
  const dybde = lab.antallBaner * AVSTAND_Z + 2;
  const senterX = ((lab.antallLag + 1) * AVSTAND_X) / 2;

  return (
    <>
      <color attach="background" args={["#fdf1e2"]} />
      <hemisphereLight intensity={0.6} groundColor="#c9843b" />
      <directionalLight position={[10, 15, 8]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />

      {/* Gulv og yttervegger */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[senterX, 0, 0]} receiveShadow>
        <planeGeometry args={[bredde, dybde]} />
        <meshStandardMaterial color={farge.gulv} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[senterX, 0.6, (s * dybde) / 2]} castShadow receiveShadow>
          <boxGeometry args={[bredde, 1.2, 0.2]} />
          <meshStandardMaterial color={farge.vegg} />
        </mesh>
      ))}
      <mesh position={[-AVSTAND_X / 2 - 0.4, 0.6, 0]} castShadow>
        <boxGeometry args={[0.2, 1.2, dybde]} />
        <meshStandardMaterial color={farge.vegg} />
      </mesh>

      {/* Ganger mellom checkpointene */}
      {kanter.map(({ fra, til }) => {
        const a = pos(fra);
        const b = pos(til);
        const midtP = a.clone().add(b).multiplyScalar(0.5);
        const lengde = a.distanceTo(b);
        const vinkel = Math.atan2(b.z - a.z, b.x - a.x);
        const gatt = gattKant.has(kantNokkel(fra, til));
        const mulig = (fra === naa && nesteIder.includes(til)) || (til === naa && nesteIder.includes(fra));
        return (
          <mesh key={kantNokkel(fra, til)} position={[midtP.x, 0.02 + (gatt ? 0.01 : 0), midtP.z]} rotation={[-Math.PI / 2, 0, -vinkel]} receiveShadow>
            <planeGeometry args={[lengde, gatt ? 0.55 : mulig ? 0.45 : 0.3]} />
            <meshStandardMaterial
              color={gatt ? farge.gatt : mulig ? farge.mulig : farge.gang}
              emissive={mulig && !gatt ? farge.mulig : "#000000"}
              emissiveIntensity={mulig && !gatt ? 0.3 : 0}
            />
          </mesh>
        );
      })}

      {/* Checkpoints */}
      {Object.values(lab.kryss).map((k) => {
        const p = pos(k.id);
        const kanVelges = nesteIder.includes(k.id) && !lasert;
        const erBesokt = besokt.includes(k.id);
        const klikk = (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (kanVelges) onVelg(k.id);
        };
        return (
          <group
            key={k.id}
            position={p.toArray()}
            onClick={klikk}
            onPointerOver={(e) => { e.stopPropagation(); setHover(k.id); document.body.style.cursor = kanVelges ? "pointer" : "default"; }}
            onPointerOut={() => { setHover(null); document.body.style.cursor = "default"; }}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} receiveShadow>
              <circleGeometry args={[0.95, 32]} />
              <meshStandardMaterial color={erBesokt ? "#f1e1cc" : "#ffffff"} />
            </mesh>
            {kanVelges && <Ring farge={farge.mulig} puls />}
            {k.id === naa && <Ring farge={farge.gatt} />}
            <group scale={kanVelges || hover === k.id ? 1.1 : 1}>
              <Modell type={k.stopp?.type} />
            </group>
            {(hover === k.id || kanVelges) && (
              <Html position={[0, 2.3, 0]} center distanceFactor={12} zIndexRange={[20, 0]}>
                <div style={{
                  background: kanVelges ? "#2f9e44" : "#fffaf3", color: kanVelges ? "white" : "#542d06",
                  padding: "4px 10px", borderRadius: 10, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(0,0,0,.2)", pointerEvents: "none",
                }}>
                  {k.stopp ? `${k.stopp.navn} · ${k.stopp.minutter} min` : "Resepsjonen"}
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Møterommet */}
      <group position={pos("MAL").toArray()}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.3, 2.4, 2.4]} />
          <meshStandardMaterial color="#2f9e44" />
        </mesh>
        <mesh position={[-0.16, 1, 0]}>
          <boxGeometry args={[0.02, 1.8, 0.9]} />
          <meshStandardMaterial color="#8a4d10" />
        </mesh>
        <Html position={[0, 2.9, 0]} center distanceFactor={12}>
          <div style={{ background: "#2f9e44", color: "white", padding: "4px 12px", borderRadius: 10, fontWeight: 700, fontFamily: "Fredoka", whiteSpace: "nowrap" }}>
            🚪 {rom}
          </div>
        </Html>
      </group>

      <Figur mal={pos(naa).add(new THREE.Vector3(-0.9, 0, 0.7))} kameraMal={kameraMal} />
      <KameraFolger mal={kameraMal} />
      <ContactShadows position={[senterX, 0.01, 0]} scale={bredde} opacity={0.25} blur={2} far={4} />
    </>
  );
}

export function LabyrintKart3D(props: Props) {
  return (
    <div style={{ height: 460, borderRadius: 16, overflow: "hidden", border: "1px solid #e3c19a" }}>
      <Canvas shadows camera={{ position: [-4, 9, 10], fov: 50 }}>
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
