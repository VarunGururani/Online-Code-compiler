import { api, getIsDemoMode } from './api';
import { INITIAL_EXECUTIONS } from '../utils/mockData';

const DEMO_EXECUTIONS_KEY = 'cloud_ide_demo_executions';

const getStoredExecutions = () => {
  const data = localStorage.getItem(DEMO_EXECUTIONS_KEY);
  if (!data) {
    localStorage.setItem(DEMO_EXECUTIONS_KEY, JSON.stringify(INITIAL_EXECUTIONS));
    return INITIAL_EXECUTIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_EXECUTIONS;
  }
};

const saveStoredExecutions = (executions) => {
  localStorage.setItem(DEMO_EXECUTIONS_KEY, JSON.stringify(executions));
};

const isUuid = (val) =>
  typeof val === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

const formatExecutionItem = (item, fallback = {}) => {
  if (!item) return null;
  const exec = item.execution || item;
  const rawStatus = (exec.status || fallback.status || 'completed').toLowerCase();
  const formattedStatus =
    rawStatus === 'completed'
      ? 'Completed'
      : rawStatus === 'failed'
      ? 'Failed'
      : rawStatus === 'timed_out'
      ? 'Timed Out'
      : rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

  return {
    ...fallback,
    ...exec,
    id: exec.id || fallback.id || `exec_${Date.now()}`,
    projectId: exec.project_id || exec.projectId || fallback.projectId,
    projectName: exec.project_name || exec.projectName || fallback.projectName || 'Project',
    filename: exec.file_name || exec.filename || fallback.filename || 'source',
    language: exec.language || fallback.language || 'python',
    status: formattedStatus,
    rawStatus,
    exitCode: exec.exit_code ?? exec.exitCode ?? 0,
    durationMs: exec.execution_time_ms ?? exec.executionTimeMs ?? exec.durationMs ?? 0,
    memoryMb: exec.memory_mb ?? exec.memoryMb ?? 24.5,
    stdout: exec.stdout ?? '',
    stderr: exec.stderr ?? '',
    stdin: exec.stdin ?? fallback.stdin ?? '',
    sandboxId: exec.sandbox_id || exec.sandboxId || (exec.id ? `sbx_${String(exec.id).slice(0, 8)}` : 'sbx_isolated'),
    createdAt: exec.created_at || exec.createdAt || new Date().toISOString(),
    isDemoSandbox: !!exec.isDemoSandbox,
  };
};

