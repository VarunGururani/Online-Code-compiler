import React, { useState } from 'react';
import { Cloud, Globe, Cpu, Server, Database, Container, Layers, ShieldCheck, Activity } from 'lucide-react';
import { getIsDemoMode } from '../services/api';

export const ArchitectureDiagram = () => {
  const [selectedNode, setSelectedNode] = useState('docker');
  const isDemo = getIsDemoMode();

  const nodes = [
    {
      id: 'client',
      title: 'React Client',
      type: 'Frontend',
      tech: 'React 19 + Monaco Editor + Tailwind',
      icon: <Globe className="w-5 h-5 text-sky-600" />,
      desc: 'Monaco code editor workspace delivering syntax highlighting, intelligent buffer diffing, and zero-latency keyboard events.',
      status: 'Live Client',
    },
    {
      id: 'edge',
      title: 'AWS CloudFront',
      type: 'CDN & Edge',
      tech: 'Global Edge Locations + TLS Termination',
      icon: <Cloud className="w-5 h-5 text-indigo-600" />,
      desc: 'Edge caching for static assets, low-latency TLS handshake, and DDoS mitigation via AWS Shield Standard.',
      status: 'Planned Infra',
    },
    {
      id: 'alb',
      title: 'Application Load Balancer',
      type: 'Gateway',
      tech: 'AWS ALB + WebSocket Support',
      icon: <Layers className="w-5 h-5 text-violet-600" />,
      desc: 'Layer-7 load balancing directing traffic between REST endpoints and persistent WebSocket execution telemetry streams.',
      status: 'Planned Infra',
    },
    {
      id: 'api',
      title: 'Node.js Express API',
      type: 'Backend Service',
      tech: 'Express.js + Session Cookies + JWT',
      icon: <Server className="w-5 h-5 text-emerald-600" />,
      desc: 'Authentication via HTTP-only cookies, project CRUD, execution payload validation, and job dispatching to Redis.',
      status: isDemo ? 'Demo Mode Active' : 'Target Host: :5000',
    },
    {
      id: 'redis',
      title: 'Redis Cluster',
      type: 'Cache & Queue',
      tech: 'Redis 7 / AWS ElastiCache',
      icon: <Activity className="w-5 h-5 text-rose-600" />,
      desc: 'BullMQ execution job queue, rate limiting per user IP, session storage, and pub/sub output streaming buffer.',
      status: 'Planned Infra',
    },
    {
      id: 'db',
      title: 'PostgreSQL RDS',
      type: 'Database',
      tech: 'Amazon RDS PostgreSQL 16',
      icon: <Database className="w-5 h-5 text-blue-600" />,
      desc: 'ACID storage for user credentials, project metadata, file trees, execution audit trails, and user preferences.',
      status: 'Planned Infra',
    },
    {
      id: 'k8s',
      title: 'Kubernetes (EKS)',
      type: 'Orchestrator',
      tech: 'AWS EKS + Karpenter Auto-scaler',
      icon: <Cpu className="w-5 h-5 text-cyan-600" />,
      desc: 'Dispatches execution jobs to isolated worker pods with resource quotas, ephemeral volume mounts, and dynamic scaling.',
      status: 'Planned Infra',
    },
    {
      id: 'docker',
      title: 'Docker Sandbox Runners',
      type: 'Execution Engine',
      tech: 'gVisor / seccomp / cgroups v2',
      icon: <Container className="w-5 h-5 text-amber-600" />,
      desc: 'Ephemeral, unprivileged containers for Java (Temurin 17), C++ (GCC 13), and Python (3.11) with strict memory and CPU limits.',
      status: 'Isolated Sandbox',
    },
  ];

  const activeInfo = nodes.find((n) => n.id === selectedNode) || nodes[0];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Target Cloud Architecture</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end execution pipeline from browser editor to isolated Linux container sandboxes.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Frontend Ready
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
            Sandbox Engine Ready
          </span>
        </div>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-6">
        {nodes.map((node, i) => {
          const isSelected = selectedNode === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`text-left p-3 rounded-2xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500/30'
                  : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                  {node.icon}
                </span>
                <span className="text-[10px] font-mono font-medium text-slate-400">#{i + 1}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 truncate">{node.title}</p>
                <p className="text-[10px] text-slate-500 truncate">{node.type}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Node Detailed Breakdown */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-sm text-slate-900">{activeInfo.title}</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono">
              {activeInfo.tech}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
              {activeInfo.status}
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">{activeInfo.desc}</p>
        </div>

        <div className="shrink-0 flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Isolated cgroup quotas & seccomp sandbox</span>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
