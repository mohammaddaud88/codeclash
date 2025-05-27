package com.codeclash.codeclash.service;

import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Path;

@Service
public class CodeExecutorService {
    private static final String WORKDIR = "tempCode";

    public String executeJavaCode(String className, String code, String input) throws IOException, InterruptedException {
        File dir = new File(WORKDIR);
        if (!dir.exists() && !dir.mkdirs()) {
            throw new IOException("Failed to create directory: " + dir.getAbsolutePath());
        }

        // Save the Java file
        File javaFile = new File(dir, className + ".java");
        try (FileWriter writer = new FileWriter(javaFile)) {
            writer.write(code);
        }

        // Compile Java file
        Process compileProcess = new ProcessBuilder("javac", javaFile.getAbsolutePath())
                .directory(dir)
                .redirectErrorStream(true)
                .start();

        String compileOutput = readProcessOutput(compileProcess);
        int compileExitCode = compileProcess.waitFor();
        if (compileExitCode != 0) {
            return "Compilation failed:\n" + compileOutput;
        }

        // Run Java class
        Process runProcess = new ProcessBuilder("java", className)
                .directory(dir)
                .redirectErrorStream(true)
                .start();

        // Pass input to the process
        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
            writer.write(input);
            writer.flush();
        }

        String output = readProcessOutput(runProcess);
        int runExitCode = runProcess.waitFor();

        // Cleanup
        new File(dir, className + ".class").delete();
        javaFile.delete();

        if (runExitCode != 0) {
            return "Runtime error:\n" + output;
        }

        System.out.println(output.trim());
        return output.trim();
    }

    private String readProcessOutput(Process process) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            StringBuilder result = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                result.append(line).append("\n");
            }
            return result.toString();
        }
    }
}