export const executionService = {
  // Main execution endpoint
  async runCode({ projectId, projectName, filename, language, code, stdin = '', onStatusChange }) {
    if (getIsDemoMode()) {
      return this.simulateSandboxExecution({
        projectId,
        projectName,
        filename,
        language,
        code,
        stdin,
        onStatusChange,
      });
    }

    try {
      if (onStatusChange) onStatusChange('Running');
      const payload = {
        language,
        code,
        stdin: stdin || '',
      };
      if (isUuid(projectId)) payload.projectId = projectId;

      const res = await api.post('/executions', payload);
      const formatted = formatExecutionItem(res.data, {
        projectId,
        projectName,
        filename,
        language,
        stdin,
      });

      if (onStatusChange) onStatusChange(formatted.status);
      return formatted;
    } catch (err) {
      if (onStatusChange) onStatusChange('Failed');
      throw err;
    }
  },

  async getExecution(executionId) {
    if (getIsDemoMode()) {
      const execs = getStoredExecutions();
      const item = execs.find((e) => e.id === executionId);
      if (!item) throw new Error('Execution record not found');
      return item;
    }
    const res = await api.get(`/executions/${executionId}`);
    return formatExecutionItem(res.data);
  },

  async getExecutions(filters = {}) {
    if (getIsDemoMode()) {
      await new Promise((r) => setTimeout(r, 150));
      let execs = getStoredExecutions();
      if (filters.projectId) {
        execs = execs.filter((e) => e.projectId === filters.projectId);
      }
      if (filters.language && filters.language !== 'all') {
        execs = execs.filter((e) => e.language === filters.language);
      }
      if (filters.status && filters.status !== 'all') {
        execs = execs.filter((e) => e.status.toLowerCase() === filters.status.toLowerCase());
      }
      return execs;
    }
    const queryParams = { ...filters };
    if (queryParams.projectId && !isUuid(queryParams.projectId)) {
      delete queryParams.projectId;
    }
    const res = await api.get('/executions', { params: queryParams });
    const rawList = Array.isArray(res.data) ? res.data : (res.data?.executions || []);
    return rawList.map((item) => formatExecutionItem(item));
  },

  async cancelExecution(executionId) {
    if (getIsDemoMode()) {
      return { success: true, message: 'Execution stopped' };
    }
    const res = await api.post(`/executions/${executionId}/cancel`);
    return res.data;
  },

  // High-fidelity Sandbox Simulation for demonstration mode
  async simulateSandboxExecution({
    projectId,
    projectName = 'Project',
    filename,
    language,
    code,
    stdin,
    onStatusChange,
  }) {
    const startTime = performance.now();
    const sandboxId = `sbx_${Math.random().toString(36).substring(2, 9)}`;

    // Phase 1: Queued
    if (onStatusChange) onStatusChange('Queued');
    await new Promise((r) => setTimeout(r, 350));

    // Phase 2: Compiling (Java & C++)
    const isCompiled = language === 'java' || language === 'cpp';
    if (isCompiled) {
      if (onStatusChange) onStatusChange('Compiling');
      await new Promise((r) => setTimeout(r, 650));
    }

    // Phase 3: Running inside container
    if (onStatusChange) onStatusChange('Running');
    await new Promise((r) => setTimeout(r, 800));

    // Check code for intentional syntax mistakes or errors
    const hasSyntaxError =
      code.includes('syntax_error_test') ||
      (language === 'python' && code.includes('import non_existent_library_99')) ||
      (language === 'java' && code.includes('System.out.printl(')) ||
      (language === 'cpp' && code.includes('std::cout <<<'));

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    let result;

    if (hasSyntaxError) {
      result = {
        id: `exec_${Date.now()}`,
        projectId,
        projectName,
        filename,
        language,
        status: 'Failed',
        exitCode: 1,
        durationMs,
        memoryMb: Number((12 + Math.random() * 8).toFixed(1)),
        createdAt: new Date().toISOString(),
        sandboxId,
        stdout: '',
        stderr:
          language === 'python'
            ? `Traceback (most recent call last):\n  File "/sandbox/${filename}", line 14, in <module>\nModuleNotFoundError: No module named 'non_existent_library_99'`
            : language === 'java'
            ? `/sandbox/${filename}:12: error: cannot find symbol\n  System.out.printl("Test");\n            ^\n1 error\nExecution aborted with code 1.`
            : `/sandbox/${filename}:8:15: error: invalid operands of types 'std::ostream' and 'const char[5]' to binary 'operator<<<'`,
        stdin,
        isDemoSandbox: true,
      };
    } else {
      let simulatedStdout = '';
      if (language === 'python') {
        const printRegex = /print\s*\(\s*(?:f?["'](.*?)["']|([^)]*))\s*\)/g;
        const matches = [...code.matchAll(printRegex)];
        if (matches.length > 0) {
          simulatedStdout = matches.map((m) => (m[1] !== undefined ? m[1] : m[2])).join('\n') + '\n';
        } else {
          simulatedStdout = `[Executed python:3.11-slim]\n${code.trim()}\n`;
        }
      } else if (language === 'java') {
        const printlnRegex = /System\.out\.println\s*\(\s*(?:["'](.*?)["']|([^)]*))\s*\)/g;
        const matches = [...code.matchAll(printlnRegex)];
        if (matches.length > 0) {
          simulatedStdout = matches.map((m) => (m[1] !== undefined ? m[1] : m[2])).join('\n') + '\n';
        } else {
          simulatedStdout = `[Executed OpenJDK 17]\n${code.trim()}\n`;
        }
      } else {
        const coutRegex = /std::cout\s*<<\s*(?:["'](.*?)["']|([^;]*));/g;
        const matches = [...code.matchAll(coutRegex)];
        if (matches.length > 0) {
          simulatedStdout = matches.map((m) => (m[1] !== undefined ? m[1] : m[2].replace(/<<\s*std::endl/g, ''))).join('\n') + '\n';
        } else {
          simulatedStdout = `[Executed GCC 13.2]\n${code.trim()}\n`;
        }
      }

      if (stdin) {
        simulatedStdout += `\n[Input Stream]:\n${stdin.trim()}\n`;
      }

      result = {
        id: `exec_${Date.now()}`,
        projectId,
        projectName,
        filename,
        language,
        status: 'Completed',
        exitCode: 0,
        durationMs,
        memoryMb: Number((18 + Math.random() * 24).toFixed(1)),
        createdAt: new Date().toISOString(),
        sandboxId,
        stdout: simulatedStdout,
        stderr: '',
        stdin,
        isDemoSandbox: true,
      };
    }

    if (onStatusChange) onStatusChange(result.status);

    // Save execution record
    const stored = getStoredExecutions();
    stored.unshift(result);
    saveStoredExecutions(stored);

    return result;
  },
};

export default executionService;
