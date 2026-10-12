# Minimalist Python 3.11 Execution Sandbox Runner
FROM python:3.11-slim

# Create unprivileged runner user
RUN useradd -m -u 1000 -s /bin/bash runner && \
    mkdir -p /workspace && \
    chown -R runner:runner /workspace

USER runner
WORKDIR /workspace

CMD ["python3", "main.py"]
