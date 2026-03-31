module.exports = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      issuePrefixes: ["AX-"],
    },
  },
  rules: {
    "references-empty": [2, "never"], // Bloqueia o commit se não tiver a referência AX-
    "subject-case": [0, "always"], // Desativa a obrigatoriedade de letras minúsculas na descrição
  },
};

