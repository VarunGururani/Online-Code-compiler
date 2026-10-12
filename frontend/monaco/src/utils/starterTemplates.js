export const STARTER_TEMPLATES = {
  python: {
    filename: 'main.py',
    content: `# Cloud IDE - Python 3 Execution Environment
# Cloud-native sandbox running Python 3.11

import sys
import time

def fibonacci(n):
    """Calculate the first n Fibonacci numbers."""
    seq = [0, 1]
    for _ in range(2, n):
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

def main():
    print("=" * 45)
    print("🚀 Welcome to Cloud IDE Code Runner!")
    print(f"Python Version: {sys.version.split()[0]}")
    print("=" * 45)
    
    # Example calculation
    count = 10
    print(f"Generating first {count} Fibonacci numbers:")
    fib_series = fibonacci(count)
    print(f"Result: {fib_series}")
    
    # Check if standard input is provided
    print("\nReading standard input (if provided)...")
    lines = sys.stdin.read().strip().splitlines()
    if lines:
        print(f"Received {len(lines)} line(s) from stdin:")
        for idx, line in enumerate(lines, 1):
            print(f"  [Input #{idx}]: {line}")
    else:
        print("  (No stdin supplied. You can supply custom input in the Stdin tab!)")
        
    print("\nExecution completed successfully! ✅")

if __name__ == "__main__":
    main()
`,
  },

  java: {
    filename: 'Main.java',
    content: `// Cloud IDE - Java 17 LTS Execution Sandbox
// Eclipse Temurin OpenJDK 17 Container

import java.util.Scanner;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        System.out.println("=============================================");
        System.out.println("🚀 Welcome to Cloud IDE - Java Environment!");
        System.out.println("Java Runtime: " + System.getProperty("java.version"));
        System.out.println("=============================================");

        // Sorting Demonstration
        int[] numbers = { 64, 34, 25, 12, 22, 11, 90 };
        System.out.println("Original array: " + Arrays.toString(numbers));
        Arrays.sort(numbers);
        System.out.println("Sorted array:   " + Arrays.toString(numbers));

        // Reading standard input
        System.out.println("\\nReading standard input (stdin)...");
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextLine()) {
            System.out.println("Echoing stdin lines:");
            int count = 1;
            while (scanner.hasNextLine()) {
                String line = scanner.nextLine();
                if (line.trim().isEmpty()) break;
                System.out.println("  [Line " + count++ + "]: " + line);
            }
        } else {
            System.out.println("  (No stdin provided. Provide custom input in the Stdin tab.)");
        }
        scanner.close();

        System.out.println("\\nExecution finished with exit code 0. ✅");
    }
}
`,
  },

  cpp: {
    filename: 'main.cpp',
    content: `// Cloud IDE - C++20 Execution Sandbox
// GCC 13.2 with -O2 optimization

#include <iostream>
#include <vector>
#include <numeric>
#include <string>

int main() {
    std::cout << "=============================================\\n";
    std::cout << "🚀 Welcome to Cloud IDE - C++ Environment!\\n";
    std::cout << "Compiled with: GCC 13.2 (C++20)\\n";
    std::cout << "=============================================\\n";

    // Vector operations
    std::vector<int> numbers = { 10, 20, 30, 40, 50 };
    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);

    std::cout << "Vector elements: ";
    for (int n : numbers) {
        std::cout << n << " ";
    }
    std::cout << "\\nCalculated sum: " << sum << "\\n";

    // Standard input processing
    std::cout << "\\nChecking standard input (stdin)...\\n";
    std::string line;
    if (std::getline(std::cin, line) && !line.empty()) {
        std::cout << "Received first line from stdin: \\"" << line << "\\"\\n";
    } else {
        std::cout << "(No stdin provided. Provide custom input in the Stdin tab.)\\n";
    }

    std::cout << "\\nC++ program exited successfully with code 0! ✅\\n";
    return 0;
}
`,
  },
};

export const getStarterTemplate = (langId) => {
  return STARTER_TEMPLATES[langId] || STARTER_TEMPLATES.python;
};
