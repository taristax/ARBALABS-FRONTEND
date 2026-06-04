"use client";

import React, { useState, useEffect, useRef } from "react";
import { List, ListImperativeAPI } from "react-window";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import TechButton from "@/components/ui/TechButton";
import DataLabel from "@/components/ui/DataLabel";
import { 
  Lock, 
  FileSignature, 
  Database, 
  Terminal as TerminalIcon, 
  Settings, 
  Trash2, 
  ChevronRight, 
  FileCode, 
  UploadCloud, 
  X,
  AlertTriangle,
  RotateCcw
} from "lucide-react";

interface UploadingFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  speed: string;
  eta: string;
  status: "queued" | "uploading" | "transmitted" | "confirmed";
}

interface LogLine {
  id: string;
  time: string;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR";
  subsystem: string;
  message: string;
}

const INITIAL_LOGS: LogLine[] = [
  { id: "log-1", time: "12:50:01", level: "INFO", subsystem: "SYS", message: "SYSTEM ARCHITECTURE INITIALIZATION COMPLETED" },
  { id: "log-2", time: "12:50:03", level: "INFO", subsystem: "NET", message: "TELEMETRY UPLINK ROUTER CONNECTED — CHANNEL S-BAND-4" },
  { id: "log-3", time: "12:50:05", level: "DEBUG", subsystem: "GPU", message: "TENSOR CORE TEMP AT 38.4C, FREQUENCY SET TO 1845MHZ" },
  { id: "log-4", time: "12:50:06", level: "INFO", subsystem: "AI", message: "ARBAEDGE MODEL RESNET50-V4 LOADED INTO EDGE RAM" },
  { id: "log-5", time: "12:50:10", level: "DEBUG", subsystem: "SYS", message: "PROVENANCE METRICS: WRITING INTEGRITY CHAIN FINGERPRINT..." },
  { id: "log-6", time: "12:51:15", level: "INFO", subsystem: "SEC", message: "SHA256 INTEGRITY VALIDATED AGAINST AUDIT HASH: VALID" },
  { id: "log-7", time: "12:53:22", level: "WARN", subsystem: "TEL", message: "S-BAND SIGNAL ATTENUATION EXCEEDED 2DB - AUTOSHIFT CH 4" },
  { id: "log-8", time: "12:54:12", level: "INFO", subsystem: "NET", message: "TELEMETRY INGEST NOMINAL (450 MBPS)" }
];

