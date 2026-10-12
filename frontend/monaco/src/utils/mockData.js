import { STARTER_TEMPLATES } from './starterTemplates';

export const MOCK_USER = {
  id: 'usr_94829a1b',
  name: 'Alex Rivera',
  email: 'alex.rivera@devcloud.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  role: 'Senior Software Engineer',
  createdAt: '2025-01-15T08:30:00Z',
  preferences: {
    theme: 'vs-light',
    fontSize: 14,
    tabSize: 4,
    wordWrap: 'on',
    minimap: true,
    defaultLanguage: 'python',
    autoSave: true,
  },
};

export const INITIAL_PROJECTS = [
  {
    id: 'proj_py_algo',
    name: 'Distributed Graph Solver',
    description: 'Breadth-First Search and Dijkstra shortest path implementation in Python 3.11 with containerized benchmarking.',
    language: 'python',
    updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    createdAt: '2025-02-10T14:20:00Z',
    runsCount: 42,
    files: [
      {
        id: 'file_py_1',
        name: 'main.py',
        path: '/main.py',
        language: 'python',
        content: `# Distributed Graph Solver - Python 3.11
import heapq
import sys

def dijkstra(graph, start):
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    
    while pq:
        curr_dist, curr_node = heapq.heappop(pq)
        if curr_dist > distances[curr_node]:
            continue
            
        for neighbor, weight in graph[curr_node].items():
            dist = curr_dist + weight
            if dist < distances[neighbor]:
                distances[neighbor] = dist
                heapq.heappush(pq, (dist, neighbor))
                
    return distances

def main():
    print("🕸️ Initializing Weighted Network Graph...")
    graph = {
        'CloudFront-Edge': {'ALB-US-East': 12, 'ALB-EU-Central': 28},
        'ALB-US-East': {'EKS-Worker-01': 4, 'EKS-Worker-02': 5},
        'ALB-EU-Central': {'EKS-Worker-03': 6},
        'EKS-Worker-01': {'RDS-Postgres': 3, 'Redis-Cluster': 2},
        'EKS-Worker-02': {'RDS-Postgres': 4, 'Redis-Cluster': 2},
        'EKS-Worker-03': {'RDS-Postgres': 18, 'Redis-Cluster': 14},
        'RDS-Postgres': {},
        'Redis-Cluster': {}
    }
    
    source = 'CloudFront-Edge'
    print(f"Calculating routing latencies from source node: [{source}]")
    routes = dijkstra(graph, source)
    
    print("\\n--- Shortest Path Latencies (ms) ---")
    for target, cost in sorted(routes.items(), key=lambda x: x[1]):
        print(f"  → {target:<18} : {cost} ms")
        
    print("\\nTopology optimization complete! Docker sandbox healthy.")

if __name__ == '__main__':
    main()
`,
      },
      {
        id: 'file_py_2',
        name: 'utils.py',
        path: '/utils.py',
        language: 'python',
        content: `# Utility functions for telemetry and logging
import time

def benchmark(fn):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        res = fn(*args, **kwargs)
        duration = (time.perf_counter() - start) * 1000
        print(f"Executed {fn.__name__} in {duration:.2f}ms")
        return res
    return wrapper
`,
      },
      {
        id: 'file_py_3',
        name: 'requirements.txt',
        path: '/requirements.txt',
        language: 'plaintext',
        content: `# Project Dependencies
numpy==1.26.4
pytest==8.0.0
`,
      },
    ],
  },
  {
    id: 'proj_java_svc',
    name: 'Order Transaction Engine',
    description: 'Concurrent memory safe transaction processor written in Java 17 LTS with simulated ACID verification.',
    language: 'java',
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    createdAt: '2025-02-08T11:00:00Z',
    runsCount: 31,
    files: [
      {
        id: 'file_java_1',
        name: 'Main.java',
        path: '/Main.java',
        language: 'java',
        content: `// Order Transaction Engine - Java 17 LTS
import java.util.*;
import java.time.Instant;

public class Main {
    record Order(String orderId, String customer, double amount, String status) {}

    public static void main(String[] args) {
        System.out.println("💳 Cloud IDE - Java 17 High-Throughput Processor");
        System.out.println("Timestamp: " + Instant.now());
        System.out.println("-------------------------------------------------");

        List<Order> batch = List.of(
            new Order("ORD-9021", "Alice Corp", 1499.50, "SETTLED"),
            new Order("ORD-9022", "Bob Global", 320.00, "SETTLED"),
            new Order("ORD-9023", "Charlie Ltd", 8450.75, "SETTLED"),
            new Order("ORD-9024", "Delta Inc", 215.10, "SETTLED")
        );

        double totalRevenue = batch.stream()
            .mapToDouble(Order::amount)
            .sum();

        System.out.printf("Processed %d transactions in batch.\\n", batch.size());
        System.out.printf("Aggregated Settlement: $%,.2f USD\\n", totalRevenue);
        System.out.println("Container isolation: Verified. All locks released.");
    }
}
`,
      },
      {
        id: 'file_java_2',
        name: 'TransactionValidator.java',
        path: '/TransactionValidator.java',
        language: 'java',
        content: `public class TransactionValidator {
    public static boolean validate(double amount) {
        return amount > 0.0 && amount <= 100_000.0;
    }
}
`,
      },
    ],
  },
  {
    id: 'proj_cpp_matrix',
    name: 'SIMD Matrix Multiply Sandbox',
    description: 'Cache-conscious linear algebra multiplication and benchmark harness in C++20 with vectorization.',
    language: 'cpp',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    createdAt: '2025-02-01T09:15:00Z',
    runsCount: 56,
    files: [
      {
        id: 'file_cpp_1',
        name: 'main.cpp',
        path: '/main.cpp',
        language: 'cpp',
        content: `// SIMD Matrix Multiply Sandbox - C++20
#include <iostream>
#include <vector>
#include <chrono>

const int N = 64;

int main() {
    std::cout << "⚡ Cloud IDE C++ Engine - GCC 13.2 x86_64\\n";
    std::cout << "Compiling with flags: -O3 -march=native -Wall\\n";
    std::cout << "------------------------------------------\\n";

    std::vector<std::vector<int>> A(N, std::vector<int>(N, 1));
    std::vector<std::vector<int>> B(N, std::vector<int>(N, 2));
    std::vector<std::vector<int>> C(N, std::vector<int>(N, 0));

    auto start = std::chrono::high_resolution_clock::now();

    for (int i = 0; i < N; ++i) {
        for (int k = 0; k < N; ++k) {
            for (int j = 0; j < N; ++j) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> elapsed = end - start;

    std::cout << "Matrix dimension: " << N << "x" << N << "\\n";
    std::cout << "Checksum C[0][0]: " << C[0][0] << "\\n";
    std::cout << "Execution time:   " << elapsed.count() << " ms\\n";
    std::cout << "Container exited with code 0 (Success)\\n";
    return 0;
}
`,
      },
      {
        id: 'file_cpp_2',
        name: 'benchmark.h',
        path: '/benchmark.h',
        language: 'cpp',
        content: `#pragma once
#include <chrono>

struct Timer {
    std::chrono::time_point<std::chrono::high_resolution_clock> start;
    Timer() : start(std::chrono::high_resolution_clock::now()) {}
};
`,
      },
    ],
  },
];

