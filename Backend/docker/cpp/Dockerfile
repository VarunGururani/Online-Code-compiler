# Minimalist C++20 GCC 13.2 Execution Sandbox Runner
FROM gcc:13.2

# Create unprivileged runner user
RUN useradd -m -u 1000 -s /bin/bash runner && \
    mkdir -p /workspace && \
    chown -R runner:runner /workspace

USER runner
WORKDIR /workspace

CMD ["sh", "-c", "g++ -O2 -std=c++20 main.cpp -o main && ./main"]
