# Minimalist Java 17 LTS OpenJDK Execution Sandbox Runner
FROM eclipse-temurin:17-jdk-alpine

# Create unprivileged runner user
RUN adduser -D -u 1000 -s /bin/sh runner && \
    mkdir -p /workspace && \
    chown -R runner:runner /workspace

USER runner
WORKDIR /workspace

CMD ["sh", "-c", "javac Main.java && java Main"]
