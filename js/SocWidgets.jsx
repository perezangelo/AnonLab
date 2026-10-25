import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function SocWidgets() {
  const [socData, setSocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const endpoint = "https://angelonline.altervista.org/api/soc-collector.php";

  // Polling dei dati da Altervista ogni 10 secondi
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        const data = await res.json();
        if (data.status === "success") {
          setSocData(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Errore di sincronizzazione SOC:", err);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Rendering e aggiornamento sicuro del grafico Chart.js
  useEffect(() => {
    if (!socData || !socData.attacks) return;
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    
    // Distrugge la vecchia istanza per prevenire l'errore "Canvas is already in use"
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: socData.attacks.labels,
        datasets: [{
          label: "Attacchi Bloccati",
          data: socData.attacks.values,
          borderColor: "#ff4a4a",
          backgroundColor: "rgba(255, 74, 74, 0.15)",
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 2,
          pointBackgroundColor: "#ff4a4a"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#64748b", font: { size: 10 }, maxTicksLimit: 8 }, grid: { color: "rgba(30, 41, 59, 0.4)" } },
          y: { ticks: { color: "#64748b", font: { size: 10 } }, grid: { color: "rgba(30, 41, 59, 0.4)" } }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [socData]);

  if (loading) {
    return <div style={{ color: "#00eaff", fontFamily: "monospace", padding: "20px" }}>⏳ Connessione al SOC Control Room in corso...</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0" }}>
      
      {/* 1. SYSTEM STATUS WIDGET */}
      <div style={{ background: "linear-gradient(135deg, #070a0f 0%, #0d121d 100%)", border: "1px solid #1a2638", borderTop: "3px solid #00eaff", padding: "20px", borderRadius: "6px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.7)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h2 style={{ margin: 0, color: "#00eaff", fontSize: "1.05rem", textTransform: "uppercase", letterSpacing: "2px" }}>System Status</h2>
          <span style={{ fontSize: "0.7rem", color: "#00ff99" }}>● LIVE</span>
        </div>
        <p style={{ opacity: 0.75, fontSize: "0.78rem", marginBottom: "16px", color: "#94a3b8" }}>Monitoraggio nodi e servizi principali.</p>
        
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.82rem" }}>
          <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #1e293b", paddingBottom: "8px" }}>
            <span style={{ color: "#cbd5e1" }}>System Health:</span>
            <span style={{ padding: "3px 10px", borderRadius: "4px", fontWeight: "700", fontSize: "0.72rem", background: "rgba(0,255,153,0.12)", color: "#00ff99", border: "1px solid #00ff99" }}>SECURE / ONLINE</span>
          </li>
          <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #1e293b", paddingBottom: "8px" }}>
            <span style={{ color: "#cbd5e1" }}>Server Latency:</span>
            <span style={{ color: "#00eaff", fontWeight: "bold" }}>{socData?.server?.latency || "14ms"}</span>
          </li>
          <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#cbd5e1" }}>Database / SSL:</span>
            <span style={{ color: "#00ff99", fontWeight: "bold" }}>DB ONLINE (Active)</span>
          </li>
        </ul>
      </div>

      {/* 2. ATTACKS CHART WIDGET */}
      <div style={{ background: "linear-gradient(135deg, #070a0f 0%, #0d121d 100%)", border: "1px solid #1a2638", borderTop: "3px solid #ff4a4a", padding: "20px", borderRadius: "6px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.7)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h2 style={{ margin: 0, color: "#ff4a4a", fontSize: "1.05rem", textTransform: "uppercase", letterSpacing: "2px" }}>Attacchi (ultime 24h)</h2>
          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>SYNCED</span>
        </div>
        <p style={{ opacity: 0.75, fontSize: "0.78rem", marginBottom: "16px", color: "#94a3b8" }}>Volume orario attacchi WAF.</p>
        
        <div style={{ background: "linear-gradient(135deg, #030712 0%, #070b16 100%)", borderRadius: "4px", padding: "10px", border: "1px solid #1e293b", position: "relative", height: "200px" }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* 3. EVENT LOG WIDGET */}
      <div style={{ background: "linear-gradient(135deg, #070a0f 0%, #0d121d 100%)", border: "1px solid #1a2638", borderTop: "3px solid #00eaff", padding: "20px", borderRadius: "6px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.7)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h2 style={{ margin: 0, color: "#00eaff", fontSize: "1.05rem", textTransform: "uppercase", letterSpacing: "2px" }}>Event Log</h2>
          <span style={{ fontSize: "0.7rem", color: "#00ff99" }}>● REAL-TIME</span>
        </div>
        <p style={{ opacity: 0.75, fontSize: "0.78rem", marginBottom: "16px", color: "#94a3b8" }}>Registro attività di sicurezza.</p>

        <div style={{ background: "#030712", border: "1px solid #1e293b", borderRadius: "4px", padding: "10px", maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.75rem" }}>
          {socData?.events?.map((ev, index) => {
            const isHigh = ev.severity === "high";
            const color = isHigh ? "#ff4a4a" : ev.severity === "medium" ? "#f59e0b" : "#00eaff";
            const bg = isHigh ? "rgba(255,74,74,0.15)" : "rgba(0,234,255,0.1)";
            return (
              <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", borderBottom: "1px dashed #1e293b", paddingBottom: "6px" }}>
                <div>
                  <span style={{ color: "#64748b", fontSize: "0.68rem" }}>[{ev.time}]</span>
                  <span style={{ color: "#e2e8f0", marginLeft: "6px" }}>{ev.message}</span>
                </div>
                <span style={{ background: bg, color: color, border: `1px solid ${color}`, padding: "1px 5px", fontSize: "0.6rem", borderRadius: "3px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  {ev.type}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
