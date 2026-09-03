# AI and ML quality evaluation

Normal software tests remain necessary even when outputs are non-deterministic. This phase defines future evaluation needs but builds no evaluation platform or benchmark dataset.

## Deterministic tests are sufficient for

- request/result schema validation, timeouts, retries, fallbacks, budgets, and provider error mapping;
- prompt/template version selection and provenance recording;
- token offsets, timestamp monotonicity, graph invariants, cache keys, permissions, and state transitions;
- refusing/degrading on malformed, missing, low-confidence, or unsupported output;
- regression fixtures where the exact provider response is recorded and licensed/sanitized.

## Future quality evaluation candidates

| Capability | Potential measures | Human/reference need |
| --- | --- | --- |
| Context meaning/translation | adequacy, sense selection, faithfulness, harmful error rate | bilingual rubric and adjudication |
| Grammar explanation | factual correctness, relevance, level fit, actionable clarity | linguist/teacher review |
| CEFR classification | agreement, calibration, subgroup/source stability | labeled representative samples |
| Exercise generation | answerability, unique answer, source grounding, level/difficulty | learner/teacher review |
| Transcription | word/error rate, punctuation/segmentation, named-term handling | licensed reference transcripts |
| Text/audio alignment | boundary error, coverage, monotonicity, sentence fallback rate | timestamped reference audio |
| TTS | intelligibility, pronunciation, naturalness, timing stability | listening panels plus deterministic checks |
| Linguistic parsing | token/lemma/POS/dependency accuracy, pedagogical mapping error | French UD/reference annotations |

## When to add evaluation

Create a feature-specific evaluation plan only when the pipeline exists and before its output is used for a consequential learning claim or broad rollout. Define intended population/content, rubric, baseline, acceptance threshold, slice analysis, failure taxonomy, cost/latency, data rights, and model/prompt version. Keep online user feedback separate from ground truth.

Do not make CI depend on live non-deterministic provider output. Candidate model changes should run an offline, versioned evaluation and canary/feature-flag rollout when the feature risk warrants it.