export default function ManagementPage() {
  // --- STATE FOR VERIFICATION & INTEGRITY (⑤) ---
  const [integrityStatus, setIntegrityStatus] = useState<"verified" | "unverified" | "tamper">("verified");
  const [lastCheckTime, setLastCheckTime] = useState("12:54:12 UTC");
  const [expectedHash, setExpectedHash] = useState("0x8b4c9e821fa3906a2e4822bc9942a17082bf3de4c718b5ea108422bc5906f0e1");
  const [actualHash, setActualHash] = useState("0x8b4c9e821fa3906a2e4822bc9942a17082bf3de4c718b5ea108422bc5906f0e1");

  // --- STATE FOR PAYLOAD UPLOAD (⑦) ---
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([
    { id: "f-1", name: "instruction_set_beta_7.bin", size: "4.2 MB", progress: 100, speed: "0 KB/s", eta: "0s", status: "confirmed" },
    { id: "f-2", name: "ocean_grid_scan_weights.json", size: "12.8 MB", progress: 75, speed: "256 KB/s", eta: "12s", status: "uploading" }
  ]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE FOR TERMINAL & CONTROLS (⑨) ---
  const [logs, setLogs] = useState<LogLine[]>(INITIAL_LOGS);
  const [logFilter, setLogFilter] = useState<"ALL" | "DEBUG" | "INFO" | "WARN" | "ERROR">("ALL");
  const [autoScrollLogs, setAutoScrollLogs] = useState(true);
  const listRef = useRef<ListImperativeAPI>(null);
  const [isLogsPaused, setIsLogsPaused] = useState(false);

  // Form Config
  const [pollInterval, setPollInterval] = useState(5);
  const [bandwidthLimit, setBandwidthLimit] = useState(10);
  const [activeTelemetryChannel, setActiveTelemetryChannel] = useState("Band-S-4");

  // Confirmation Modal
  const [activeModal, setActiveModal] = useState<"restart" | "reverify" | "clear" | null>(null);

  // Simulated active devices table
  const [devices, setDevices] = useState([
    { id: "dev-a", name: "ARBAEDGE-CORE-01", type: "Edge AI GPU", ver: "v4.1.2", ping: "42ms", status: "online" },
    { id: "dev-b", name: "AVIONICS-NAV-3", type: "LEO Guidance", ver: "v2.8.9", ping: "8ms", status: "online" },
    { id: "dev-c", name: "SENS-RAD-SHIELD", type: "Radiation Shield", ver: "v1.4.0", ping: "124ms", status: "online" },
    { id: "dev-d", name: "COMM-S-BAND-4", type: "S-Band Uplink", ver: "v3.0.4", ping: "---", status: "warning" },
  ]);

  // --- LOG STREAMING SIMULATION ---
  useEffect(() => {
    if (isLogsPaused) return;

    const timer = setInterval(() => {
      const timeStr = new Date().toISOString().substring(11, 19);
      const subsystems = ["SYS", "TEL", "GPU", "AI", "SEC", "NET"];
      const levels: Array<"DEBUG" | "INFO" | "WARN" | "ERROR"> = ["DEBUG", "INFO", "WARN"];
      const subsys = subsystems[Math.floor(Math.random() * subsystems.length)];
      const lvl = Math.random() < 0.1 ? "WARN" : levels[Math.floor(Math.random() * levels.length)];

      let msg = "";
      if (lvl === "WARN") {
        msg = `TELEMETRY DRIFT NOTED IN CH-${Math.floor(Math.random() * 8)} (+0.${Math.floor(Math.random() * 9)}%)`;
      } else if (subsys === "SYS") {
        msg = `SOLID-STATE CACHE READ CYCLES RE-ALLOCATED (${Math.floor(100 + Math.random() * 400)}KB)`;
      } else if (subsys === "GPU") {
        msg = `TENSOR FLOPS RATE SYNCED AT ${Math.round((12.4 + Math.random() * 2) * 10) / 10} TFLOPS`;
      } else if (subsys === "AI") {
        msg = `BATCH EXECUTION FINGERPRINT WRITTEN: sha256:${Math.floor(1000 + Math.random() * 9000)}`;
      } else if (subsys === "SEC") {
        msg = `CHECKING SHA256 BLOCK INTEGRITY ON ARBAEDGE-1... INTEGRITY OK`;
      } else {
        msg = `TELEMETRY INGEST MATRIX ${Math.floor(Math.random() * 200)} OK`;
      }

      setLogs(prev => [
        ...prev,
        { id: `log-${Date.now()}`, time: timeStr, level: lvl, subsystem: subsys, message: msg }
      ].slice(-120)); // Limit to last 120 logs for solid buffer
    }, 2000);

    return () => clearInterval(timer);
  }, [isLogsPaused]);

  // --- UPLOAD SPEED & PROGRESS SIMULATION ---
  useEffect(() => {
    const timer = setInterval(() => {
      setUploadQueue(prevQueue => {
        let updated = false;
        const next = prevQueue.map(f => {
          if (f.status === "uploading") {
            updated = true;
            const newProgress = Math.min(100, f.progress + Math.floor(Math.random() * 8) + 2);
            const isDone = newProgress === 100;
            
            return {
              ...f,
              progress: newProgress,
              speed: isDone ? "0 KB/s" : `${Math.floor(128 + Math.random() * 256)} KB/s`,
              eta: isDone ? "0s" : `${Math.ceil((100 - newProgress) * 0.4)}s`,
              status: isDone ? ("transmitted" as const) : ("uploading" as const)
            };
          } else if (f.status === "transmitted" && Math.random() < 0.25) {
            // Shift to confirmed (validated on-orbit)
            updated = true;
            return {
              ...f,
              status: "confirmed" as const
            };
          }
          return f;
        });

        // Trigger log print on complete
        if (updated) {
          const finished = next.find(f => f.status === "transmitted" && !prevQueue.find(p => p.id === f.id && p.status === "transmitted"));
          if (finished) {
            const timeStr = new Date().toISOString().substring(11, 19);
            setLogs(prev => [
              ...prev,
              { id: `log-${Date.now()}`, time: timeStr, level: "INFO", subsystem: "SYS", message: `PAYLOAD INSTRUCTION UPLOAD COMPLETE: ${finished.name.toUpperCase()}` }
            ]);
          }
        }
        return next;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (logFilter === "ALL") return true;
    return log.level === logFilter;
  });

  // Scroll to bottom of terminal using virtualization scrollToRow
  useEffect(() => {
    if (autoScrollLogs && listRef.current && filteredLogs.length > 0) {
      listRef.current.scrollToRow({ index: filteredLogs.length - 1, align: "end" });
    }
  }, [filteredLogs, autoScrollLogs]);

  // Handle drag over
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Simulate file drop upload addition
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      addNewFileToQueue(file.name, file.size);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      addNewFileToQueue(file.name, file.size);
    }
  };

  const addNewFileToQueue = (name: string, sizeBytes: number) => {
    const sizeStr = sizeBytes > 1024 * 1024 
      ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB` 
      : `${(sizeBytes / 1024).toFixed(0)} KB`;

    const newId = `f-${Date.now()}`;
    
    setUploadQueue(prev => [
      ...prev,
      {
        id: newId,
        name,
        size: sizeStr,
        progress: 0,
        speed: "256 KB/s",
        eta: "15s",
        status: "queued"
      }
    ]);

    // Print to syslog
    const timeStr = new Date().toISOString().substring(11, 19);
    setLogs(prev => [
      ...prev,
      { id: `log-${Date.now()}`, time: timeStr, level: "INFO", subsystem: "SYS", message: `NEW PAYLOAD INSTRUCTION ENQUEUED: ${name.toUpperCase()}` }
    ]);

    // Start uploading after 1 second if queue not already busy
    setTimeout(() => {
      setUploadQueue(prevQueue => {
        return prevQueue.map(f => {
          if (f.id === newId) {
            return { ...f, status: "uploading" };
          }
          return f;
        });
      });
    }, 1000);
  };

  const triggerUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearQueue = () => {
    setUploadQueue([]);
    const timeStr = new Date().toISOString().substring(11, 19);
    setLogs(prev => [
      ...prev,
      { id: `log-${Date.now()}`, time: timeStr, level: "INFO", subsystem: "SYS", message: "PAYLOAD INSTRUCTION UPLOAD QUEUE FLUSHED BY OPERATOR" }
    ]);
  };

  // Anomaly Injection Test
  const handleInjectAnomaly = () => {
    setIntegrityStatus("tamper");
    setActualHash("0xDEADBEEF1fa3906a2e4822bc9942a17082bf3de4c718b5ea108422bc59066666");
    const timeStr = new Date().toISOString().substring(11, 19);
    setLogs(prev => [
      ...prev,
      { id: `log-${Date.now()}`, time: timeStr, level: "ERROR", subsystem: "SEC", message: "PROVENANCE LEDGER INTEGRITY ERROR: SHA256 MISMATCH IDENTIFIED!" },
      { id: `log-${Date.now() + 1}`, time: timeStr, level: "ERROR", subsystem: "SYS", message: "CRITICAL ALARM: TAMPER-EVIDENT EVIDENCE COMPROMISED ON ORBITAL NODE!" }
    ]);
  };

  const executeModalAction = () => {
    const timeStr = new Date().toISOString().substring(11, 19);
    
    if (activeModal === "restart") {
      setLogs(prev => [
        ...prev,
        { id: `log-${Date.now()}`, time: timeStr, level: "WARN", subsystem: "SYS", message: "OPERATOR COMMAND: CRITICAL COLD RESET ISSUED" },
        { id: `log-${Date.now() + 1}`, time: timeStr, level: "INFO", subsystem: "SYS", message: "TERMINATING ACTIVE ARBAEDGE EDGE NEURAL INFERENCES..." },
        { id: `log-${Date.now() + 2}`, time: timeStr, level: "INFO", subsystem: "SYS", message: "REBOOTING FLIGHT COMPUTERS AND ORBITAL RAM REGISTERS..." },
        { id: `log-${Date.now() + 3}`, time: timeStr, level: "INFO", subsystem: "SYS", message: "SYSTEM CORE ONLINE - INITIALIZATION NOMINAL" }
      ]);
      setIntegrityStatus("verified");
      setExpectedHash("0x8b4c9e821fa3906a2e4822bc9942a17082bf3de4c718b5ea108422bc5906f0e1");
      setActualHash("0x8b4c9e821fa3906a2e4822bc9942a17082bf3de4c718b5ea108422bc5906f0e1");
      setLastCheckTime(`${timeStr} UTC`);
    } else if (activeModal === "reverify") {
      setLogs(prev => [
        ...prev,
        { id: `log-${Date.now()}`, time: timeStr, level: "INFO", subsystem: "SEC", message: "OPERATOR COMMAND: RERUN INTEGRITY AUDIT STARTED" },
        { id: `log-${Date.now() + 1}`, time: timeStr, level: "INFO", subsystem: "SEC", message: "RE-HASHING TENSOR STATE LEDGERS FOR SECTORS 1-14..." },
        { id: `log-${Date.now() + 2}`, time: timeStr, level: "INFO", subsystem: "SEC", message: "AUDIT RESULTS: expected === actual MATCHED. INTEGRITY VERIFIED." }
      ]);
      setIntegrityStatus("verified");
      setExpectedHash("0x8b4c9e821fa3906a2e4822bc9942a17082bf3de4c718b5ea108422bc5906f0e1");
      setActualHash("0x8b4c9e821fa3906a2e4822bc9942a17082bf3de4c718b5ea108422bc5906f0e1");
      setLastCheckTime(`${timeStr} UTC`);
    }
    
    setActiveModal(null);
  };

  // virtualized row renderer for VT100 console logs
  const LogRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const log = filteredLogs[index];
    if (!log) return null;

    const levelColors = {
      DEBUG: "text-[#52525B]",
      INFO: "text-[#A1A1AA]",
      WARN: "text-accent-amber font-bold",
      ERROR: "text-accent-red font-bold",
    };

    return (
      <div
        style={style}
        className="leading-relaxed hover:bg-[#27272A]/40 py-0.5 rounded-[2px] px-1 flex gap-1.5 items-start select-text text-[9px] font-mono whitespace-nowrap overflow-hidden"
      >
        <span className="text-[#3F3F46] flex-shrink-0">{log.time}</span>
        <span className={`flex-shrink-0 [min-width:35px] font-bold ${levelColors[log.level]}`}>[{log.level}]</span>
        <span className="text-[#52525B] flex-shrink-0">[{log.subsystem}]</span>
        <span className="text-[#A1A1AA] truncate uppercase tracking-wide">{log.message}</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-stretch min-h-0 select-none">
      
      {/* LEFT COLUMN: Verification & Integrity (⑤) & Payload Upload (⑦) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* ⑤ Verification & Integrity Panel */}
        <GlassCard
          title="PROVENANCE LEDGER — SHA-256 INTEGRITY"
          headerAction={
            <StatusBadge status={integrityStatus === "verified" ? "online" : integrityStatus === "tamper" ? "alert" : "warning"} label={integrityStatus === "verified" ? "VERIFIED" : "COMPROMISED"} />
          }
        >
          <div className="space-y-6">
            
            {/* Status overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border border-[#27272A] p-3 rounded-[2px]">
                <p className="text-[9px] font-mono text-[#52525B] uppercase tracking-wider mb-2">Integrity State</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${integrityStatus === "verified" ? "bg-accent-green" : "bg-accent-red"}`} />
                  <span className={`text-sm font-bold tracking-widest ${integrityStatus === "verified" ? "text-accent-green" : "text-accent-red"}`}>
                    {integrityStatus === "verified" ? "VERIFIED" : "COMPROMISED"}
                  </span>
                </div>
              </div>
              <div className="border border-[#27272A] p-3 rounded-[2px]">
                <p className="text-[9px] font-mono text-[#52525B] uppercase tracking-wider mb-2">Last Audit</p>
                <span className="text-sm font-bold text-white font-data">{lastCheckTime}</span>
              </div>
              <div className="border border-[#27272A] p-3 rounded-[2px] flex flex-col justify-between gap-2">
                <p className="text-[9px] font-mono text-[#52525B] uppercase tracking-wider">Anomaly Test</p>
                <TechButton
                  onClick={handleInjectAnomaly}
                  disabled={integrityStatus === "tamper"}
                  variant={integrityStatus === "verified" ? "danger" : "outline"}
                  size="sm"
                  className="w-full justify-center"
                >
                  Inject Anomaly
                </TechButton>
              </div>
            </div>

            {/* Checksums */}
            <div className="border border-[#27272A] p-3 rounded-[2px] font-mono text-[9px] space-y-2.5">
              <div className="text-[8px] text-[#52525B] uppercase tracking-widest border-b border-[#27272A] pb-1.5 flex justify-between items-center">
                <span>SHA-256 AUDIT LEDGER</span>
                <FileSignature className="w-3.5 h-3.5 text-[#52525B]" />
              </div>
              <div className="space-y-1">
                <span className="text-[#A1A1AA] block text-[8px] uppercase">Expected (Base Audit Hash):</span>
                <span className="text-[#0ea5e9] block break-all text-[8px] bg-black/60 p-1.5 rounded-[2px] border border-[#27272A]">{expectedHash}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#A1A1AA] block text-[8px] uppercase">Actual Onboard Generated:</span>
                <span className={`block break-all text-[8px] p-1.5 rounded-[2px] border ${
                  integrityStatus === "verified"
                    ? "text-accent-green bg-black/60 border-[#27272A]"
                    : "text-accent-red bg-black/60 border-[#ef4444]/30"
                }`}>{actualHash}</span>
              </div>
            </div>

            {/* Provenance chain */}
            <div className="border border-[#27272A] p-3 rounded-[2px]">
              <p className="text-[9px] font-mono text-[#52525B] uppercase tracking-widest border-b border-[#27272A] pb-2 mb-4">Data Provenance Chain</p>
              <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 md:gap-0">
                {[
                  { icon: <Database className="w-4 h-4" />, label: "Raw Ingest",    sub: "LEO Telemetry",  color: "text-[#0ea5e9]" },
                  { icon: <Lock className="w-4 h-4" />,     label: "ArbaEdge Core", sub: "GPU Tensor Calc", color: "text-[#10b981]" },
                  { icon: <FileSignature className="w-4 h-4" />, label: "SHA-256 Sign", sub: "Provenance Log", color: "text-[#f59e0b]" },
                  { icon: <Lock className="w-4 h-4" />,     label: "Audit Ledger",  sub: integrityStatus === "verified" ? "VERIFIED" : "TAMPERED", color: integrityStatus === "verified" ? "text-accent-green" : "text-accent-red" },
                ].map((step, i, arr) => (
                  <React.Fragment key={step.label}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full border border-[#27272A] bg-black flex items-center justify-center ${step.color}`}>
                        {step.icon}
                      </div>
                      <span className="text-[8px] font-space text-[#A1A1AA] uppercase tracking-wider">{step.label}</span>
                      <span className={`text-[7.5px] font-mono uppercase ${i === arr.length - 1 ? step.color + " font-bold" : "text-[#52525B]"}`}>{step.sub}</span>
                    </div>
                    {i < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-[#3F3F46] hidden md:block" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

          </div>
        </GlassCard>

        {/* Payload Upload Area */}
        <GlassCard title="PAYLOAD UPLOADER">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Drag & Drop zone */}
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerUploadClick}
                className={`border border-dashed rounded-[2px] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
                  dragActive
                    ? "border-[#52525B] bg-white/5"
                    : "border-[#27272A] hover:border-[#3F3F46] hover:bg-white/[0.02]"
                }`}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept=".bin,.json,.hex"
                  onChange={handleFileSelect}
                />
                <UploadCloud className="w-9 h-9 text-[#A1A1AA] mb-3" />
                <div className="text-xs text-white font-space tracking-wider uppercase font-medium">
                  Drag & Drop Payload Instructions
                </div>
                <div className="text-[10px] text-[#52525B] font-mono mt-1 uppercase tracking-wide">
                  .bin, .json, .hex — Max 50 MB
                </div>
                <div className="mt-3 px-3 py-1 bg-[#18181B] border border-[#27272A] rounded-[2px] text-[9px] font-mono text-[#A1A1AA] hover:border-[#3F3F46] transition-colors">
                  Select File
                </div>
              </div>

              <div className="flex gap-2">
                <TechButton onClick={clearQueue} variant="outline" size="sm" className="w-full flex justify-center items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  CLEAR ACTIVE QUEUE
                </TechButton>
                <TechButton onClick={triggerUploadClick} variant="blue" size="sm" className="w-full flex justify-center items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5" />
                  ADD NEW FILE
                </TechButton>
              </div>
            </div>

            {/* Upload Queue List */}
            <div className="flex flex-col justify-between">
              <div className="border border-[#27272A] rounded-[2px] p-3 flex-1 flex flex-col">
                <span className="text-[9px] font-mono text-[#52525B] tracking-widest uppercase block border-b border-[#27272A] pb-1.5 mb-2">  
                  ACTIVE UPLOAD QUEUE
                </span>

                <div className="flex-1 overflow-y-auto max-h-[160px] space-y-2 pr-1 custom-scrollbar">
                  {uploadQueue.length === 0 ? (
                    <div className="text-center py-8 text-[10px] font-mono text-[#52525B] uppercase tracking-widest">
                      Queue empty — awaiting input...
                    </div>
                  ) : (
                    uploadQueue.map((file) => {
                      const isComplete = file.progress === 100;
                      return (
                        <div key={file.id} className="border border-[#27272A] p-2 rounded-[2px] space-y-1.5 text-[10px] font-mono">
                          <div className="flex justify-between items-center gap-4">
                            <span className="font-bold text-white flex items-center gap-1 truncate max-w-[60%]">
                              <FileCode className="w-3.5 h-3.5 text-[#A1A1AA] flex-shrink-0" />
                              {file.name}
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-slate-500">{file.size}</span>
                              {file.status === "confirmed" ? (
                                <span className="text-accent-green font-bold">CONFIRMED</span>
                              ) : file.status === "transmitted" ? (
                                <span className="text-accent-blue font-bold">TRANSMITTED</span>
                              ) : file.status === "uploading" ? (
                                <span className="text-accent-amber">UPLOADING...</span>
                              ) : (
                                <span className="text-slate-500">QUEUED</span>
                              )}
                            </div>
                          </div>

                          {/* Progress Line */}
                          <div className="space-y-1">
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className={`h-full transition-all duration-500 ease-out ${
                                  isComplete ? "bg-accent-green" : "bg-accent-blue"
                                }`}
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                            {!isComplete && file.status === "uploading" && (
                              <div className="flex justify-between text-[8px] text-slate-500 leading-none">
                                <span>SPEED: {file.speed}</span>
                                <span>ETA: {file.eta}</span>
                                <span>{file.progress}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            </div>

          </div>
        </GlassCard>

      </div>

      {/* RIGHT COLUMN: Admin / Operator Console (⑨ - Functional Monospaced, virtualized syslogs) */}
      <div className="flex flex-col gap-6 font-mono text-xs">
        
        <GlassCard
          title="OPERATOR CONTROLS"
          className="flex-1 flex flex-col"
        >
          <div className="space-y-4 flex-1 flex flex-col">
            
            {/* System Configuration */}
            <div className="border border-[#27272A] p-3 rounded-[2px] space-y-3">
              <div className="text-[9px] text-[#52525B] tracking-widest uppercase border-b border-[#27272A] pb-1.5 flex justify-between">
                <span>System Configuration</span>
                <Settings className="w-3.5 h-3.5 text-[#52525B]" />
              </div>
              <div className="space-y-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase">Telemetry Sync Rate (seconds)</label>
                  <input
                    type="number"
                    value={pollInterval}
                    onChange={(e) => setPollInterval(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-black border border-[#27272A] focus:border-[#52525B] px-2 py-1 rounded-[2px] text-white outline-none text-[11px] font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase">Max Bandwidth Throttle (Mbps)</label>
                  <input
                    type="number"
                    value={bandwidthLimit}
                    onChange={(e) => setBandwidthLimit(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-black border border-[#27272A] focus:border-[#52525B] px-2 py-1 rounded-[2px] text-white outline-none text-[11px] font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#A1A1AA] uppercase">Telemetry Uplink Channel</label>
                  <select
                    value={activeTelemetryChannel}
                    onChange={(e) => setActiveTelemetryChannel(e.target.value)}
                    className="w-full bg-black border border-[#27272A] focus:border-[#52525B] px-2 py-1 rounded-[2px] text-white outline-none text-[11px] font-mono"
                  >
                    <option value="Band-S-4">S-Band-Ch4 (Primary Uplink)</option>
                    <option value="Band-X-2">X-Band-Ch2 (Imagery Feed)</option>
                    <option value="UHF-Ch-1">UHF-Aux-1 (Vitals Backup)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* VT100 System Log Terminal */}
            <div className="flex-1 min-h-[290px] bg-black border border-[#27272A] rounded-[2px] p-2.5 flex flex-col justify-between">
              
              {/* Header Filters */}
              <div className="flex justify-between items-center border-b border-[#27272A] pb-1.5 mb-2 text-[9px]">
                <div className="flex items-center gap-1 text-[#A1A1AA]">
                  <TerminalIcon className="w-3 h-3" />
                  <span className="font-mono text-[8px] uppercase tracking-widest">System Log</span>
                </div>
                
                <div className="flex gap-1">
                  {(["ALL", "INFO", "WARN", "ERROR"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setLogFilter(f)}
                      className={`px-1.5 py-0.5 border rounded-[2px] transition-colors uppercase text-[8px] font-mono ${
                        logFilter === f
                          ? "bg-[#27272A] border-[#3F3F46] text-white"
                          : "border-transparent text-[#52525B] hover:text-[#A1A1AA]"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logs area - Virtualized FixedSizeList */}
              <div 
                onMouseEnter={() => setIsLogsPaused(true)}
                onMouseLeave={() => setIsLogsPaused(false)}
                className="flex-1 h-[220px] text-[9px] relative pr-1 overflow-hidden"
              >
                {isLogsPaused && (
                  <div className="sticky top-0 left-0 right-0 bg-accent-amber/10 border border-accent-amber/25 text-accent-amber text-[8px] py-0.5 px-2 rounded-[2px] text-center uppercase mb-1 font-bold z-10">
                    Terminal Paused (Hovering)
                  </div>
                )}
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-6 text-slate-600 uppercase">
                    No matching syslog outputs
                  </div>
                ) : (
                  <List
                    listRef={listRef}
                    style={{ height: 210, width: "100%" }}
                    rowCount={filteredLogs.length}
                    rowHeight={18}
                    rowComponent={LogRow as any}
                    rowProps={{}}
                    className="custom-scrollbar"
                  />
                )}
              </div>

              {/* Log actions footer */}
              <div className="border-t border-[#27272A] pt-1.5 mt-2 flex justify-between items-center text-[8px] text-[#52525B] font-mono uppercase">
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isLogsPaused ? "bg-[#52525B]" : "bg-accent-green"}`} />
                  {isLogsPaused ? "Paused" : "Streaming"}
                </span>
                <button
                  onClick={() => setLogs(INITIAL_LOGS)}
                  className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Flush Logs
                </button>
              </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <TechButton 
                onClick={() => setActiveModal("restart")} 
                variant="amber" 
                size="sm"
                className="w-full justify-center flex items-center gap-1 text-[9px] tracking-widest font-mono"
              >
                SYS COLD RESET
              </TechButton>
              <TechButton 
                onClick={() => setActiveModal("reverify")} 
                variant="outline" 
                size="sm"
                className="w-full justify-center flex items-center gap-1 text-[9px] tracking-widest font-mono"
              >
                RE-RUN STATE AUDIT
              </TechButton>
            </div>

          </div>
        </GlassCard>

      </div>

      {/* Confirmation Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 select-none">
          <div className="bg-[#111111] border border-[#27272A] max-w-sm w-full p-6 rounded-[2px]">
            <button
              onClick={() => setActiveModal(null)}
              className="float-right text-[#52525B] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center gap-4 text-center clear-right">
              <div className="w-10 h-10 border border-[#27272A] flex items-center justify-center rounded-[2px] text-[#f59e0b]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-space text-sm font-bold uppercase tracking-wider text-white">Confirm Command</h3>
                <p className="text-[10px] text-[#A1A1AA] leading-relaxed mt-2 font-mono">
                  {activeModal === "restart" && "Cold reset will terminate active ArbaEdge inferences and restart orbital core memories."}
                  {activeModal === "reverify" && "Re-verification will re-hash all tensor state ledgers and compare against the audit hash."}
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <TechButton onClick={() => setActiveModal(null)} variant="outline" className="w-full justify-center">Cancel</TechButton>
                <TechButton onClick={executeModalAction} variant="amber" className="w-full justify-center">Execute</TechButton>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
