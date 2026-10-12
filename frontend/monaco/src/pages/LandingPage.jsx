import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import {
  Code2,
  Terminal,
  Play,
  Container,
  Cpu,
  Zap,
  ArrowRight,
  ExternalLink,
  GitBranch,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const [activeTabLang, setActiveTabLang] = useState('python');
  const [demoExecuting, setDemoExecuting] = useState(false);
  const [demoOutput, setDemoOutput] = useState('');

  const sampleSnippets = {
    python: `# Python 3.11 - Dijkstra Routing Demo
import heapq

def shortest_path(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        for v, weight in graph[u].items():
            if distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight
                heapq.heappush(pq, (distances[v], v))
    return distances

network = {'Edge': {'ALB': 12}, 'ALB': {'Worker': 4}, 'Worker': {}}
print("Network Route Latency:", shortest_path(network, 'Edge'))`,
    java: `// Java 17 LTS - Parallel Math Stream
import java.util.stream.IntStream;

public class Main {
    public static void main(String[] args) {
        int sumOfSquares = IntStream.rangeClosed(1, 100)
            .parallel()
            .map(n -> n * n)
            .sum();
        System.out.println("Sum of squares (1..100): " + sumOfSquares);
    }
}`,
    cpp: `// C++20 - Vectorized Multiplication
#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> numbers = {10, 20, 30, 40, 50};
    int total = std::accumulate(numbers.begin(), numbers.end(), 0);
    std::cout << "Computed checksum: " << total << "\\n";
    return 0;
}`,
  };

  const handleRunDemo = () => {
    setDemoExecuting(true);
    setDemoOutput('Enqueuing execution job in container sandbox...');
    setTimeout(() => {
      setDemoOutput('Allocating Linux cgroups v2 quotas...');
      setTimeout(() => {
        setDemoExecuting(false);
        if (activeTabLang === 'python') {
          setDemoOutput("Network Route Latency: {'Edge': 0, 'ALB': 12, 'Worker': 16}\nContainer exited with code 0 (Success) | 28ms");
        } else if (activeTabLang === 'java') {
          setDemoOutput('Sum of squares (1..100): 338350\nContainer exited with code 0 (Success) | 84ms');
        } else {
          setDemoOutput('Computed checksum: 150\nContainer exited with code 0 (Success) | 12ms');
        }
      }, 700);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              Cloud<span className="text-blue-600">IDE</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-slate-900 transition-colors">Architecture</a>
            <a href="#tech-stack" className="hover:text-slate-900 transition-colors">Tech Stack</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors flex items-center gap-1">
              Documentation <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
                >
                  Start Coding
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 pt-16 pb-20 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span>Containerized Code Execution Workspace</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Your Development Environment. <br className="hidden sm:inline" />
          <span className="text-blue-600">Anywhere.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Zero-setup, browser-based coding platform powered by Monaco Editor, microservice API architecture, and isolated container execution for Java, C++, and Python.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={isAuthenticated ? '/ide' : '/register'}
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm flex items-center gap-2"
          >
            <span>Start Coding Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors"
          >
            Explore Features
          </a>
        </div>

        {/* Live Interactive Code Preview */}
        <div className="mt-14 max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-left">
          {/* Window Title Bar */}
          <div className="h-11 bg-slate-50/80 px-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="ml-3 font-mono text-xs text-slate-500 font-medium">Cloud IDE Sandbox</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTabLang('python')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                  activeTabLang === 'python' ? 'bg-white text-blue-700 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Python 3.11
              </button>
              <button
                onClick={() => setActiveTabLang('java')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                  activeTabLang === 'java' ? 'bg-white text-blue-700 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Java 17
              </button>
              <button
                onClick={() => setActiveTabLang('cpp')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                  activeTabLang === 'cpp' ? 'bg-white text-blue-700 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                C++20
              </button>

              <button
                onClick={handleRunDemo}
                disabled={demoExecuting}
                className="ml-2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{demoExecuting ? 'Running...' : 'Run Preview'}</span>
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className="p-5 font-mono text-xs bg-white">
            <pre className="text-slate-800 leading-relaxed overflow-x-auto">
              {sampleSnippets[activeTabLang]}
            </pre>
          </div>

          {/* Execution Result Area */}
          <div className="border-t border-slate-200 bg-slate-50/80 p-4 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1.5 text-[11px] font-sans font-medium">
              <Terminal className="w-3.5 h-3.5 text-blue-600" />
              <span>Container stdout / execution output:</span>
            </div>
            <p className="text-slate-800 font-semibold whitespace-pre-line leading-relaxed">
              {demoOutput || 'Click "Run Preview" to execute this code inside the container sandbox.'}
            </p>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed for Clean Productivity
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Everything you need to write, compile, debug, and execute code in isolated cloud environments.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Online Execution</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full compiler and runtime support for Java 17 LTS, C++20 (GCC 13.2), and Python 3.11 with custom stdin inputs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Container className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Secure Sandboxes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Programs execute inside isolated, unprivileged Linux Docker containers with strict CPU quotas and memory ceilings.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Monaco Editor</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The exact code editing engine that powers VS Code. IntelliSense, syntax tree highlighting, tabs, and minimap.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Cloud-Native Scale</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Architected for AWS CloudFront edge delivery, Application Load Balancers, Redis queues, and Kubernetes worker pods.
            </p>
          </div>
        </div>
      </section>

      {/* Cloud Architecture Overview */}
      <section id="architecture" className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Target Cloud Infrastructure
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Designed for enterprise isolation, zero persistent state in containers, and horizontal auto-scaling on AWS.
          </p>
        </div>

        <ArchitectureDiagram />
      </section>

      {/* Technology Stack Section */}
      <section id="tech-stack" className="py-16 px-6 max-w-7xl mx-auto w-full border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900">
            Technology Stack
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Built with modern web standards and battle-tested cloud-native infrastructure components.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col items-center">
            <span className="font-bold text-sm text-slate-900">React 19 & Vite</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Frontend App</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col items-center">
            <span className="font-bold text-sm text-slate-900">Monaco Editor</span>
            <span className="text-[11px] text-slate-500 mt-0.5">VS Code Core</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col items-center">
            <span className="font-bold text-sm text-slate-900">Node.js Express</span>
            <span className="text-[11px] text-slate-500 mt-0.5">API Gateway</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col items-center">
            <span className="font-bold text-sm text-slate-900">Docker Sandbox</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Isolated Runner</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col items-center">
            <span className="font-bold text-sm text-slate-900">Postgres & Redis</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Storage & Queue</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col items-center">
            <span className="font-bold text-sm text-slate-900">Kubernetes EKS</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Worker Pods</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800">Cloud IDE</span>
            <span>— Cloud-Native Code Execution Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/ide" className="hover:text-slate-900 transition-colors">IDE Workspace</Link>
            <Link to="/dashboard" className="hover:text-slate-900 transition-colors">Projects</Link>
            <Link to="/settings" className="hover:text-slate-900 transition-colors">API Settings</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-slate-900 transition-colors">
              <GitBranch className="w-3.5 h-3.5" /> GitHub
            </a>
          </div>

          <p className="text-slate-400">© 2025 Cloud IDE. Minimalist, light-themed developer platform.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
