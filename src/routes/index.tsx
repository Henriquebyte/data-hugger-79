import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, Copy, Check, RefreshCw, Search, Server, Users } from "lucide-react";
import { getServers, type ServerRoom } from "@/lib/servers.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SRB2 Server Browser — Servidores online agora" },
      {
        name: "description",
        content:
          "Lista em tempo real dos servidores de Sonic Robo Blast 2 ativos no master server oficial. Filtre por sala, copie o IP e conecte.",
      },
      { property: "og:title", content: "SRB2 Server Browser" },
      {
        property: "og:description",
        content: "Servidores de Sonic Robo Blast 2 ativos agora, direto do master server oficial.",
      },
    ],
  }),
  component: Index,
});

type RoomFilter = "all" | ServerRoom;

const FILTERS: { id: RoomFilter; label: string }[] = [
  { id: "all", label: "Todas as salas" },
  { id: "Casual", label: "Casual" },
  { id: "Standard", label: "Standard" },
  { id: "Custom Gametypes", label: "Custom Gametypes" },
];

function Index() {
  const router = useRouter();
  const fetchServers = useServerFn(getServers);
  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["srb2-servers"],
    queryFn: () => fetchServers(),
    refetchInterval: 30_000,
  });

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RoomFilter>("all");
  const [copied, setCopied] = useState<string | null>(null);

  const servers = data?.servers ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return servers.filter((s) => {
      if (filter !== "all" && s.room !== filter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.ip.toLowerCase().includes(q)
      );
    });
  }, [servers, query, filter]);

  const updatedAt = data
    ? new Date(data.fetchedAt).toLocaleTimeString("pt-BR", { hour12: false })
    : "—";

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(address);
      setTimeout(() => setCopied((c) => (c === address ? null : c)), 1600);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b18] text-slate-100 relative overflow-hidden">
      {/* Background grid + glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(56,189,248,0.25), rgba(168,85,247,0.12) 60%, transparent 80%)",
        }}
      />

      <main className="relative mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div className="flex items-center gap-2 text-sky-400 text-sm font-medium tracking-widest uppercase">
          <Activity className="h-4 w-4" />
          Master Server Live
        </div>
        <h1 className="mt-3 text-5xl md:text-6xl font-black tracking-tight">
          SRB2{" "}
          <span className="bg-gradient-to-r from-sky-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
            Server Browser
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-slate-400">
          Servidores de Sonic Robo Blast 2 ativos agora, direto do master server oficial.
          Atualiza automaticamente a cada 30 segundos.
        </p>

        {/* Stats row */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm">
            <Server className="h-4 w-4 text-sky-400" />
            <span className="font-semibold text-slate-100">{servers.length}</span>
            <span className="text-slate-400">servidores online</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-slate-400">Última atualização</span>
            <span className="font-mono text-slate-200">{updatedAt}</span>
          </div>
          <button
            onClick={() => {
              refetch();
              router.invalidate();
            }}
            disabled={isFetching}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500/40 hover:bg-slate-900 disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Atualizar
          </button>
        </div>

        {/* Search + Filters */}
        <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou IP..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm font-medium transition",
                  filter === f.id
                    ? "border-sky-500/50 bg-sky-500/15 text-sky-300"
                    : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:text-slate-100",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 font-medium">Servidor</th>
                  <th className="px-5 py-3 font-medium">Endereço</th>
                  <th className="px-5 py-3 font-medium">Jogadores</th>
                  <th className="px-5 py-3 font-medium">Sala / Mapa</th>
                  <th className="px-5 py-3 font-medium">Versão</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                      Carregando servidores...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                      Nenhum servidor encontrado.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, idx) => (
                    <tr
                      key={`${s.address}-${idx}`}
                      className="border-b border-slate-900/70 last:border-0 transition hover:bg-slate-900/40"
                    >
                      <td className="px-5 py-4 font-medium text-slate-100">{s.name}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => copyAddress(s.address)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 font-mono text-xs text-slate-200 transition hover:border-sky-500/40 hover:text-sky-300"
                        >
                          {copied === s.address ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-slate-500" />
                          )}
                          {s.address}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <Users className="h-3.5 w-3.5" />—
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <RoomBadge room={s.room} />
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-400">{s.version}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                          Online
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Dados obtidos de mb.srb2.org — o master server oficial de Sonic Robo Blast 2.
        </p>
      </main>
    </div>
  );
}

function RoomBadge({ room }: { room: ServerRoom }) {
  const styles: Record<ServerRoom, string> = {
    Casual: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    Standard: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    "Custom Gametypes": "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
    Unknown: "border-slate-700 bg-slate-800/60 text-slate-300",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
        styles[room],
      )}
    >
      {room}
    </span>
  );
}
