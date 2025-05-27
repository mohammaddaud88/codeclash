package com.codeclash.codeclash.controller;

import com.codeclash.codeclash.model.CodeRequest;
import com.codeclash.codeclash.model.CodeSubmit;
import com.codeclash.codeclash.repository.CodeSubmitRepo;
import com.codeclash.codeclash.service.CodeExecutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CodeController {

    private final CodeExecutorService codeExecutorService;

    @Autowired
    private CodeSubmitRepo codeSubmitRepo;

    public CodeController(CodeExecutorService codeExecutorService) {
        this.codeExecutorService = codeExecutorService;
    }

    @PostMapping("/coderun")
    public ResponseEntity<?> runJavaCode(@RequestBody CodeRequest codeRequest) {
        try {
            String results = codeExecutorService.executeJavaCode(
                    codeRequest.getClassName(),
                    codeRequest.getCode(),
                   codeRequest.getInput() // Accepting multiple test cases
            );
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error while executing code: " + e.getMessage());
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<Boolean> codeSubmitResponseEntity(@RequestBody CodeSubmit codeSubmit){
//            CodeSubmit code = new CodeSubmit();
//            code.setTitle(codeSubmit.getTitle());
//            code.setCode(codeSubmit.getCode());
//            code.setCategory(codeSubmit.getCategory());
//            code.setLanguage(codeSubmit.getLanguage());
        try {
            codeSubmitRepo.save(codeSubmit);
        } catch (Exception e){
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.ok(true);
    }
}