export const INITIAL_EXECUTIONS = [
  {
    id: 'exec_7a812f',
    projectId: 'proj_py_algo',
    projectName: 'Distributed Graph Solver',
    filename: 'main.py',
    language: 'python',
    status: 'Completed',
    exitCode: 0,
    durationMs: 342,
    memoryMb: 24.8,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    stdout: `🕸️ Initializing Weighted Network Graph...
Calculating routing latencies from source node: [CloudFront-Edge]

--- Shortest Path Latencies (ms) ---
  → CloudFront-Edge    : 0 ms
  → ALB-US-East        : 12 ms
  → EKS-Worker-01      : 16 ms
  → EKS-Worker-02      : 17 ms
  → Redis-Cluster      : 18 ms
  → RDS-Postgres       : 19 ms
  → ALB-EU-Central     : 28 ms
  → EKS-Worker-03      : 34 ms

Topology optimization complete! Docker sandbox healthy.`,
    stderr: '',
    stdin: '',
  },
  {
    id: 'exec_8b903c',
    projectId: 'proj_java_svc',
    projectName: 'Order Transaction Engine',
    filename: 'Main.java',
    language: 'java',
    status: 'Completed',
    exitCode: 0,
    durationMs: 890,
    memoryMb: 82.4,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    stdout: `💳 Cloud IDE - Java 17 High-Throughput Processor
Timestamp: 2025-02-10T12:00:00Z
-------------------------------------------------
Processed 4 transactions in batch.
Aggregated Settlement: $10,485.35 USD
Container isolation: Verified. All locks released.`,
    stderr: '',
    stdin: '',
  },
  {
    id: 'exec_9c014d',
    projectId: 'proj_cpp_matrix',
    projectName: 'SIMD Matrix Multiply Sandbox',
    filename: 'main.cpp',
    language: 'cpp',
    status: 'Completed',
    exitCode: 0,
    durationMs: 420,
    memoryMb: 16.2,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    stdout: `⚡ Cloud IDE C++ Engine - GCC 13.2 x86_64
Compiling with flags: -O3 -march=native -Wall
------------------------------------------
Matrix dimension: 64x64
Checksum C[0][0]: 128
Execution time:   1.42 ms
Container exited with code 0 (Success)`,
    stderr: '',
    stdin: '',
  },
  {
    id: 'exec_6f194e',
    projectId: 'proj_py_algo',
    projectName: 'Distributed Graph Solver',
    filename: 'main.py',
    language: 'python',
    status: 'Failed',
    exitCode: 1,
    durationMs: 210,
    memoryMb: 19.5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    stdout: '🕸️ Initializing Weighted Network Graph...\n',
    stderr: `Traceback (most recent call last):
  File "/workspace/main.py", line 18, in dijkstra
    curr_dist, curr_node = heapq.heappop(pq)
IndexError: index out of range in min-heap extraction`,
    stdin: '',
  },
];
