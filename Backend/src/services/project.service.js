const projectRepository = require('../repositories/project.repository');
const fileRepository = require('../repositories/file.repository');
const logger = require('../logger');

const STARTER_CODE = {
  python: `# Cloud IDE - Python 3.11 Execution Environment
def main():
    print("Hello from Cloud IDE Python!")

if __name__ == "__main__":
    main()
`,
  java: `// Cloud IDE - Java 17 LTS Environment
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Cloud IDE Java!");
    }
}
`,
  cpp: `// Cloud IDE - C++20 Environment
#include <iostream>

int main() {
    std::cout << "Hello from Cloud IDE C++!\\n";
    return 0;
}
`,
};

const STARTER_FILES = {
  python: 'main.py',
  java: 'Main.java',
  cpp: 'main.cpp',
};

const projectService = {
  async createProject(userId, { name, description, language = 'python' }) {
    const proj = await projectRepository.create({
      user_id: userId,
      name: name.trim(),
      description: description ? description.trim() : null,
    });

    // Create default starter file
    const lang = language.toLowerCase();
    const defaultFilename = STARTER_FILES[lang] || 'main.py';
    const defaultContent = STARTER_CODE[lang] || STARTER_CODE.python;

    const initialFile = await fileRepository.create({
      project_id: proj.id,
      name: defaultFilename,
      path: `/${defaultFilename}`,
      language: lang,
      content: defaultContent,
    });

    logger.info({ projectId: proj.id, userId }, 'Project created with initial starter file');

    return {
      ...proj,
      language: lang,
      files: [initialFile],
    };
  },

  async getUserProjects(userId) {
    const projects = await projectRepository.findByUserId(userId);

    // Attach files to each project for rich IDE and dashboard experience
    const populated = await Promise.all(
      projects.map(async (p) => {
        const files = await fileRepository.findByProjectId(p.id);
        const primaryFile = files[0];
        const lang = primaryFile?.language || 'python';
        return {
          ...p,
          language: lang,
          files,
        };
      })
    );

    return populated;
  },

  async getProjectById(userId, projectId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    if (project.user_id !== userId) {
      const err = new Error('Access denied: You do not own this project');
      err.statusCode = 403;
      throw err;
    }

    const files = await fileRepository.findByProjectId(projectId);
    const primaryFile = files[0];
    const language = primaryFile?.language || 'python';

    return {
      ...project,
      language,
      files,
    };
  },

  async updateProject(userId, projectId, updates) {
    // Verify ownership
    await this.getProjectById(userId, projectId);

    const updated = await projectRepository.update(projectId, updates);
    const files = await fileRepository.findByProjectId(projectId);

    return {
      ...updated,
      files,
    };
  },

  async deleteProject(userId, projectId) {
    // Verify ownership
    await this.getProjectById(userId, projectId);

    const deleted = await projectRepository.delete(projectId);
    logger.info({ projectId, userId }, 'Project deleted successfully');
    return { success: deleted };
  },
};

module.exports = projectService;
